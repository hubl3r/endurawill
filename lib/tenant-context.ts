import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getRedis } from './redis';

/**
 * Get the active tenant ID for the current user
 * Returns from Redis cache (server-side), never from client
 */
export async function getActiveTenantId(clerkUserId: string): Promise<string | null> {
  const redis = getRedis();
  const cacheKey = `user:${clerkUserId}:activeTenant`;
  
  try {
    const tenantId = await redis.get<string>(cacheKey);
    return tenantId;
  } catch (error) {
    console.error('Error fetching active tenant from Redis:', error);
    return null;
  }
}

/**
 * Set the active tenant ID for the current user
 * Validates user has access before storing
 */
export async function setActiveTenantId(
  clerkUserId: string,
  tenantId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // CRITICAL: Verify user has access to this tenant
    const user = await prisma.user.findFirst({
      where: {
        clerkId: clerkUserId,
        tenantId: tenantId,
      },
    });

    if (!user) {
      return {
        success: false,
        error: 'Access denied: You do not have access to this estate',
      };
    }

    // Direct Redis write (separated set and expire)
    const redis = getRedis();
    const key = `user:${clerkUserId}:activeTenant`;
    
    await redis.set(key, tenantId);
    await redis.expire(key, 86400);
    
    // Verify immediately
    const verify = await redis.get(key);
    console.log('[SET] Wrote:', tenantId, '| Verified:', verify, '| Match:', verify === tenantId);
    
    if (verify !== tenantId) {
      throw new Error('Redis write failed verification');
    }

    return { success: true };
  } catch (error) {
    console.error('[SET ERROR]:', error);
    return {
      success: false,
      error: 'Failed to set active tenant',
    };
  }
}

/**
 * Get the validated user and tenant for the current request
 * This is the main function ALL API routes should use
 * 
 * Returns null if:
 * - User is not authenticated
 * - No active tenant is set
 * - User doesn't have access to the active tenant
 */
export async function getAuthenticatedUserAndTenant() {
  const clerkUser = await currentUser();
  
  if (!clerkUser) {
    console.log('[TenantContext] No Clerk user found');
    return null;
  }

  console.log('[TenantContext] ClerkUser ID:', clerkUser.id);

  // Get active tenant from Redis (server-side, secure)
  let activeTenantId = await getActiveTenantId(clerkUser.id);

  console.log('[TenantContext] Active tenant from Redis:', activeTenantId);

  // If no active tenant is set, get the first one they have access to
  if (!activeTenantId) {
    console.log('[TenantContext] No active tenant in Redis, getting first estate');
    const firstUser = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      include: { tenant: true },
    });

    if (!firstUser) {
      console.log('[TenantContext] No user records found');
      return null;
    }

    console.log('[TenantContext] Using first estate:', firstUser.tenant.id, firstUser.tenant.name);

    // Set this as their active tenant
    activeTenantId = firstUser.tenantId;
    await setActiveTenantId(clerkUser.id, activeTenantId);
  }

  console.log('[TenantContext] Fetching user record for tenant:', activeTenantId);

  // Validate user has access to this tenant (CRITICAL SECURITY CHECK)
  const user = await prisma.user.findFirst({
    where: {
      clerkId: clerkUser.id,
      tenantId: activeTenantId,
    },
    include: {
      tenant: true,
      profile: true,
    },
  });

  if (!user) {
    console.log('[TenantContext] User does not have access to tenant:', activeTenantId);
    // User lost access to this tenant, clear it
    const redis = getRedis();
    await redis.del(`user:${clerkUser.id}:activeTenant`);
    return null;
  }

  console.log('[TenantContext] Successfully authenticated:', {
    tenantId: activeTenantId,
    tenantName: user.tenant.name,
    userRole: user.role
  });

  return {
    clerkUser,
    user,
    tenant: user.tenant,
    tenantId: activeTenantId,
  };
}

/**
 * Clear the active tenant (used on logout or security events)
 */
export async function clearActiveTenant(clerkUserId: string): Promise<void> {
  const redis = getRedis();
  const cacheKey = `user:${clerkUserId}:activeTenant`;
  await redis.del(cacheKey);
}

/**
 * Get all estates the user has access to
 * Caches result for 5 minutes
 */
export async function getUserEstates(clerkUserId: string) {
  const redis = getRedis();
  const cacheKey = `user:${clerkUserId}:estates`;
  
  // Try cache first
  const cached = await redis.get<any[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Fetch from database
  const userRecords = await prisma.user.findMany({
    where: { clerkId: clerkUserId },
    include: { tenant: true },
    orderBy: [
      { isPrimary: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  const estates = userRecords.map(record => ({
    id: record.tenant.id,
    name: record.tenant.name || `Estate of ${record.fullName}`,
    type: record.tenant.type,
    role: record.role,
    isPrimary: record.isPrimary,
    userId: record.id,
  }));

  // Cache for 5 minutes
  await redis.set(cacheKey, JSON.stringify(estates), { ex: 300 });

  return estates;
}

/**
 * Invalidate estate cache (call when estates change)
 */
export async function invalidateEstateCache(clerkUserId: string): Promise<void> {
  const redis = getRedis();
  const cacheKey = `user:${clerkUserId}:estates`;
  await redis.del(cacheKey);
}
