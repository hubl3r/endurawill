// app/api/poa/agent/[agentId]/decline/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendAgentDeclineNotification } from '@/lib/poa/notifications';

/**
 * POST /api/poa/agent/[agentId]/decline
 * Agent declines their POA designation
 */
export async function POST(
  request: Request,
  props: { params: Promise<{ agentId: string }> }
) {
  try {
    const params = await props.params;
    const { agentId } = params;
    const body = await request.json();
    const { reason } = body;

    // Get agent details
    const agent = await prisma.pOAAgent.findUnique({
      where: { id: agentId },
      include: {
        poa: true
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
        { success: false, error: 'Agent has already accepted and cannot decline' },
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
        declinedAt: now,
        declineReason: reason || 'No reason provided',
        updatedAt: now
      }
    });

    // Create audit log
    await prisma.pOAAuditLog.create({
      data: {
        poaId: agent.poaId,
        userId: agent.userId,
        action: 'AGENT_DECLINED',
        category: 'agent_workflow',
        details: {
          agentId: agent.id,
          agentName: agent.fullName,
          agentType: agent.agentType,
          declineReason: reason || 'No reason provided',
          declinedAt: now.toISOString()
        },
        timestamp: now
      }
    });

    // Send notification email to principal
    if (agent.poa.principalEmail) {
      await sendAgentDeclineNotification({
        principalEmail: agent.poa.principalEmail,
        principalName: agent.poa.principalName,
        agentName: agent.fullName,
        agentType: agent.agentType,
        declineReason: reason,
        declinedAt: now
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Agent designation declined',
      agent: {
        id: updatedAgent.id,
        fullName: updatedAgent.fullName,
        agentType: updatedAgent.agentType,
        declinedAt: updatedAgent.declinedAt,
        declineReason: updatedAgent.declineReason
      }
    });

  } catch (error) {
    console.error('Error declining agent designation:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to decline designation',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
