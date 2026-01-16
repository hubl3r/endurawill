// components/CreateBeneficiaryModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import Tooltip from '@/components/Tooltip';

interface CreateBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editBeneficiary?: any;
}

const RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'niece_nephew', label: 'Niece/Nephew' },
  { value: 'friend', label: 'Friend' },
  { value: 'partner', label: 'Domestic Partner' },
  { value: 'charity', label: 'Charity/Organization' },
  { value: 'trust', label: 'Trust' },
  { value: 'other', label: 'Other' },
];

export default function CreateBeneficiaryModal({ isOpen, onClose, onSuccess, editBeneficiary }: CreateBeneficiaryModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    isPrimary: true,
    isCharity: false,
    charityTaxId: '',
    conditions: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editBeneficiary) {
      setFormData({
        fullName: editBeneficiary.fullName || '',
        relationship: editBeneficiary.relationship || '',
        email: editBeneficiary.email || '',
        phone: editBeneficiary.phone || '',
        street: editBeneficiary.address?.street || '',
        city: editBeneficiary.address?.city || '',
        state: editBeneficiary.address?.state || '',
        zip: editBeneficiary.address?.zip || '',
        isPrimary: editBeneficiary.isPrimary !== false,
        isCharity: editBeneficiary.isCharity || false,
        charityTaxId: editBeneficiary.charityTaxId || '',
        conditions: editBeneficiary.conditions || '',
        notes: editBeneficiary.notes || '',
      });
    }
  }, [editBeneficiary]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.fullName || !formData.relationship) {
        setError('Name and relationship are required');
        setLoading(false);
        return;
      }

      const address = (formData.street || formData.city || formData.state || formData.zip)
        ? { street: formData.street, city: formData.city, state: formData.state, zip: formData.zip }
        : null;

      const payload = {
        fullName: formData.fullName,
        relationship: formData.relationship,
        email: formData.email || null,
        phone: formData.phone || null,
        address,
        isPrimary: formData.isPrimary,
        isCharity: formData.isCharity,
        charityTaxId: formData.charityTaxId || null,
        conditions: formData.conditions || null,
        notes: formData.notes || null,
      };

      const url = editBeneficiary ? `/api/beneficiaries/${editBeneficiary.id}` : '/api/beneficiaries';
      const method = editBeneficiary ? 'PUT' : 'POST';

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
        setError(data.error || 'Failed to save beneficiary');
      }
    } catch (error) {
      setError('Failed to save beneficiary');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editBeneficiary ? 'Edit Beneficiary' : 'Add New Beneficiary'}
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship <span className="text-red-600">*</span>
                <Tooltip
                  position="right"
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">How is this person related to you?</p>
                      <p className="text-xs">This helps organize your beneficiaries and may affect estate tax rules.</p>
                    </div>
                  }
                />
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, relationship: e.target.value, isCharity: e.target.value === 'charity' }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              >
                <option value="">Select relationship...</option>
                {RELATIONSHIPS.map(rel => (
                  <option key={rel.value} value={rel.value}>{rel.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrimary"
                checked={formData.isPrimary}
                onChange={(e) => setFormData(prev => ({ ...prev, isPrimary: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
              />
              <label htmlFor="isPrimary" className="text-sm font-medium text-gray-700">
                Primary beneficiary
                <Tooltip
                  position="right"
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">Primary vs Contingent</p>
                      <p className="text-xs"><strong>Primary:</strong> First in line to inherit</p>
                      <p className="text-xs"><strong>Contingent:</strong> Inherits only if primary beneficiaries cannot</p>
                    </div>
                  }
                />
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input
                type="text"
                value={formData.street}
                onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  maxLength={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {formData.isCharity && (
            <div className="space-y-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Charity Information</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tax ID (EIN)
                  <Tooltip
                    position="right"
                    content={
                      <div className="space-y-1">
                        <p className="font-semibold">Employer Identification Number</p>
                        <p className="text-xs">Required for charitable deductions. Find it on the charity's website or IRS database.</p>
                      </div>
                    }
                  />
                </label>
                <input
                  type="text"
                  value={formData.charityTaxId}
                  onChange={(e) => setFormData(prev => ({ ...prev, charityTaxId: e.target.value }))}
                  placeholder="XX-XXXXXXX"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Conditions
                <Tooltip
                  position="right"
                  content={
                    <div className="space-y-1">
                      <p className="font-semibold">When can they inherit?</p>
                      <p className="text-xs">Examples: "Upon reaching age 25", "After completing college", "If married"</p>
                      <p className="text-xs italic mt-1">Consult an attorney for enforceable conditions</p>
                    </div>
                  }
                />
              </label>
              <input
                type="text"
                value={formData.conditions}
                onChange={(e) => setFormData(prev => ({ ...prev, conditions: e.target.value }))}
                placeholder="e.g., Upon reaching age 25"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
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
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : editBeneficiary ? 'Update Beneficiary' : 'Add Beneficiary'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
