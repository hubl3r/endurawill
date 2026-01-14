// app/api/poa/[id]/delete-notarized/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { del } from '@vercel/blob';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const poaId = params.id;

    // Get the POA
    const poa = await prisma.powerOfAttorney.findUnique({
      where: { id: poaId },
    });

    if (!poa) {
      return NextResponse.json(
        { success: false, error: 'POA not found' },
        { status: 404 }
      );
    }

    if (!poa.signedDocument) {
      return NextResponse.json(
        { success: false, error: 'No notarized document to delete' },
        { status: 400 }
      );
    }

    // Delete from Vercel Blob
    try {
      await del(poa.signedDocument);
    } catch (error) {
      console.error('Error deleting from blob storage:', error);
      // Continue anyway - update database even if blob delete fails
    }

    // Update POA - remove signed document and revert to DRAFT
    await prisma.powerOfAttorney.update({
      where: { id: poaId },
      data: {
        signedDocument: null,
        status: 'DRAFT',
        notarizedAt: null,
        notaryName: null,
        notaryCommission: null,
        notaryExpiration: null,
      },
    });

    // Create audit log
    await prisma.pOAAuditLog.create({
      data: {
        poaId: poaId,
        action: 'NOTARIZED_COPY_DELETED',
        category: 'POA_LIFECYCLE',
        details: {
          deletedUrl: poa.signedDocument,
          revertedToDraft: true,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Notarized copy removed successfully',
    });
  } catch (error) {
    console.error('Error deleting notarized copy:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete notarized copy',
      },
      { status: 500 }
    );
  }
}
