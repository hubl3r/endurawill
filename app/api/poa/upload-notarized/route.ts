// app/api/poa/upload-notarized/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const poaId = formData.get('poaId') as string;

    if (!file || !poaId) {
      return NextResponse.json(
        { success: false, error: 'Missing file or POA ID' },
        { status: 400 }
      );
    }

    // Check if POA exists
    const poa = await prisma.powerOfAttorney.findUnique({
      where: { id: poaId },
    });

    if (!poa) {
      return NextResponse.json(
        { success: false, error: 'POA not found' },
        { status: 404 }
      );
    }

    // Upload to Vercel Blob
    const blob = await put(`poa-notarized-${poaId}-${Date.now()}.pdf`, file, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // Update POA with notarized document URL and set status to ACTIVE
    await prisma.powerOfAttorney.update({
      where: { id: poaId },
      data: {
        signedDocument: blob.url,
        status: 'ACTIVE',
      },
    });

    // Create audit log
    await prisma.pOAAuditLog.create({
      data: {
        poaId,
        userId: poa.createdById,
        action: 'NOTARIZED_UPLOADED',
        category: 'POA_LIFECYCLE',
        details: {
          filename: file.name,
          url: blob.url,
        },
      },
    });

    return NextResponse.json({
      success: true,
      url: blob.url,
      message: 'Notarized document uploaded successfully',
    });
  } catch (error) {
    console.error('Error uploading notarized document:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload document',
      },
      { status: 500 }
    );
  }
}
