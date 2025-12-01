import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';

// NOTE: This is a temporary implementation that stores data in-memory
// You'll need to replace this with actual Prisma database calls

// Temporary in-memory storage (will be lost on server restart)
const profileStore = new Map();

export async function GET() {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get profile from temporary storage
    const profile = profileStore.get(user.id);
    
    return NextResponse.json({ 
      success: true, 
      profile: profile || null 
    });
  } catch (error) {
    console.error('Error loading profile:', error);
    return NextResponse.json(
      { error: 'Failed to load profile' }, 
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const user = await currentUser();
  
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.fullName || !data.dob || !data.stateResidence || !data.maritalStatus) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate age (must be 18-120)
    const birthDate = new Date(data.dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 18) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old to use this service' },
        { status: 400 }
      );
    }

    if (age > 120 || birthDate > today) {
      return NextResponse.json(
        { error: 'Please enter a valid date of birth' },
        { status: 400 }
      );
    }

    // Store profile in temporary storage
    // TODO: Replace with Prisma database call
    const profileData = {
      clerkId: user.id,
      fullName: data.fullName,
      email: user.emailAddresses[0]?.emailAddress,
      dob: data.dob,
      stateResidence: data.stateResidence,
      maritalStatus: data.maritalStatus,
      hasCompletedOnboarding: true,
      updatedAt: new Date().toISOString(),
    };

    profileStore.set(user.id, profileData);

    /* 
    TODO: Replace the above with this Prisma code once you set up the database:
    
    // First, find or create tenant
    let tenant = await prisma.tenant.findFirst();
    if (!tenant) {
      tenant = await prisma.tenant.create({ data: {} });
    }

    // Upsert user profile
    const dbUser = await prisma.user.upsert({
      where: { clerkId: user.id },
      update: {
        fullName: data.fullName,
        dob: new Date(data.dob),
        stateResidence: data.stateResidence,
        maritalStatus: data.maritalStatus,
        hasCompletedOnboarding: true,
      },
      create: {
        clerkId: user.id,
        tenantId: tenant.id,
        fullName: data.fullName,
        email: user.emailAddresses[0]?.emailAddress,
        dob: new Date(data.dob),
        stateResidence: data.stateResidence,
        maritalStatus: data.maritalStatus,
        hasCompletedOnboarding: true,
      },
    });

    return NextResponse.json({ success: true, user: dbUser });
    */

    return NextResponse.json({ 
      success: true, 
      profile: profileData 
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
