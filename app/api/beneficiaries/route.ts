// app/api/beneficiaries/route.ts
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

    // Fetch all beneficiaries
    const beneficiaries = await prisma.beneficiary.findMany({
      where: { tenantId: user.tenantId },
      include: {
        assetAllocations: {
          include: {
            asset: {
              select: {
                id: true,
                description: true,
                estimatedValue: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate summary statistics
    const totalBeneficiaries = beneficiaries.length;
    const primaryBeneficiaries = beneficiaries.filter(b => b.isPrimary).length;
    const charityBeneficiaries = beneficiaries.filter(b => b.isCharity).length;
    
    const beneficiariesByRelationship = beneficiaries.reduce((acc, ben) => {
      const rel = ben.relationship || 'unknown';
      if (!acc[rel]) {
        acc[rel] = 0;
      }
      acc[rel]++;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      beneficiaries,
      summary: {
        totalBeneficiaries,
        primaryBeneficiaries,
        charityBeneficiaries,
        beneficiariesByRelationship,
      },
    });
  } catch (error) {
    console.error('Error fetching beneficiaries:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch beneficiaries',
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
    if (!body.fullName || !body.relationship) {
      return NextResponse.json(
        { success: false, error: 'Full name and relationship are required' },
        { status: 400 }
      );
    }

    // Create beneficiary
    const beneficiary = await prisma.beneficiary.create({
      data: {
        tenantId: user.tenantId,
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
        assetAllocations: true,
      },
    });

    return NextResponse.json({
      success: true,
      beneficiary,
      message: 'Beneficiary created successfully',
    });
  } catch (error) {
    console.error('Error creating beneficiary:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create beneficiary',
      },
      { status: 500 }
    );
  }
}
