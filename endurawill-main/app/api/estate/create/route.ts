import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * POST /api/estate/create
 * Creates a new tenant/estate for the current user
 */
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { name, type } = body;

    // Validate estate type
    if (!type || !['individual', 'joint'].includes(type)) {
      return NextResponse.json({ error: 'Invalid estate type. Must be "individual" or "joint"' }, { status: 400 });
    }

    // Check if user already has 3 estates (as owner or co-owner)
    const userEstates = await prisma.user.findMany({
      where: {
        clerkId: clerkUser.id,
        role: {
          in: ['primary_owner', 'co_owner']
        }
      }
    });

    if (userEstates.length >= 3) {
      return NextResponse.json(
        { error: 'You have reached the maximum of 3 estates. Please contact support to request an increase.' },
        { status: 400 }
      );
    }

    // Create new tenant
    const estateName = name && name.trim() 
      ? name.trim() 
      : `Estate of ${user.fullName || clerkUser.firstName || 'Unknown'}`;

    const tenant = await prisma.tenant.create({
      data: {
        name: estateName,
        type: type,
        maxOwners: type === 'joint' ? 2 : 1,
        ownerCount: 1,
      }
    });

    // Create a new user record for this tenant
    const newUserRecord = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        tenantId: tenant.id,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        fullName: user.fullName || clerkUser.firstName || 'Unknown',
        role: 'primary_owner',
        isPrimary: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: newUserRecord.id,
        actorType: 'user',
        actorName: newUserRecord.fullName,
        action: 'estate_created',
        category: 'tenant',
        result: 'success',
        resourceType: 'tenant',
        resourceId: tenant.id,
        details: {
          estateName: tenant.name,
          estateType: tenant.type,
        },
      }
    });

    return NextResponse.json({
      success: true,
      estate: {
        id: tenant.id,
        name: tenant.name,
        type: tenant.type,
        role: 'primary_owner'
      }
    });
  } catch (error) {
    console.error('Error creating estate:', error);
    
    // Return a proper JSON error response
    return NextResponse.json(
      { 
        error: 'Failed to create estate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
