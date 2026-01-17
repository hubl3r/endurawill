// components/CreateFamilyModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Users } from 'lucide-react';

interface CreateFamilyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  familyMember?: any;
}

export default function CreateFamilyModal({
  isOpen,
  onClose,
  onSuccess,
  familyMember,
}: CreateFamilyModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    relationship: '',
    phone: '',
    email: '',
    address: '',
    isDeceased: false,
    dateOfDeath: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (familyMember) {
      setFormData({
        fullName: familyMember.fullName || '',
        relationship: familyMember.relationship || '',
        phone: familyMember.phone || '',
        email: familyMember.email || '',
        address: familyMember.address || '',
        isDeceased: familyMember.isDeceased || false,
        dateOfDeath: familyMember.dateOfDeath || '',
        notes: familyMember.notes || '',
      });
    } else {
      setFormData({
        fullName: '',
        relationship: '',
        phone: '',
        email: '',
        address: '',
        isDeceased: false,
        dateOfDeath: '',
        notes: '',
      });
    }
  }, [familyMember, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = familyMember ? `/api/family/${familyMember.id}` : '/api/family';
      const method = familyMember ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        onSuccess();
        onClose();
      } else {
        setError(data.error || 'Failed to save family member');
      }
    } catch (error) {
      setError('Failed to save family member');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {familyMember ? 'Edit Family Member' : 'Add Family Member'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Keep track of important family contacts</p>
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

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </label>
                <select
                  value={formData.relationship}
                  onChange={(e) => setFormData(prev => ({ ...prev, relationship: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                >
                  <option value="">Select relationship...</option>
                  <option value="spouse">Spouse</option>
                  <option value="parent">Parent</option>
                  <option value="sibling">Sibling</option>
                  <option value="grandparent">Grandparent</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="aunt_uncle">Aunt/Uncle</option>
                  <option value="niece_nephew">Niece/Nephew</option>
                  <option value="cousin">Cousin</option>
                  <option value="in_law">In-Law</option>
                  <option value="partner">Partner</option>
                  <option value="friend">Close Friend</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Status</h3>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDeceased"
                checked={formData.isDeceased}
                onChange={(e) => setFormData(prev => ({ ...prev, isDeceased: e.target.checked, dateOfDeath: e.target.checked ? prev.dateOfDeath : '' }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
              />
              <label htmlFor="isDeceased" className="text-sm font-medium text-gray-700">
                Deceased
              </label>
            </div>

            {formData.isDeceased && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Death</label>
                <input
                  type="date"
                  value={formData.dateOfDeath}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateOfDeath: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="email@example.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="123 Main St, City, State ZIP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Important information, special considerations..."
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
              {loading ? 'Saving...' : familyMember ? 'Update Family Member' : 'Add Family Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
