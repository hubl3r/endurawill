import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/estates
 * Returns all estates the current user has access to
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user records for this Clerk user (one per estate they have access to)
    const userRecords = await prisma.user.findMany({
      where: { clerkId: clerkUser.id },
      include: {
        tenant: true
      },
      orderBy: [
        { isPrimary: 'desc' }, // Primary owners first
        { createdAt: 'desc' }  // Then by creation date
      ]
    });

    const estates = userRecords.map(record => ({
      id: record.tenant.id,
      name: record.tenant.name || `Estate of ${record.fullName}`,
      type: record.tenant.type,
      role: record.role,
      isPrimary: record.isPrimary,
      userId: record.id,
    }));

    return NextResponse.json({
      success: true,
      estates,
      count: estates.length
    });
  } catch (error) {
    console.error('Error fetching estates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch estates' },
      { status: 500 }
    );
  }
}
