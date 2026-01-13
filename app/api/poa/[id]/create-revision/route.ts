// app/api/poa/[id]/create-revision/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const originalPoaId = params.id;

    // Get the original POA with all its data
    const originalPoa = await prisma.powerOfAttorney.findUnique({
      where: { id: originalPoaId },
      include: {
        agents: true,
        grantedPowers: {
          include: {
            category: true,
          },
        },
        powerLimitations: true,
      },
    });

    if (!originalPoa) {
      return NextResponse.json(
        { success: false, error: 'POA not found' },
        { status: 404 }
      );
    }

    // Mark original as not latest version
    await prisma.powerOfAttorney.update({
      where: { id: originalPoaId },
      data: { isLatestVersion: false },
    });

    // Create new POA (revision) with copied data
    const newPoa = await prisma.powerOfAttorney.create({
      data: {
        tenantId: originalPoa.tenantId,
        principalUserId: originalPoa.principalUserId,
        principalName: originalPoa.principalName,
        principalAddress: originalPoa.principalAddress,
        principalCity: originalPoa.principalCity,
        principalState: originalPoa.principalState,
        principalZip: originalPoa.principalZip,
        principalDOB: originalPoa.principalDOB,
        principalPhone: originalPoa.principalPhone,
        principalEmail: originalPoa.principalEmail,
        
        poaType: originalPoa.poaType,
        isDurable: originalPoa.isDurable,
        isLimited: originalPoa.isLimited,
        isSpringing: originalPoa.isSpringing,
        
        effectiveDate: originalPoa.effectiveDate,
        expirationDate: originalPoa.expirationDate,
        springingCondition: originalPoa.springingCondition,
        
        status: 'DRAFT', // New revision starts as draft
        
        agentCompensation: originalPoa.agentCompensation,
        compensationDetails: originalPoa.compensationDetails,
        hasCoAgents: originalPoa.hasCoAgents,
        coAgentsMustActJointly: originalPoa.coAgentsMustActJointly,
        
        specialInstructions: originalPoa.specialInstructions,
        state: originalPoa.state,
        
        // Revision tracking
        versionNumber: originalPoa.versionNumber + 1,
        parentPoaId: originalPoaId,
        isLatestVersion: true,
        
        // Attach original POA document as reference
        documentTemplateUsed: originalPoa.generatedDocument,
        
        createdById: originalPoa.createdById,
      },
    });

    // Copy agents
    for (const agent of originalPoa.agents) {
      await prisma.pOAAgent.create({
        data: {
          poaId: newPoa.id,
          agentType: agent.agentType,
          order: agent.order,
          fullName: agent.fullName,
          relationship: agent.relationship,
          email: agent.email,
          phone: agent.phone,
          address: agent.address,
          city: agent.city,
          state: agent.state,
          zip: agent.zip,
          hasAccepted: false, // Reset acceptance for new revision
        },
      });
    }

    // Copy granted powers
    for (const power of originalPoa.grantedPowers) {
      await prisma.pOAGrantedPower.create({
        data: {
          poaId: newPoa.id,
          categoryId: power.categoryId,
          grantAllSubPowers: power.grantAllSubPowers,
          grantedSubPowers: power.grantedSubPowers || {}, // Handle null/undefined, default to empty object
        },
      });
    }

    // Copy power limitations
    for (const limitation of originalPoa.powerLimitations) {
      await prisma.pOAPowerLimitation.create({
        data: {
          poaId: newPoa.id,
          categoryId: limitation.categoryId,
          limitationType: limitation.limitationType,
          limitationText: limitation.limitationText,
        },
      });
    }

    // Create audit log
    await prisma.pOAAuditLog.create({
      data: {
        poaId: newPoa.id,
        userId: originalPoa.createdById!,
        action: 'REVISION_CREATED',
        category: 'POA_LIFECYCLE',
        details: {
          originalPoaId,
          originalVersion: originalPoa.versionNumber,
          newVersion: newPoa.versionNumber,
        },
      },
    });

    return NextResponse.json({
      success: true,
      newPoaId: newPoa.id,
      versionNumber: newPoa.versionNumber,
      message: `Revision ${newPoa.versionNumber} created successfully`,
    });
  } catch (error) {
    console.error('Error creating POA revision:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create revision',
      },
      { status: 500 }
    );
  }
}
