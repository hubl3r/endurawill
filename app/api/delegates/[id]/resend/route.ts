import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { sendDelegateInvitation } from '@/lib/email-service';

/**
 * POST /api/delegates/[id]/resend
 * Resends invitation email to a delegate
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Only owners can resend invitations
    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json(
        { error: 'Only estate owners can resend invitations' },
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

    // Can only resend to invited status (not active, revoked, etc)
    if (delegate.status !== 'invited') {
      return NextResponse.json(
        { error: `Cannot resend invitation. Current status: ${delegate.status}` },
        { status: 400 }
      );
    }

    // Rate limit: can't resend within 1 hour
    if (delegate.lastInviteSentAt) {
      const hoursSinceLastSent = (Date.now() - new Date(delegate.lastInviteSentAt).getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastSent < 1) {
        const minutesRemaining = Math.ceil((1 - hoursSinceLastSent) * 60);
        return NextResponse.json(
          { error: `Please wait ${minutesRemaining} minutes before resending the invitation` },
          { status: 429 }
        );
      }
    }

    // Check if invitation is expired
    if (delegate.expiresAt && new Date(delegate.expiresAt) < new Date()) {
      // Generate new token and extend expiration
      const newToken = crypto.randomUUID();
      const newExpiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await prisma.delegate.update({
        where: { id: delegate.id },
        data: {
          invitationToken: newToken,
          expiresAt: newExpiration,
          lastInviteSentAt: new Date(),
          status: 'invited' // Reset from expired to invited
        }
      });

      // Send email with new token
      const estateName = user.tenant.name || `Estate of ${user.fullName}`;
      await sendDelegateInvitation(
        delegate.email,
        delegate.fullName,
        user.fullName,
        estateName,
        newToken
      );
    } else {
      // Update last sent timestamp
      await prisma.delegate.update({
        where: { id: delegate.id },
        data: {
          lastInviteSentAt: new Date()
        }
      });

      // Resend with existing token
      const estateName = user.tenant.name || `Estate of ${user.fullName}`;
      await sendDelegateInvitation(
        delegate.email,
        delegate.fullName,
        user.fullName,
        estateName,
        delegate.invitationToken!
      );
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'invitation_resent',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Invitation email sent successfully'
    });
  } catch (error) {
    console.error('Error resending invitation:', error);
    return NextResponse.json(
      { error: 'Failed to resend invitation' }, 
      { status: 500 }
    );
  }
}
