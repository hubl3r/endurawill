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
  Users,
} from 'lucide-react';
import { getAssetCategory } from '@/lib/assetCategories';
import CreateAllocationModal from '@/components/CreateAllocationModal';

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
  assetBeneficiaries: AssetBeneficiary[];
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

interface AssetBeneficiary {
  id: string;
  allocationType: string;
  percentage: number | null;
  specificAmount: number | null;
  isPrimary: boolean;
  isContingent: boolean;
  beneficiary: {
    id: string;
    fullName: string;
    relationship: string;
  };
}

type TabView = 'details' | 'basis' | 'value-history' | 'allocations';

export default function AssetDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabView>('details');
  const [showAllocationModal, setShowAllocationModal] = useState(false);

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

  const totalAllocated = asset.assetBeneficiaries.reduce((sum, alloc) => {
    return sum + (alloc.percentage ? Number(alloc.percentage) : 0);
  }, 0);

  const totalAllocatedDollars = asset.assetBeneficiaries.reduce((sum, alloc) => {
    if (alloc.specificAmount) {
      return sum + Number(alloc.specificAmount);
    }
    if (alloc.percentage && asset.estimatedValue) {
      return sum + (Number(alloc.percentage) / 100 * Number(asset.estimatedValue));
    }
    return sum;
  }, 0);

  const handleDeleteAllocation = async (allocationId: string, beneficiaryName: string) => {
    if (!confirm(`Remove ${beneficiaryName} from this asset?`)) return;

    try {
      const res = await fetch(`/api/allocations/${allocationId}`, { method: 'DELETE' });
      if (res.ok) await loadAsset();
    } catch (error) {
      console.error('Error deleting allocation:', error);
    }
  };

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
              <p className="text-sm font-medium text-gray-600">Allocated</p>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalAllocatedDollars)}</p>
            <p className="text-xs text-gray-500 mt-1">
              {totalAllocated > 0 && `${totalAllocated.toFixed(1)}% • `}
              {asset.assetBeneficiaries.length} beneficiar{asset.assetBeneficiaries.length !== 1 ? 'ies' : 'y'}
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'details', label: 'Details', icon: FileText },
              { id: 'allocations', label: 'Beneficiaries', icon: Users },
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

          {activeTab === 'allocations' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Beneficiary Allocations</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {formatCurrency(totalAllocatedDollars)} allocated
                    {asset.estimatedValue && ` • ${formatCurrency(Number(asset.estimatedValue) - totalAllocatedDollars)} remaining`}
                  </p>
                </div>
                <button
                  onClick={() => setShowAllocationModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Beneficiary
                </button>
              </div>

              {asset.assetBeneficiaries.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No beneficiaries allocated</p>
                  <p className="text-sm text-gray-500 mt-1">Allocate this asset to one or more beneficiaries</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {asset.assetBeneficiaries.map((alloc) => (
                    <div key={alloc.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-gray-900">{alloc.beneficiary.fullName}</p>
                        <p className="text-sm text-gray-500 capitalize">{alloc.beneficiary.relationship.replace('_', ' ')}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold text-blue-600">{alloc.percentage ? `${alloc.percentage}%` : formatCurrency(alloc.specificAmount)}</p>
                          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                            {alloc.isPrimary ? 'Primary' : 'Contingent'}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDeleteAllocation(alloc.id, alloc.beneficiary.fullName)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'basis' && (
            <div className="text-center py-12">
              <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Basis adjustments feature coming soon</p>
            </div>
          )}

          {activeTab === 'value-history' && (
            <div className="text-center py-12">
              <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Value history feature coming soon</p>
            </div>
          )}
        </div>
      </div>

      {asset && (
        <CreateAllocationModal
          isOpen={showAllocationModal}
          onClose={() => setShowAllocationModal(false)}
          onSuccess={loadAsset}
          assetId={asset.id}
          assetDescription={asset.description}
          remainingPercentage={100 - totalAllocated}
        />
      )}
    </DashboardLayout>
  );
}
