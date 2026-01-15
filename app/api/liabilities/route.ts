// app/api/liabilities/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user's tenant
    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      select: { 
        tenantId: true,
        tenant: {
          select: {
            name: true,
            type: true,
          }
        }
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Fetch all liabilities with relations
    const liabilities = await prisma.liability.findMany({
      where: { tenantId: user.tenantId },
      include: {
        valueHistory: {
          orderBy: { valueDate: 'desc' },
          take: 1, // Get most recent balance
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary statistics
    const totalDebt = liabilities.reduce((sum, liability) => {
      return sum + Number(liability.currentBalance || 0);
    }, 0);

    const liabilitiesByCategory = liabilities.reduce((acc, liability) => {
      const category = liability.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 };
      }
      acc[category].count++;
      acc[category].value += Number(liability.currentBalance || 0);
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const securedDebt = liabilities.filter(l => l.isSecured);
    const unsecuredDebt = liabilities.filter(l => !l.isSecured);
    const deductibleDebt = liabilities.filter(l => l.isDeductible);

    return NextResponse.json({
      success: true,
      liabilities,
      tenant: user.tenant,
      summary: {
        totalLiabilities: liabilities.length,
        totalDebt,
        liabilitiesByCategory,
        securedCount: securedDebt.length,
        securedValue: securedDebt.reduce((sum, l) => sum + Number(l.currentBalance || 0), 0),
        unsecuredCount: unsecuredDebt.length,
        unsecuredValue: unsecuredDebt.reduce((sum, l) => sum + Number(l.currentBalance || 0), 0),
        deductibleCount: deductibleDebt.length,
        deductibleValue: deductibleDebt.reduce((sum, l) => sum + Number(l.currentBalance || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching liabilities:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch liabilities',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();

    // Validate required fields
    if (!body.type || !body.description || !body.currentBalance) {
      return NextResponse.json(
        { success: false, error: 'Type, description, and current balance are required' },
        { status: 400 }
      );
    }

    // Create liability
    const liability = await prisma.liability.create({
      data: {
        tenantId: user.tenantId,
        type: body.type,
        description: body.description,
        creditor: body.creditor || null,
        category: body.category || null,
        originalAmount: body.originalAmount ? parseFloat(body.originalAmount) : parseFloat(body.currentBalance),
        currentBalance: parseFloat(body.currentBalance),
        amount: parseFloat(body.currentBalance), // Deprecated field for backwards compatibility
        currency: body.currency || 'USD',
        accountNumber: body.accountNumber || null,
        loanNumber: body.loanNumber || null,
        interestRate: body.interestRate ? parseFloat(body.interestRate) : null,
        originationDate: body.originationDate ? new Date(body.originationDate) : null,
        maturityDate: body.maturityDate ? new Date(body.maturityDate) : null,
        paymentSchedule: body.paymentSchedule || null,
        monthlyPayment: body.monthlyPayment ? parseFloat(body.monthlyPayment) : null,
        nextPaymentDate: body.nextPaymentDate ? new Date(body.nextPaymentDate) : null,
        isSecured: body.isSecured || false,
        collateralAssetId: body.collateralAssetId || null,
        collateralDescription: body.collateralDescription || null,
        probateStatus: body.probateStatus || null,
        isDeductible: body.isDeductible || null,
        taxCategory: body.taxCategory || null,
        annualReviewReminder: body.annualReviewReminder ? new Date(body.annualReviewReminder) : null,
        notes: body.notes || null,
        attachments: body.attachments || null,
      },
      include: {
        valueHistory: true,
      },
    });

    // Create initial value history entry
    await prisma.valueHistory.create({
      data: {
        tenantId: user.tenantId,
        liabilityId: liability.id,
        valueDate: body.originationDate ? new Date(body.originationDate) : new Date(),
        amount: parseFloat(body.currentBalance),
        currency: body.currency || 'USD',
        source: 'STATEMENT',
        sourceDetails: 'Initial liability entry',
        recordedBy: user.id,
      },
    });

    return NextResponse.json({
      success: true,
      liability,
      message: 'Liability created successfully',
    });
  } catch (error) {
    console.error('Error creating liability:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create liability',
      },
      { status: 500 }
    );
  }
}
