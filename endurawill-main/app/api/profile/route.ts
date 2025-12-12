import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      include: { 
        profile: true,
        tenant: true 
      }
    });

    if (!user) {
      return NextResponse.json({ 
        success: true, 
        profile: null,
        message: 'No profile found'
      });
    }

    // Combine user data with profile for the form
    const profileData = user.profile ? {
      ...user.profile,
      fullName: user.fullName,
      dob: user.dob,
    } : null;

    return NextResponse.json({ 
      success: true, 
      profile: profileData,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        isPrimary: user.isPrimary
      },
      tenant: user.tenant ? {
        id: user.tenant.id,
        name: user.tenant.name,
        type: user.tenant.type,
        maxOwners: user.tenant.maxOwners,
        ownerCount: user.tenant.ownerCount,
        createdAt: user.tenant.createdAt.toISOString(),
        updatedAt: user.tenant.updatedAt.toISOString()
      } : null
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
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await request.json();

    // Validate required fields
    if (!data.fullName || !data.dob || !data.stateResidence || !data.maritalStatus) {
      return NextResponse.json(
        { error: 'Missing required fields: fullName, dob, stateResidence, maritalStatus' },
        { status: 400 }
      );
    }

    // Validate date of birth
    const birthDate = new Date(data.dob);
    const today = new Date();
    
    if (isNaN(birthDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date of birth format' },
        { status: 400 }
      );
    }

    if (birthDate > today) {
      return NextResponse.json(
        { error: 'Date of birth cannot be in the future' },
        { status: 400 }
      );
    }

    // Calculate age
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // Validate age range (18-120)
    if (age < 18) {
      return NextResponse.json(
        { error: 'You must be at least 18 years old to use this service' },
        { status: 400 }
      );
    }

    if (age > 120) {
      return NextResponse.json(
        { error: 'Please enter a valid date of birth' },
        { status: 400 }
      );
    }

    // Validate state residence (US states + DC)
    const validStates = [
      'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
      'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
      'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
      'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
      'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
    ];

    if (!validStates.includes(data.stateResidence)) {
      return NextResponse.json(
        { error: 'Invalid state residence' },
        { status: 400 }
      );
    }

    // Validate marital status
    const validMaritalStatuses = ['single', 'married', 'divorced', 'widowed', 'separated'];
    if (!validMaritalStatuses.includes(data.maritalStatus)) {
      return NextResponse.json(
        { error: 'Invalid marital status' },
        { status: 400 }
      );
    }

    // Find or create tenant
    let tenant = await prisma.tenant.findFirst({
      where: {
        users: {
          some: { clerkId: clerkUser.id }
        }
      }
    });

    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          type: 'individual',
          maxOwners: 1,
          ownerCount: 1
        }
      });
    }

    // Upsert user
    const user = await prisma.user.upsert({
      where: { clerkId: clerkUser.id },
      update: {
        fullName: data.fullName,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        dob: birthDate,
      },
      create: {
        clerkId: clerkUser.id,
        tenantId: tenant.id,
        role: 'primary_owner',
        isPrimary: true,
        fullName: data.fullName,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        dob: birthDate,
      },
      include: { profile: true }
    });

    // Upsert profile
    const profile = await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        stateResidence: data.stateResidence,
        maritalStatus: data.maritalStatus,
        hasCompletedOnboarding: true,
      },
      create: {
        userId: user.id,
        stateResidence: data.stateResidence,
        maritalStatus: data.maritalStatus,
        hasCompletedOnboarding: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: user.profile ? 'profile_updated' : 'profile_created',
        category: 'profile',
        resourceType: 'profile',
        resourceId: profile.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      profile,
      message: 'Profile saved successfully'
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
