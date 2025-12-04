import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(
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

    const delegate = await prisma.delegate.findFirst({
      where: {
        id,
        tenantId: user.tenant.id
      }
    });

    if (!delegate) {
      return NextResponse.json({ error: 'Delegate not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, delegate });
  } catch (error) {
    console.error('Error loading delegate:', error);
    return NextResponse.json({ error: 'Failed to load delegate' }, { status: 500 });
  }
}

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

    const data = await request.json();

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json({ error: 'Only estate owners can modify delegates' }, { status: 403 });
    }

    const delegate = await prisma.delegate.findFirst({
      where: { id, tenantId: user.tenant.id }
    });

    if (!delegate) {
      return NextResponse.json({ error: 'Delegate not found' }, { status: 404 });
    }

    const updateData: any = {};
    if (data.fullName) updateData.fullName = data.fullName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.relationship) updateData.relationship = data.relationship;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;

    const updatedDelegate = await prisma.delegate.update({
      where: { id },
      data: updateData
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'delegate_updated',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, delegate: updatedDelegate });
  } catch (error) {
    console.error('Error updating delegate:', error);
    return NextResponse.json({ error: 'Failed to update delegate' }, { status: 500 });
  }
}

export async function DELETE(
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

    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json({ error: 'Only estate owners can remove delegates' }, { status: 403 });
    }

    const delegate = await prisma.delegate.findFirst({
      where: { id, tenantId: user.tenant.id }
    });

    if (!delegate) {
      return NextResponse.json({ error: 'Delegate not found' }, { status: 404 });
    }

    await prisma.delegate.update({
      where: { id },
      data: {
        status: 'revoked',
        revokedAt: new Date()
      }
    });

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'delegate_revoked',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Delegate revoked' });
  } catch (error) {
    console.error('Error revoking delegate:', error);
    return NextResponse.json({ error: 'Failed to revoke delegate' }, { status: 500 });
  }
}
