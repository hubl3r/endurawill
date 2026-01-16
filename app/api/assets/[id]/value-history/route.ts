// app/api/assets/[id]/value-history/route.ts
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

    // Fetch value history
    const history = await prisma.valueHistory.findMany({
      where: {
        assetId: id,
        tenantId: user.tenantId,
      },
      orderBy: { valueDate: 'desc' },
    });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error fetching value history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch value history',
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
    });

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Validate required fields
    if (!body.amount || !body.valueDate || !body.source) {
      return NextResponse.json(
        { success: false, error: 'Amount, date, and source are required' },
        { status: 400 }
      );
    }

    // Create value history entry
    const entry = await prisma.valueHistory.create({
      data: {
        tenantId: user.tenantId,
        assetId: id,
        valueDate: new Date(body.valueDate),
        amount: parseFloat(body.amount),
        currency: body.currency || 'USD',
        source: body.source,
        sourceDetails: body.sourceDetails || null,
        appraisalDoc: body.appraisalDoc || null,
        notes: body.notes || null,
        recordedBy: user.id,
      },
    });

    // Update asset's current value if this is the most recent entry
    const mostRecent = await prisma.valueHistory.findFirst({
      where: {
        assetId: id,
        tenantId: user.tenantId,
      },
      orderBy: { valueDate: 'desc' },
    });

    if (mostRecent?.id === entry.id) {
      await prisma.asset.update({
        where: { id: id },
        data: {
          estimatedValue: parseFloat(body.amount),
          valuationDate: new Date(body.valueDate),
        },
      });
    }

    return NextResponse.json({
      success: true,
      entry,
      message: 'Value history entry added successfully',
    });
  } catch (error) {
    console.error('Error creating value history:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create value history entry',
      },
      { status: 500 }
    );
  }
}
