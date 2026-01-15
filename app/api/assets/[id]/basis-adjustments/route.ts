// app/api/assets/[id]/basis-adjustments/route.ts
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

    // Verify asset belongs to user's tenant
    const asset = await prisma.asset.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Fetch all basis adjustments for this asset
    const adjustments = await prisma.basisAdjustment.findMany({
      where: {
        assetId: id,
        tenantId: user.tenantId,
      },
      orderBy: { adjustmentDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      adjustments,
    });
  } catch (error) {
    console.error('Error fetching basis adjustments:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch basis adjustments',
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

    // Verify asset belongs to user's tenant
    const asset = await prisma.asset.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
      select: {
        id: true,
        adjustedBasis: true,
        originalCostBasis: true,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.adjustmentType || !body.amount || !body.adjustmentDate || !body.reason) {
      return NextResponse.json(
        { success: false, error: 'Adjustment type, amount, date, and reason are required' },
        { status: 400 }
      );
    }

    const amount = parseFloat(body.amount);
    const currentBasis = Number(asset.adjustedBasis || asset.originalCostBasis || 0);
    const newBasis = currentBasis + amount;

    // Create basis adjustment record (immutable)
    const adjustment = await prisma.basisAdjustment.create({
      data: {
        tenantId: user.tenantId,
        assetId: id,
        adjustmentDate: new Date(body.adjustmentDate),
        adjustmentType: body.adjustmentType,
        amount: amount,
        basisBefore: currentBasis,
        basisAfter: newBasis,
        reason: body.reason,
        documentation: body.documentation || null,
        taxYear: body.taxYear ? parseInt(body.taxYear) : null,
        formReference: body.formReference || null,
        irsPublication: body.irsPublication || null,
        createdBy: user.id,
      },
    });

    // Update asset's adjusted basis
    await prisma.asset.update({
      where: { id: id },
      data: {
        adjustedBasis: newBasis,
      },
    });

    return NextResponse.json({
      success: true,
      adjustment,
      message: 'Basis adjustment recorded successfully',
    });
  } catch (error) {
    console.error('Error creating basis adjustment:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create basis adjustment',
      },
      { status: 500 }
    );
  }
}
