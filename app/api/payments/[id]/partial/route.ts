// /app/api/payments/[id]/partial/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * POST /api/payments/:id/partial
 * Add a partial payment to an existing payment
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
      date,
      amount,
      method,
      note,
    } = body;

    // Validate required fields
    if (!date || !amount) {
      return NextResponse.json(
        { error: 'Date and amount are required' },
        { status: 400 }
      );
    }

    // Get existing partial payments
    const currentPartials = (existingPayment.partialPayments as any) || [];
    
    // Create new partial payment entry
    const newPartial = {
      id: `partial_${Date.now()}`,
      date: new Date(date).toISOString(),
      amount: parseFloat(amount),
      method: method || null,
      note: note || null,
    };

    // Add to array
    const updatedPartials = [...currentPartials, newPartial];

    // Calculate total paid and remaining
    const totalPaid = updatedPartials.reduce((sum, p) => sum + p.amount, 0);
    const scheduledAmount = Number(existingPayment.scheduledAmount);
    const remaining = scheduledAmount - totalPaid;

    // Determine new status
    const newStatus: 'PARTIAL' | 'PAID' = remaining <= 0 ? 'PAID' : 'PARTIAL';

    // Update payment record
    const updatedPayment = await prisma.paymentHistory.update({
      where: { id: paymentId },
      data: {
        partialPayments: updatedPartials,
        remainingBalance: remaining > 0 ? remaining : 0,
        status: newStatus,
        actualAmount: totalPaid,
        paidAmount: totalPaid,
        actualDate: remaining <= 0 ? new Date(date) : existingPayment.actualDate || existingPayment.paidDate,
        paidDate: remaining <= 0 ? new Date(date) : existingPayment.paidDate || existingPayment.actualDate,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'partial_payment_added',
        category: 'payment',
        result: 'success',
        resourceType: 'payment',
        resourceId: paymentId,
        details: {
          partialAmount: parseFloat(amount),
          totalPaid,
          remaining,
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
    console.error('Error adding partial payment:', error);
    return NextResponse.json(
      { error: 'Failed to add partial payment' },
      { status: 500 }
    );
  }
}
