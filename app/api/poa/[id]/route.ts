// app/api/poa/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const poa = await prisma.powerOfAttorney.findUnique({
      where: { id: params.id },
      include: {
        agents: {
          orderBy: {
            order: 'asc',
          },
        },
        grantedPowers: {
          include: {
            category: true,
          },
        },
        powerLimitations: true,
        revocations: true,
        auditLogs: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!poa) {
      return NextResponse.json(
        { success: false, error: 'POA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      poa,
    });
  } catch (error) {
    console.error('Error fetching POA:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch POA',
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
    // Check if POA exists and is DRAFT
    const poa = await prisma.powerOfAttorney.findUnique({
      where: { id: params.id },
    });

    if (!poa) {
      return NextResponse.json(
        { success: false, error: 'POA not found' },
        { status: 404 }
      );
    }

    if (poa.status !== 'DRAFT') {
      return NextResponse.json(
        { success: false, error: 'Only draft POAs can be deleted. Active POAs must be revoked.' },
        { status: 400 }
      );
    }

    // Delete POA (cascade will delete related records)
    await prisma.powerOfAttorney.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: 'POA deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting POA:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete POA',
      },
      { status: 500 }
    );
  }
}
