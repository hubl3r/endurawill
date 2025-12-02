
```typescript
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Find user with profile
    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { profile: true }
    });

    return NextResponse.json({ 
      success: true, 
      profile: user?.profile || null 
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
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate age (18-120)
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
        email: clerkUser.emailAddresses[0]?.emailAddress,
        dob: new Date(data.dob),
      },
      create: {
        clerkId: clerkUser.id,
        tenantId: tenant.id,
        role: 'primary_owner',
        isPrimary: true,
        fullName: data.fullName,
        email: clerkUser.emailAddresses[0]?.emailAddress,
        dob: new Date(data.dob),
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

    // Log the action
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'profile_updated',
        category: 'profile',
        resourceType: 'profile',
        resourceId: profile.id,
        result: 'success',
        timestamp: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      profile 
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    return NextResponse.json(
      { error: 'Failed to save profile', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
```
