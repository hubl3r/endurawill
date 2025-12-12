import { currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { getRedis } from './redis';

const redis = getRedis();

/**
 * Get the active tenant ID for the current user
 * Returns from Redis cache (server-side), never from client
 */
export async function getActiveTenantId(clerkUserId: string): Promise<string | null> {
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

    // Store in Redis with 24-hour expiration
    const cacheKey = `user:${clerkUserId}:activeTenant`;
    await redis.set(cacheKey, tenantId, { ex: 86400 }); // 24 hours

    return { success: true };
  } catch (error) {
    console.error('Error setting active tenant:', error);
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
    return null;
  }

  // Get active tenant from Redis (server-side, secure)
  let activeTenantId = await getActiveTenantId(clerkUser.id);

  // If no active tenant is set, get the first one they have access to
  if (!activeTenantId) {
    const firstUser = await prisma.user.findFirst({
      where: { clerkId: clerkUser.id },
      include: { tenant: true },
    });

    if (!firstUser) {
      return null;
    }

    // Set this as their active tenant
    activeTenantId = firstUser.tenantId;
    await setActiveTenantId(clerkUser.id, activeTenantId);
  }

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
    // User lost access to this tenant, clear it
    await redis.del(`user:${clerkUser.id}:activeTenant`);
    return null;
  }

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
  const cacheKey = `user:${clerkUserId}:activeTenant`;
  await redis.del(cacheKey);
}

/**
 * Get all estates the user has access to
 * Caches result for 5 minutes
 */
export async function getUserEstates(clerkUserId: string) {
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
  const cacheKey = `user:${clerkUserId}:estates`;
  await redis.del(cacheKey);
}
