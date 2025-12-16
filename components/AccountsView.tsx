'use client';

import { useState, useEffect } from 'react';
import { 
  Plus,
  Search,
  X,
  Edit,
  Trash2,
  Calendar,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronRight,
  CreditCard,
} from 'lucide-react';
import CreateAccountModal from '@/components/CreateAccountModal';
import DateRangePicker from '@/components/DateRangePicker';
import { ACCOUNT_CATEGORIES } from '@/lib/accountConstants';

interface Account {
  id: string;
  accountName: string;
  companyName: string;
  category: string;
  subcategory: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  companyWebsite: string | null;
  accountNumber: string | null;
  paymentFrequency: string;
  anticipatedAmount: number | null;
  nextPaymentDate: string | null;
  calculationMode: string | null;
  balanceRemaining: number | null;
  notes: string | null;
  status: string;
  isActive: boolean;
  createdAt: string;
  _count: {
    paymentHistory: number;
  };
}

const SORT_OPTIONS = [
  { value: 'category', label: 'By Category (Default)' },
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
  const [sortBy, setSortBy] = useState('category');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null);
  const [dateRangeStart, setDateRangeStart] = useState('');
  const [dateRangeEnd, setDateRangeEnd] = useState('');

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
    setEditingAccount(null);
    setPreselectedCategory(null);
    await fetchAccounts();
  };

  const handleEdit = (account: Account) => {
    setEditingAccount(account);
    setShowCreateModal(true);
  };

  const handleAccountClick = (account: Account) => {
    if (sortBy !== 'category') {
      setSelectedAccount(account);
    }
  };

  const handleCategoryAdd = (categoryId: string) => {
    setPreselectedCategory(categoryId);
    setEditingAccount(null);
    setShowCreateModal(true);
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

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const getDaysUntilPayment = (nextPaymentDate: string | null): number => {
    if (!nextPaymentDate) return Infinity;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const paymentDate = new Date(nextPaymentDate);
    paymentDate.setHours(0, 0, 0, 0);
    return Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getPaymentStatusColor = (nextPaymentDate: string | null): string => {
    if (!nextPaymentDate) return 'text-gray-400';
    
    const daysUntil = getDaysUntilPayment(nextPaymentDate);
    
    if (daysUntil < 0) return 'text-red-600';
    if (daysUntil <= 7) return 'text-orange-600';
    return 'text-gray-600';
  };

  const getPaymentStatusIcon = (nextPaymentDate: string | null) => {
    if (!nextPaymentDate) return <Clock className="h-4 w-4" />;
    
    const daysUntil = getDaysUntilPayment(nextPaymentDate);
    
    if (daysUntil < 0) return <AlertCircle className="h-4 w-4" />;
    if (daysUntil <= 7) return <Clock className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
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

  const formatFrequency = (frequency: string): string => {
    return frequency.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const getCategoryIcon = (category: string) => {
    const cat = ACCOUNT_CATEGORIES.find(c => c.id === category);
    return cat?.icon || CreditCard;
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
    
    const matchesDateRange = (() => {
      if (!dateRangeStart && !dateRangeEnd) return true;
      if (!account.nextPaymentDate) return false;
      
      const paymentDate = new Date(account.nextPaymentDate);
      paymentDate.setHours(0, 0, 0, 0);
      
      if (dateRangeStart && dateRangeEnd) {
        const start = new Date(dateRangeStart);
        start.setHours(0, 0, 0, 0);
        const end = new Date(dateRangeEnd);
        end.setHours(23, 59, 59, 999);
        return paymentDate >= start && paymentDate <= end;
      } else if (dateRangeStart) {
        const start = new Date(dateRangeStart);
        start.setHours(0, 0, 0, 0);
        return paymentDate >= start;
      } else if (dateRangeEnd) {
        const end = new Date(dateRangeEnd);
        end.setHours(23, 59, 59, 999);
        return paymentDate <= end;
      }
      return true;
    })();
    
    return matchesSearch && matchesCategory && matchesDateRange;
  });

  const sortAccounts = (accounts: Account[]) => {
    const sorted = [...accounts];
    
    switch (sortBy) {
      case 'category':
        return sorted;
      
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

  // Helper: Convert payment frequency to monthly amount
  const convertToMonthly = (amount: number, frequency: string): number => {
    switch (frequency) {
      case 'WEEKLY':
        return amount * 4.33; // 52 weeks / 12 months
      case 'BIWEEKLY':
        return amount * 2.0; // Simplified: 2 payments per month
      case 'MONTHLY':
        return amount * 1;
      case 'QUARTERLY':
        return amount / 3;
      case 'SEMI_ANNUALLY':
        return amount / 6;
      case 'ANNUALLY':
        return amount / 12;
      case 'NONE':
      case 'ONE_TIME':
      case 'OTHER':
      default:
        return 0; // Don't include in monthly calculations
    }
  };

  // Helper: Calculate how many payments are past due for an account
  const calculatePastDueAmount = (account: Account): number => {
    if (!account.nextPaymentDate || !account.anticipatedAmount || account.paymentFrequency === 'NONE') {
      return 0;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextPayment = new Date(account.nextPaymentDate);
    nextPayment.setHours(0, 0, 0, 0);

    if (nextPayment >= today) {
      return 0; // Not past due
    }

    // Calculate how many payment periods have passed
    const daysPastDue = Math.floor((today.getTime() - nextPayment.getTime()) / (1000 * 60 * 60 * 24));
    let paymentsPastDue = 0;

    switch (account.paymentFrequency) {
      case 'WEEKLY':
        paymentsPastDue = Math.floor(daysPastDue / 7) + 1;
        break;
      case 'BIWEEKLY':
        paymentsPastDue = Math.floor(daysPastDue / 14) + 1;
        break;
      case 'MONTHLY':
        // Approximate: 30 days per month
        paymentsPastDue = Math.floor(daysPastDue / 30) + 1;
        break;
      case 'QUARTERLY':
        paymentsPastDue = Math.floor(daysPastDue / 90) + 1;
        break;
      case 'SEMI_ANNUALLY':
        paymentsPastDue = Math.floor(daysPastDue / 182) + 1;
        break;
      case 'ANNUALLY':
        paymentsPastDue = Math.floor(daysPastDue / 365) + 1;
        break;
      default:
        paymentsPastDue = 1;
    }

    return Number(account.anticipatedAmount) * paymentsPastDue;
  };

  // Calculate total monthly payments (all frequencies converted to monthly, active accounts only)
  const totalMonthlyPayments = sortedAccounts
    .filter(a => a.isActive && a.anticipatedAmount && a.status === 'ACTIVE')
    .reduce((sum, a) => {
      const monthlyAmount = convertToMonthly(Number(a.anticipatedAmount || 0), a.paymentFrequency);
      return sum + monthlyAmount;
    }, 0);

  // Total Past Due - accumulated unpaid payments
  const totalPastDue = sortedAccounts
    .reduce((sum, a) => sum + calculatePastDueAmount(a), 0);

  // Total Liabilities - loan balances (will be populated in Phase 3)
  // Currently showing balanceRemaining for temporary compatibility
  const totalLiabilities = sortedAccounts
    .filter(a => a.balanceRemaining)
    .reduce((sum, a) => sum + Number(a.balanceRemaining || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading accounts...</div>
      </div>
    );
  }

  const showFlatList = sortBy !== 'category';

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 px-4 md:px-6 py-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
            <p className="text-sm text-gray-500 mt-1">Track your financial accounts and payment schedules</p>
          </div>
          <button
            onClick={() => {
              setEditingAccount(null);
              setPreselectedCategory(null);
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Account</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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

        <div className="mt-3">
          <DateRangePicker
            startDate={dateRangeStart}
            endDate={dateRangeEnd}
            onStartDateChange={setDateRangeStart}
            onEndDateChange={setDateRangeEnd}
            onClear={() => {
              setDateRangeStart('');
              setDateRangeEnd('');
            }}
          />
        </div>
      </div>

      <div className="border-b border-gray-200 px-4 md:px-6 py-4 bg-gray-50">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Accounts</div>
            <div className="text-xl md:text-2xl font-bold text-gray-900">{sortedAccounts.length}</div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Active</div>
            <div className="text-xl md:text-2xl font-bold text-green-600">
              {sortedAccounts.filter(a => a.status === 'ACTIVE').length}
            </div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Monthly Payments</div>
            <div className="text-xl md:text-2xl font-bold text-blue-600">
              {formatCurrency(totalMonthlyPayments)}
            </div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Past Due</div>
            <div className="text-xl md:text-2xl font-bold text-red-600">
              {formatCurrency(totalPastDue)}
            </div>
          </div>
          <div className="bg-white p-3 md:p-4 rounded-lg border border-gray-200">
            <div className="text-xs md:text-sm text-gray-600 mb-1">Total Liabilities</div>
            <div className="text-xl md:text-2xl font-bold text-purple-600">
              {formatCurrency(totalLiabilities)}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 md:p-6 bg-white">
        {sortedAccounts.length === 0 ? (
          <div className="text-center py-16">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || selectedCategory || sortBy !== 'category' ? 'No accounts found' : 'No accounts yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || selectedCategory || sortBy !== 'category'
                ? 'Try adjusting your filters' 
                : 'Start by adding your first account'}
            </p>
            {!searchQuery && !selectedCategory && sortBy === 'category' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mx-auto"
              >
                <Plus className="h-4 w-4" />
                Add Account
              </button>
            )}
          </div>
        ) : showFlatList ? (
          <div className="space-y-2">
            {sortedAccounts.map(account => {
              const statusColor = getPaymentStatusColor(account.nextPaymentDate);
              const statusIcon = getPaymentStatusIcon(account.nextPaymentDate);
              const isIncomplete = !account.anticipatedAmount || account.paymentFrequency === 'NONE';
              const isPastDue = calculatePastDueAmount(account) > 0;
              
              return (
                <div
                  key={account.id}
                  onClick={() => handleAccountClick(account)}
                  className="relative flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer group"
                >
                  {/* Incomplete indicator */}
                  {isIncomplete && (
                    <div 
                      className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-orange-400 border-l-[12px] border-l-transparent rounded-tr-lg"
                      title="Missing payment frequency or amount"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {account.accountName}
                      {isPastDue && (
                        <span 
                          className="inline-block w-2 h-2 bg-red-600 rounded-full"
                          title="Payment past due"
                        />
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{account.companyName}</div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    {account.anticipatedAmount && (
                      <div className="text-right">
                        <div className="font-medium text-gray-900">
                          {formatCurrency(account.anticipatedAmount)}
                        </div>
                      </div>
                    )}
                    
                    {account.nextPaymentDate && (
                      <div className="text-right">
                        <div className={`font-medium flex items-center gap-1 ${statusColor}`}>
                          {statusIcon}
                          <span className="hidden sm:inline">{formatDate(account.nextPaymentDate)}</span>
                          <span className="sm:hidden">{new Date(account.nextPaymentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(account);
                      }}
                      className="p-1 hover:bg-gray-200 rounded"
                      title="Edit"
                    >
                      <Edit className="h-4 w-4 text-gray-600" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(account.id, account.accountName);
                      }}
                      className="p-1 hover:bg-red-100 rounded"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-4">
            {accountsByCategory
              .filter(cat => cat.count > 0)
              .map(category => {
                const Icon = category.icon;
                const isExpanded = expandedCategories.has(category.id);
                
                return (
                  <div key={category.id}>
                    <div className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="flex items-center gap-2 flex-1"
                      >
                        <Icon className={`h-5 w-5 text-${category.color}-600`} />
                        <h2 className="text-base md:text-lg font-semibold text-gray-900">{category.id}</h2>
                        <span className="text-sm text-gray-500">({category.count})</span>
                        {isExpanded ? (
                          <ChevronDown className="h-5 w-5 text-gray-400 ml-auto" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400 ml-auto" />
                        )}
                      </button>
                      <button
                        onClick={() => handleCategoryAdd(category.id)}
                        className="ml-2 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title={`Add ${category.id} account`}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="mt-2 space-y-2 ml-4">
                        {category.accounts.map(account => {
                          const Icon = getCategoryIcon(account.category);
                          const statusColor = getPaymentStatusColor(account.nextPaymentDate);
                          const statusIcon = getPaymentStatusIcon(account.nextPaymentDate);
                          const isIncomplete = !account.anticipatedAmount || account.paymentFrequency === 'NONE';
                          const isPastDue = calculatePastDueAmount(account) > 0;
                          
                          return (
                            <div
                              key={account.id}
                              className="relative flex flex-col md:flex-row md:items-center gap-3 md:gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 group"
                            >
                              {/* Incomplete indicator - small orange corner */}
                              {isIncomplete && (
                                <div 
                                  className="absolute top-0 right-0 w-0 h-0 border-t-[12px] border-t-orange-400 border-l-[12px] border-l-transparent rounded-tr-lg"
                                  title="Missing payment frequency or amount"
                                />
                              )}
                              
                              <Icon className={`h-8 w-8 text-${getCategoryColor(account.category)}-500 flex-shrink-0 hidden md:block`} />
                              
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 flex items-center gap-2">
                                  {account.accountName}
                                  {isPastDue && (
                                    <span 
                                      className="inline-block w-2 h-2 bg-red-600 rounded-full"
                                      title="Payment past due"
                                    />
                                  )}
                                </div>
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
                                    {formatFrequency(account.paymentFrequency)}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => handleEdit(account)}
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
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="max-w-2xl w-full">
            <CreateAccountModal
              account={editingAccount}
              preselectedCategory={preselectedCategory}
              onAccountCreated={handleAccountCreated}
              onClose={() => {
                setShowCreateModal(false);
                setEditingAccount(null);
                setPreselectedCategory(null);
              }}
            />
          </div>
        </div>
      )}

      {selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">{selectedAccount.accountName}</h2>
              <button
                onClick={() => setSelectedAccount(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-500">Company</div>
                <div className="font-medium text-gray-900">{selectedAccount.companyName}</div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Category</div>
                  <div className="font-medium text-gray-900">{selectedAccount.category}</div>
                </div>
                {selectedAccount.subcategory && (
                  <div>
                    <div className="text-sm text-gray-500">Subcategory</div>
                    <div className="font-medium text-gray-900">{selectedAccount.subcategory}</div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {selectedAccount.anticipatedAmount && (
                  <div>
                    <div className="text-sm text-gray-500">Payment Amount</div>
                    <div className="font-medium text-gray-900">{formatCurrency(selectedAccount.anticipatedAmount)}</div>
                  </div>
                )}
                <div>
                  <div className="text-sm text-gray-500">Frequency</div>
                  <div className="font-medium text-gray-900">{formatFrequency(selectedAccount.paymentFrequency)}</div>
                </div>
              </div>

              {selectedAccount.nextPaymentDate && (
                <div>
                  <div className="text-sm text-gray-500">Next Payment Date</div>
                  <div className="font-medium text-gray-900">{formatDate(selectedAccount.nextPaymentDate)}</div>
                </div>
              )}

              {selectedAccount.balanceRemaining && (
                <div>
                  <div className="text-sm text-gray-500">Balance Remaining</div>
                  <div className="font-medium text-gray-900">{formatCurrency(selectedAccount.balanceRemaining)}</div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setEditingAccount(selectedAccount);
                    setSelectedAccount(null);
                    setShowCreateModal(true);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Edit Account
                </button>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
