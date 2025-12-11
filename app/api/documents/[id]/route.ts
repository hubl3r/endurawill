import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const documentId = params.id;

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify ownership
    if (document.tenantId !== user.tenant.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // If it's a folder, check if it has children
    if (document.isFolder) {
      const childCount = await prisma.document.count({
        where: { parentId: documentId },
      });

      if (childCount > 0) {
        return NextResponse.json(
          { error: 'Cannot delete folder with contents. Please delete contents first.' },
          { status: 400 }
        );
      }
    }

    // Delete the document
    await prisma.document.delete({
      where: { id: documentId },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: user.tenant.id,
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
