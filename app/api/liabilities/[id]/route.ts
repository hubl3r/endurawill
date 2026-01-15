// app/api/liabilities/[id]/route.ts
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

    const liability = await prisma.liability.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
      include: {
        valueHistory: {
          orderBy: { valueDate: 'desc' },
        },
      },
    });

    if (!liability) {
      return NextResponse.json(
        { success: false, error: 'Liability not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      liability,
    });
  } catch (error) {
    console.error('Error fetching liability:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch liability',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const existingLiability = await prisma.liability.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
    });

    if (!existingLiability) {
      return NextResponse.json(
        { success: false, error: 'Liability not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Update liability
    const liability = await prisma.liability.update({
      where: { id: id },
      data: {
        type: body.type,
        description: body.description,
        creditor: body.creditor || null,
        category: body.category || null,
        originalAmount: body.originalAmount ? parseFloat(body.originalAmount) : undefined,
        currentBalance: body.currentBalance ? parseFloat(body.currentBalance) : undefined,
        amount: body.currentBalance ? parseFloat(body.currentBalance) : undefined, // Deprecated field
        currency: body.currency || 'USD',
        accountNumber: body.accountNumber || null,
        loanNumber: body.loanNumber || null,
        interestRate: body.interestRate ? parseFloat(body.interestRate) : null,
        originationDate: body.originationDate ? new Date(body.originationDate) : null,
        maturityDate: body.maturityDate ? new Date(body.maturityDate) : null,
        paymentSchedule: body.paymentSchedule || null,
        monthlyPayment: body.monthlyPayment ? parseFloat(body.monthlyPayment) : null,
        nextPaymentDate: body.nextPaymentDate ? new Date(body.nextPaymentDate) : null,
        isSecured: body.isSecured !== undefined ? body.isSecured : false,
        collateralAssetId: body.collateralAssetId || null,
        collateralDescription: body.collateralDescription || null,
        probateStatus: body.probateStatus || null,
        isDeductible: body.isDeductible || null,
        taxCategory: body.taxCategory || null,
        annualReviewReminder: body.annualReviewReminder ? new Date(body.annualReviewReminder) : null,
        lastReviewedAt: body.lastReviewedAt ? new Date(body.lastReviewedAt) : null,
        notes: body.notes || null,
        attachments: body.attachments || null,
      },
      include: {
        valueHistory: true,
      },
    });

    // If balance changed, create new value history entry
    if (
      body.currentBalance &&
      parseFloat(body.currentBalance) !== Number(existingLiability.currentBalance)
    ) {
      await prisma.valueHistory.create({
        data: {
          tenantId: user.tenantId,
          liabilityId: liability.id,
          valueDate: new Date(),
          amount: parseFloat(body.currentBalance),
          currency: body.currency || 'USD',
          source: 'STATEMENT',
          sourceDetails: 'Updated liability balance',
          recordedBy: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      liability,
      message: 'Liability updated successfully',
    });
  } catch (error) {
    console.error('Error updating liability:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update liability',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    // Delete liability (cascade will handle related records)
    await prisma.liability.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Liability deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting liability:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete liability',
      },
      { status: 500 }
    );
  }
}
