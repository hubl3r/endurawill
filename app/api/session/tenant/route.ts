import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { setActiveTenantId, invalidateEstateCache, getActiveTenantId, getAuthenticatedUserAndTenant } from '@/lib/tenant-context';
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
    const clerkUser = await currentUser();
    
    if (!clerkUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[SESSION POST] ClerkUser:', clerkUser.id);

    // Rate limiting: 10 tenant switches per hour
    const { success, remaining, reset } = await rateLimiters.tenantSwitch.limit(
      clerkUser.id
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

    console.log('[SESSION POST] Requested tenantId:', tenantId);

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      );
    }

    // Get current tenant before switching (for audit log)
    const currentUserRecord = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      include: { tenant: true },
    });

    // Set active tenant (validates access internally)
    console.log('[SESSION POST] Calling setActiveTenantId...');
    const result = await setActiveTenantId(clerkUser.id, tenantId);

    console.log('[SESSION POST] setActiveTenantId result:', result);

    if (!result.success) {
      console.log('[SESSION POST] Failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: 403 }
      );
    }

    // Verify it was actually set
    const verifyTenantId = await getActiveTenantId(clerkUser.id);
    console.log('[SESSION POST] Verification - tenant in Redis:', verifyTenantId);

    // Get the new user record for audit logging
    const newUserRecord = await prisma.user.findFirst({
      where: {
        clerkId: clerkUser.id,
        tenantId: tenantId,
      },
      include: { tenant: true },
    });

    if (!newUserRecord) {
      return NextResponse.json(
        { error: 'Failed to retrieve user record' },
        { status: 500 }
      );
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: newUserRecord.id,
        actorType: 'user',
        actorName: newUserRecord.fullName,
        action: 'tenant_switched',
        category: 'security',
        result: 'success',
        resourceType: 'tenant',
        resourceId: tenantId,
        details: {
          fromTenantId: currentUserRecord?.tenantId,
          fromTenantName: currentUserRecord?.tenant.name,
          toTenantId: tenantId,
          toTenantName: newUserRecord.tenant.name,
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
    await invalidateEstateCache(clerkUser.id);

    console.log('[SESSION POST] Success! Switched to:', newUserRecord.tenant.name);

    return NextResponse.json({
      success: true,
      tenantId: tenantId,
      tenantName: newUserRecord.tenant.name,
      message: 'Active estate switched successfully',
      debug: {
        requestedTenant: tenantId,
        verifiedInRedis: verifyTenantId,
        match: verifyTenantId === tenantId
      }
    });
  } catch (error) {
    console.error('[SESSION POST] Error switching tenant:', error);
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
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenant, tenantId } = auth;

    return NextResponse.json({
      success: true,
      tenantId: tenantId,
      tenantName: tenant.name,
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
