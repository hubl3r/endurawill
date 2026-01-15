// app/dashboard/liabilities/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus,
  Search,
  Filter,
  TrendingDown,
  DollarSign,
  Shield,
  ShieldOff,
  Grid,
  List,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { LIABILITY_CATEGORIES, getLiabilityCategory } from '@/lib/assetCategories';
import CreateLiabilityModal from '@/components/CreateLiabilityModal';

interface Liability {
  id: string;
  type: string;
  description: string;
  category: string | null;
  creditor: string | null;
  originalAmount: number;
  currentBalance: number;
  currency: string;
  accountNumber: string | null;
  loanNumber: string | null;
  interestRate: number | null;
  originationDate: string | null;
  maturityDate: string | null;
  paymentSchedule: string | null;
  monthlyPayment: number | null;
  nextPaymentDate: string | null;
  isSecured: boolean;
  collateralDescription: string | null;
  probateStatus: string | null;
  isDeductible: boolean | null;
  taxCategory: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  valueHistory: any[];
}

interface Summary {
  totalLiabilities: number;
  totalDebt: number;
  liabilitiesByCategory: Record<string, { count: number; value: number }>;
  securedCount: number;
  securedValue: number;
  unsecuredCount: number;
  unsecuredValue: number;
  deductibleCount: number;
  deductibleValue: number;
}

type ViewMode = 'grid' | 'list';
type TabView = 'overview' | 'all' | 'secured' | 'unsecured';

