// app/api/children/[id]/route.ts
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

    const child = await prisma.child.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      child,
    });
  } catch (error) {
    console.error('Error fetching child:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch child',
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

    const child = await prisma.child.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Calculate isMinor based on date of birth
    let isMinor = true;
    if (body.dob) {
      const birthDate = new Date(body.dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      isMinor = age < 18;
    }

    // Prepare additional data for notes field
    const additionalData = {
      ssn: body.ssn || null,
      schoolName: body.schoolName || null,
      grade: body.grade || null,
      schoolPhone: body.schoolPhone || null,
      primaryPhysician: body.primaryPhysician || null,
      physicianPhone: body.physicianPhone || null,
      allergies: body.allergies || null,
      medications: body.medications || null,
      extraNotes: body.notes || null,
    };

    const updatedChild = await prisma.child.update({
      where: { id: id },
      data: {
        fullName: body.fullName,
        dob: body.dob ? new Date(body.dob) : null,
        relationship: body.relationship || 'child',
        isMinor: isMinor,
        guardianPreference: body.guardianPreference || null,
        notes: JSON.stringify(additionalData),
      },
    });

    return NextResponse.json({
      success: true,
      child: updatedChild,
    });
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update child',
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

    const child = await prisma.child.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!child) {
      return NextResponse.json(
        { success: false, error: 'Child not found' },
        { status: 404 }
      );
    }

    await prisma.child.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Child deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete child',
      },
      { status: 500 }
    );
  }
}
