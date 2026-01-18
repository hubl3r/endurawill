// app/api/legacy-letters/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize string input to prevent XSS
function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] });
}

// Sanitize HTML content (for rich text fields)
function sanitizeHTML(input: string | null | undefined): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: []
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      select: { id: true, profile: { select: { id: true } } },
    });

    if (!user?.profile?.id) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const letter = await prisma.legacyLetter.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
      include: {
        recipients: {
          include: {
            beneficiary: {
              select: {
                id: true,
                fullName: true,
                relationship: true,
              },
            },
          },
        },
      },
    });

    if (!letter) {
      return NextResponse.json(
        { success: false, error: 'Letter not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      letter,
    });
  } catch (error) {
    console.error('Error fetching letter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch letter',
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      select: { id: true, profile: { select: { id: true } } },
    });

    if (!user?.profile?.id) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const letter = await prisma.legacyLetter.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!letter) {
      return NextResponse.json(
        { success: false, error: 'Letter not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Sanitize all text inputs
    const sanitizedData = {
      title: sanitizeString(body.title),
      letterType: sanitizeString(body.letterType),
      contentType: sanitizeString(body.contentType),
      content: sanitizeHTML(body.content),
      instructions: sanitizeHTML(body.instructions),
      deliveryTiming: sanitizeString(body.deliveryTiming),
      milestone: sanitizeString(body.milestone),
      recurringFrequency: sanitizeString(body.recurringFrequency),
      notes: sanitizeHTML(body.notes),
      fileUrl: body.fileUrl || null,
      fileName: sanitizeString(body.fileName),
      fileSize: body.fileSize || null,
      mimeType: sanitizeString(body.mimeType),
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      recurringUntil: body.recurringUntil ? new Date(body.recurringUntil) : null,
      conditionalAge: body.conditionalAge ? parseInt(body.conditionalAge) : null,
      notifyDaysBefore: body.notifyDaysBefore ? parseInt(body.notifyDaysBefore) : 7,
      notifyBeforeDelivery: body.notifyBeforeDelivery ?? false,
      isPrivate: body.isPrivate ?? true,
    };

    // Validate file URL if provided
    if (sanitizedData.fileUrl) {
      try {
        const url = new URL(sanitizedData.fileUrl);
        if (url.protocol !== 'https:') {
          return NextResponse.json(
            { success: false, error: 'File URL must use HTTPS' },
            { status: 400 }
          );
        }
      } catch (e) {
        return NextResponse.json(
          { success: false, error: 'Invalid file URL' },
          { status: 400 }
        );
      }
    }

    // Update letter and recipients in transaction
    const updatedLetter = await prisma.$transaction(async (tx) => {
      // Update the letter
      const updated = await tx.legacyLetter.update({
        where: { id: id },
        data: {
          title: sanitizedData.title,
          letterType: sanitizedData.letterType,
          contentType: sanitizedData.contentType,
          content: sanitizedData.content,
          instructions: sanitizedData.instructions,
          fileUrl: sanitizedData.fileUrl,
          fileName: sanitizedData.fileName,
          fileSize: sanitizedData.fileSize,
          mimeType: sanitizedData.mimeType,
          deliveryTiming: sanitizedData.deliveryTiming,
          deliveryDate: sanitizedData.deliveryDate,
          milestone: sanitizedData.milestone,
          recurringFrequency: sanitizedData.recurringFrequency,
          recurringUntil: sanitizedData.recurringUntil,
          conditionalAge: sanitizedData.conditionalAge,
          notifyBeforeDelivery: sanitizedData.notifyBeforeDelivery,
          notifyDaysBefore: sanitizedData.notifyDaysBefore,
          isPrivate: sanitizedData.isPrivate,
          notes: sanitizedData.notes,
        },
      });

      // Update recipients if provided
      if (body.recipients && Array.isArray(body.recipients)) {
        // Delete existing recipients
        await tx.letterRecipient.deleteMany({
          where: { letterId: id },
        });

        // Create new recipients
        await tx.letterRecipient.createMany({
          data: body.recipients.map((beneficiaryId: string) => ({
            letterId: id,
            beneficiaryId: beneficiaryId,
          })),
        });
      }

      return updated;
    });

    return NextResponse.json({
      success: true,
      letter: updatedLetter,
    });
  } catch (error) {
    console.error('Error updating letter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update letter',
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      select: { id: true, profile: { select: { id: true } } },
    });

    if (!user?.profile?.id) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      );
    }

    const letter = await prisma.legacyLetter.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!letter) {
      return NextResponse.json(
        { success: false, error: 'Letter not found' },
        { status: 404 }
      );
    }

    // Delete letter (recipients will cascade delete)
    await prisma.legacyLetter.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Letter deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting letter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete letter',
      },
      { status: 500 }
    );
  }
}
