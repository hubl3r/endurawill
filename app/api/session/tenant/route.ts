import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import type { User } from '@clerk/nextjs/server';
import { setActiveTenantId, invalidateEstateCache } from '@/lib/tenant-context';
import { prisma } from '@/lib/prisma';
import { rateLimiters } from '@/lib/ratelimit';

/**
 * POST /api/session/tenant
 * Set the active tenant for the current user
 * 
 * Body: { tenantId: string }
 * 
 * Security:
 * - Rate limited to 10 switches per hour
 * - Validates user has access to tenant
 * - Logs all switches for audit trail
 */
export async function POST(request: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: 10 tenant switches per hour
    const { success, remaining, reset } = await rateLimiters.tenantSwitch.limit(
      user.id
    );

    if (!success) {
      return NextResponse.json(
        {
          error: 'Too many tenant switches. Please try again later.',
          remaining: 0,
          reset: reset,
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          }
        }
      );
    }

    const body = await request.json();
    const { tenantId } = body;

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Get current tenant before switching (for audit log)
    const currentUser = await prisma.user.findFirst({
      where: { clerkId: user.id },
      include: { tenant: true },
    });

    // Set active tenant (validates access internally)
    const result = await setActiveTenantId(user.id, tenantId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 403 }
      );
    }

    // Get the new user record for audit logging
    const newUser = await prisma.user.findFirst({
      where: {
        clerkId: user.id,
        tenantId: tenantId,
      },
      include: { tenant: true },
    });

    if (!newUser) {
      return NextResponse.json(
        { error: 'Failed to retrieve user record' },
        { status: 500 }
      );
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: newUser.id,
        actorType: 'user',
        actorName: newUser.fullName,
        action: 'tenant_switched',
        category: 'security',
        result: 'success',
        resourceType: 'tenant',
        resourceId: tenantId,
        details: {
          fromTenantId: currentUser?.tenantId,
          fromTenantName: currentUser?.tenant.name,
          toTenantId: tenantId,
          toTenantName: newUser.tenant.name,
          userConsented: true,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    // Invalidate estate cache
    await invalidateEstateCache(user.id);

    return NextResponse.json({
      success: true,
      tenantId: tenantId,
      tenantName: newUser.tenant.name,
      message: 'Active estate switched successfully',
    });
  } catch (error) {
    console.error('Error switching tenant:', error);
    return NextResponse.json(
      { error: 'Failed to switch estate' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/session/tenant
 * Get the current active tenant
 */
export async function GET() {
  try {
    const user: Awaited<ReturnType<typeof currentUser>> = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { clerkId: user.id },
      include: { tenant: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      tenantId: user.tenantId,
      tenantName: user.tenant.name,
      role: user.role,
    });
  } catch (error) {
    console.error('Error getting active tenant:', error);
    return NextResponse.json(
      { error: 'Failed to get active estate' },
      { status: 500 }
    );
  }
}
