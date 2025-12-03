import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * PATCH /api/delegates/[id]/promote
 * Promotes a delegate to co-owner status
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Only primary owner can promote
    if (!user.isPrimary) {
      return NextResponse.json(
        { error: 'Only the primary owner can promote delegates to co-owner' },
        { status: 403 }
      );
    }

    // Find delegate
    const delegate = await prisma.delegate.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      }
    });

    if (!delegate) {
      return NextResponse.json({ error: 'Delegate not found' }, { status: 404 });
    }

    // Check if delegate has accepted and has user account
    if (!delegate.hasAccount || !delegate.userId) {
      return NextResponse.json(
        { error: 'Delegate must accept invitation and create account before being promoted' },
        { status: 400 }
      );
    }

    // Check if estate allows co-owners
    if (user.tenant.type === 'individual') {
      return NextResponse.json(
        { error: 'Estate must be converted to joint estate before adding co-owners' },
        { status: 400 }
      );
    }

    // Check if estate is at max owners
    if (user.tenant.ownerCount >= user.tenant.maxOwners) {
      return NextResponse.json(
        { error: 'Estate has reached maximum number of owners' },
        { status: 400 }
      );
    }

    // Check if user is already a co-owner
    const delegateUser = await prisma.user.findUnique({
      where: { id: delegate.userId }
    });

    if (delegateUser?.role === 'co_owner') {
      return NextResponse.json(
        { error: 'This delegate is already a co-owner' },
        { status: 400 }
      );
    }

    // Promote: Update user role and increment owner count
    await prisma.$transaction([
      prisma.user.update({
        where: { id: delegate.userId },
        data: { role: 'co_owner' }
      }),
      prisma.tenant.update({
        where: { id: user.tenant.id },
        data: { ownerCount: { increment: 1 } }
      })
    ]);

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'delegate_promoted',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: `${delegate.fullName} promoted to co-owner`
    });
  } catch (error) {
    console.error('Error promoting delegate:', error);
    return NextResponse.json(
      { error: 'Failed to promote delegate' }, 
      { status: 500 }
    );
  }
}
