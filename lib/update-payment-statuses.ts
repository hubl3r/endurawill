/**
 * Payment Status Updater
 * 
 * Automatically updates payment statuses:
 * - UPCOMING → PAST_DUE when dueDate passes
 * - Called on API requests to keep statuses current
 * - No background job needed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Update payment statuses for a specific tenant
 * Changes UPCOMING payments with past due dates to PAST_DUE
 */
export async function updatePaymentStatuses(tenantId: string): Promise<number> {
  const now = new Date();
  
  try {
    const result = await prisma.paymentHistory.updateMany({
      where: {
        tenantId,
        status: 'UPCOMING',
        dueDate: {
          lt: now
        },
        paidDate: null
      },
      data: {
        status: 'PAST_DUE'
      }
    });
    
    return result.count;
  } catch (error) {
    console.error('Error updating payment statuses:', error);
    return 0;
  }
}

/**
 * Update payment statuses for all accounts in a tenant
 * More granular version that processes account by account
 */
export async function updateAccountPaymentStatuses(
  tenantId: string,
  accountId?: string
): Promise<{
  accountsProcessed: number;
  paymentsUpdated: number;
}> {
  const now = new Date();
  
  try {
    // Get accounts to update
    const accounts = await prisma.account.findMany({
      where: {
        tenantId,
        ...(accountId && { id: accountId }),
        isActive: true
      },
      select: {
        id: true
      }
    });
    
    let totalUpdated = 0;
    
    // Update payments for each account
    for (const account of accounts) {
      const result = await prisma.paymentHistory.updateMany({
        where: {
          accountId: account.id,
          status: 'UPCOMING',
          dueDate: {
            lt: now
          },
          paidDate: null
        },
        data: {
          status: 'PAST_DUE'
        }
      });
      
      totalUpdated += result.count;
    }
    
    return {
      accountsProcessed: accounts.length,
      paymentsUpdated: totalUpdated
    };
  } catch (error) {
    console.error('Error updating account payment statuses:', error);
    return {
      accountsProcessed: 0,
      paymentsUpdated: 0
    };
  }
}

/**
 * Get payment status counts for a tenant
 * Useful for dashboard stats
 */
export async function getPaymentStatusCounts(tenantId: string): Promise<{
  upcoming: number;
  pastDue: number;
  paid: number;
  partial: number;
  total: number;
}> {
  try {
    const [upcoming, pastDue, paid, partial] = await Promise.all([
      prisma.paymentHistory.count({
        where: { tenantId, status: 'UPCOMING' }
      }),
      prisma.paymentHistory.count({
        where: { tenantId, status: 'PAST_DUE' }
      }),
      prisma.paymentHistory.count({
        where: { tenantId, status: 'PAID' }
      }),
      prisma.paymentHistory.count({
        where: { tenantId, status: 'PARTIAL' }
      })
    ]);
    
    return {
      upcoming,
      pastDue,
      paid,
      partial,
      total: upcoming + pastDue + paid + partial
    };
  } catch (error) {
    console.error('Error getting payment status counts:', error);
    return {
      upcoming: 0,
      pastDue: 0,
      paid: 0,
      partial: 0,
      total: 0
    };
  }
}

/**
 * Get past due payments for a tenant
 * Returns actual payment records with account details
 */
export async function getPastDuePayments(tenantId: string) {
  // First update statuses to ensure accuracy
  await updatePaymentStatuses(tenantId);
  
  try {
    const pastDuePayments = await prisma.paymentHistory.findMany({
      where: {
        tenantId,
        status: 'PAST_DUE'
      },
      include: {
        account: {
          select: {
            id: true,
            accountName: true,
            companyName: true,
            category: true,
            balanceRemaining: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc' // Oldest first
      }
    });
    
    return pastDuePayments;
  } catch (error) {
    console.error('Error getting past due payments:', error);
    return [];
  }
}

/**
 * Get payments due in a specific timeframe
 */
export async function getPaymentsDueInRange(
  tenantId: string,
  startDate: Date,
  endDate: Date
) {
  // Update statuses first
  await updatePaymentStatuses(tenantId);
  
  try {
    const payments = await prisma.paymentHistory.findMany({
      where: {
        tenantId,
        dueDate: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: ['UPCOMING', 'PAST_DUE']
        }
      },
      include: {
        account: {
          select: {
            id: true,
            accountName: true,
            companyName: true,
            category: true
          }
        }
      },
      orderBy: {
        dueDate: 'asc'
      }
    });
    
    return payments;
  } catch (error) {
    console.error('Error getting payments in range:', error);
    return [];
  }
}

/**
 * Get payments due this week
 */
export async function getPaymentsDueThisWeek(tenantId: string) {
  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(weekFromNow.getDate() + 7);
  
  return getPaymentsDueInRange(tenantId, now, weekFromNow);
}

/**
 * Get payments due this month
 */
export async function getPaymentsDueThisMonth(tenantId: string) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  
  return getPaymentsDueInRange(tenantId, startOfMonth, endOfMonth);
}

