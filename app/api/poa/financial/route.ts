// app/api/poa/financial/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateFinancialPOA } from '@/lib/poa/validation';
import { generateFinancialPOAPDF } from '@/lib/poa/pdf-generator';
import { uploadPOADocument } from '@/lib/poa/storage';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

/**
 * POST /api/poa/financial
 * Create a new Financial Power of Attorney
 * 
 * Phase 3: DURABLE POA only
 * Phase 4: Will add springing and limited support
 */
export async function POST(request: Request) {
  try {
    // Get authenticated user and validated tenant (secure)
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized or no active estate selected' }, { status: 401 });
    }

    const { user, tenant, tenantId } = auth;

    const body = await request.json();

    // Add secure tenant/user context to the data
    const dataWithAuth = {
      ...body,
      principal: {
        ...body.principal,
        userId: user.id,
        tenantId: tenantId,
      }
    };

    // Validate input
    const validation = validateFinancialPOA(dataWithAuth);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create PowerOfAttorney record
      const poa = await tx.powerOfAttorney.create({
        data: {
          tenantId: data.principal.tenantId,
          principalUserId: data.principal.userId,
          principalName: data.principal.fullName,
          principalAddress: data.principal.address.street,
          principalCity: data.principal.address.city,
          principalState: data.principal.address.state,
          principalZip: data.principal.address.zipCode,
          principalEmail: data.principal.email,
          principalPhone: data.principal.phone,
          principalDOB: data.principal.dateOfBirth ? new Date(data.principal.dateOfBirth) : null,
          
          state: data.state,
          poaType: data.poaType.toUpperCase() as 'DURABLE' | 'SPRINGING' | 'LIMITED',
          isDurable: data.isDurable,
          isLimited: data.isLimited,
          isSpringing: data.isSpringing,
          
          effectiveImmediately: !data.isSpringing,
          expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
          
          springingCondition: data.springingCondition,
          requiresPhysicianCert: data.isSpringing,
          numberOfPhysiciansReq: data.numberOfPhysiciansRequired || 1,
          
          status: 'DRAFT',
          
          // Co-agent settings
          hasCoAgents: data.agents.filter(a => a.type === 'co_agent').length > 0,
          coAgentsMustActJointly: (data as any).coAgentsMustActJointly || false,
          
          usesStatutoryForm: data.useStatutoryForm,
          specialInstructions: data.additionalInstructions,
          
          notaryName: data.notaryPublic?.fullName,
          notaryCommission: data.notaryPublic?.commissionNumber,
          notaryExpiration: data.notaryPublic?.commissionExpiration 
            ? new Date(data.notaryPublic.commissionExpiration)
            : null,
          notaryCounty: data.notaryPublic?.county,
          notaryState: data.notaryPublic?.state,
          
          createdById: data.principal.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // 2. Create POA Agents
      const agentPromises = data.agents.map((agent, index) =>
        tx.pOAAgent.create({
          data: {
            poaId: poa.id,
            agentType: agent.type,
            order: agent.order || index + 1,
            fullName: agent.fullName,
            email: agent.email,
            phone: agent.phone,
            address: agent.address.street,
            city: agent.address.city,
            state: agent.address.state,
            zip: agent.address.zipCode,
            relationship: agent.relationship,
            hasAccepted: false,
            requiresSignature: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      );
      const agents = await Promise.all(agentPromises);

      // 3. Create Granted Powers
      const powerPromises = data.grantedPowers.categoryIds.map((categoryId) =>
        tx.pOAGrantedPower.create({
          data: {
            poaId: poa.id,
            categoryId: categoryId,
            grantAllSubPowers: data.grantedPowers.grantAllSubPowers,
            grantedSubPowers: data.grantedPowers.subPowerIds || [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
      );
      const grantedPowers = await Promise.all(powerPromises);

      // 4. Create Witnesses (if provided)
      if (data.witnesses && data.witnesses.length > 0) {
        const witnessPromises = data.witnesses.map((witness) =>
          tx.pOAWitness.create({
            data: {
              poaId: poa.id,
              fullName: witness.fullName,
              address: witness.address.street,
              city: witness.address.city,
              state: witness.address.state,
              zip: witness.address.zipCode,
              relationship: witness.relationship,
              createdAt: new Date(),
              updatedAt: new Date()
            }
          })
        );
        await Promise.all(witnessPromises);
      }

      // 6. Create Audit Log
      await tx.pOAAuditLog.create({
        data: {
          poaId: poa.id,
          userId: data.principal.userId,
          action: 'POA_CREATED',
          category: 'creation',
          details: {
            poaType: data.poaType,
            principalName: data.principal.fullName,
            agentCount: agents.length,
            powerCategoryCount: grantedPowers.length
          },
          ipAddress: null,
          userAgent: null,
          timestamp: new Date()
        }
      });

      return { poa, agents, grantedPowers };
    });

    const { poa, agents, grantedPowers } = result;

    // 7. Generate PDF (outside transaction since it's slow)
    const { buffer, filename } = await generateFinancialPOAPDF({
      poaData: data
    });

    // 8. Upload PDF to Vercel Blob
    const { url: documentUrl } = await uploadPOADocument({
      file: buffer,
      filename,
      contentType: 'application/pdf',
      tenantId: data.principal.tenantId,
      poaId: poa.id
    });

    // 9. Update POA with document URL
    const updatedPOA = await prisma.powerOfAttorney.update({
      where: { id: poa.id },
      data: { 
        generatedDocument: documentUrl,
        updatedAt: new Date()
      },
      include: {
        agents: true,
        grantedPowers: {
          include: {
            category: true
          }
        },
        witnesses: true
      }
    });

    // 10. Create Document record for dashboard visibility
    await prisma.document.create({
      data: {
        title: `${data.poaType.charAt(0).toUpperCase() + data.poaType.slice(1)} Power of Attorney - ${data.principal.fullName}`,
        description: `${data.poaType} POA with ${agents.length} agent(s) and ${grantedPowers.length} power categories`,
        isFolder: false,
        type: 'poa',
        parentId: null,
        status: 'active',
        tenantId: data.principal.tenantId,
        createdById: data.principal.userId,
        fileUrl: documentUrl,
        fileName: filename,
        fileType: 'application/pdf',
        fileSize: buffer.length,
        // Link to the actual POA record in content field
        content: {
          poaId: poa.id,
          poaType: data.poaType
        }
      }
    });

    // 12. Create audit log for PDF generation
    await prisma.pOAAuditLog.create({
      data: {
        poaId: poa.id,
        userId: data.principal.userId,
        action: 'PDF_GENERATED',
        category: 'document',
        details: {
          filename,
          documentUrl,
          fileSize: buffer.length
        },
        timestamp: new Date()
      }
    });

    // 13. Send designation emails to agents
    const { sendAgentDesignationEmail } = await import('@/lib/poa/notifications');
    
    for (const agent of updatedPOA.agents) {
      if (agent.email) {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://endurawill.vercel.app';
        await sendAgentDesignationEmail({
          agentEmail: agent.email,
          agentName: agent.fullName,
          principalName: data.principal.fullName,
          poaType: data.poaType,
          agentType: agent.agentType,
          acceptUrl: `${baseUrl}/poa/agent/${agent.id}/accept`,
          declineUrl: `${baseUrl}/poa/agent/${agent.id}/decline`
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Financial POA created successfully',
      poa: {
        id: updatedPOA.id,
        status: updatedPOA.status,
        generatedDocument: updatedPOA.generatedDocument,
        createdAt: updatedPOA.createdAt
      },
      agents: updatedPOA.agents,
      grantedPowers: updatedPOA.grantedPowers,
      witnesses: updatedPOA.witnesses
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating financial POA:', error);
    
    // Detailed error logging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create financial POA',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/poa/financial?id=xxx
 * Fetch a specific financial POA by ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const poaId = searchParams.get('id');

    if (!poaId) {
      return NextResponse.json(
        {
          success: false,
          error: 'POA ID is required'
        },
        { status: 400 }
      );
    }

    const poa = await prisma.powerOfAttorney.findUnique({
      where: { id: poaId },
      include: {
        agents: true,
        grantedPowers: {
          include: {
            category: {
              include: {
                subPowers: true
              }
            }
          }
        },
        witnesses: true,
        auditLogs: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!poa) {
      return NextResponse.json(
        {
          success: false,
          error: 'POA not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      poa
    });

  } catch (error) {
    console.error('Error fetching financial POA:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch financial POA',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
