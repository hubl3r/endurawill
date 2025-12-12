import { Ratelimit } from '@upstash/ratelimit';
import { getRedis } from './redis';

// Rate limiters for different operations
export const rateLimiters = {
  // Tenant switching: 10 per hour
  tenantSwitch: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
    prefix: 'ratelimit:tenant-switch',
  }),

  // Estate creation: 5 per day
  estateCreate: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(5, '1 d'),
    analytics: true,
    prefix: 'ratelimit:estate-create',
  }),

  // Document upload: 50 per hour
  documentUpload: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(50, '1 h'),
    analytics: true,
    prefix: 'ratelimit:document-upload',
  }),

  // API calls: 100 per minute
  apiCall: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // Failed login tracking: 5 per 15 minutes
  failedLogin: new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(5, '15 m'),
    analytics: true,
    prefix: 'ratelimit:failed-login',
  }),
};

// Helper to check rate limit and return consistent response
export async function checkRateLimit(
  limiter: Ratelimit,
  identifier: string
): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> {
  const result = await limiter.limit(identifier);
  
  return {
    success: result.success,
    limit: result.limit,
    remaining: result.remaining,
    reset: result.reset,
  };
}
