import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user and validated tenant
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenantId } = auth;

    const { id: documentId } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Security: Verify document belongs to active tenant
    if (document.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update the document
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { 
        title,
        modifiedById: user.id,
      },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: document.isFolder ? 'folder_renamed' : 'document_renamed',
        category: 'document',
        result: 'success',
        resourceType: 'document',
        resourceId: documentId,
        details: {
          oldTitle: document.title,
          newTitle: title,
        },
      },
    });

    return NextResponse.json({ success: true, document: updated });
  } catch (error) {
    console.error('Error updating document:', error);
    return NextResponse.json(
      { error: 'Failed to update document' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Get authenticated user and validated tenant
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenantId } = auth;

    const { id: documentId } = await params;

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Security: Verify document belongs to active tenant
    if (document.tenantId !== tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // If it's a folder, delete all contents first
    if (document.isFolder) {
      // Recursively delete all children (with tenant verification)
      const deleteFolder = async (folderId: string) => {
        const children = await prisma.document.findMany({
          where: { 
            parentId: folderId,
            tenantId: tenantId, // ← Security: only delete from this tenant
          },
        });

        for (const child of children) {
          if (child.isFolder) {
            await deleteFolder(child.id);
          }
          await prisma.document.delete({
            where: { id: child.id },
          });
        }
      };

      await deleteFolder(documentId);
    }

    // Delete the document/folder
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: document.isFolder ? 'folder_deleted' : 'document_deleted',
        category: 'document',
        result: 'success',
        resourceType: 'document',
        resourceId: documentId,
        details: {
          title: document.title,
          type: document.type,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: 'Failed to delete document' },
      { status: 500 }
    );
  }
}
