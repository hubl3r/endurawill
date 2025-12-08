import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const includeTree = searchParams.get('tree') === 'true'; // New: for folder tree view

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const whereClause: any = {
      tenantId: user.tenant.id
    };

    if (type) whereClause.documentType = type;
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
          { displayOrder: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return NextResponse.json({ 
        success: true, 
        documents,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
        },
      });
    }

    // Standard list view (existing functionality)
    const documents = await prisma.document.findMany({
      where: whereClause,
      select: {
        id: true,
        documentType: true,
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
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, parentId, isFolder, documentType, description } = body;

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Verify folder depth if creating a folder
    if (isFolder && parentId) {
      let depth = 1;
      let currentParentId = parentId;
      
      while (currentParentId && depth < 4) {
        const parent = await prisma.document.findUnique({
          where: { id: currentParentId },
          select: { parentId: true, isFolder: true },
        });
        
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

    // Get the highest display order for siblings
    const siblings = await prisma.document.findMany({
      where: {
        tenantId: user.tenant.id,
        parentId: parentId || null,
      },
      orderBy: { displayOrder: 'desc' },
      take: 1,
    });

    const displayOrder = siblings.length > 0 ? (siblings[0].displayOrder || 0) + 1 : 0;

    // Create folder or document record
    const document = await prisma.document.create({
      data: {
        title,
        description: description || null,
        isFolder: isFolder || false,
        documentType: documentType || 'wills',
        parentId: parentId || null,
        displayOrder,
        status: 'draft',
        tenantId: user.tenant.id,
        uploadedById: user.id,
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
        tenantId: user.tenant.id,
        userId: user.id,
        action: isFolder ? 'folder_created' : 'document_created',
        category: 'document',
        result: 'success',
        resourceType: 'document',
        resourceId: document.id,
        metadata: {
          title,
          parentId,
          documentType,
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
