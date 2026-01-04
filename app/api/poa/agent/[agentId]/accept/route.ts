// app/api/poa/agent/[agentId]/accept/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAgentAcceptanceConfirmation } from '@/lib/poa/notifications';

/**
 * POST /api/poa/agent/[agentId]/accept
 * Agent accepts their POA designation
 */
export async function POST(
  request: Request,
  { params }: { params: { agentId: string } }
) {
  try {
    const { agentId } = params;

    // Get agent details
    const agent = await prisma.pOAAgent.findUnique({
      where: { id: agentId },
      include: {
        poa: {
          include: {
            principal: true
          }
        }
      }
    });

    if (!agent) {
      return NextResponse.json(
        { success: false, error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent.hasAccepted) {
      return NextResponse.json(
        { success: false, error: 'Agent has already accepted' },
        { status: 400 }
      );
    }

    if (agent.declinedAt) {
      return NextResponse.json(
        { success: false, error: 'Agent has already declined' },
        { status: 400 }
      );
    }

    const now = new Date();

    // Update agent status
    const updatedAgent = await prisma.pOAAgent.update({
      where: { id: agentId },
      data: {
        hasAccepted: true,
        acceptedAt: now,
        updatedAt: now
      }
    });

    // Create audit log
    await prisma.pOAAuditLog.create({
      data: {
        poaId: agent.poaId,
        userId: agent.userId,
        action: 'AGENT_ACCEPTED',
        category: 'agent_workflow',
        details: {
          agentId: agent.id,
          agentName: agent.fullName,
          agentType: agent.agentType,
          acceptedAt: now.toISOString()
        },
        timestamp: now
      }
    });

    // Send confirmation email to principal
    if (agent.poa.principalEmail) {
      await sendAgentAcceptanceConfirmation({
        principalEmail: agent.poa.principalEmail,
        principalName: agent.poa.principalName,
        agentName: agent.fullName,
        agentType: agent.agentType,
        acceptedAt: now
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Agent designation accepted',
      agent: {
        id: updatedAgent.id,
        fullName: updatedAgent.fullName,
        agentType: updatedAgent.agentType,
        hasAccepted: updatedAgent.hasAccepted,
        acceptedAt: updatedAgent.acceptedAt
      }
    });

  } catch (error) {
    console.error('Error accepting agent designation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to accept designation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
