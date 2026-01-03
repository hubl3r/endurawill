// app/api/poa/states/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/poa/states
 * Fetch all state requirements for POA creation
 * 
 * Optional query params:
 * - state: Filter by specific state code (e.g., ?state=FL)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const stateCode = searchParams.get('state');

    if (stateCode) {
      // Fetch specific state
      const stateRequirement = await prisma.stateRequirements.findUnique({
        where: {
          state: stateCode.toUpperCase()
        }
      });

      if (!stateRequirement) {
        return NextResponse.json(
          {
            success: false,
            error: `State ${stateCode.toUpperCase()} not found`
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        state: stateRequirement
      });
    }

    // Fetch all states
    const states = await prisma.stateRequirements.findMany({
      orderBy: {
        state: 'asc'
      }
    });

    return NextResponse.json({
      success: true,
      count: states.length,
      states
    });

  } catch (error) {
    console.error('Error fetching state requirements:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch state requirements',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
