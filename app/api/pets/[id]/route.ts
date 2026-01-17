// app/api/pets/[id]/route.ts
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

    const pet = await prisma.pet.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!pet) {
      return NextResponse.json(
        { success: false, error: 'Pet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      pet,
    });
  } catch (error) {
    console.error('Error fetching pet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pet',
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

    const pet = await prisma.pet.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!pet) {
      return NextResponse.json(
        { success: false, error: 'Pet not found' },
        { status: 404 }
      );
    }

    const body = await req.json();

    // Store additional data in notes as JSON
    const additionalData = {
      isDeceased: body.isDeceased || false,
      dateOfDeath: body.dateOfDeath || null,
      vetName: body.vetName || null,
      vetPhone: body.vetPhone || null,
      extraNotes: body.notes || null,
    };

    const updatedPet = await prisma.pet.update({
      where: { id: id },
      data: {
        name: body.name,
        type: body.type,
        breed: body.breed || null,
        age: body.age ? parseInt(body.age) || null : null,
        specialNeeds: body.specialNeeds || null,
        caretakerPreference: body.caretakerPreference || null,
        notes: JSON.stringify(additionalData),
      },
    });

    return NextResponse.json({
      success: true,
      pet: updatedPet,
    });
  } catch (error) {
    console.error('Error updating pet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update pet',
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

    const pet = await prisma.pet.findFirst({
      where: {
        id: id,
        profileId: user.profile.id,
      },
    });

    if (!pet) {
      return NextResponse.json(
        { success: false, error: 'Pet not found' },
        { status: 404 }
      );
    }

    await prisma.pet.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: 'Pet deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting pet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete pet',
      },
      { status: 500 }
    );
  }
}
