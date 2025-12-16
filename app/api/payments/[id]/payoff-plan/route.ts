// /app/api/payments/[id]/payoff-plan/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * POST /api/payments/:id/payoff-plan
 * Create a payoff plan for a past due payment
 */
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenantId } = auth;
    const { id: paymentId } = await params;

    // Verify payment exists and belongs to this tenant
    const existingPayment = await prisma.paymentHistory.findFirst({
      where: {
        id: paymentId,
        tenantId,
      },
    });

    if (!existingPayment) {
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const {
      totalPastDue,
      targetPayoffDate,
      plannedPayments,
    } = body;

    // Validate required fields
    if (!totalPastDue || !targetPayoffDate || !plannedPayments || plannedPayments.length === 0) {
      return NextResponse.json(
        { error: 'Total past due, target date, and planned payments are required' },
        { status: 400 }
      );
    }

    // Create payoff plan structure
    const payoffPlan = {
      createdDate: new Date().toISOString(),
      totalPastDue: parseFloat(totalPastDue),
      targetPayoffDate: new Date(targetPayoffDate).toISOString(),
      plannedPayments: plannedPayments.map((p: any, index: number) => ({
        id: `plan_${index + 1}`,
        plannedDate: new Date(p.plannedDate).toISOString(),
        plannedAmount: parseFloat(p.plannedAmount),
        actualDate: null,
        actualAmount: null,
        status: 'PENDING',
      })),
      progress: {
        totalPaid: 0,
        remaining: parseFloat(totalPastDue),
        percentComplete: 0,
        onTrack: true,
      }
    };

    // Update payment record with payoff plan
    const updatedPayment = await prisma.paymentHistory.update({
      where: { id: paymentId },
      data: {
        payoffPlan,
        status: 'PAST_DUE', // Keep as past due until plan is complete
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'payoff_plan_created',
        category: 'payment',
        result: 'success',
        resourceType: 'payment',
        resourceId: paymentId,
        details: {
          totalPastDue: parseFloat(totalPastDue),
          targetPayoffDate,
          numberOfPayments: plannedPayments.length,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      payment: {
        ...updatedPayment,
        scheduledAmount: Number(updatedPayment.scheduledAmount),
        actualAmount: updatedPayment.actualAmount ? Number(updatedPayment.actualAmount) : null,
        remainingBalance: updatedPayment.remainingBalance ? Number(updatedPayment.remainingBalance) : null,
      }
    });
  } catch (error) {
    console.error('Error creating payoff plan:', error);
    return NextResponse.json(
      { error: 'Failed to create payoff plan' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/payments/:id/payoff-plan
 * Update progress on an existing payoff plan
 */
export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenantId } = auth;
    const { id: paymentId } = await params;

    // Verify payment exists and has a payoff plan
    const existingPayment = await prisma.paymentHistory.findFirst({
      where: {
        id: paymentId,
        tenantId,
      },
    });

    if (!existingPayment || !existingPayment.payoffPlan) {
      return NextResponse.json({ 
        error: 'Payment or payoff plan not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const {
      planPaymentId,
      actualDate,
      actualAmount,
    } = body;

    // Validate required fields
    if (!planPaymentId || !actualDate || !actualAmount) {
      return NextResponse.json(
        { error: 'Plan payment ID, actual date, and actual amount are required' },
        { status: 400 }
      );
    }

    // Get current payoff plan
    const payoffPlan = existingPayment.payoffPlan as any;
    
    // Find and update the specific planned payment
    const updatedPlannedPayments = payoffPlan.plannedPayments.map((p: any) => {
      if (p.id === planPaymentId) {
        return {
          ...p,
          actualDate: new Date(actualDate).toISOString(),
          actualAmount: parseFloat(actualAmount),
          status: 'PAID',
        };
      }
      return p;
    });

    // Recalculate progress
    const totalPaid = updatedPlannedPayments
      .filter((p: any) => p.status === 'PAID')
      .reduce((sum: number, p: any) => sum + p.actualAmount, 0);
    
    const remaining = payoffPlan.totalPastDue - totalPaid;
    const percentComplete = Math.round((totalPaid / payoffPlan.totalPastDue) * 100);
    
    // Check if on track (all past payments made)
    const today = new Date();
    const missedPayments = updatedPlannedPayments.filter((p: any) => {
      const plannedDate = new Date(p.plannedDate);
      return plannedDate < today && p.status !== 'PAID';
    });
    const onTrack = missedPayments.length === 0;

    // Update payoff plan
    const updatedPayoffPlan = {
      ...payoffPlan,
      plannedPayments: updatedPlannedPayments,
      progress: {
        totalPaid,
        remaining: remaining > 0 ? remaining : 0,
        percentComplete,
        onTrack,
      }
    };

    // Determine if plan is complete
    const allPaid = updatedPlannedPayments.every((p: any) => p.status === 'PAID');
    const newStatus: 'PAID' | 'PAST_DUE' = allPaid && remaining <= 0 ? 'PAID' : 'PAST_DUE';

    // Update payment record
    const updatedPayment = await prisma.paymentHistory.update({
      where: { id: paymentId },
      data: {
        payoffPlan: updatedPayoffPlan,
        status: newStatus,
        ...(allPaid && remaining <= 0 && { 
          actualDate: new Date(actualDate),
          paidDate: new Date(actualDate),
          actualAmount: payoffPlan.totalPastDue,
          paidAmount: payoffPlan.totalPastDue,
        }),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'payoff_plan_updated',
        category: 'payment',
        result: 'success',
        resourceType: 'payment',
        resourceId: paymentId,
        details: {
          planPaymentId,
          actualAmount: parseFloat(actualAmount),
          percentComplete,
          remaining,
          completed: allPaid && remaining <= 0,
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      payment: {
        ...updatedPayment,
        scheduledAmount: Number(updatedPayment.scheduledAmount),
        actualAmount: updatedPayment.actualAmount ? Number(updatedPayment.actualAmount) : null,
        remainingBalance: updatedPayment.remainingBalance ? Number(updatedPayment.remainingBalance) : null,
      }
    });
  } catch (error) {
    console.error('Error updating payoff plan:', error);
    return NextResponse.json(
      { error: 'Failed to update payoff plan' },
      { status: 500 }
    );
  }
}
