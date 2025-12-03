import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * GET /api/delegates
 * Lists all delegates for the current user's tenant
 */
export async function GET() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    // Find user with tenant
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

    // Get all delegates for this tenant with their permissions
    const delegates = await prisma.delegate.findMany({
      where: {
        tenantId: user.tenant.id,
      },
      include: {
        permissions: {
          where: {
            revokedAt: null
          }
        },
        invitedByUser: {
          select: {
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform permissions into a more usable format
    const delegatesWithPermissions = delegates.map(delegate => {
      // Group permissions by type
      const permissionsByType: Record<string, any> = {};
      const documentPermissions: Record<string, any> = {};

      delegate.permissions.forEach(perm => {
        if (perm.scope === 'all') {
          permissionsByType['all'] = {
            view: perm.canView,
            download: perm.canDownload,
            edit: perm.canEdit,
            comment: perm.canComment
          };
        } else if (perm.scope === 'document_type') {
          permissionsByType[perm.documentType || 'unknown'] = {
            view: perm.canView,
            download: perm.canDownload,
            edit: perm.canEdit,
            comment: perm.canComment
          };
        } else if (perm.scope === 'document' && perm.documentId) {
          documentPermissions[perm.documentId] = {
            view: perm.canView,
            download: perm.canDownload,
            edit: perm.canEdit,
            comment: perm.canComment
          };
        }
      });

      return {
        id: delegate.id,
        fullName: delegate.fullName,
        email: delegate.email,
        status: delegate.status,
        expiresAt: delegate.expiresAt,
        invitedBy: delegate.invitedByUser,
        createdAt: delegate.createdAt,
        lastAccessAt: delegate.lastAccessAt,
        permissions: permissionsByType,
        documentPermissions: documentPermissions
      };
    });

    return NextResponse.json({ 
      success: true, 
      delegates: delegatesWithPermissions
    });

  } catch (error) {
    console.error('Error loading delegates:', error);
    return NextResponse.json(
      { 
        error: 'Failed to load delegates',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/delegates
 * Creates a new delegate invitation
 */
export async function POST(request: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const data = await request.json();

    // Validate required fields
    if (!data.fullName || !data.email) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, email' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Find user with tenant
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

    // Check if user has permission to add delegates (must be owner or co-owner)
    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json(
        { error: 'Only estate owners can add delegates' },
        { status: 403 }
      );
    }

    // Check if delegate already exists
    const existingDelegate = await prisma.delegate.findFirst({
      where: {
        tenantId: user.tenant.id,
        email: data.email.toLowerCase(),
      }
    });

    if (existingDelegate) {
      return NextResponse.json(
        { error: 'A delegate with this email already exists' },
        { status: 400 }
      );
    }

    // Parse expiration date if provided
    let expiresAt = null;
    if (data.expiresAt) {
      expiresAt = new Date(data.expiresAt);
      if (expiresAt <= new Date()) {
        return NextResponse.json(
          { error: 'Expiration date must be in the future' },
          { status: 400 }
        );
      }
    }

    // Create delegate
    const delegate = await prisma.delegate.create({
      data: {
        tenantId: user.tenant.id,
        invitedByUserId: user.id,
        fullName: data.fullName,
        email: data.email.toLowerCase(),
        status: 'pending',
        expiresAt: expiresAt
      }
    });

    // Create default permissions based on data.permissions object
    // Expected format: { all: 'full' | 'view_download' | 'view_only' | 'none' }
    const defaultPermissions = data.permissions || { all: 'view_only' };

    for (const [scope, level] of Object.entries(defaultPermissions)) {
      let canView = false;
      let canDownload = false;
      let canEdit = false;
      let canComment = false;

      // Map permission level to capabilities
      switch (level) {
        case 'full':
          canView = true;
          canDownload = true;
          canEdit = true;
          canComment = true;
          break;
        case 'view_download':
          canView = true;
          canDownload = true;
          canComment = true;
          break;
        case 'view_only':
          canView = true;
          break;
        case 'none':
          // All false
          break;
      }

      if (scope === 'all') {
        await prisma.delegatePermission.create({
          data: {
            delegateId: delegate.id,
            scope: 'all',
            canView,
            canDownload,
            canEdit,
            canComment,
            grantedByUserId: user.id
          }
        });
      } else {
        // Document type permission
        await prisma.delegatePermission.create({
          data: {
            delegateId: delegate.id,
            scope: 'document_type',
            documentType: scope,
            canView,
            canDownload,
            canEdit,
            canComment,
            grantedByUserId: user.id
          }
        });
      }
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'delegate_invited',
        category: 'access',
        resourceType: 'delegate',
        resourceId: delegate.id,
        result: 'success',
        timestamp: new Date(),
      }
    });

    // TODO: Send invitation email here
    // await sendDelegateInvitation(delegate.email, delegate.fullName, user.fullName);

    return NextResponse.json({ 
      success: true, 
      delegate: {
        id: delegate.id,
        fullName: delegate.fullName,
        email: delegate.email,
        status: delegate.status,
        expiresAt: delegate.expiresAt
      },
      message: 'Delegate invitation sent successfully'
    });

  } catch (error) {
    console.error('Error creating delegate:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create delegate', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
