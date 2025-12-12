import { put } from '@vercel/blob';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';
import { rateLimiters } from '@/lib/ratelimit';

/**
 * POST /api/documents/upload
 * Uploads a document to Vercel Blob storage
 */
export async function POST(request: Request) {
  try {
    // Get authenticated user and validated tenant
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenant, tenantId, clerkUser } = auth;

    // Only owners can upload documents
    if (user.role !== 'primary_owner' && user.role !== 'co_owner') {
      return NextResponse.json(
        { error: 'Only estate owners can upload documents' },
        { status: 403 }
      );
    }

    // Rate limiting: 50 uploads per hour
    const { success } = await rateLimiters.documentUpload.limit(clerkUser.id);
    if (!success) {
      return NextResponse.json(
        { error: 'Upload rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const documentType = formData.get('type') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string | null;
    const parentId = formData.get('parentId') as string | null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type required' }, { status: 400 });
    }

    // If parentId is provided, verify it belongs to this tenant
    if (parentId) {
      const parent = await prisma.document.findUnique({
        where: { id: parentId },
        select: { tenantId: true, isFolder: true },
      });

      if (!parent) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 });
      }

      if (parent.tenantId !== tenantId) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (!parent.isFolder) {
        return NextResponse.json({ error: 'Parent must be a folder' }, { status: 400 });
      }
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size exceeds 50MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: PDF, JPG, PNG, DOC, DOCX' },
        { status: 400 }
      );
    }

    // Generate file path with tenant isolation
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const blobPath = `${tenantId}/${documentType}/${timestamp}-${sanitizedFilename}`;

    // Upload to Vercel Blob
    const blob = await put(blobPath, file, {
      access: 'public', // Change to 'private' if you want signed URLs
      addRandomSuffix: false,
    });

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        tenantId: tenantId, // ← Active tenant from Redis
        createdById: user.id,
        type: documentType,
        title: title || file.name,
        description: description || null,
        parentId: parentId || null,
        isFolder: false,
        status: 'draft',
        version: 1,
        fileUrl: blob.url,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'document_uploaded',
        category: 'document',
        resourceType: 'document',
        resourceId: document.id,
        result: 'success',
        details: {
          title: document.title,
          type: document.type,
          parentId: parentId,
          fileSize: file.size,
        },
      }
    });

    return NextResponse.json({ 
      success: true, 
      document: {
        id: document.id,
        title: document.title,
        type: document.type,
        url: document.fileUrl,
        size: document.fileSize,
        uploadedAt: document.createdAt,
        parentId: document.parentId,
      }
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' }, 
      { status: 500 }
    );
  }
}
