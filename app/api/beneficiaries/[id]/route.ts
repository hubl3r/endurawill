// app/api/beneficiaries/[id]/route.ts
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

    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
      include: {
        assetAllocations: {
          include: {
            asset: {
              select: {
                id: true,
                description: true,
                category: true,
                estimatedValue: true,
              },
            },
          },
        },
      },
    });

    if (!beneficiary) {
      return NextResponse.json(
        { success: false, error: 'Beneficiary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      beneficiary,
    });
  } catch (error) {
    console.error('Error fetching beneficiary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch beneficiary',
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
      select: { tenantId: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Verify beneficiary belongs to user's tenant
    const existingBeneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
    });

    if (!existingBeneficiary) {
      return NextResponse.json(
        { success: false, error: 'Beneficiary not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Update beneficiary
    const beneficiary = await prisma.beneficiary.update({
      where: { id: id },
      data: {
        fullName: body.fullName,
        relationship: body.relationship,
        email: body.email || null,
        phone: body.phone || null,
        address: body.address || null,
        isPrimary: body.isPrimary !== false,
        isCharity: body.isCharity || false,
        charityTaxId: body.charityTaxId || null,
        shareType: body.shareType || 'percentage',
        shareValue: body.shareValue ? parseFloat(body.shareValue) : null,
        sharePercent: body.sharePercent ? parseFloat(body.sharePercent) : null,
        conditions: body.conditions || null,
        trusteeInfo: body.trusteeInfo || null,
        notes: body.notes || null,
      },
      include: {
        assetAllocations: {
          include: {
            asset: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      beneficiary,
      message: 'Beneficiary updated successfully',
    });
  } catch (error) {
    console.error('Error updating beneficiary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update beneficiary',
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

    // Verify beneficiary belongs to user's tenant
    const beneficiary = await prisma.beneficiary.findFirst({
      where: {
        id: id,
        tenantId: user.tenantId,
      },
      include: {
        assetAllocations: true,
      },
    });

    if (!beneficiary) {
      return NextResponse.json(
        { success: false, error: 'Beneficiary not found' },
        { status: 404 }
      );
    }

    // Check if beneficiary has asset allocations
    if (beneficiary.assetAllocations.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete beneficiary with ${beneficiary.assetAllocations.length} asset allocation(s). Remove allocations first.`,
        },
        { status: 400 }
      );
    }

    // Delete beneficiary
    await prisma.beneficiary.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Beneficiary deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting beneficiary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete beneficiary',
      },
      { status: 500 }
    );
  }
}