/**
 * Middleware function to be called in API routes
 * Updates statuses before processing request
 */
export async function withStatusUpdate<T>(
  tenantId: string,
  operation: () => Promise<T>
): Promise<T> {
  // Update statuses first
  await updatePaymentStatuses(tenantId);
  
  // Then execute the operation
  return operation();
}

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Update statuses in API route
 * 
 * // In /api/accounts/route.ts
 * import { updatePaymentStatuses } from '@/lib/update-payment-statuses';
 * 
 * export async function GET(request: Request) {
 *   const auth = await getAuthenticatedUserAndTenant();
 *   if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   
 *   const { tenantId } = auth;
 *   
 *   // Update statuses before returning data
 *   await updatePaymentStatuses(tenantId);
 *   
 *   const accounts = await prisma.account.findMany({
 *     where: { tenantId }
 *   });
 *   
 *   return NextResponse.json({ accounts });
 * }
 */

/**
 * Example 2: Get dashboard stats
 * 
 * // In /api/dashboard/stats/route.ts
 * import { getPaymentStatusCounts, getPastDuePayments } from '@/lib/update-payment-statuses';
 * 
 * export async function GET(request: Request) {
 *   const auth = await getAuthenticatedUserAndTenant();
 *   if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   
 *   const { tenantId } = auth;
 *   
 *   const [counts, pastDue] = await Promise.all([
 *     getPaymentStatusCounts(tenantId),
 *     getPastDuePayments(tenantId)
 *   ]);
 *   
 *   return NextResponse.json({
 *     counts,
 *     pastDue,
 *     totalPastDueAmount: pastDue.reduce((sum, p) => sum + Number(p.scheduledAmount), 0)
 *   });
 * }
 */

/**
 * Example 3: Using withStatusUpdate wrapper
 * 
 * // In /api/calendar/payments/route.ts
 * import { withStatusUpdate } from '@/lib/update-payment-statuses';
 * 
 * export async function GET(request: Request) {
 *   const auth = await getAuthenticatedUserAndTenant();
 *   if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   
 *   const { tenantId } = auth;
 *   
 *   const payments = await withStatusUpdate(tenantId, async () => {
 *     return prisma.paymentHistory.findMany({
 *       where: { tenantId },
 *       include: { account: true }
 *     });
 *   });
 *   
 *   return NextResponse.json({ payments });
 * }
 */

/**
 * Example 4: Vault filter - payments due this week
 * 
 * // In /api/vault/filter/route.ts
 * import { getPaymentsDueThisWeek } from '@/lib/update-payment-statuses';
 * 
 * export async function GET(request: Request) {
 *   const auth = await getAuthenticatedUserAndTenant();
 *   if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   
 *   const { searchParams } = new URL(request.url);
 *   const filter = searchParams.get('filter');
 *   
 *   if (filter === 'dueThisWeek') {
 *     const payments = await getPaymentsDueThisWeek(auth.tenantId);
 *     return NextResponse.json({ payments });
 *   }
 *   
 *   // ... other filters
 * }
 */

/**
 * Example 5: Background status check (optional cron job)
 * 
 * // In /api/cron/update-statuses/route.ts
 * // Called daily by Vercel Cron or similar
 * 
 * export async function GET(request: Request) {
 *   // Verify cron secret
 *   const authHeader = request.headers.get('authorization');
 *   if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
 *     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
 *   }
 *   
 *   // Get all active tenants
 *   const tenants = await prisma.tenant.findMany({
 *     select: { id: true }
 *   });
 *   
 *   let totalUpdated = 0;
 *   
 *   for (const tenant of tenants) {
 *     const updated = await updatePaymentStatuses(tenant.id);
 *     totalUpdated += updated;
 *   }
 *   
 *   return NextResponse.json({
 *     tenantsProcessed: tenants.length,
 *     paymentsUpdated: totalUpdated
 *   });
 * }
 */
