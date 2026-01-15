// components/CreateLiabilityModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import {
  LIABILITY_CATEGORIES,
  getLiabilityCategory,
  type LiabilityCategory,
  type SubType,
} from '@/lib/assetCategories';

interface CreateLiabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editLiability?: any;
}

export default function CreateLiabilityModal({
  isOpen,
  onClose,
  onSuccess,
  editLiability,
}: CreateLiabilityModalProps) {
  const [formData, setFormData] = useState({
    category: '',
    type: '',
    description: '',
    creditor: '',
    originalAmount: '',
    currentBalance: '',
    currency: 'USD',
    accountNumber: '',
    loanNumber: '',
    interestRate: '',
    originationDate: '',
    maturityDate: '',
    paymentSchedule: '',
    monthlyPayment: '',
    nextPaymentDate: '',
    isSecured: false,
    collateralDescription: '',
    probateStatus: '',
    isDeductible: false,
    taxCategory: '',
    notes: '',
  });

  const [selectedCategory, setSelectedCategory] = useState<LiabilityCategory | null>(null);
  const [availableSubtypes, setAvailableSubtypes] = useState<SubType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editLiability) {
      setFormData({
        category: editLiability.category || '',
        type: editLiability.type || '',
        description: editLiability.description || '',
        creditor: editLiability.creditor || '',
        originalAmount: editLiability.originalAmount?.toString() || '',
        currentBalance: editLiability.currentBalance?.toString() || '',
        currency: editLiability.currency || 'USD',
        accountNumber: editLiability.accountNumber || '',
        loanNumber: editLiability.loanNumber || '',
        interestRate: editLiability.interestRate?.toString() || '',
        originationDate: editLiability.originationDate ? new Date(editLiability.originationDate).toISOString().split('T')[0] : '',
        maturityDate: editLiability.maturityDate ? new Date(editLiability.maturityDate).toISOString().split('T')[0] : '',
        paymentSchedule: editLiability.paymentSchedule || '',
        monthlyPayment: editLiability.monthlyPayment?.toString() || '',
        nextPaymentDate: editLiability.nextPaymentDate ? new Date(editLiability.nextPaymentDate).toISOString().split('T')[0] : '',
        isSecured: editLiability.isSecured || false,
        collateralDescription: editLiability.collateralDescription || '',
        probateStatus: editLiability.probateStatus || '',
        isDeductible: editLiability.isDeductible || false,
        taxCategory: editLiability.taxCategory || '',
        notes: editLiability.notes || '',
      });

      if (editLiability.category) {
        const cat = getLiabilityCategory(editLiability.category);
        if (cat) {
          setSelectedCategory(cat);
          setAvailableSubtypes(cat.subtypes);
        }
      }
    }
  }, [editLiability]);

  const handleCategoryChange = (categoryId: string) => {
    const category = getLiabilityCategory(categoryId);
    setSelectedCategory(category || null);
    setAvailableSubtypes(category?.subtypes || []);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      type: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.category) {
        setError('Please select a liability category');
        setLoading(false);
        return;
      }
      if (!formData.type) {
        setError('Please select a liability type');
        setLoading(false);
        return;
      }
      if (!formData.description) {
        setError('Please provide a description');
        setLoading(false);
        return;
      }
      if (!formData.currentBalance) {
        setError('Please provide the current balance');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        originalAmount: formData.originalAmount ? parseFloat(formData.originalAmount) : null,
        currentBalance: parseFloat(formData.currentBalance),
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) : null,
        monthlyPayment: formData.monthlyPayment ? parseFloat(formData.monthlyPayment) : null,
        originationDate: formData.originationDate || null,
        maturityDate: formData.maturityDate || null,
        nextPaymentDate: formData.nextPaymentDate || null,
      };

      const url = editLiability ? `/api/liabilities/${editLiability.id}` : '/api/liabilities';
      const method = editLiability ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to save liability');
      }
    } catch (error) {
      console.error('Error saving liability:', error);
      setError('Failed to save liability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {editLiability ? 'Edit Liability' : 'Add New Liability'}
          </h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Category and Type */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Liability Category</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-600">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              >
                <option value="">Select a category...</option>
                {LIABILITY_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {availableSubtypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Liability Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                >
                  <option value="">Select liability type...</option>
                  {availableSubtypes.map((subtype) => (
                    <option key={subtype.id} value={subtype.id}>
                      {subtype.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="e.g., Home Mortgage, Auto Loan, Credit Card"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creditor/Lender
                </label>
                <input
                  type="text"
                  value={formData.creditor}
                  onChange={(e) => setFormData(prev => ({ ...prev, creditor: e.target.value }))}
                  placeholder="e.g., Wells Fargo, Chase"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account/Loan Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  placeholder="Last 4 digits recommended"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amount Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Amount Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Amount
                  <Tooltip content={
                    <div className="space-y-1">
                      <p className="font-semibold">How much did you originally borrow?</p>
                      <p className="text-xs">The total principal amount when the loan was first issued.</p>
                    </div>
                  } />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalAmount: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance <span className="text-red-600">*</span>
                  <Tooltip content={
                    <div className="space-y-1">
                      <p className="font-semibold">What do you currently owe?</p>
                      <p className="text-xs">The remaining balance as of today.</p>
                    </div>
                  } />
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.currentBalance}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentBalance: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.interestRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
                  placeholder="e.g., 4.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Payment
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.monthlyPayment}
                    onChange={(e) => setFormData(prev => ({ ...prev, monthlyPayment: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Important Dates</h3>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Origination Date
                </label>
                <input
                  type="date"
                  value={formData.originationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, originationDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maturity Date
                </label>
                <input
                  type="date"
                  value={formData.maturityDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, maturityDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Next Payment Date
                </label>
                <input
                  type="date"
                  value={formData.nextPaymentDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, nextPaymentDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Schedule
              </label>
              <select
                value={formData.paymentSchedule}
                onChange={(e) => setFormData(prev => ({ ...prev, paymentSchedule: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Select schedule...</option>
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
                <option value="biweekly">Biweekly</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {/* Collateral */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Collateral & Security</h3>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isSecured"
                checked={formData.isSecured}
                onChange={(e) => setFormData(prev => ({ ...prev, isSecured: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
              />
              <label htmlFor="isSecured" className="text-sm font-medium text-gray-700">
                This is secured debt (backed by collateral)
                <Tooltip content={
                  <div className="space-y-1">
                    <p className="font-semibold">Secured vs Unsecured Debt</p>
                    <p className="text-xs"><strong>Secured:</strong> Backed by an asset (home, car). If you default, lender can seize the asset.</p>
                    <p className="text-xs"><strong>Unsecured:</strong> Not backed by collateral (credit cards, personal loans).</p>
                  </div>
                } />
              </label>
            </div>

            {formData.isSecured && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collateral Description
                </label>
                <input
                  type="text"
                  value={formData.collateralDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, collateralDescription: e.target.value }))}
                  placeholder="e.g., 2020 Toyota Camry, Primary Residence"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Tax Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Tax Information</h3>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDeductible"
                checked={formData.isDeductible}
                onChange={(e) => setFormData(prev => ({ ...prev, isDeductible: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
              />
              <label htmlFor="isDeductible" className="text-sm font-medium text-gray-700">
                Interest is tax-deductible
                <Tooltip content={
                  <div className="space-y-1">
                    <p className="font-semibold">Common Tax-Deductible Interest</p>
                    <ul className="text-xs space-y-1">
                      <li>• Mortgage interest (primary/second home)</li>
                      <li>• Student loan interest (up to $2,500)</li>
                      <li>• Business loan interest</li>
                      <li>• Investment interest (certain situations)</li>
                    </ul>
                    <p className="text-xs italic mt-1">Consult your tax advisor</p>
                  </div>
                } />
              </label>
            </div>

            {formData.isDeductible && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax Category
                </label>
                <select
                  value={formData.taxCategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, taxCategory: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Select category...</option>
                  <option value="mortgage_interest">Mortgage Interest</option>
                  <option value="student_loan_interest">Student Loan Interest</option>
                  <option value="business_interest">Business Interest</option>
                  <option value="investment_interest">Investment Interest</option>
                  <option value="other">Other</option>
                </select>
              </div>
            )}
          </div>

          {/* Estate Planning */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estate Planning</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Probate Status
                <Tooltip content={
                  <div className="space-y-2">
                    <p className="font-semibold">How is this debt handled in probate?</p>
                    <p className="text-xs">Most debts must be paid from estate assets before distribution to heirs. Secured debts remain with the collateral.</p>
                  </div>
                } />
              </label>
              <select
                value={formData.probateStatus}
                onChange={(e) => setFormData(prev => ({ ...prev, probateStatus: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="">Select status...</option>
                <option value="PROBATE">Paid from Estate</option>
                <option value="NON_PROBATE">Joint Debt (Continues)</option>
                <option value="EXEMPT">Exempt/Discharged</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional information about this liability..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : editLiability ? 'Update Liability' : 'Add Liability'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
