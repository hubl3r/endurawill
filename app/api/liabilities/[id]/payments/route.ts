// app/api/liabilities/[id]/payments/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      select: { tenantId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify liability belongs to user's tenant
    const liability = await prisma.liability.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
    });

    if (!liability) {
      return NextResponse.json(
        { success: false, error: 'Liability not found' },
        { status: 404 }
      );
    }

    // Fetch payment history (stored in ValueHistory table)
    const payments = await prisma.valueHistory.findMany({
      where: {
        liabilityId: id,
        tenantId: user.tenantId,
      },
      orderBy: { valueDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payments',
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      select: { tenantId: true, id: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify liability belongs to user's tenant
    const liability = await prisma.liability.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        currentBalance: true,
      },
    });

    if (!liability) {
      return NextResponse.json(
        { success: false, error: 'Liability not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.amount || !body.paymentDate) {
      return NextResponse.json(
        { success: false, error: 'Payment amount and date are required' },
        { status: 400 }
      );
    }

    const paymentAmount = parseFloat(body.amount);
    const currentBalance = Number(liability.currentBalance || 0);
    const newBalance = currentBalance - paymentAmount;

    if (newBalance < 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Payment amount ($${paymentAmount.toFixed(2)}) exceeds current balance ($${currentBalance.toFixed(2)})`,
        },
        { status: 400 }
      );
    }

    // Create payment record in ValueHistory
    const payment = await prisma.valueHistory.create({
      data: {
        tenantId: user.tenantId,
        liabilityId: id,
        valueDate: new Date(body.paymentDate),
        amount: newBalance, // Store the new balance after payment
        currency: body.currency || 'USD',
        source: 'OTHER',
        sourceDetails: `Payment: ${body.paymentMethod || 'unspecified'}`,
        notes: body.notes || null,
        recordedBy: user.id,
      },
    });

    // Update liability's current balance
    await prisma.liability.update({
      where: { id: id },
      data: {
        currentBalance: newBalance,
      },
    });

    return NextResponse.json({
      success: true,
      payment,
      newBalance,
      message: 'Payment recorded successfully',
    });
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record payment',
      },
      { status: 500 }
    );
  }
}
