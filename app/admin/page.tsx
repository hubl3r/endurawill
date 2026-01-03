// /app/admin/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  CreditCard, 
  Database, 
  Activity,
  Calendar,
  DollarSign,
  Shield,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import AdminBackfillButton from '@/components/AdminBackfillButton';
import AdminSeedButton from '@/components/AdminSeedButton';

interface AdminStats {
  system: {
    totalTenants: number;
    totalUsers: number;
    totalAccounts: number;
    totalPayments: number;
    activeTenants: number;
    activeAccounts: number;
  };
  tenants: Array<{
    id: string;
    estateName: string;
    createdAt: string;
    accountCount: number;
    userCount: number;
    delegateCount: number;
    lastActivity: string;
  }>;
  database: {
    accountsSize: string;
    paymentsSize: string;
    auditLogsSize: string;
    totalSize: string;
  };
  recent: {
    newAccounts: number;
    newPayments: number;
    lastWeek: string;
  };
  recentAccounts: Array<{
    id: string;
    accountName: string;
    companyName: string;
    estateName: string;
    createdByName: string;
    createdAt: string;
  }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();
      
      if (response.ok) {
        setStats(data);
      } else {
        setError(data.error || 'Failed to load stats');
      }
    } catch (err) {
      setError('Network error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <div className="text-gray-600">Loading admin dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-1">System overview and management</p>
            </div>
            <button
              onClick={fetchStats}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* System Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Shield className="h-6 w-6" />}
            label="Total Estates"
            value={stats.system.totalTenants}
            subValue={`${stats.system.activeTenants} active`}
            color="blue"
          />
          <StatCard
            icon={<Users className="h-6 w-6" />}
            label="Total Users"
            value={stats.system.totalUsers}
            subValue="All estates"
            color="green"
          />
          <StatCard
            icon={<CreditCard className="h-6 w-6" />}
            label="Total Accounts"
            value={stats.system.totalAccounts}
            subValue={`${stats.system.activeAccounts} active`}
            color="purple"
          />
          <StatCard
            icon={<DollarSign className="h-6 w-6" />}
            label="Payment Records"
            value={stats.system.totalPayments}
            subValue="Across all accounts"
            color="orange"
          />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Last 7 Days</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.recent.newAccounts}
            </div>
            <div className="text-sm text-gray-600">New accounts created</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Payments</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.recent.newPayments}
            </div>
            <div className="text-sm text-gray-600">Processed last week</div>
          </div>

          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Database className="h-5 w-5 text-purple-600" />
              <h3 className="font-semibold text-gray-900">Database Size</h3>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">
              {stats.database.totalSize}
            </div>
            <div className="text-sm text-gray-600">Total storage used</div>
          </div>
        </div>

        {/* Database Details */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Database Usage</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-sm text-gray-600 mb-1">Accounts Table</div>
                <div className="text-2xl font-bold text-gray-900">{stats.database.accountsSize}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Payment History</div>
                <div className="text-2xl font-bold text-gray-900">{stats.database.paymentsSize}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Audit Logs</div>
                <div className="text-2xl font-bold text-gray-900">{stats.database.auditLogsSize}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tenants/Estates List */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Accounts (Last 30 Days)</h2>
            <p className="text-sm text-gray-600 mt-1">See who's creating accounts</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Account Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.recentAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No accounts created in the last 30 days
                    </td>
                  </tr>
                ) : (
                  stats.recentAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {account.accountName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {account.companyName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {account.estateName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {account.createdByName}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(account.createdAt).toLocaleDateString()} {new Date(account.createdAt).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tenants/Estates List */}
        <div className="bg-white rounded-lg border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Estates Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estate Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Users</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delegates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Accounts</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stats.tenants.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {tenant.estateName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant.userCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant.delegateCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant.accountCount}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {tenant.lastActivity ? new Date(tenant.lastActivity).toLocaleDateString() : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Actions */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Admin Actions</h2>
          <AdminSeedButton />
          <AdminBackfillButton />
        </div>
      </div>
    </div>
  );
}

// Helper component for stat cards
function StatCard({ 
  icon, 
  label, 
  value, 
  subValue, 
  color 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: number; 
  subValue: string; 
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    orange: 'text-orange-600 bg-orange-50',
  }[color];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className={`inline-flex p-3 rounded-lg ${colorClasses} mb-4`}>
        {icon}
      </div>
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value.toLocaleString()}</div>
      <div className="text-sm text-gray-500">{subValue}</div>
    </div>
  );
}
