// /app/api/accounts/[id]/generate-payments/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';
import { generatePaymentRecords } from '@/lib/generate-payments';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * POST /api/accounts/:id/generate-payments
 * Generate 12 months of payment projections for an account
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

    // Check if account has necessary fields
    if (!account.nextPaymentDate || !account.anticipatedAmount || account.paymentFrequency === 'NONE') {
      return NextResponse.json({
        error: 'Account must have next payment date, amount, and valid frequency',
      }, { status: 400 });
    }

    // Delete existing upcoming payments for this account
    await prisma.paymentHistory.deleteMany({
      where: {
        accountId,
        status: 'UPCOMING',
      },
    });

    // Generate payment records
    const paymentRecords = generatePaymentRecords({
      accountId,
      tenantId,
      nextPaymentDate: account.nextPaymentDate,
      anticipatedAmount: Number(account.anticipatedAmount),
      paymentFrequency: account.paymentFrequency,
    });

    // Create all payment records
    const created = await prisma.paymentHistory.createMany({
      data: paymentRecords,
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'payments_generated',
        category: 'payment',
        result: 'success',
        resourceType: 'account',
        resourceId: accountId,
        details: {
          paymentsCreated: created.count,
          frequency: account.paymentFrequency,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      paymentsCreated: created.count,
      message: `Generated ${created.count} payment projections`,
    });
  } catch (error) {
    console.error('Error generating payments:', error);
    return NextResponse.json(
      { error: 'Failed to generate payments' },
      { status: 500 }
    );
  }
}
