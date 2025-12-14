'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle, CreditCard, DollarSign } from 'lucide-react';

interface CreateAccountModalProps {
  onAccountCreated?: (account: any) => void;
  onClose?: () => void;
}

const ACCOUNT_CATEGORIES = [
  'Financial Accounts',
  'Credit & Loans',
  'Vehicles & Transportation',
  'Insurance',
  'Real Estate & Property',
  'Utilities',
  'Subscriptions & Memberships',
  'Healthcare & Medical',
  'Childcare & Education',
  'Professional Services',
  'Other Recurring',
];

const SUBCATEGORIES: Record<string, string[]> = {
  'Financial Accounts': ['Checking', 'Savings', 'Money Market', 'CD', 'Investment', 'Retirement (401k/IRA)', 'HSA', '529', 'Cryptocurrency'],
  'Credit & Loans': ['Credit Card', 'Personal Loan', 'Student Loan', 'HELOC', 'Business Loan', 'Medical Debt'],
  'Real Estate & Property': ['Mortgage', 'Property Tax', 'HOA Fees', 'Rent', 'Storage Unit', 'Parking Space'],
  'Vehicles & Transportation': ['Auto Loan', 'Lease Payment', 'Motorcycle/RV/Boat', 'Truck Payment', 'Registration', 'Toll Pass'],
  'Insurance': ['Life', 'Health', 'Dental', 'Vision', 'Auto', 'Home/Renters', 'Umbrella', 'Disability', 'Long-term Care', 'Pet'],
  'Utilities': ['Electric', 'Gas', 'Water/Sewer', 'Trash/Recycling', 'Internet', 'Mobile Phone', 'Landline', 'Cable/Satellite'],
  'Subscriptions & Memberships': ['Streaming', 'Software', 'News/Magazines', 'Gym', 'Club Membership', 'Amazon Prime/Costco', 'Cloud Storage'],
  'Healthcare & Medical': ['Prescription', 'Medical Equipment', 'Therapy', 'Dental/Orthodontic', 'Payment Plan'],
  'Childcare & Education': ['Daycare', 'Tuition', 'Tutoring', 'Lessons', 'School Lunch'],
  'Professional Services': ['Lawn Care', 'Cleaning', 'Pest Control', 'Security', 'Legal', 'Accounting', 'Financial Advisor'],
  'Other Recurring': ['Charitable Donations', 'Alimony/Child Support', 'Pet Care', 'Domain/Hosting', 'PO Box'],
};

const PAYMENT_FREQUENCIES = [
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Biweekly (Every 2 weeks)' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly (Every 3 months)' },
  { value: 'SEMI_ANNUALLY', label: 'Semi-annually (Twice a year)' },
  { value: 'ANNUALLY', label: 'Annually (Once a year)' },
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'OTHER', label: 'Other (Custom schedule)' },
];

export default function CreateAccountModal({ onAccountCreated, onClose }: CreateAccountModalProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Basic Info
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [accountName, setAccountName] = useState('');
  const [companyName, setCompanyName] = useState('');
  
  // Contact Info
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  
  // Login Credentials
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Payment Info
  const [paymentFrequency, setPaymentFrequency] = useState('MONTHLY');
  const [anticipatedAmount, setAnticipatedAmount] = useState('');
  const [nextPaymentDate, setNextPaymentDate] = useState('');
  
  // Balance Tracking
  const [calculationMode, setCalculationMode] = useState('MANUAL');
  const [balanceRemaining, setBalanceRemaining] = useState('');
  
  // Notes
  const [notes, setNotes] = useState('');

  const handleSubmit = async () => {
    // Validation
    if (!accountName || !companyName || (!category && !customCategory)) {
      setErrorMessage('Please fill in all required fields');
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
        notes: notes || null,
      };

      const response = await fetch('/api/accounts', {
        method: 'POST',
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
        setErrorMessage(error.error || 'Failed to create account');
      }
    } catch (error) {
      console.error('Error creating account:', error);
      setSubmitStatus('error');
      setErrorMessage('An error occurred while creating the account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setCategory('');
    setSubcategory('');
    setCustomCategory('');
    setAccountName('');
    setCompanyName('');
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
    setNotes('');
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const availableSubcategories = category ? SUBCATEGORIES[category] || [] : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Add Account</h2>
          <p className="text-sm text-gray-500 mt-1">Step {step} of 3</p>
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

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Success Message */}
      {submitStatus === 'success' && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
          <p className="text-green-900 font-medium">Account created successfully!</p>
        </div>
      )}

      {/* Error Message */}
      {submitStatus === 'error' && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-900">{errorMessage}</p>
        </div>
      )}

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory('');
                setCustomCategory('');
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a category...</option>
              {ACCOUNT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
              <option value="custom">Other (Custom)</option>
            </select>
          </div>

          {category === 'custom' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Category *
              </label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g., Pool Maintenance"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              Account Name *
            </label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="e.g., Main Checking Account"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., Chase Bank"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone (optional)
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
                Website (optional)
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

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => setStep(2)}
              disabled={!accountName || !companyName || (!category && !customCategory)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Next: Payment Info
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Payment Information */}
      {step === 2 && (
        <div className="space-y-4">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Amount (optional)
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
                Next Payment Date (optional)
              </label>
              <input
                type="date"
                value={nextPaymentDate}
                onChange={(e) => setNextPaymentDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Balance Tracking
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
                  <div className="text-sm text-gray-500">Calculate based on loan terms (for loans/credit)</div>
                </div>
              </label>
            </div>
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

          <div className="flex justify-between gap-3 pt-4">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Next: Login & Notes
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Login Credentials & Notes */}
      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              <strong>🔒 Secure:</strong> Login credentials are encrypted before storage and can only be viewed in the secure vault.
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              placeholder="Add any additional notes about this account..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex justify-between gap-3 pt-4">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
