'use client';

import { useState, useEffect } from 'react';
import { 
  CreditCard,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Building2,
  Car,
  Shield,
  Home,
  Wallet,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowUpDown,
} from 'lucide-react';
import CreateAccountModal from '@/components/CreateAccountModal';

interface Account {
  id: string;
  accountName: string;
  companyName: string;
  category: string;
  subcategory: string | null;
  paymentFrequency: string;
  anticipatedAmount: number | null;
  nextPaymentDate: string | null;
  balanceRemaining: number | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    paymentHistory: number;
  };
}

const ACCOUNT_CATEGORIES = [
  { id: 'Financial Accounts', icon: Wallet, color: 'blue' },
  { id: 'Credit & Loans', icon: CreditCard, color: 'purple' },
  { id: 'Vehicles & Transportation', icon: Car, color: 'green' },
  { id: 'Insurance', icon: Shield, color: 'orange' },
  { id: 'Real Estate & Property', icon: Home, color: 'red' },
  { id: 'Utilities', icon: Building2, color: 'cyan' },
  { id: 'Subscriptions & Memberships', icon: TrendingUp, color: 'pink' },
  { id: 'Other', icon: DollarSign, color: 'gray' },
];

const SORT_OPTIONS = [
  { value: 'name', label: 'Alphabetical' },
  { value: 'nextDue', label: 'Next Due Date' },
  { value: 'dueThisWeek', label: 'Due This Week' },
  { value: 'dueSoon', label: 'Due Soon (2 weeks)' },
];

