// app/api/poa/[id]/revoke/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/poa/[id]/revoke
 * Revoke a Power of Attorney
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const { id: poaId } = params;
    const body = await request.json();
    const { reason, revokedById } = body;

    // Get POA details
    const poa = await prisma.powerOfAttorney.findUnique({
      where: { id: poaId },
      include: {
        agents: true
      }
    });

    if (!poa) {
      return NextResponse.json(
        { success: false, error: 'POA not found' },
        { status: 404 }
      );
    }

    if (poa.status === 'REVOKED') {
      return NextResponse.json(
        { success: false, error: 'POA is already revoked' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create revocation record
      const revocation = await tx.pOARevocation.create({
        data: {
          poaId: poa.id,
          tenantId: poa.tenantId,
          principalName: poa.principalName,
          principalAddress: `${poa.principalAddress}, ${poa.principalCity}, ${poa.principalState} ${poa.principalZip}`,
          revocationType: 'COMPLETE_REVOCATION',
          revokedAt: now,
          revokedById: revokedById || poa.principalUserId,
          reason: reason || 'Principal elected to revoke POA',
          createdAt: now,
          updatedAt: now
        }
      });

      // 2. Update POA status
      const updatedPOA = await tx.powerOfAttorney.update({
        where: { id: poaId },
        data: {
          status: 'REVOKED',
          updatedAt: now
        }
      });

      // 3. Create audit log
      await tx.pOAAuditLog.create({
        data: {
          poaId: poa.id,
          userId: revokedById || poa.principalUserId,
          action: 'POA_REVOKED',
          category: 'revocation',
          details: {
            revocationId: revocation.id,
            reason: reason || 'Principal elected to revoke POA',
            revokedAt: now.toISOString(),
            agentsNotified: poa.agents.filter(a => a.email).length
          },
          timestamp: now
        }
      });

      return { revocation, updatedPOA };
    });

    const { revocation } = result;

    // 4. Generate revocation PDF (outside transaction)
    const { generateRevocationPDF } = await import('@/lib/poa/pdf-generator');
    const { buffer, filename } = await generateRevocationPDF({
      poa,
      revocation,
      revokedAt: now
    });

    // 5. Upload PDF
    const { uploadPOADocument } = await import('@/lib/poa/storage');
    const { url: revocationDocumentUrl } = await uploadPOADocument({
      file: buffer,
      filename,
      contentType: 'application/pdf',
      tenantId: poa.tenantId,
      poaId: poa.id
    });

    // 6. Update revocation record (no document field in schema)
    // Document URL will be stored separately if needed

    // 7. Send notification emails to all agents
    const { sendRevocationNotification } = await import('@/lib/poa/notifications');
    
    for (const agent of poa.agents) {
      if (agent.email) {
        await sendRevocationNotification({
          agentEmail: agent.email,
          agentName: agent.fullName,
          principalName: poa.principalName,
          poaType: poa.poaType,
          revokedAt: now,
          revocationDocumentUrl
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'POA revoked successfully',
      revocation: {
        id: revocation.id,
        revokedAt: revocation.revokedAt,
        reason: revocation.reason,
        revocationDocument: revocationDocumentUrl
      },
      poa: {
        id: poa.id,
        status: 'REVOKED'
      },
      agentsNotified: poa.agents.filter(a => a.email).length
    });

  } catch (error) {
    console.error('Error revoking POA:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to revoke POA',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
