// app/api/poa/categories/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/poa/categories
 * Fetch all POA power categories with their sub-powers
 */
export async function GET() {
  try {
    const categories = await prisma.pOAPowerCategoryDefinition.findMany({
      include: {
        subPowers: {
          orderBy: {
            sortOrder: 'asc'
          }
        }
      },
      orderBy: {
        categoryNumber: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      count: categories.length,
      categories
    });

  } catch (error) {
    console.error('Error fetching POA categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch POA categories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
