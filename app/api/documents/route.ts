import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';
import { rateLimiters } from '@/lib/ratelimit';

export async function GET(request: Request) {
  try {
    // Get authenticated user and validated tenant (from Redis, secure)
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized or no active estate selected' }, { status: 401 });
    }

    const { user, tenant, tenantId } = auth;

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeTree = searchParams.get('tree') === 'true';

    const whereClause: any = {
      tenantId: tenantId, // ← Uses active tenant from Redis
    };

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    // If tree view is requested, include more details for folder navigation
    if (includeTree) {
      const documents = await prisma.document.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              comments: true,
            },
          },
        },
        orderBy: [
          { isFolder: 'desc' }, // Folders first
          { createdAt: 'desc' },
        ],
      });

      return NextResponse.json({ 
        success: true, 
        documents,
        tenant: {
          id: tenant.id,
          name: tenant.name,
        },
      });
    }

    // Standard list view
    const documents = await prisma.document.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        title: true,
        description: true,
        isFolder: true,
        parentId: true,
        status: true,
        version: true,
        fileSize: true,
        fileName: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Error loading documents:', error);
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    // Get authenticated user and validated tenant
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenant, tenantId, clerkUser } = auth;

    // Rate limiting: 50 document creations per hour
    const { success } = await rateLimiters.documentUpload.limit(clerkUser.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { title, parentId, isFolder, type: documentType, description } = body;

    // Verify folder depth if creating a folder
    if (isFolder && parentId) {
      let depth = 1;
      let currentParentId = parentId;
      
      while (currentParentId && depth < 4) {
        const parent = await prisma.document.findUnique({
          where: { id: currentParentId },
          select: { parentId: true, isFolder: true, tenantId: true },
        });
        
        // Security: Verify parent belongs to same tenant
        if (parent?.tenantId !== tenantId) {
          return NextResponse.json(
            { error: 'Access denied' },
            { status: 403 }
          );
        }
        
        if (!parent?.isFolder) {
          return NextResponse.json(
            { error: 'Parent must be a folder' },
            { status: 400 }
          );
        }
        
        if (parent?.parentId) {
          depth++;
          currentParentId = parent.parentId;
        } else {
          break;
        }
      }
      
      if (depth >= 4) {
        return NextResponse.json(
          { error: 'Maximum folder depth (4 levels) reached' },
          { status: 400 }
        );
      }
    }

    // Create folder or document record
    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        isFolder: isFolder || false,
        type: documentType || 'will',
        parentId: parentId || null,
        status: 'draft',
        tenantId: tenantId, // ← Uses active tenant from Redis
        createdById: user.id,
      },
      include: {
        _count: {
          select: {
            comments: true,
          },
        },
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: isFolder ? 'folder_created' : 'document_created',
        category: 'document',
        result: 'success',
        resourceType: 'document',
        resourceId: document.id,
        details: {
          title,
          parentId,
          type: documentType,
        },
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error('Error creating document/folder:', error);
    return NextResponse.json(
      { error: 'Failed to create document/folder' },
      { status: 500 }
    );
  }
}
