import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
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

    const delegates = await prisma.delegate.findMany({
      where: {
        tenantId: user.tenant.id,
        status: { in: ['pending', 'invited', 'active'] }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, delegates });
  } catch (error) {
    console.error('Error loading delegates:', error);
    return NextResponse.json(
      { error: 'Failed to load delegates' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();

    if (!data.fullName || !data.email) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json(
        { error: 'Only estate owners can add delegates' },
        { status: 403 }
      );
    }

    const delegate = await prisma.delegate.create({
      data: {
        tenantId: user.tenant.id,
        invitedByUserId: user.id,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        phone: data.phone || null,
        relationship: data.relationship || 'other',
        status: 'invited',
        invitationToken: crypto.randomUUID(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        canAccessWhen: data.canAccessWhen || 'after_death'
      }
    });

    // TODO: Send invitation email
    // const inviteLink = `https://endurawill.com/accept-invite?token=${delegate.invitationToken}`;
    // await sendInvitationEmail(delegate.email, delegate.fullName, user.fullName, inviteLink);

    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'delegate_invited',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      delegate,
      message: 'Delegate created successfully'
    });
  } catch (error) {
    console.error('Error creating delegate:', error);
    return NextResponse.json(
      { error: 'Failed to create delegate' }, 
      { status: 500 }
    );
  }
}
