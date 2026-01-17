// app/api/children/route.ts
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

    const children = await prisma.child.findMany({
      where: { profileId: user.profile.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      children,
    });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch children',
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
    if (!body.fullName) {
      return NextResponse.json(
        { success: false, error: 'Full name is required' },
        { status: 400 }
      );
    }

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

    // Create child with notes field containing additional data as JSON
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

    const child = await prisma.child.create({
      data: {
        profileId: user.profile.id,
        fullName: body.fullName,
        dob: body.dob ? new Date(body.dob) : null,
        relationship: body.relationship || 'child',
        isMinor: isMinor,
        guardianPreference: body.guardianPreference || null,
        notes: JSON.stringify(additionalData), // Store extra data as JSON in notes field
      },
    });

    return NextResponse.json({
      success: true,
      child,
    });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create child',
      },
      { status: 500 }
    );
  }
}
