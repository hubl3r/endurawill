// app/dashboard/assets/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus,
  Search,
  Filter,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  BarChart3,
  Grid,
  List,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
} from 'lucide-react';
import { ASSET_CATEGORIES, getAssetCategory, getAssetSubtype } from '@/lib/assetCategories';
import CreateAssetModal from '@/components/CreateAssetModal';

interface Asset {
  id: string;
  type: string;
  description: string;
  category: string | null;
  estimatedValue: number | null;
  currency: string;
  valuationDate: string | null;
  accountNumber: string | null;
  institution: string | null;
  location: string | null;
  serialNumber: string | null;
  ownershipType: string;
  probateStatus: string | null;
  includedInEstate: boolean;
  acquisitionDate: string | null;
  holdingPeriod: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  basisAdjustments: any[];
  valueHistory: any[];
  assetBeneficiaries: any[];
}

interface Summary {
  totalAssets: number;
  totalValue: number;
  assetsByCategory: Record<string, { count: number; value: number }>;
  probateCount: number;
  probateValue: number;
  nonProbateCount: number;
  nonProbateValue: number;
  trustCount: number;
  trustValue: number;
}

type ViewMode = 'grid' | 'list';
type TabView = 'overview' | 'all' | 'probate' | 'non-probate' | 'trust';

export default function AssetsPage() {
  const router = useRouter();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedAsset, setExpandedAsset] = useState<string | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  useEffect(() => {
    loadAssets();
  }, []);

  useEffect(() => {
    filterAssets();
  }, [assets, searchQuery, selectedCategory, activeTab]);

  const loadAssets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/assets');
      const data = await response.json();

      if (data.success) {
        setAssets(data.assets);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAssets = () => {
    let filtered = [...assets];

    // Filter by tab
    if (activeTab === 'probate') {
      filtered = filtered.filter(a => a.probateStatus === 'PROBATE');
    } else if (activeTab === 'non-probate') {
      filtered = filtered.filter(a => a.probateStatus === 'NON_PROBATE');
    } else if (activeTab === 'trust') {
      filtered = filtered.filter(a => a.probateStatus === 'TRUST_ASSET');
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.description.toLowerCase().includes(query) ||
        a.institution?.toLowerCase().includes(query) ||
        a.location?.toLowerCase().includes(query) ||
        a.accountNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredAssets(filtered);
  };

  const handleDelete = async (assetId: string, description: string) => {
    if (!confirm(`Are you sure you want to delete "${description}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/assets/${assetId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadAssets();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete asset');
      }
    } catch (error) {
      console.error('Error deleting asset:', error);
      alert('Failed to delete asset');
    }
  };

  const handleEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingAsset(null);
  };

  const formatCurrency = (amount: number | null) => {
    if (amount === null) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getCategoryInfo = (categoryId: string | null) => {
    if (!categoryId) return { label: 'Uncategorized', icon: FileText, color: 'gray' };
    const category = getAssetCategory(categoryId);
    return category || { label: categoryId, icon: FileText, color: 'gray' };
  };

  const getProbateStatusBadge = (status: string | null) => {
    switch (status) {
      case 'PROBATE':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Probate</span>;
      case 'NON_PROBATE':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Non-Probate</span>;
      case 'TRUST_ASSET':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">Trust</span>;
      case 'EXEMPT':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Exempt</span>;
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">Unknown</span>;
    }
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Assets</h1>
            <p className="text-gray-600 mt-1">
              Manage your estate assets and track values over time
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Asset
          </button>
        </div>

        {/* Summary Cards - Only show on overview tab */}
        {activeTab === 'overview' && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assets</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalAssets}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(summary.totalValue)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Probate Assets</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.probateCount}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(summary.probateValue)}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <AlertCircle className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Non-Probate</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.nonProbateCount}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(summary.nonProbateValue)}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'all', label: 'All Assets' },
              { id: 'probate', label: 'Probate' },
              { id: 'non-probate', label: 'Non-Probate' },
              { id: 'trust', label: 'Trust Assets' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabView)}
                className={`
                  py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Filters and Search - Only show when not on overview */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search assets..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <Grid className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Assets Display */}
        {activeTab === 'overview' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Assets by Category</h2>
            {summary && Object.keys(summary.assetsByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(summary.assetsByCategory).map(([categoryId, data]) => {
                  const categoryInfo = getCategoryInfo(categoryId);
                  const Icon = categoryInfo.icon;
                  return (
                    <div
                      key={categoryId}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedCategory(categoryId);
                        setActiveTab('all');
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-${categoryInfo.color}-100 rounded-lg`}>
                          <Icon className={`h-5 w-5 text-${categoryInfo.color}-600`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{categoryInfo.label}</p>
                          <p className="text-sm text-gray-500">{data.count} assets</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(data.value)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No assets yet. Add your first asset to get started.</p>
            )}
          </div>
        ) : (
          <div>
            {filteredAssets.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No assets found</p>
                <p className="text-sm text-gray-500">
                  {searchQuery || selectedCategory
                    ? 'Try adjusting your filters'
                    : 'Add your first asset to get started'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map((asset) => {
                  const categoryInfo = getCategoryInfo(asset.category);
                  const Icon = categoryInfo.icon;
                  return (
                    <div
                      key={asset.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 bg-${categoryInfo.color}-100 rounded-lg`}>
                          <Icon className={`h-6 w-6 text-${categoryInfo.color}-600`} />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setExpandedAsset(asset.id === expandedAsset ? null : asset.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(asset)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(asset.id, asset.description)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{asset.description}</h3>
                      <p className="text-sm text-gray-500 mb-3">{categoryInfo.label}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Value:</span>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(asset.estimatedValue)}
                          </span>
                        </div>
                        {asset.institution && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Institution:</span>
                            <span className="text-sm text-gray-900">{asset.institution}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200">
                          {getProbateStatusBadge(asset.probateStatus)}
                        </div>
                      </div>
                      {expandedAsset === asset.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                          {asset.accountNumber && (
                            <div>
                              <span className="text-gray-600">Account:</span>{' '}
                              <span className="text-gray-900">{asset.accountNumber}</span>
                            </div>
                          )}
                          {asset.location && (
                            <div>
                              <span className="text-gray-600">Location:</span>{' '}
                              <span className="text-gray-900">{asset.location}</span>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Added:</span>{' '}
                            <span className="text-gray-900">{formatDate(asset.createdAt)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAssets.map((asset) => {
                      const categoryInfo = getCategoryInfo(asset.category);
                      return (
                        <tr key={asset.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{asset.description}</div>
                            {asset.institution && (
                              <div className="text-sm text-gray-500">{asset.institution}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{categoryInfo.label}</td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(asset.estimatedValue)}
                          </td>
                          <td className="px-6 py-4">{getProbateStatusBadge(asset.probateStatus)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(asset)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(asset.id, asset.description)}
                                className="p-1 text-gray-400 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Asset Modal */}
      <CreateAssetModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSuccess={loadAssets}
        editAsset={editingAsset}
      />
    </DashboardLayout>
  );
}
