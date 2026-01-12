// app/api/poa/categories/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Fetch all power categories with their sub-powers
    const categories = await prisma.pOAPowerCategoryDefinition.findMany({
      include: {
        subPowers: {
          orderBy: {
            sortOrder: 'asc',
          },
        },
      },
      orderBy: {
        categoryNumber: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      categories,
    });
  } catch (error) {
    console.error('Error fetching power categories:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch categories',
      },
      { status: 500 }
    );
  }
}
