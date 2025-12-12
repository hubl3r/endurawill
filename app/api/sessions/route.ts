import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: user.id,
        isActive: true
      },
      orderBy: {
        lastActivityAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Error loading sessions:', error);
    return NextResponse.json({ error: 'Failed to load sessions' }, { status: 500 });
  }
}
