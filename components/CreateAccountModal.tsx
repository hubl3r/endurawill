// /components/CreateAccountModal.tsx
'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle, DollarSign } from 'lucide-react';
import { ACCOUNT_CATEGORIES, ACCOUNT_STATUSES, SUBCATEGORIES, PAYMENT_FREQUENCIES } from '@/lib/accountConstants';

interface CreateAccountModalProps {
  account?: {
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
  } | null;
  preselectedCategory?: string | null;
  onAccountCreated?: (account: any) => void;
  onClose?: () => void;
}

export default function CreateAccountModal({ 
  account, 
  preselectedCategory,
  onAccountCreated, 
  onClose 
}: CreateAccountModalProps) {
  const isEditing = !!account;
  
  const [activeTab, setActiveTab] = useState(0); // 0=Basic, 1=Company, 2=Login, 3=Category-Specific
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Tab 1: Basic Info (required fields)
  const [category, setCategory] = useState(account?.category || preselectedCategory || '');
  const [subcategory, setSubcategory] = useState(account?.subcategory || '');
  const [customCategory, setCustomCategory] = useState('');
  const [accountName, setAccountName] = useState(account?.accountName || '');
  const [companyName, setCompanyName] = useState(account?.companyName || '');
  const [status, setStatus] = useState(account?.status || 'ACTIVE');
  const [paymentFrequency, setPaymentFrequency] = useState(account?.paymentFrequency || 'MONTHLY');
  const [anticipatedAmount, setAnticipatedAmount] = useState(account?.anticipatedAmount?.toString() || '');
  const [nextPaymentDate, setNextPaymentDate] = useState(
    account?.nextPaymentDate ? new Date(account.nextPaymentDate).toISOString().split('T')[0] : ''
  );
  const [calculationMode, setCalculationMode] = useState(account?.calculationMode || 'MANUAL');
  
  // Tab 2: Company Details
  const [companyAddress, setCompanyAddress] = useState(account?.companyAddress || '');
  const [companyPhone, setCompanyPhone] = useState(account?.companyPhone || '');
  const [accountNumber, setAccountNumber] = useState(account?.accountNumber || '');
  const [companyWebsite, setCompanyWebsite] = useState(account?.companyWebsite || '');
  
  // Tab 3: Login & Notes
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [notes, setNotes] = useState(account?.notes || '');
  
  // Tab 4: Category-Specific Details (placeholder for now)
  const [balanceRemaining, setBalanceRemaining] = useState(account?.balanceRemaining?.toString() || '');

  // Check if required fields are filled
  const isFormValid = () => {
    return !!(accountName && companyName && (category || customCategory));
  };

  const handleSubmit = async () => {
    if (!isFormValid()) {
      setErrorMessage('Please fill in all required fields (Account Title, Company Name, Category)');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const accountData = {
        category: customCategory || category,
        subcategory: subcategory || null,
        accountName,
        companyName,
        accountNumber: accountNumber || null,
        companyAddress: companyAddress || null,
        companyPhone: companyPhone || null,
        companyWebsite: companyWebsite || null,
        loginUsername: loginUsername || null,
        loginPassword: loginPassword || null,
        paymentFrequency,
        anticipatedAmount: anticipatedAmount ? parseFloat(anticipatedAmount) : null,
        nextPaymentDate: nextPaymentDate || null,
        calculationMode,
        balanceRemaining: balanceRemaining ? parseFloat(balanceRemaining) : null,
        status,
        notes: notes || null,
      };

      const url = isEditing ? `/api/accounts/${account.id}` : '/api/accounts';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        const data = await response.json();
        setSubmitStatus('success');
        
        setTimeout(() => {
          onAccountCreated?.(data.account);
          handleReset();
        }, 1500);
      } else {
        const error = await response.json();
        setSubmitStatus('error');
        setErrorMessage(error.error || `Failed to ${isEditing ? 'update' : 'create'} account`);
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} account:`, error);
      setSubmitStatus('error');
      setErrorMessage(`An error occurred while ${isEditing ? 'updating' : 'creating'} the account`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveTab(0);
    setCategory('');
    setSubcategory('');
    setCustomCategory('');
    setAccountName('');
    setCompanyName('');
    setAccountNumber('');
    setCompanyAddress('');
    setCompanyPhone('');
    setCompanyWebsite('');
    setLoginUsername('');
    setLoginPassword('');
    setPaymentFrequency('MONTHLY');
    setAnticipatedAmount('');
    setNextPaymentDate('');
    setCalculationMode('MANUAL');
    setBalanceRemaining('');
    setStatus('ACTIVE');
    setNotes('');
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const availableSubcategories = category ? SUBCATEGORIES[category] || [] : [];
  const categoryList = ACCOUNT_CATEGORIES.map(cat => cat.id);

  const tabs = ['Basic Info', 'Company Details', 'Login & Notes', 'Category-Specific'];

  // Helper to get border color based on required field validation
  const getRequiredFieldClass = (value: string) => {
    return value ? 
      'border-gray-300 focus:border-blue-500' : 
      'border-red-300 focus:border-red-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Account' : 'Add Account'}</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the account details</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 px-6">
        <div className="flex gap-1 -mb-px overflow-x-auto">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === index
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Status Messages */}
      <div className="px-6 pt-4">
        {submitStatus === 'success' && (
          <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            <p className="text-green-900 font-medium">Account {isEditing ? 'updated' : 'created'} successfully!</p>
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-red-900">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-6 pb-4">
        {/* TAB 1: BASIC INFO */}
        {activeTab === 0 && (
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setSubcategory('');
                  setCustomCategory('');
                }}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getRequiredFieldClass(category || customCategory)}`}
              >
                <option value="">Select a category...</option>
                {categoryList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="custom">Other (Custom)</option>
              </select>
            </div>

            {category === 'custom' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Category <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  placeholder="e.g., Pool Maintenance"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getRequiredFieldClass(customCategory)}`}
                />
              </div>
            )}

            {category && category !== 'custom' && availableSubcategories.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory (optional)
                </label>
                <select
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">None</option>
                  {availableSubcategories.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="e.g., Main Checking Account"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getRequiredFieldClass(accountName)}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Chase Bank"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${getRequiredFieldClass(companyName)}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {ACCOUNT_STATUSES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Frequency
              </label>
              <select
                value={paymentFrequency}
                onChange={(e) => setPaymentFrequency(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {PAYMENT_FREQUENCIES.map(freq => (
                  <option key={freq.value} value={freq.value}>{freq.label}</option>
                ))}
              </select>
            </div>

            {paymentFrequency !== 'NONE' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Anticipated Amount (optional)
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      value={anticipatedAmount}
                      onChange={(e) => setAnticipatedAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Next Payment Due (optional)
                  </label>
                  <input
                    type="date"
                    value={nextPaymentDate}
                    onChange={(e) => setNextPaymentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculation Mode
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="calculationMode"
                    value="MANUAL"
                    checked={calculationMode === 'MANUAL'}
                    onChange={(e) => setCalculationMode(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Manual</div>
                    <div className="text-sm text-gray-500">I'll update the balance manually</div>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="calculationMode"
                    value="AUTOMATIC"
                    checked={calculationMode === 'AUTOMATIC'}
                    onChange={(e) => setCalculationMode(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Automatic</div>
                    <div className="text-sm text-gray-500">Calculate based on loan terms</div>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY DETAILS */}
        {activeTab === 1 && (
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Address (optional)
              </label>
              <input
                type="text"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                placeholder="e.g., 123 Main St, New York, NY 10001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Phone (optional)
              </label>
              <input
                type="tel"
                value={companyPhone}
                onChange={(e) => setCompanyPhone(e.target.value)}
                placeholder="(555) 123-4567"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Number (optional)
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="e.g., ****1234"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Website (optional)
              </label>
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* TAB 3: LOGIN & NOTES */}
        {activeTab === 2 && (
          <div className="space-y-4 py-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Login credentials are encrypted and stored securely.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Username (optional)
              </label>
              <input
                type="text"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="username or email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="off"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Login Password (optional)
              </label>
              <input
                type="password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                autoComplete="new-password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any additional notes or reminders about this account..."
                rows={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          </div>
        )}

        {/* TAB 4: CATEGORY-SPECIFIC DETAILS */}
        {activeTab === 3 && (
          <div className="space-y-4 py-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                Category-specific fields (loans, vehicles, insurance, etc.) will be added here in Phase 3.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance (optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  value={balanceRemaining}
                  onChange={(e) => setBalanceRemaining(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer with action buttons */}
      <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isFormValid() || isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : isEditing ? 'Update Account' : 'Save & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
