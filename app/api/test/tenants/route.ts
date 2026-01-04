typescriptimport { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      estateName: true
    },
    take: 5
  });
  
  return NextResponse.json({ tenants });
}
