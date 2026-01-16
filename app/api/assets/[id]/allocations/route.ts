// app/api/assets/[id]/allocations/route.ts
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

    // Fetch allocations
    const allocations = await prisma.assetBeneficiary.findMany({
      where: { assetId: id },
      include: {
        beneficiary: {
          select: {
            id: true,
            fullName: true,
            relationship: true,
            email: true,
            isPrimary: true,
            isCharity: true,
          },
        },
      },
      orderBy: [
        { isPrimary: 'desc' },
        { priority: 'asc' },
      ],
    });

    // Calculate total allocated percentage
    const totalPercentage = allocations.reduce((sum, alloc) => {
      return sum + (alloc.percentage ? Number(alloc.percentage) : 0);
    }, 0);

    return NextResponse.json({
      success: true,
      allocations,
      totalPercentage,
    });
  } catch (error) {
    console.error('Error fetching allocations:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch allocations',
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

    const body = await req.json();

    // Validate required fields
    if (!body.beneficiaryId || !body.allocationType) {
      return NextResponse.json(
        { success: false, error: 'Beneficiary and allocation type are required' },
        { status: 400 }
      );
    }

    // Verify beneficiary belongs to same tenant
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: body.beneficiaryId,
        tenantId: user.tenantId,
      },
    });

    if (!beneficiary) {
      return NextResponse.json(
        { success: false, error: 'Beneficiary not found' },
        { status: 404 }
      );
    }

    // Check if allocation already exists
    const existing = await prisma.assetBeneficiary.findFirst({
      where: {
        assetId: id,
        beneficiaryId: body.beneficiaryId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: 'This beneficiary is already allocated to this asset' },
        { status: 400 }
      );
    }

    // If percentage allocation, validate total doesn't exceed 100%
    if (body.allocationType === 'percentage' && body.percentage) {
      const currentAllocations = await prisma.assetBeneficiary.findMany({
        where: { assetId: id },
      });

      const currentTotal = currentAllocations.reduce((sum, alloc) => {
        return sum + (alloc.percentage ? Number(alloc.percentage) : 0);
      }, 0);

      if (currentTotal + parseFloat(body.percentage) > 100) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot allocate ${body.percentage}%. Already allocated ${currentTotal}%. Only ${100 - currentTotal}% remaining.`,
          },
          { status: 400 }
        );
      }
    }

    // Create allocation
    const allocation = await prisma.assetBeneficiary.create({
      data: {
        assetId: id,
        beneficiaryId: body.beneficiaryId,
        allocationType: body.allocationType,
        percentage: body.percentage ? parseFloat(body.percentage) : null,
        specificAmount: body.specificAmount ? parseFloat(body.specificAmount) : null,
        taxAllocation: body.taxAllocation || null,
        taxNotes: body.taxNotes || null,
        conditions: body.conditions || null,
        isPrimary: body.isPrimary !== false,
        isContingent: body.isContingent || false,
        priority: body.priority || 1,
      },
      include: {
        beneficiary: true,
      },
    });

    return NextResponse.json({
      success: true,
      allocation,
      message: 'Allocation created successfully',
    });
  } catch (error) {
    console.error('Error creating allocation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create allocation',
      },
      { status: 500 }
    );
  }
}
