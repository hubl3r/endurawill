// app/api/pets/route.ts
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

    const pets = await prisma.pet.findMany({
      where: { profileId: user.profile.id },
      orderBy: { createdAt: 'desc' },
    });

    // Parse notes field to get additional data (isDeceased, dateOfDeath)
    const petsWithParsedData = pets.map((pet) => {
      let parsedData: any = {};
      try {
        parsedData = pet.notes ? JSON.parse(pet.notes) : {};
      } catch (e) {
        parsedData = {};
      }
      return {
        ...pet,
        age: pet.age?.toString() || '',
        isDeceased: parsedData.isDeceased || false,
        dateOfDeath: parsedData.dateOfDeath || '',
        vetName: parsedData.vetName || '',
        vetPhone: parsedData.vetPhone || '',
        extraNotes: parsedData.extraNotes || '',
        notes: parsedData.extraNotes || '',
      };
    });

    return NextResponse.json({
      success: true,
      pets: petsWithParsedData,
    });
  } catch (error) {
    console.error('Error fetching pets:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch pets',
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
    if (!body.name || !body.type) {
      return NextResponse.json(
        { success: false, error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Store additional data in notes as JSON
    const additionalData = {
      isDeceased: body.isDeceased || false,
      dateOfDeath: body.dateOfDeath || null,
      vetName: body.vetName || null,
      vetPhone: body.vetPhone || null,
      extraNotes: body.notes || null,
    };

    const pet = await prisma.pet.create({
      data: {
        profileId: user.profile.id,
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
      pet,
    });
  } catch (error) {
    console.error('Error creating pet:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create pet',
      },
      { status: 500 }
    );
  }
}
