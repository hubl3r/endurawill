// app/dashboard/assets/[id]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  FileText,
  AlertCircle,
  History,
  Calculator,
} from 'lucide-react';
import { getAssetCategory } from '@/lib/assetCategories';

interface Asset {
  id: string;
  description: string;
  category: string | null;
  estimatedValue: number | null;
  valuationDate: string | null;
  institution: string | null;
  location: string | null;
  accountNumber: string | null;
  ownershipType: string;
  acquisitionDate: string | null;
  acquisitionMethod: string | null;
  originalCostBasis: number | null;
  adjustedBasis: number | null;
  holdingPeriod: string | null;
  probateStatus: string | null;
  notes: string | null;
  basisAdjustments: BasisAdjustment[];
  valueHistory: ValueHistoryEntry[];
}

interface BasisAdjustment {
  id: string;
  adjustmentDate: string;
  adjustmentType: string;
  amount: number;
  basisBefore: number;
  basisAfter: number;
  reason: string;
  taxYear: number | null;
}

interface ValueHistoryEntry {
  id: string;
  valueDate: string;
  amount: number;
  source: string;
  sourceDetails: string | null;
}

type TabView = 'details' | 'basis' | 'value-history';

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('details');

  useEffect(() => {
    loadAsset();
  }, [resolvedParams.id]);

  const loadAsset = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/assets/${resolvedParams.id}`);
      const data = await response.json();
      if (data.success) setAsset(data.asset);
    } catch (error) {
      console.error('Error loading asset:', error);
    } finally {
      setLoading(false);
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

  if (!asset) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Asset Not Found</h2>
          <button onClick={() => router.push('/dashboard/assets')} className="text-blue-600">Return to Assets</button>
        </div>
      </DashboardLayout>
    );
  }

  const categoryInfo = getAssetCategory(asset.category || '');
  const potentialGain = asset.estimatedValue && asset.adjustedBasis ? Number(asset.estimatedValue) - Number(asset.adjustedBasis) : null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => router.push('/dashboard/assets')} className="p-2 hover:bg-gray-100 rounded-lg">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{asset.description}</h1>
              <p className="text-gray-600 mt-1">{categoryInfo?.label || 'Asset'}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Current Value</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(asset.estimatedValue)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Cost Basis</p>
              <Calculator className="h-5 w-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(asset.adjustedBasis || asset.originalCostBasis)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Potential Gain/Loss</p>
              {potentialGain !== null && (potentialGain >= 0 ? <TrendingUp className="h-5 w-5 text-green-600" /> : <TrendingDown className="h-5 w-5 text-red-600" />)}
            </div>
            <p className={`text-2xl font-bold ${potentialGain !== null && potentialGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {potentialGain !== null ? formatCurrency(Math.abs(potentialGain)) : 'N/A'}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Holding Period</p>
              <Calendar className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-lg font-bold text-gray-900">
              {asset.holdingPeriod === 'SHORT_TERM' && 'Short-term'}
              {asset.holdingPeriod === 'LONG_TERM' && 'Long-term'}
              {asset.holdingPeriod === 'INHERITED' && 'Inherited'}
              {!asset.holdingPeriod && 'Not set'}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', label: 'Details', icon: FileText },
              { id: 'basis', label: 'Basis Adjustments', icon: Calculator },
              { id: 'value-history', label: 'Value History', icon: History },
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
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><h3 className="text-sm font-medium text-gray-500">Institution</h3><p className="text-gray-900">{asset.institution || 'N/A'}</p></div>
                <div><h3 className="text-sm font-medium text-gray-500">Account Number</h3><p className="text-gray-900">{asset.accountNumber || 'N/A'}</p></div>
                <div><h3 className="text-sm font-medium text-gray-500">Location</h3><p className="text-gray-900">{asset.location || 'N/A'}</p></div>
                <div><h3 className="text-sm font-medium text-gray-500">Ownership</h3><p className="text-gray-900 capitalize">{asset.ownershipType.replace('_', ' ')}</p></div>
              </div>
            </div>
          )}

          {activeTab === 'basis' && (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Basis adjustments coming soon</p>
            </div>
          )}

          {activeTab === 'value-history' && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Value history coming soon</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