export default function LiabilitiesPage() {
  const router = useRouter();
  const [liabilities, setLiabilities] = useState<Liability[]>([]);
  const [filteredLiabilities, setFilteredLiabilities] = useState<Liability[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabView>('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedLiability, setExpandedLiability] = useState<string | null>(null);
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null);

  useEffect(() => {
    loadLiabilities();
  }, []);

  useEffect(() => {
    filterLiabilities();
  }, [liabilities, searchQuery, selectedCategory, activeTab]);

  const loadLiabilities = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/liabilities');
      const data = await response.json();

      if (data.success) {
        setLiabilities(data.liabilities);
        setSummary(data.summary);
      }
    } catch (error) {
      console.error('Error loading liabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLiabilities = () => {
    let filtered = [...liabilities];

    // Filter by tab
    if (activeTab === 'secured') {
      filtered = filtered.filter(l => l.isSecured);
    } else if (activeTab === 'unsecured') {
      filtered = filtered.filter(l => !l.isSecured);
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(l => l.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l =>
        l.description.toLowerCase().includes(query) ||
        l.creditor?.toLowerCase().includes(query) ||
        l.accountNumber?.toLowerCase().includes(query) ||
        l.loanNumber?.toLowerCase().includes(query)
      );
    }

    setFilteredLiabilities(filtered);
  };

  const handleDelete = async (liabilityId: string, description: string) => {
    if (!confirm(`Are you sure you want to delete "${description}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/liabilities/${liabilityId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await loadLiabilities();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete liability');
      }
    } catch (error) {
      console.error('Error deleting liability:', error);
      alert('Failed to delete liability');
    }
  };

  const handleEdit = (liability: Liability) => {
    setEditingLiability(liability);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingLiability(null);
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
    const category = getLiabilityCategory(categoryId);
    return category || { label: categoryId, icon: FileText, color: 'gray' };
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
            <h1 className="text-3xl font-bold text-gray-900">Liabilities</h1>
            <p className="text-gray-600 mt-1">
              Track debts and obligations for estate planning
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Liability
          </button>
        </div>

        {/* Summary Cards */}
        {activeTab === 'overview' && summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Liabilities</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.totalLiabilities}</p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Debt</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(summary.totalDebt)}
                  </p>
                </div>
                <div className="p-3 bg-orange-100 rounded-lg">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Secured Debt</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.securedCount}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(summary.securedValue)}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tax Deductible</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{summary.deductibleCount}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatCurrency(summary.deductibleValue)}</p>
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
              { id: 'all', label: 'All Liabilities' },
              { id: 'secured', label: 'Secured Debt' },
              { id: 'unsecured', label: 'Unsecured Debt' },
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

        {/* Filters and Search */}
        {activeTab !== 'overview' && (
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search liabilities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {LIABILITY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>

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

        {/* Liabilities Display */}
        {activeTab === 'overview' ? (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Liabilities by Category</h2>
            {summary && Object.keys(summary.liabilitiesByCategory).length > 0 ? (
              <div className="space-y-4">
                {Object.entries(summary.liabilitiesByCategory).map(([categoryId, data]) => {
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
                          <p className="text-sm text-gray-500">{data.count} liabilities</p>
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
              <p className="text-gray-500 text-center py-8">No liabilities yet. Add your first liability to get started.</p>
            )}
          </div>
        ) : (
          <div>
            {filteredLiabilities.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No liabilities found</p>
                <p className="text-sm text-gray-500">
                  {searchQuery || selectedCategory
                    ? 'Try adjusting your filters'
                    : 'Add your first liability to get started'}
                </p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredLiabilities.map((liability) => {
                  const categoryInfo = getCategoryInfo(liability.category);
                  const Icon = categoryInfo.icon;
                  return (
                    <div
                      key={liability.id}
                      className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-2 bg-${categoryInfo.color}-100 rounded-lg`}>
                          <Icon className={`h-6 w-6 text-${categoryInfo.color}-600`} />
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => setExpandedLiability(liability.id === expandedLiability ? null : liability.id)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(liability)}
                            className="p-1 text-gray-400 hover:text-blue-600"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(liability.id, liability.description)}
                            className="p-1 text-gray-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">{liability.description}</h3>
                      <p className="text-sm text-gray-500 mb-3">{categoryInfo.label}</p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Balance:</span>
                          <span className="font-semibold text-red-600">
                            {formatCurrency(liability.currentBalance)}
                          </span>
                        </div>
                        {liability.creditor && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Creditor:</span>
                            <span className="text-sm text-gray-900">{liability.creditor}</span>
                          </div>
                        )}
                        {liability.monthlyPayment && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Payment:</span>
                            <span className="text-sm text-gray-900">{formatCurrency(liability.monthlyPayment)}/mo</span>
                          </div>
                        )}
                        <div className="pt-2 border-t border-gray-200 flex gap-2">
                          {liability.isSecured && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              Secured
                            </span>
                          )}
                          {liability.isDeductible && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                              Deductible
                            </span>
                          )}
                        </div>
                      </div>
                      {expandedLiability === liability.id && (
                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-sm">
                          {liability.interestRate && (
                            <div>
                              <span className="text-gray-600">Interest Rate:</span>{' '}
                              <span className="text-gray-900">{liability.interestRate}%</span>
                            </div>
                          )}
                          {liability.maturityDate && (
                            <div>
                              <span className="text-gray-600">Maturity:</span>{' '}
                              <span className="text-gray-900">{formatDate(liability.maturityDate)}</span>
                            </div>
                          )}
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Liability</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLiabilities.map((liability) => {
                      const categoryInfo = getCategoryInfo(liability.category);
                      return (
                        <tr key={liability.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{liability.description}</div>
                            {liability.creditor && (
                              <div className="text-sm text-gray-500">{liability.creditor}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">{categoryInfo.label}</td>
                          <td className="px-6 py-4 text-sm font-medium text-red-600">
                            {formatCurrency(liability.currentBalance)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {liability.monthlyPayment ? `${formatCurrency(liability.monthlyPayment)}/mo` : 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEdit(liability)}
                                className="p-1 text-gray-400 hover:text-blue-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(liability.id, liability.description)}
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

      {/* Create/Edit Liability Modal */}
      <CreateLiabilityModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSuccess={loadLiabilities}
        editLiability={editingLiability}
      />
    </DashboardLayout>
  );
}
