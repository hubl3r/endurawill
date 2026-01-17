// app/api/contacts/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    // Get contactType filter from query params
    const { searchParams } = new URL(req.url);
    const contactType = searchParams.get('type');

    const where: any = { profileId: user.profile.id };
    if (contactType) {
      where.contactType = contactType;
    }

    const contacts = await prisma.contact.findMany({
      where,
      orderBy: [
        { priority: 'asc' }, // Emergency contacts sorted by priority
        { createdAt: 'desc' },
      ],
    });

    return NextResponse.json({
      success: true,
      contacts,
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch contacts',
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
    if (!body.contactName || !body.relationship || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Name, relationship, and phone are required' },
        { status: 400 }
      );
    }

    const contact = await prisma.contact.create({
      data: {
        profileId: user.profile.id,
        contactName: body.contactName,
        relationship: body.relationship,
        phone: body.phone,
        email: body.email || null,
        contactType: body.contactType || 'general',
        priority: body.priority || null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create contact',
      },
      { status: 500 }
    );
  }
}
