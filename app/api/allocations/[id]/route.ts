// app/api/allocations/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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
      select: { tenantId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify allocation belongs to user's tenant (through asset)
    const existingAllocation = await prisma.assetBeneficiary.findFirst({
      where: {
        id: id,
        asset: {
          tenantId: user.tenantId,
        },
      },
      include: {
        asset: true,
      },
    });

    if (!existingAllocation) {
      return NextResponse.json(
        { success: false, error: 'Allocation not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // If updating percentage, validate total doesn't exceed 100%
    if (body.allocationType === 'percentage' && body.percentage) {
      const otherAllocations = await prisma.assetBeneficiary.findMany({
        where: {
          assetId: existingAllocation.assetId,
          id: { not: id },
        },
      });

      const otherTotal = otherAllocations.reduce((sum, alloc) => {
        return sum + (alloc.percentage ? Number(alloc.percentage) : 0);
      }, 0);

      if (otherTotal + parseFloat(body.percentage) > 100) {
        return NextResponse.json(
          {
            success: false,
            error: `Cannot allocate ${body.percentage}%. Other allocations total ${otherTotal}%. Only ${100 - otherTotal}% available.`,
          },
          { status: 400 }
        );
      }
    }

    // Update allocation
    const allocation = await prisma.assetBeneficiary.update({
      where: { id: id },
      data: {
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
        asset: true,
      },
    });

    return NextResponse.json({
      success: true,
      allocation,
      message: 'Allocation updated successfully',
    });
  } catch (error) {
    console.error('Error updating allocation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update allocation',
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

    // Verify allocation belongs to user's tenant
    const allocation = await prisma.assetBeneficiary.findFirst({
      where: {
        id: id,
        asset: {
          tenantId: user.tenantId,
        },
      },
    });

    if (!allocation) {
      return NextResponse.json(
        { success: false, error: 'Allocation not found' },
        { status: 404 }
      );
    }

    // Delete allocation
    await prisma.assetBeneficiary.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Allocation deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting allocation:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete allocation',
      },
      { status: 500 }
    );
  }
}
