// /app/api/admin/stats/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

/**
 * GET /api/admin/stats
 * Fetch comprehensive admin statistics
 */
export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get system-wide counts
    const [
      totalTenants,
      totalUsers,
      totalAccounts,
      totalPayments,
      activeAccounts,
    ] = await Promise.all([
      prisma.tenant.count(),
      prisma.user.count(),
      prisma.account.count(),
      prisma.paymentHistory.count(),
      prisma.account.count({ where: { isActive: true, status: 'ACTIVE' } }),
    ]);

    // Get active tenants (those with activity in last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeTenants = await prisma.tenant.count({
      where: {
        updatedAt: { gte: thirtyDaysAgo },
      },
    });

    // Get detailed tenant information
    const tenants = await prisma.tenant.findMany({
      select: {
        id: true,
        estateName: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            accounts: true,
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get delegate counts for each tenant
    const tenantsWithDetails = await Promise.all(
      tenants.map(async (tenant) => {
        const [delegateCount, lastActivity] = await Promise.all([
          prisma.user.count({
            where: {
              tenantMemberships: {
                some: {
                  tenantId: tenant.id,
                  role: 'DELEGATE',
                },
              },
            },
          }),
          prisma.auditLog.findFirst({
            where: { tenantId: tenant.id },
            orderBy: { createdAt: 'desc' },
            select: { createdAt: true },
          }),
        ]);

        return {
          id: tenant.id,
          estateName: tenant.estateName,
          createdAt: tenant.createdAt.toISOString(),
          accountCount: tenant._count.accounts,
          userCount: tenant._count.users,
          delegateCount,
          lastActivity: lastActivity?.createdAt.toISOString() || '',
        };
      })
    );

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [newAccounts, newPayments] = await Promise.all([
      prisma.account.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.paymentHistory.count({
        where: { 
          createdAt: { gte: sevenDaysAgo },
          status: 'PAID',
        },
      }),
    ]);

    // Estimate database sizes (approximate based on record counts)
    // These are rough estimates - actual sizes would require database-specific queries
    const estimateSize = (count: number, avgRecordSize: number) => {
      const bytes = count * avgRecordSize;
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    };

    const auditLogCount = await prisma.auditLog.count();

    const accountsSize = estimateSize(totalAccounts, 2048); // ~2KB per account
    const paymentsSize = estimateSize(totalPayments, 512); // ~512B per payment
    const auditLogsSize = estimateSize(auditLogCount, 1024); // ~1KB per log

    // Calculate total (rough estimate)
    const totalBytes = 
      (totalAccounts * 2048) + 
      (totalPayments * 512) + 
      (auditLogCount * 1024) +
      (totalUsers * 1024) +
      (totalTenants * 512);
    const totalSize = estimateSize(totalBytes, 1);

    const stats = {
      system: {
        totalTenants,
        totalUsers,
        totalAccounts,
        totalPayments,
        activeTenants,
        activeAccounts,
      },
      tenants: tenantsWithDetails,
      database: {
        accountsSize,
        paymentsSize,
        auditLogsSize,
        totalSize,
      },
      recent: {
        newAccounts,
        newPayments,
        lastWeek: sevenDaysAgo.toISOString(),
      },
    };

    return NextResponse.json(stats);

  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin statistics' },
      { status: 500 }
    );
  }
}
