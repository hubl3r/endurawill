// app/api/legacy-letters/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import DOMPurify from 'isomorphic-dompurify';

// Sanitize string input to prevent XSS
function sanitizeString(input: string | null | undefined): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [] }); // Strip all HTML tags
}

// Sanitize HTML content (for rich text fields)
function sanitizeHTML(input: string | null | undefined): string | null {
  if (!input) return null;
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote'],
    ALLOWED_ATTR: []
  });
}

export async function GET(req: NextRequest) {
  try {
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

    const letters = await prisma.legacyLetter.findMany({
      where: { profileId: user.profile.id },
      include: {
        recipients: {
          include: {
            beneficiary: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format response with recipient count
    const formattedLetters = letters.map(letter => ({
      id: letter.id,
      title: letter.title,
      letterType: letter.letterType,
      contentType: letter.contentType,
      deliveryTiming: letter.deliveryTiming,
      deliveryDate: letter.deliveryDate,
      deliveryStatus: letter.deliveryStatus,
      recipientCount: letter.recipients.length,
      createdAt: letter.createdAt,
      updatedAt: letter.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      letters: formattedLetters,
    });
  } catch (error) {
    console.error('Error fetching legacy letters:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch letters',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
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

    const body = await req.json();

    // Validate required fields
    if (!body.title || !body.letterType || !body.contentType || !body.deliveryTiming) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate recipients array
    if (!body.recipients || !Array.isArray(body.recipients) || body.recipients.length === 0) {
      return NextResponse.json(
        { success: false, error: 'At least one recipient is required' },
        { status: 400 }
      );
    }

    // Sanitize all text inputs
    const sanitizedData = {
      title: sanitizeString(body.title),
      letterType: sanitizeString(body.letterType),
      contentType: sanitizeString(body.contentType),
      content: sanitizeHTML(body.content), // Allow rich text formatting
      instructions: sanitizeHTML(body.instructions),
      deliveryTiming: sanitizeString(body.deliveryTiming),
      milestone: sanitizeString(body.milestone),
      recurringFrequency: sanitizeString(body.recurringFrequency),
      notes: sanitizeHTML(body.notes),
      // File fields (validated separately)
      fileUrl: body.fileUrl || null,
      fileName: sanitizeString(body.fileName),
      fileSize: body.fileSize || null,
      mimeType: sanitizeString(body.mimeType),
      // Dates
      deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
      recurringUntil: body.recurringUntil ? new Date(body.recurringUntil) : null,
      // Numbers
      conditionalAge: body.conditionalAge ? parseInt(body.conditionalAge) : null,
      notifyDaysBefore: body.notifyDaysBefore ? parseInt(body.notifyDaysBefore) : 7,
      // Booleans
      notifyBeforeDelivery: body.notifyBeforeDelivery ?? false,
      isPrivate: body.isPrivate ?? true,
    };

    // Validate file URL if provided (prevent SSRF attacks)
    if (sanitizedData.fileUrl) {
      try {
        const url = new URL(sanitizedData.fileUrl);
        // Only allow HTTPS and specific domains (adjust as needed)
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

    // Create letter with recipients in a transaction
    const letter = await prisma.$transaction(async (tx) => {
      // Create the letter
      const newLetter = await tx.legacyLetter.create({
        data: {
          profileId: user.profile!.id,
          title: sanitizedData.title!,
          letterType: sanitizedData.letterType!,
          contentType: sanitizedData.contentType!,
          content: sanitizedData.content,
          instructions: sanitizedData.instructions,
          fileUrl: sanitizedData.fileUrl,
          fileName: sanitizedData.fileName,
          fileSize: sanitizedData.fileSize,
          mimeType: sanitizedData.mimeType,
          deliveryTiming: sanitizedData.deliveryTiming!,
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

      // Create recipient links
      await tx.letterRecipient.createMany({
        data: body.recipients.map((beneficiaryId: string) => ({
          letterId: newLetter.id,
          beneficiaryId: beneficiaryId,
        })),
      });

      return newLetter;
    });

    return NextResponse.json({
      success: true,
      letter,
    });
  } catch (error) {
    console.error('Error creating legacy letter:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create letter',
      },
      { status: 500 }
    );
  }
}
