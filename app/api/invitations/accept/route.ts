import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';

/**
 * POST /api/invitations/accept
 * Accepts a delegate invitation and creates Clerk user account
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { token, password } = data;

    if (!token || !password) {
      return NextResponse.json(
        { error: 'Token and password are required' },
        { status: 400 }
      );
    }

    // Find delegate by invitation token
    const delegate = await prisma.delegate.findFirst({
      where: {
        invitationToken: token,
        status: { in: ['pending', 'invited'] },
        hasAccount: false
      },
      include: {
        tenant: true
      }
    });

    if (!delegate) {
      return NextResponse.json(
        { error: 'Invalid or expired invitation' },
        { status: 400 }
      );
    }

    // Check if invitation has expired
    if (delegate.expiresAt && new Date(delegate.expiresAt) < new Date()) {
      await prisma.delegate.update({
        where: { id: delegate.id },
        data: { status: 'expired' }
      });

      return NextResponse.json(
        { error: 'This invitation has expired. Please request a new invitation.' },
        { status: 400 }
      );
    }

    // Check if email is already in use in our database
    const existingUser = await prisma.user.findFirst({
      where: { email: delegate.email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if email exists in Clerk
    const client = await clerkClient();
    const clerkUsers = await client.users.getUserList({
      emailAddress: [delegate.email]
    });

    if (clerkUsers.data.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Create Clerk user
    const nameParts = delegate.fullName.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || nameParts[0]; // Use first name as last if only one name
    
    const userData: any = {
      emailAddress: [delegate.email],
      password: password,
      firstName: firstName,
      lastName: lastName,
    };
    
    // Add legal acceptance if terms were accepted
    if (data.acceptedTerms) {
      userData.unsafeMetadata = {
        legal_accepted_at: new Date().toISOString()
      };
    }
    
    const clerkUser = await client.users.createUser(userData);

    // Create user in our database and link to delegate
    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        tenantId: delegate.tenantId,
        role: 'delegate',
        isPrimary: false,
        fullName: delegate.fullName,
        email: delegate.email,
        phone: delegate.phone
      }
    });

    // Update delegate record
    await prisma.delegate.update({
      where: { id: delegate.id },
      data: {
        userId: user.id,
        hasAccount: true,
        status: 'active',
        acceptedAt: new Date(),
        invitationToken: null // Clear token after use
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: delegate.tenantId,
        userId: user.id,
        delegateId: delegate.id,
        actorType: 'delegate',
        actorName: delegate.fullName,
        action: 'invitation_accepted',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Account created successfully. You can now sign in.',
      userId: user.id
    });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    
    // Handle Clerk-specific errors
    if (error && typeof error === 'object' && 'errors' in error) {
      const clerkError = error as any;
      console.error('Clerk error details:', JSON.stringify(clerkError.errors, null, 2));
      
      if (clerkError.errors?.[0]?.code === 'form_identifier_exists') {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 400 }
        );
      }
      
      // Return the specific Clerk error message
      const errorMessage = clerkError.errors?.[0]?.message || clerkError.errors?.[0]?.longMessage || 'Failed to create account';
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' }, 
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invitations/accept?token=xyz
 * Rejects/declines an invitation
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find delegate by invitation token
    const delegate = await prisma.delegate.findFirst({
      where: {
        invitationToken: token,
        status: { in: ['pending', 'invited'] },
        hasAccount: false
      }
    });

    if (!delegate) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    // Update delegate to declined status
    await prisma.delegate.update({
      where: { id: delegate.id },
      data: {
        status: 'declined',
        revokedAt: new Date(),
        invitationToken: null
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: delegate.tenantId,
        delegateId: delegate.id,
        actorType: 'delegate',
        actorName: delegate.fullName,
        action: 'invitation_rejected',
        category: 'delegate',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Invitation declined'
    });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    return NextResponse.json(
      { error: 'Failed to reject invitation' }, 
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

    // Find delegate by invitation token
    const delegate = await prisma.delegate.findFirst({
      where: {
        invitationToken: token,
        status: { in: ['pending', 'invited'] },
        hasAccount: false
      },
      include: {
        tenant: true,
        invitedBy: {
          select: {
            fullName: true
          }
        }
      }
    });

    if (!delegate) {
      return NextResponse.json(
        { error: 'Invalid invitation token' },
        { status: 400 }
      );
    }

    // Check if expired
    if (delegate.expiresAt && new Date(delegate.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This invitation has expired' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true,
      delegate: {
        fullName: delegate.fullName,
        email: delegate.email,
        relationship: delegate.relationship,
        invitedBy: delegate.invitedBy.fullName,
        estateName: delegate.tenant.name || `Estate of ${delegate.invitedBy.fullName}`,
        expiresAt: delegate.expiresAt
      }
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    return NextResponse.json(
      { error: 'Failed to validate invitation' }, 
      { status: 500 }
    );
  }
}
