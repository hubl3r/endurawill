// app/api/assets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
      select: { tenantId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const asset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        basisAdjustments: {
          orderBy: { adjustmentDate: 'desc' },
        },
        valueHistory: {
          orderBy: { valueDate: 'desc' },
        },
        assetBeneficiaries: {
          include: {
            beneficiary: true,
          },
        },
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      asset,
    });
  } catch (error) {
    console.error('Error fetching asset:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch asset',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verify asset belongs to user's tenant
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
    });

    if (!existingAsset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Update asset
    const asset = await prisma.asset.update({
      where: { id: params.id },
      data: {
        type: body.type,
        description: body.description,
        category: body.category || null,
        estimatedValue: body.estimatedValue ? parseFloat(body.estimatedValue) : null,
        currency: body.currency || 'USD',
        valuationDate: body.valuationDate ? new Date(body.valuationDate) : null,
        accountNumber: body.accountNumber || null,
        institution: body.institution || null,
        location: body.location || null,
        serialNumber: body.serialNumber || null,
        ownershipType: body.ownershipType || 'sole',
        ownedBy: body.ownedBy || null,
        hasBeneficiary: body.hasBeneficiary || false,
        // Tax fields
        acquisitionDate: body.acquisitionDate ? new Date(body.acquisitionDate) : null,
        acquisitionMethod: body.acquisitionMethod || null,
        originalCostBasis: body.originalCostBasis ? parseFloat(body.originalCostBasis) : null,
        adjustedBasis: body.adjustedBasis ? parseFloat(body.adjustedBasis) : null,
        fairMarketValueAtAcquisition: body.fairMarketValueAtAcquisition ? parseFloat(body.fairMarketValueAtAcquisition) : null,
        fairMarketValueAtDeath: body.fairMarketValueAtDeath ? parseFloat(body.fairMarketValueAtDeath) : null,
        dateOfDeath: body.dateOfDeath ? new Date(body.dateOfDeath) : null,
        carryoverBasis: body.carryoverBasis || null,
        holdingPeriod: body.holdingPeriod || null,
        taxLotInfo: body.taxLotInfo || null,
        basisNotes: body.basisNotes || null,
        probateStatus: body.probateStatus || null,
        includedInEstate: body.includedInEstate !== false,
        annualReviewReminder: body.annualReviewReminder ? new Date(body.annualReviewReminder) : null,
        lastReviewedAt: body.lastReviewedAt ? new Date(body.lastReviewedAt) : null,
        reviewedBy: body.reviewedBy || null,
        notes: body.notes || null,
        attachments: body.attachments || null,
        dispositionInstructions: body.dispositionInstructions || null,
      },
      include: {
        basisAdjustments: true,
        valueHistory: true,
        assetBeneficiaries: {
          include: {
            beneficiary: true,
          },
        },
      },
    });

    // If value changed, create new value history entry
    if (
      body.estimatedValue &&
      parseFloat(body.estimatedValue) !== Number(existingAsset.estimatedValue)
    ) {
      await prisma.valueHistory.create({
        data: {
          tenantId: user.tenantId,
          assetId: asset.id,
          valueDate: body.valuationDate ? new Date(body.valuationDate) : new Date(),
          amount: parseFloat(body.estimatedValue),
          currency: body.currency || 'USD',
          source: body.valueSource || 'ESTIMATE',
          sourceDetails: body.valueSourceDetails || 'Updated asset value',
          recordedBy: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      asset,
      message: 'Asset updated successfully',
    });
  } catch (error) {
    console.error('Error updating asset:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update asset',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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
        id: params.id,
        tenantId: user.tenantId,
      },
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    // Delete asset (cascade will handle related records)
    await prisma.asset.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Asset deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting asset:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete asset',
      },
      { status: 500 }
    );
  }
}
