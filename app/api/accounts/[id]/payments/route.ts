// /app/api/accounts/[id]/payments/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/accounts/:id/payments
 * Fetch all payment history for an account
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

    const { user, tenantId } = auth;
    const { id: accountId } = await params;

    // Verify account belongs to this tenant
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        tenantId,
      },
    });

    if (!account) {
      return NextResponse.json({ 
        error: 'Account not found' 
      }, { status: 404 });
    }

    // Fetch all payments for this account
    const payments = await prisma.paymentHistory.findMany({
      where: {
        accountId,
        tenantId,
      },
      orderBy: {
        scheduledDate: 'desc',
      },
    });

    // Parse JSON fields
    const paymentsWithParsedJson = payments.map(payment => ({
      ...payment,
      scheduledAmount: Number(payment.scheduledAmount),
      actualAmount: payment.actualAmount ? Number(payment.actualAmount) : null,
      remainingBalance: payment.remainingBalance ? Number(payment.remainingBalance) : null,
      balanceAfter: payment.balanceAfter ? Number(payment.balanceAfter) : null,
      principalPaid: payment.principalPaid ? Number(payment.principalPaid) : null,
      interestPaid: payment.interestPaid ? Number(payment.interestPaid) : null,
      partialPayments: payment.partialPayments || null,
      payoffPlan: payment.payoffPlan || null,
    }));

    return NextResponse.json({ 
      success: true, 
      payments: paymentsWithParsedJson 
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch payments' 
    }, { status: 500 });
  }
}

/**
 * POST /api/accounts/:id/payments
 * Create a new payment record (manual entry or projection)
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
    const { id: accountId } = await params;

    // Verify account belongs to this tenant
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        tenantId,
      },
    });

    if (!account) {
      return NextResponse.json({ 
        error: 'Account not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const {
      scheduledDate,
      scheduledAmount,
      manualDueDate,
      originalDueDate,
      actualDate,
      actualAmount,
      status,
      paymentMethod,
      notes,
      partialPayments,
      remainingBalance,
      payoffPlan,
    } = body;

    // Validate required fields
    if (!scheduledDate || !scheduledAmount) {
      return NextResponse.json(
        { error: 'Scheduled date and amount are required' },
        { status: 400 }
      );
    }

    // Create payment record
    const payment = await prisma.paymentHistory.create({
      data: {
        accountId,
        tenantId,
        scheduledDate: new Date(scheduledDate),
        scheduledAmount: parseFloat(scheduledAmount),
        manualDueDate: manualDueDate ? new Date(manualDueDate) : null,
        originalDueDate: originalDueDate ? new Date(originalDueDate) : null,
        actualDate: actualDate ? new Date(actualDate) : null,
        actualAmount: actualAmount ? parseFloat(actualAmount) : null,
        status: status || 'UPCOMING',
        paymentMethod: paymentMethod || null,
        notes: notes || null,
        partialPayments: partialPayments || null,
        remainingBalance: remainingBalance ? parseFloat(remainingBalance) : null,
        payoffPlan: payoffPlan || null,
      },
    });

    return NextResponse.json({ 
      success: true, 
      payment: {
        ...payment,
        scheduledAmount: Number(payment.scheduledAmount),
        actualAmount: payment.actualAmount ? Number(payment.actualAmount) : null,
        remainingBalance: payment.remainingBalance ? Number(payment.remainingBalance) : null,
      }
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
      }
