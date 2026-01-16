// app/dashboard/liabilities/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  TrendingDown,
  Percent,
  CreditCard,
  Clock,
} from 'lucide-react';

interface Liability {
  id: string;
  description: string;
  category: string | null;
  creditor: string | null;
  accountNumber: string | null;
  originalAmount: number | null;
  currentBalance: number | null;
  interestRate: number | null;
  monthlyPayment: number | null;
  originationDate: string | null;
  maturityDate: string | null;
  nextPaymentDate: string | null;
  paymentSchedule: string | null;
  isSecured: boolean;
  collateralDescription: string | null;
  isDeductible: boolean;
  taxCategory: string | null;
  probateStatus: string | null;
  notes: string | null;
  valueHistory: ValueHistoryEntry[];
}

interface ValueHistoryEntry {
  id: string;
  valueDate: string;
  amount: number;
  source: string;
  notes: string | null;
}

type TabView = 'details' | 'payment-history';

export default function LiabilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [liability, setLiability] = useState<Liability | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('details');

  useEffect(() => {
    loadLiability();
  }, [resolvedParams.id]);

  const loadLiability = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/liabilities/${resolvedParams.id}`);
      const data = await response.json();
      if (data.success) setLiability(data.liability);
    } catch (error) {
      console.error('Error loading liability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!liability || !confirm(`Delete "${liability.description}"?`)) return;

    try {
      const res = await fetch(`/api/liabilities/${resolvedParams.id}`, { method: 'DELETE' });
      if (res.ok) router.push('/dashboard/liabilities');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!liability) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Liability Not Found</h2>
          <button onClick={() => router.push('/dashboard/liabilities')} className="text-blue-600">
            Return to Liabilities
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const amountPaid = liability.originalAmount && liability.currentBalance
    ? Number(liability.originalAmount) - Number(liability.currentBalance)
    : 0;
  const percentPaid = liability.originalAmount && amountPaid > 0
    ? (amountPaid / Number(liability.originalAmount)) * 100
    : 0;

  const monthsRemaining = liability.maturityDate
    ? Math.max(0, Math.ceil((new Date(liability.maturityDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard/liabilities')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{liability.description}</h1>
              <p className="text-gray-600 mt-1">{liability.creditor || 'Liability'}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50">
              <Edit className="h-4 w-4" />
              Edit
            </button>
            <button onClick={handleDelete} className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Current Balance</p>
              <DollarSign className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(liability.currentBalance)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Amount Paid</p>
              <TrendingDown className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(amountPaid)}</p>
            <p className="text-xs text-gray-500 mt-1">{percentPaid.toFixed(1)}% of total</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Interest Rate</p>
              <Percent className="h-5 w-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {liability.interestRate ? `${liability.interestRate}%` : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Monthly Payment</p>
              <CreditCard className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(liability.monthlyPayment)}</p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', label: 'Details', icon: FileText },
              { id: 'payment-history', label: 'Payment History', icon: Clock },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabView)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Creditor</h3>
                  <p className="text-gray-900">{liability.creditor || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Account Number</h3>
                  <p className="text-gray-900">{liability.accountNumber || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Original Amount</h3>
                  <p className="text-gray-900">{formatCurrency(liability.originalAmount)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Schedule</h3>
                  <p className="text-gray-900 capitalize">{liability.paymentSchedule?.replace('_', ' ') || 'N/A'}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Origination Date</h3>
                  <p className="text-gray-900">{formatDate(liability.originationDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Maturity Date</h3>
                  <p className="text-gray-900">{formatDate(liability.maturityDate)}</p>
                  {monthsRemaining !== null && monthsRemaining > 0 && (
                    <p className="text-sm text-gray-500 mt-1">{monthsRemaining} months remaining</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Next Payment</h3>
                  <p className="text-gray-900">{formatDate(liability.nextPaymentDate)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Secured</h3>
                  <p className="text-gray-900">{liability.isSecured ? 'Yes' : 'No'}</p>
                  {liability.isSecured && liability.collateralDescription && (
                    <p className="text-sm text-gray-500 mt-1">{liability.collateralDescription}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Tax Deductible</h3>
                  <p className="text-gray-900">{liability.isDeductible ? 'Yes' : 'No'}</p>
                  {liability.taxCategory && (
                    <p className="text-sm text-gray-500 mt-1 capitalize">{liability.taxCategory.replace('_', ' ')}</p>
                  )}
                </div>
              </div>

              {liability.notes && (
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
                  <p className="text-gray-900 whitespace-pre-wrap">{liability.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'payment-history' && (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Payment history tracking coming soon</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
