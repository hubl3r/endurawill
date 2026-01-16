// app/dashboard/reports/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Download,
  FileText,
  PieChart,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Scale,
  Heart,
  Building,
  Home,
  Briefcase,
} from 'lucide-react';

interface ReportData {
  totalAssets: {
    count: number;
    value: number;
  };
  totalLiabilities: {
    count: number;
    value: number;
  };
  netWorth: number;
  beneficiaries: {
    count: number;
    primary: number;
    contingent: number;
  };
  probateStatus: {
    probate: { count: number; value: number };
    nonProbate: { count: number; value: number };
    trustAsset: { count: number; value: number };
  };
  assetsByCategory: Array<{
    category: string;
    count: number;
    value: number;
  }>;
  allocationStatus: {
    fullyAllocated: number;
    partiallyAllocated: number;
    unallocated: number;
  };
  topBeneficiaries: Array<{
    name: string;
    relationship: string;
    totalValue: number;
    assetCount: number;
  }>;
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportData();
  }, []);

  const loadReportData = async () => {
    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [assetsRes, liabilitiesRes, beneficiariesRes] = await Promise.all([
        fetch('/api/assets'),
        fetch('/api/liabilities'),
        fetch('/api/beneficiaries'),
      ]);

      const [assetsData, liabilitiesData, beneficiariesData] = await Promise.all([
        assetsRes.json(),
        liabilitiesRes.json(),
        beneficiariesRes.json(),
      ]);

      if (assetsData.success && liabilitiesData.success && beneficiariesData.success) {
        // Calculate report metrics
        const assets = assetsData.assets;
        const liabilities = liabilitiesData.liabilities;
        const beneficiaries = beneficiariesData.beneficiaries;

        const totalAssetValue = assets.reduce((sum: number, a: any) => sum + (Number(a.estimatedValue) || 0), 0);
        const totalLiabilityValue = liabilities.reduce((sum: number, l: any) => sum + (Number(l.currentBalance) || 0), 0);

        // Probate status breakdown
        const probateBreakdown = assets.reduce((acc: any, asset: any) => {
          const status = asset.probateStatus || 'PROBATE';
          const value = Number(asset.estimatedValue) || 0;
          
          if (status === 'PROBATE') {
            acc.probate.count++;
            acc.probate.value += value;
          } else if (status === 'NON_PROBATE') {
            acc.nonProbate.count++;
            acc.nonProbate.value += value;
          } else if (status === 'TRUST_ASSET') {
            acc.trustAsset.count++;
            acc.trustAsset.value += value;
          }
          return acc;
        }, {
          probate: { count: 0, value: 0 },
          nonProbate: { count: 0, value: 0 },
          trustAsset: { count: 0, value: 0 },
        });

        // Assets by category
        const categoryBreakdown = assets.reduce((acc: any, asset: any) => {
          const category = asset.category || 'other';
          if (!acc[category]) {
            acc[category] = { count: 0, value: 0 };
          }
          acc[category].count++;
          acc[category].value += Number(asset.estimatedValue) || 0;
          return acc;
        }, {});

        const assetsByCategory = Object.entries(categoryBreakdown).map(([category, data]: any) => ({
          category,
          count: data.count,
          value: data.value,
        })).sort((a, b) => b.value - a.value);

        // Allocation status
        const allocationStatus = assets.reduce((acc: any, asset: any) => {
          const allocations = asset.assetBeneficiaries || [];
          const totalAllocated = allocations.reduce((sum: number, alloc: any) => {
            if (alloc.specificAmount) {
              return sum + Number(alloc.specificAmount);
            }
            if (alloc.percentage && asset.estimatedValue) {
              return sum + (Number(alloc.percentage) / 100 * Number(asset.estimatedValue));
            }
            return sum;
          }, 0);

          const assetValue = Number(asset.estimatedValue) || 0;
          
          if (totalAllocated >= assetValue * 0.99) {
            acc.fullyAllocated++;
          } else if (totalAllocated > 0) {
            acc.partiallyAllocated++;
          } else {
            acc.unallocated++;
          }
          return acc;
        }, { fullyAllocated: 0, partiallyAllocated: 0, unallocated: 0 });

        // Top beneficiaries
        const beneficiaryValues: any = {};
        assets.forEach((asset: any) => {
          (asset.assetBeneficiaries || []).forEach((alloc: any) => {
            const benId = alloc.beneficiary.id;
            if (!beneficiaryValues[benId]) {
              beneficiaryValues[benId] = {
                name: alloc.beneficiary.fullName,
                relationship: alloc.beneficiary.relationship,
                totalValue: 0,
                assetCount: 0,
              };
            }
            
            let allocValue = 0;
            if (alloc.specificAmount) {
              allocValue = Number(alloc.specificAmount);
            } else if (alloc.percentage && asset.estimatedValue) {
              allocValue = Number(alloc.percentage) / 100 * Number(asset.estimatedValue);
            }
            
            beneficiaryValues[benId].totalValue += allocValue;
            beneficiaryValues[benId].assetCount++;
          });
        });

        const topBeneficiaries = Object.values(beneficiaryValues)
          .sort((a: any, b: any) => b.totalValue - a.totalValue)
          .slice(0, 5);

        setReportData({
          totalAssets: {
            count: assets.length,
            value: totalAssetValue,
          },
          totalLiabilities: {
            count: liabilities.length,
            value: totalLiabilityValue,
          },
          netWorth: totalAssetValue - totalLiabilityValue,
          beneficiaries: {
            count: beneficiaries.length,
            primary: beneficiaries.filter((b: any) => b.isPrimary).length,
            contingent: beneficiaries.filter((b: any) => !b.isPrimary).length,
          },
          probateStatus: probateBreakdown,
          assetsByCategory,
          allocationStatus,
          topBeneficiaries: topBeneficiaries as any,
        });
      }
    } catch (error) {
      console.error('Error loading report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryLabel = (category: string) => {
    const labels: any = {
      bank_accounts: 'Bank Accounts',
      retirement: 'Retirement Accounts',
      investment: 'Investments',
      real_estate: 'Real Estate',
      vehicles: 'Vehicles',
      business: 'Business Interests',
      insurance: 'Insurance',
      personal: 'Personal Property',
      crypto: 'Cryptocurrency',
      collectibles: 'Collectibles',
      other: 'Other',
    };
    return labels[category] || category;
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

  if (!reportData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Unable to load report data</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estate Reports</h1>
            <p className="text-gray-600 mt-1">Comprehensive overview of your estate plan</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Download className="h-5 w-5" />
            Export Report
          </button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Assets</p>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalAssets.value)}</p>
            <p className="text-xs text-gray-500 mt-1">{reportData.totalAssets.count} assets</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
              <Scale className="h-5 w-5 text-red-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(reportData.totalLiabilities.value)}</p>
            <p className="text-xs text-gray-500 mt-1">{reportData.totalLiabilities.count} liabilities</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Net Worth</p>
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <p className={`text-2xl font-bold ${reportData.netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(reportData.netWorth)}
            </p>
            <p className="text-xs text-gray-500 mt-1">Assets - Liabilities</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Beneficiaries</p>
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{reportData.beneficiaries.count}</p>
            <p className="text-xs text-gray-500 mt-1">{reportData.beneficiaries.primary} primary</p>
          </div>
        </div>

        {/* Probate Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Probate Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-red-200 rounded-lg p-4 bg-red-50">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="font-semibold text-gray-900">Subject to Probate</p>
              </div>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(reportData.probateStatus.probate.value)}</p>
              <p className="text-sm text-gray-600 mt-1">{reportData.probateStatus.probate.count} assets</p>
            </div>

            <div className="border border-green-200 rounded-lg p-4 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-semibold text-gray-900">Non-Probate</p>
              </div>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(reportData.probateStatus.nonProbate.value)}</p>
              <p className="text-sm text-gray-600 mt-1">{reportData.probateStatus.nonProbate.count} assets</p>
            </div>

            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-blue-600" />
                <p className="font-semibold text-gray-900">Trust Assets</p>
              </div>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(reportData.probateStatus.trustAsset.value)}</p>
              <p className="text-sm text-gray-600 mt-1">{reportData.probateStatus.trustAsset.count} assets</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assets by Category */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Assets by Category</h2>
            <div className="space-y-3">
              {reportData.assetsByCategory.slice(0, 6).map((cat) => {
                const percentage = (cat.value / reportData.totalAssets.value) * 100;
                return (
                  <div key={cat.category}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-700">{getCategoryLabel(cat.category)}</span>
                      <span className="text-sm font-semibold text-gray-900">{formatCurrency(cat.value)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}% • {cat.count} assets</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top Beneficiaries */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Beneficiaries</h2>
            {reportData.topBeneficiaries.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No beneficiaries allocated yet</p>
            ) : (
              <div className="space-y-3">
                {reportData.topBeneficiaries.map((ben, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{ben.name}</p>
                        <p className="text-sm text-gray-500 capitalize">{ben.relationship.replace('_', ' ')}</p>
                      </div>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(ben.totalValue)}</span>
                    </div>
                    <p className="text-xs text-gray-500">{ben.assetCount} asset{ben.assetCount !== 1 ? 's' : ''}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Allocation Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Allocation Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{reportData.allocationStatus.fullyAllocated}</p>
              <p className="text-sm text-gray-600 mt-1">Fully Allocated</p>
            </div>
            <div className="text-center p-4">
              <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{reportData.allocationStatus.partiallyAllocated}</p>
              <p className="text-sm text-gray-600 mt-1">Partially Allocated</p>
            </div>
            <div className="text-center p-4">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-2" />
              <p className="text-3xl font-bold text-gray-900">{reportData.allocationStatus.unallocated}</p>
              <p className="text-sm text-gray-600 mt-1">Unallocated</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
