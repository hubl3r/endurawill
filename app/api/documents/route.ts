import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    const user = await prisma.user.findUnique({
      where: { clerkId: clerkUser.id },
      include: { tenant: true }
    });

    if (!user?.tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const whereClause: any = {
      tenantId: user.tenant.id
    };

    if (type) whereClause.type = type;
    if (status) whereClause.status = status;

    const documents = await prisma.document.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        title: true,
        status: true,
        version: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, documents });
  } catch (error) {
    console.error('Error loading documents:', error);
    return NextResponse.json({ error: 'Failed to load documents' }, { status: 500 });
  }
}
