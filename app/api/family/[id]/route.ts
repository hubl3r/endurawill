// app/api/family/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

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

    const familyMember = await prisma.familyMember.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { success: false, error: 'Family member not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      familyMember,
    });
  } catch (error) {
    console.error('Error fetching family member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch family member',
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

    const familyMember = await prisma.familyMember.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { success: false, error: 'Family member not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    const updatedFamilyMember = await prisma.familyMember.update({
      where: { id: id },
      data: {
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
      familyMember: updatedFamilyMember,
    });
  } catch (error) {
    console.error('Error updating family member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update family member',
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

    const familyMember = await prisma.familyMember.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!familyMember) {
      return NextResponse.json(
        { success: false, error: 'Family member not found' },
        { status: 404 }
      );
    }

    await prisma.familyMember.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Family member deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting family member:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete family member',
      },
      { status: 500 }
    );
  }
}
