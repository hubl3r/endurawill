// components/CreateAllocationModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Percent, DollarSign } from 'lucide-react';
import Tooltip from '@/components/Tooltip';

interface Beneficiary {
  id: string;
  fullName: string;
  relationship: string;
  isPrimary: boolean;
  isCharity: boolean;
}

interface CreateAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  assetId: string;
  assetDescription: string;
  remainingPercentage: number;
}

const TAX_ALLOCATION_OPTIONS = [
  { value: 'proportional', label: 'Proportional' },
  { value: 'from_residue', label: 'From Residuary Estate' },
  { value: 'beneficiary_pays', label: 'Beneficiary Pays' },
];

export default function CreateAllocationModal({
  isOpen,
  onClose,
  onSuccess,
  assetId,
  assetDescription,
  remainingPercentage,
}: CreateAllocationModalProps) {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loadingBeneficiaries, setLoadingBeneficiaries] = useState(false);
  const [formData, setFormData] = useState({
    beneficiaryId: '',
    allocationType: 'percentage',
    percentage: '',
    specificAmount: '',
    taxAllocation: 'proportional',
    taxNotes: '',
    conditions: '',
    isPrimary: true,
    isContingent: false,
    priority: '1',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadBeneficiaries();
    }
  }, [isOpen]);

  const loadBeneficiaries = async () => {
    try {
      setLoadingBeneficiaries(true);
      const response = await fetch('/api/beneficiaries');
      const data = await response.json();
      if (data.success) {
        setBeneficiaries(data.beneficiaries);
      }
    } catch (error) {
      console.error('Error loading beneficiaries:', error);
    } finally {
      setLoadingBeneficiaries(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.beneficiaryId) {
        setError('Please select a beneficiary');
        setLoading(false);
        return;
      }

      if (formData.allocationType === 'percentage') {
        const percentage = parseFloat(formData.percentage);
        if (!percentage || percentage <= 0 || percentage > 100) {
          setError('Percentage must be between 0 and 100');
          setLoading(false);
          return;
        }
        if (percentage > remainingPercentage) {
          setError(`Only ${remainingPercentage}% remaining to allocate`);
          setLoading(false);
          return;
        }
      } else if (formData.allocationType === 'specific_amount') {
        const amount = parseFloat(formData.specificAmount);
        if (!amount || amount <= 0) {
          setError('Amount must be greater than 0');
          setLoading(false);
          return;
        }
      }

      const payload: any = {
        beneficiaryId: formData.beneficiaryId,
        allocationType: formData.allocationType,
        taxAllocation: formData.taxAllocation,
        taxNotes: formData.taxNotes || null,
        conditions: formData.conditions || null,
        isPrimary: formData.isPrimary,
        isContingent: formData.isContingent,
        priority: parseInt(formData.priority),
      };

      if (formData.allocationType === 'percentage') {
        payload.percentage = parseFloat(formData.percentage);
      } else {
        payload.specificAmount = parseFloat(formData.specificAmount);
      }

      const response = await fetch(`/api/assets/${assetId}/allocations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          beneficiaryId: '',
          allocationType: 'percentage',
          percentage: '',
          specificAmount: '',
          taxAllocation: 'proportional',
          taxNotes: '',
          conditions: '',
          isPrimary: true,
          isContingent: false,
          priority: '1',
        });
      } else {
        setError(data.error || 'Failed to create allocation');
      }
    } catch (error) {
      setError('Failed to create allocation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const selectedBeneficiary = beneficiaries.find(b => b.id === formData.beneficiaryId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Allocate Asset to Beneficiary</h2>
            <p className="text-sm text-gray-600 mt-1">{assetDescription}</p>
          </div>
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

          {remainingPercentage < 100 && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              <p className="text-sm">
                <strong>{remainingPercentage.toFixed(1)}%</strong> remaining to allocate
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Beneficiary <span className="text-red-600">*</span>
                <Tooltip
                  position="right"
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">Who will inherit this asset?</p>
                      <p className="text-xs">Select from your list of beneficiaries. If the person isn't listed, add them in the Beneficiaries section first.</p>
                    </div>
                  }
                />
              </label>
              {loadingBeneficiaries ? (
                <div className="text-sm text-gray-500">Loading beneficiaries...</div>
              ) : beneficiaries.length === 0 ? (
                <div className="text-sm text-gray-500">
                  No beneficiaries found. Please add beneficiaries first.
                </div>
              ) : (
                <select
                  value={formData.beneficiaryId}
                  onChange={(e) => setFormData(prev => ({ ...prev, beneficiaryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                >
                  <option value="">Select beneficiary...</option>
                  {beneficiaries.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.relationship.replace('_', ' ')})
                      {b.isCharity && ' - Charity'}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Allocation Type <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, allocationType: 'percentage' }))}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                    formData.allocationType === 'percentage'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Percent className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Percentage</p>
                    <p className="text-xs text-gray-500">Split by %</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, allocationType: 'specific_amount' }))}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-colors ${
                    formData.allocationType === 'specific_amount'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium text-gray-900">Fixed Amount</p>
                    <p className="text-xs text-gray-500">Specific $</p>
                  </div>
                </button>
              </div>
            </div>

            {formData.allocationType === 'percentage' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Percentage (%) <span className="text-red-600">*</span>
                  <Tooltip
                    position="right"
                    content={
                      <div className="space-y-1">
                        <p className="font-semibold">Percentage of Asset</p>
                        <p className="text-xs">What portion of this asset goes to this beneficiary? Total must not exceed 100%.</p>
                      </div>
                    }
                  />
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max={remainingPercentage}
                    value={formData.percentage}
                    onChange={(e) => setFormData(prev => ({ ...prev, percentage: e.target.value }))}
                    className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., 50"
                    required
                  />
                  <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Max: {remainingPercentage.toFixed(1)}%</p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specific Amount ($) <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.specificAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, specificAmount: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    placeholder="e.g., 50000"
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPrimary"
                  checked={formData.isPrimary}
                  onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked, isContingent: !e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
                  Primary beneficiary
                </label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isContingent"
                  checked={formData.isContingent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isContingent: e.target.checked, isPrimary: !e.target.checked }))}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
                />
                <label htmlFor="isContingent" className="text-sm font-medium text-gray-700">
                  Contingent
                  <Tooltip
                    position="right"
                    content={
                      <div className="space-y-1">
                        <p className="font-semibold">Contingent Beneficiary</p>
                        <p className="text-xs">Only inherits if the primary beneficiary cannot (deceased, disclaims, etc.)</p>
                      </div>
                    }
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Tax Planning (Optional)</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Allocation
                <Tooltip
                  position="right"
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">Who pays estate taxes?</p>
                      <p className="text-xs"><strong>Proportional:</strong> Each beneficiary pays their share</p>
                      <p className="text-xs"><strong>From Residuary:</strong> Residuary estate pays all taxes</p>
                      <p className="text-xs"><strong>Beneficiary Pays:</strong> This beneficiary pays all taxes on this asset</p>
                    </div>
                  }
                />
              </label>
              <select
                value={formData.taxAllocation}
                onChange={(e) => setFormData(prev => ({ ...prev, taxAllocation: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                {TAX_ALLOCATION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tax Notes</label>
              <textarea
                value={formData.taxNotes}
                onChange={(e) => setFormData(prev => ({ ...prev, taxNotes: e.target.value }))}
                rows={2}
                placeholder="Any special tax considerations..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions
              </label>
              <input
                type="text"
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder="e.g., Upon reaching age 25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || beneficiaries.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Allocation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
