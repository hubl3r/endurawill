import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/delegates/[id]
 * Get details of a specific delegate
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user || !user.tenant) {
      return NextResponse.json(
        { error: 'User or tenant not found' },
        { status: 404 }
      );
    }

    const delegate = await prisma.delegate.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenant.id
      }
    });

    if (!delegate) {
      return NextResponse.json(
        { error: 'Delegate not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      delegate
    });

  } catch (error) {
    console.error('Error loading delegate:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load delegate',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/delegates/[id]
 * Update delegate details or permissions
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const data = await request.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user || !user.tenant) {
      return NextResponse.json(
        { error: 'User or tenant not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json(
        { error: 'Only estate owners can modify delegates' },
        { status: 403 }
      );
    }

    // Find delegate
    const delegate = await prisma.delegate.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenant.id
      }
    });

    if (!delegate) {
      return NextResponse.json(
        { error: 'Delegate not found' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = {};

    if (data.fullName) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.relationship) updateData.relationship = data.relationship;
    if (data.canAccessWhen) updateData.canAccessWhen = data.canAccessWhen;
    if (data.notes !== undefined) updateData.notes = data.notes;

    if (data.expiresAt !== undefined) {
      if (data.expiresAt === null) {
        updateData.expiresAt = null;
      } else {
        const expiresAt = new Date(data.expiresAt);
        if (expiresAt <= new Date()) {
          return NextResponse.json(
            { error: 'Expiration date must be in the future' },
            { status: 400 }
          );
        }
        updateData.expiresAt = expiresAt;
      }
    }

    if (data.status && ['pending', 'invited', 'active', 'revoked'].includes(data.status)) {
      updateData.status = data.status;
    }

    // Update permission fields if provided
    if (data.documentPermissions !== undefined) updateData.documentPermissions = data.documentPermissions;
    if (data.assetPermissions !== undefined) updateData.assetPermissions = data.assetPermissions;
    if (data.liabilityPermissions !== undefined) updateData.liabilityPermissions = data.liabilityPermissions;
    if (data.beneficiaryPermissions !== undefined) updateData.beneficiaryPermissions = data.beneficiaryPermissions;
    if (data.settingsPermissions !== undefined) updateData.settingsPermissions = data.settingsPermissions;
    if (data.profilePermissions !== undefined) updateData.profilePermissions = data.profilePermissions;

    // Update delegate
    const updatedDelegate = await prisma.delegate.update({
      where: { id: params.id },
      data: updateData
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'delegate_updated',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      delegate: updatedDelegate,
      message: 'Delegate updated successfully'
    });

  } catch (error) {
    console.error('Error updating delegate:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update delegate', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/delegates/[id]
 * Revoke a delegate
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user || !user.tenant) {
      return NextResponse.json(
        { error: 'User or tenant not found' },
        { status: 404 }
      );
    }

    // Check permissions
    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json(
        { error: 'Only estate owners can remove delegates' },
        { status: 403 }
      );
    }

    // Find delegate
    const delegate = await prisma.delegate.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenant.id
      }
    });

    if (!delegate) {
      return NextResponse.json(
        { error: 'Delegate not found' },
        { status: 404 }
      );
    }

    // Revoke delegate (soft delete using status and revokedAt)
    await prisma.delegate.update({
      where: { id: params.id },
      data: {
        status: 'revoked',
        revokedAt: new Date()
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'delegate_revoked',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Delegate revoked successfully'
    });

  } catch (error) {
    console.error('Error revoking delegate:', error);
    return NextResponse.json(
      { 
        error: 'Failed to revoke delegate', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
