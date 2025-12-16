// /app/api/payments/[id]/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/payments/:id
 * Get a single payment record
 */
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ 
        error: 'Unauthorized or no active estate selected' 
      }, { status: 401 });
    }

    const { tenantId } = auth;
    const { id: paymentId } = await params;

    const payment = await prisma.paymentHistory.findFirst({
      where: {
        id: paymentId,
        tenantId,
      },
      include: {
        account: {
          select: {
            id: true,
            accountName: true,
            companyName: true,
          }
        }
      }
    });

    if (!payment) {
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      payment: {
        ...payment,
        scheduledAmount: Number(payment.scheduledAmount),
        actualAmount: payment.actualAmount ? Number(payment.actualAmount) : null,
        remainingBalance: payment.remainingBalance ? Number(payment.remainingBalance) : null,
        balanceAfter: payment.balanceAfter ? Number(payment.balanceAfter) : null,
        principalPaid: payment.principalPaid ? Number(payment.principalPaid) : null,
        interestPaid: payment.interestPaid ? Number(payment.interestPaid) : null,
      }
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payment' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/payments/:id
 * Update a payment (mark as paid, add partial payment, update status)
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
      actualDate,
      actualAmount,
      status,
      paymentMethod,
      notes,
      partialPayments,
      remainingBalance,
      manualDueDate,
      originalDueDate,
      payoffPlan,
      balanceAfter,
      principalPaid,
      interestPaid,
    } = body;

    // Update payment record
    const updatedPayment = await prisma.paymentHistory.update({
      where: { id: paymentId },
      data: {
        ...(actualDate !== undefined && { 
          actualDate: actualDate ? new Date(actualDate) : null,
          paidDate: actualDate ? new Date(actualDate) : null,
        }),
        ...(actualAmount !== undefined && { 
          actualAmount: actualAmount ? parseFloat(actualAmount) : null,
          paidAmount: actualAmount ? parseFloat(actualAmount) : null,
        }),
        ...(status && { status }),
        ...(paymentMethod !== undefined && { paymentMethod }),
        ...(notes !== undefined && { notes }),
        ...(partialPayments !== undefined && { partialPayments }),
        ...(remainingBalance !== undefined && { remainingBalance: remainingBalance ? parseFloat(remainingBalance) : null }),
        ...(manualDueDate !== undefined && { manualDueDate: manualDueDate ? new Date(manualDueDate) : null }),
        ...(originalDueDate !== undefined && { originalDueDate: originalDueDate ? new Date(originalDueDate) : null }),
        ...(payoffPlan !== undefined && { payoffPlan }),
        ...(balanceAfter !== undefined && { balanceAfter: balanceAfter ? parseFloat(balanceAfter) : null }),
        ...(principalPaid !== undefined && { principalPaid: principalPaid ? parseFloat(principalPaid) : null }),
        ...(interestPaid !== undefined && { interestPaid: interestPaid ? parseFloat(interestPaid) : null }),
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'payment_updated',
        category: 'payment',
        result: 'success',
        resourceType: 'payment',
        resourceId: paymentId,
        details: {
          status: updatedPayment.status,
          actualAmount: actualAmount ? parseFloat(actualAmount) : null,
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
        balanceAfter: updatedPayment.balanceAfter ? Number(updatedPayment.balanceAfter) : null,
        principalPaid: updatedPayment.principalPaid ? Number(updatedPayment.principalPaid) : null,
        interestPaid: updatedPayment.interestPaid ? Number(updatedPayment.interestPaid) : null,
      }
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Failed to update payment' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payments/:id
 * Delete a payment record
 */
export async function DELETE(
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
    const payment = await prisma.paymentHistory.findFirst({
      where: {
        id: paymentId,
        tenantId,
      },
      select: {
        id: true,
        scheduledDate: true,
      }
    });

    if (!payment) {
      return NextResponse.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // Delete payment
    await prisma.paymentHistory.delete({
      where: { id: paymentId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'payment_deleted',
        category: 'payment',
        result: 'success',
        resourceType: 'payment',
        resourceId: paymentId,
        details: {
          scheduledDate: payment.scheduledDate,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Payment deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
