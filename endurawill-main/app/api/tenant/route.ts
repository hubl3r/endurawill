import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * PATCH /api/tenant
 * Updates tenant (estate) name and/or type
 */
export async function PATCH(request: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Only primary owner can modify tenant
    if (!user.isPrimary) {
      return NextResponse.json(
        { error: 'Only the primary owner can modify estate settings' },
        { status: 403 }
      );
    }

    const updateData: any = {};

    // Update estate name
    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    // Update estate type with validation
    if (data.type && data.type !== user.tenant.type) {
      // Switching to individual - check owner count
      if (data.type === 'individual' && user.tenant.ownerCount > 1) {
        return NextResponse.json(
          { error: 'Cannot change to individual estate while co-owners exist. Remove co-owners first.' },
          { status: 400 }
        );
      }

      // Switching to joint
      if (data.type === 'joint') {
        updateData.type = 'joint';
        updateData.maxOwners = 2;
      } else if (data.type === 'individual') {
        updateData.type = 'individual';
        updateData.maxOwners = 1;
      } else {
        return NextResponse.json(
          { error: 'Invalid estate type. Must be "individual" or "joint".' },
          { status: 400 }
        );
      }
    }

    // Update tenant
    const updatedTenant = await prisma.tenant.update({
      where: { id: user.tenant.id },
      data: updateData
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'tenant_updated',
        category: 'security',
        resourceType: 'tenant',
        resourceId: updatedTenant.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      tenant: updatedTenant,
      message: 'Estate updated successfully'
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    return NextResponse.json(
      { error: 'Failed to update estate' }, 
      { status: 500 }
    );
  }
}
