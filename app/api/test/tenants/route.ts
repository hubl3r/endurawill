import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true
    },
    take: 5
  });
  
  return NextResponse.json({ tenants });
}
