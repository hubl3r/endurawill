// app/api/family/route.ts
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

    const familyMembers = await prisma.familyMember.findMany({
      where: { profileId: user.profile.id },
      orderBy: { createdAt: 'desc' },
    });

    // Format dates for frontend
    const formattedFamily = familyMembers.map((member) => ({
      ...member,
      dateOfDeath: member.dateOfDeath ? member.dateOfDeath.toISOString().split('T')[0] : '',
    }));

    return NextResponse.json({
      success: true,
      family: formattedFamily,
    });
  } catch (error) {
    console.error('Error fetching family members:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch family members',
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
    if (!body.fullName || !body.relationship) {
      return NextResponse.json(
        { success: false, error: 'Name and relationship are required' },
        { status: 400 }
      );
    }

    const familyMember = await prisma.familyMember.create({
      data: {
        profileId: user.profile.id,
        fullName: body.fullName,
        relationship: body.relationship,
        phone: body.phone || null,
        email: body.email || null,
        address: body.address || null,
        isDeceased: body.isDeceased || false,
        dateOfDeath: body.dateOfDeath ? new Date(body.dateOfDeath) : null,
        notes: body.notes || null,
      },
    });

    return NextResponse.json({
      success: true,
      familyMember,
    });
  } catch (error) {
    console.error('Error creating family member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create family member',
      },
      { status: 500 }
    );
  }
}
