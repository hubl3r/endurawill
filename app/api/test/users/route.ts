import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      clerkId: true,
      fullName: true,
      email: true
    },
    take: 5
  });
  
  return NextResponse.json({ users });
}
