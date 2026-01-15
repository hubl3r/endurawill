// app/api/assets/route.ts
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
    const user = await prisma.user.findUnique({
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

    // Fetch all assets with relations
    const assets = await prisma.asset.findMany({
      where: { tenantId: user.tenantId },
      include: {
        basisAdjustments: {
          orderBy: { adjustmentDate: 'desc' },
          take: 5,
        },
        valueHistory: {
          orderBy: { valueDate: 'desc' },
          take: 1, // Get most recent value
        },
        assetBeneficiaries: {
          include: {
            beneficiary: {
              select: {
                id: true,
                fullName: true,
                relationship: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary statistics
    const totalValue = assets.reduce((sum, asset) => {
      return sum + Number(asset.estimatedValue || 0);
    }, 0);

    const assetsByCategory = assets.reduce((acc, asset) => {
      const category = asset.category || 'uncategorized';
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 };
      }
      acc[category].count++;
      acc[category].value += Number(asset.estimatedValue || 0);
      return acc;
    }, {} as Record<string, { count: number; value: number }>);

    const probateAssets = assets.filter(a => a.probateStatus === 'PROBATE');
    const nonProbateAssets = assets.filter(a => a.probateStatus === 'NON_PROBATE');
    const trustAssets = assets.filter(a => a.probateStatus === 'TRUST_ASSET');

    return NextResponse.json({
      success: true,
      assets,
      tenant: user.tenant,
      summary: {
        totalAssets: assets.length,
        totalValue,
        assetsByCategory,
        probateCount: probateAssets.length,
        probateValue: probateAssets.reduce((sum, a) => sum + Number(a.estimatedValue || 0), 0),
        nonProbateCount: nonProbateAssets.length,
        nonProbateValue: nonProbateAssets.reduce((sum, a) => sum + Number(a.estimatedValue || 0), 0),
        trustCount: trustAssets.length,
        trustValue: trustAssets.reduce((sum, a) => sum + Number(a.estimatedValue || 0), 0),
      },
    });
  } catch (error) {
    console.error('Error fetching assets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch assets',
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

    const user = await prisma.user.findUnique({
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
    if (!body.type || !body.description) {
      return NextResponse.json(
        { success: false, error: 'Type and description are required' },
        { status: 400 }
      );
    }

    // Create asset
    const asset = await prisma.asset.create({
      data: {
        tenantId: user.tenantId,
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
        // Tax fields (optional)
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
        includedInEstate: body.includedInEstate !== false, // Default true
        annualReviewReminder: body.annualReviewReminder ? new Date(body.annualReviewReminder) : null,
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

    // If initial value provided, create value history entry
    if (body.estimatedValue && body.valuationDate) {
      await prisma.valueHistory.create({
        data: {
          tenantId: user.tenantId,
          assetId: asset.id,
          valueDate: new Date(body.valuationDate),
          amount: parseFloat(body.estimatedValue),
          currency: body.currency || 'USD',
          source: body.valueSource || 'ESTIMATE',
          sourceDetails: body.valueSourceDetails || null,
          recordedBy: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      asset,
      message: 'Asset created successfully',
    });
  } catch (error) {
    console.error('Error creating asset:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create asset',
      },
      { status: 500 }
    );
  }
}