export default function AccountsView(): JSX.Element {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('name');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      const data = await response.json();
      
      if (data.success && data.accounts) {
        setAccounts(data.accounts);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccountCreated = async (account: any) => {
    setShowCreateModal(false);
    await fetchAccounts();
  };

  const handleDelete = async (accountId: string, accountName: string) => {
    if (!confirm(`Are you sure you want to delete "${accountName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/accounts/${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchAccounts();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const getDaysUntilPayment = (nextPaymentDate: string | null): number => {
    if (!nextPaymentDate) return Infinity;
    const today = new Date();
    const paymentDate = new Date(nextPaymentDate);
    return Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getPaymentStatusColor = (nextPaymentDate: string | null): string => {
    if (!nextPaymentDate) return 'text-gray-400';
    
    const daysUntil = getDaysUntilPayment(nextPaymentDate);
    
    if (daysUntil < 0) return 'text-red-600'; // Past due
    if (daysUntil <= 7) return 'text-orange-600'; // Due this week
    return 'text-gray-600'; // Upcoming (not green until paid)
  };

  const getPaymentStatusIcon = (nextPaymentDate: string | null) => {
    if (!nextPaymentDate) return <Clock className="h-4 w-4" />;
    
    const daysUntil = getDaysUntilPayment(nextPaymentDate);
    
    if (daysUntil < 0) return <AlertCircle className="h-4 w-4" />; // Past due
    if (daysUntil <= 7) return <Clock className="h-4 w-4" />; // Due soon
    return <Clock className="h-4 w-4" />; // Upcoming
  };

  const formatCurrency = (amount: number | null): string => {
    if (!amount) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getCategoryIcon = (category: string) => {
    const cat = ACCOUNT_CATEGORIES.find(c => c.id === category);
    return cat?.icon || DollarSign;
  };

  const getCategoryColor = (category: string) => {
    const cat = ACCOUNT_CATEGORIES.find(c => c.id === category);
    return cat?.color || 'gray';
  };

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      account.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = !selectedCategory || account.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const sortAccounts = (accounts: Account[]) => {
    const sorted = [...accounts];
    
    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.accountName.localeCompare(b.accountName));
      
      case 'nextDue':
        return sorted.sort((a, b) => {
          const daysA = getDaysUntilPayment(a.nextPaymentDate);
          const daysB = getDaysUntilPayment(b.nextPaymentDate);
          return daysA - daysB;
        });
      
      case 'dueThisWeek':
        return sorted.filter(a => {
          const days = getDaysUntilPayment(a.nextPaymentDate);
          return days >= 0 && days <= 7;
        }).sort((a, b) => {
          const daysA = getDaysUntilPayment(a.nextPaymentDate);
          const daysB = getDaysUntilPayment(b.nextPaymentDate);
          return daysA - daysB;
        });
      
      case 'dueSoon':
        return sorted.filter(a => {
          const days = getDaysUntilPayment(a.nextPaymentDate);
          return days >= 0 && days <= 14;
        }).sort((a, b) => {
          const daysA = getDaysUntilPayment(a.nextPaymentDate);
          const daysB = getDaysUntilPayment(b.nextPaymentDate);
          return daysA - daysB;
        });
      
      default:
        return sorted;
    }
  };

  const sortedAccounts = sortAccounts(filteredAccounts);

  const accountsByCategory = ACCOUNT_CATEGORIES.map(cat => ({
    ...cat,
    accounts: sortedAccounts.filter(a => a.category === cat.id),
    count: sortedAccounts.filter(a => a.category === cat.id).length,
  }));

  // Calculate stats based on filtered accounts
  const totalMonthlyPayments = sortedAccounts
    .filter(a => a.paymentFrequency === 'MONTHLY' && a.anticipatedAmount)
    .reduce((sum, a) => sum + Number(a.anticipatedAmount || 0), 0);

  const totalBalance = sortedAccounts
    .filter(a => a.balanceRemaining)
    .reduce((sum, a) => sum + Number(a.balanceRemaining || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 px-4 md:px-6 py-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-sm text-gray-500 mt-1">Track your financial accounts and payment schedules</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Account</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {ACCOUNT_CATEGORIES.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.id}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SORT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="border-b border-gray-200 px-4 md:px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Accounts</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{sortedAccounts.length}</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {sortedAccounts.filter(a => a.isActive).length}
            </div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Monthly Payments</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {formatCurrency(totalMonthlyPayments)}
            </div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Balance</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {formatCurrency(totalBalance)}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-4 md:p-6 bg-white">
        {sortedAccounts.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory || sortBy !== 'name' ? 'No accounts found' : 'No accounts yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory || sortBy !== 'name'
                ? 'Try adjusting your filters' 
                : 'Start by adding your first account'}
            </p>
            {!searchQuery && !selectedCategory && sortBy === 'name' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Account
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {accountsByCategory
              .filter(cat => cat.count > 0)
              .map(category => {
                const Icon = category.icon;
                return (
                  <div key={category.id}>
                    <div className="flex items-center gap-2 mb-3">
                      <Icon className={`h-5 w-5 text-${category.color}-600`} />
                      <h2 className="text-base md:text-lg font-semibold text-gray-900">{category.id}</h2>
                      <span className="text-sm text-gray-500">({category.count})</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      {category.accounts.map(account => {
                        const Icon = getCategoryIcon(account.category);
                        const statusColor = getPaymentStatusColor(account.nextPaymentDate);
                        const statusIcon = getPaymentStatusIcon(account.nextPaymentDate);
                        
                        return (
                          <div
                            key={account.id}
                            className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 group"
                          >
                            <Icon className={`h-8 w-8 text-${getCategoryColor(account.category)}-500 flex-shrink-0 hidden md:block`} />
                            
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-gray-900">{account.accountName}</div>
                              <div className="text-sm text-gray-500">{account.companyName}</div>
                              {account.subcategory && (
                                <div className="text-xs text-gray-400 mt-1">{account.subcategory}</div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-4 md:gap-6 text-sm">
                              {account.anticipatedAmount && (
                                <div className="text-left md:text-right">
                                  <div className="text-gray-500 text-xs">Payment</div>
                                  <div className="font-medium text-gray-900">
                                    {formatCurrency(account.anticipatedAmount)}
                                  </div>
                                </div>
                              )}
                              
                              {account.balanceRemaining && (
                                <div className="text-left md:text-right">
                                  <div className="text-gray-500 text-xs">Balance</div>
                                  <div className="font-medium text-gray-900">
                                    {formatCurrency(account.balanceRemaining)}
                                  </div>
                                </div>
                              )}
                              
                              {account.nextPaymentDate && (
                                <div className="text-left md:text-right">
                                  <div className="text-gray-500 text-xs">Next Payment</div>
                                  <div className={`font-medium flex items-center gap-1 ${statusColor}`}>
                                    {statusIcon}
                                    <span className="hidden sm:inline">{formatDate(account.nextPaymentDate)}</span>
                                    <span className="sm:hidden">{new Date(account.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                  </div>
                                </div>
                              )}

                              <div className="text-left md:text-right">
                                <div className="text-gray-500 text-xs">Frequency</div>
                                <div className="font-medium text-gray-900 text-xs md:text-sm">
                                  {account.paymentFrequency.replace('_', ' ')}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => {/* TODO: Edit modal */}}
                                className="p-1 hover:bg-gray-200 rounded"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4 text-gray-600" />
                              </button>
                              <button
                                className="p-1 hover:bg-gray-200 rounded"
                                title="View Payments"
                              >
                                <Calendar className="h-4 w-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(account.id, account.accountName)}
                                className="p-1 hover:bg-red-100 rounded"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </button>
                              <button className="p-1 hover:bg-gray-200 rounded hidden md:block">
                                <MoreVertical className="h-4 w-4 text-gray-600" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <CreateAccountModal
              onAccountCreated={handleAccountCreated}
              onClose={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
