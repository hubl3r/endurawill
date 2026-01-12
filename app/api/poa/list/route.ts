// app/api/poa/list/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // TODO: Get tenantId from auth session
    // For now, get the default tenant
    const tenant = await prisma.tenant.findFirst({
      where: { name: 'Default Tenant' }
    });

    if (!tenant) {
      return NextResponse.json(
        { success: false, error: 'No tenant found' },
        { status: 404 }
      );
    }

    // Fetch all POAs for this tenant
    const poas = await prisma.powerOfAttorney.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        agents: {
          orderBy: {
            order: 'asc',
          },
        },
        grantedPowers: {
          include: {
            category: {
              select: {
                categoryName: true,
                categoryLetter: true,
              },
            },
          },
        },
        powerLimitations: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      poas,
    });
  } catch (error) {
    console.error('Error fetching POAs:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch POAs',
      },
      { status: 500 }
    );
  }
}
