// components/CreateChildModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle, Baby } from 'lucide-react';
import Tooltip from '@/components/Tooltip';

interface CreateChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  child?: any; // For editing
}

export default function CreateChildModal({
  isOpen,
  onClose,
  onSuccess,
  child,
}: CreateChildModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    ssn: '',
    relationship: 'child',
    isMinor: true,
    guardianPreference: '',
    schoolName: '',
    grade: '',
    schoolPhone: '',
    primaryPhysician: '',
    physicianPhone: '',
    allergies: '',
    medications: '',
    isDeceased: false,
    dateOfDeath: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when child prop changes (for editing)
  useEffect(() => {
    if (child) {
      setFormData({
        fullName: child.fullName || '',
        dob: child.dob || '',
        ssn: child.ssn || '',
        relationship: child.relationship || 'child',
        isMinor: child.isMinor ?? true,
        guardianPreference: child.guardianPreference || '',
        schoolName: child.schoolName || '',
        grade: child.grade || '',
        schoolPhone: child.schoolPhone || '',
        primaryPhysician: child.primaryPhysician || '',
        physicianPhone: child.physicianPhone || '',
        allergies: child.allergies || '',
        medications: child.medications || '',
        isDeceased: child.isDeceased || false,
        dateOfDeath: child.dateOfDeath || '',
        notes: child.notes || '',
      });
    } else {
      // Reset to defaults when adding new
      setFormData({
        fullName: '',
        dob: '',
        ssn: '',
        relationship: 'child',
        isMinor: true,
        guardianPreference: '',
        schoolName: '',
        grade: '',
        schoolPhone: '',
        primaryPhysician: '',
        physicianPhone: '',
        allergies: '',
        medications: '',
        isDeceased: false,
        dateOfDeath: '',
        notes: '',
      });
    }
  }, [child, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const url = child ? `/api/children/${child.id}` : '/api/children';
      const method = child ? 'PUT' : 'POST';

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
        setError(data.error || 'Failed to save child information');
      }
    } catch (error) {
      setError('Failed to save child information');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {child ? 'Edit Child' : 'Add Child'}
            </h2>
            <p className="text-sm text-gray-600 mt-1">Track important information about your child or dependent</p>
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

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Baby className="h-5 w-5" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Legal Name <span className="text-red-600">*</span>
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
                  Date of Birth <span className="text-red-600">*</span>
                </label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData(prev => ({ ...prev, dob: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Social Security Number
                  <Tooltip
                    position="right"
                    content={
                      <div className="space-y-1">
                        <p className="font-semibold">Secure Information</p>
                        <p className="text-xs">This information is encrypted and securely stored for estate planning purposes.</p>
                      </div>
                    }
                  />
                </label>
                <input
                  type="text"
                  value={formData.ssn}
                  onChange={(e) => setFormData(prev => ({ ...prev, ssn: e.target.value }))}
                  placeholder="###-##-####"
                  maxLength={11}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
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
                  <option value="child">Biological Child</option>
                  <option value="stepchild">Stepchild</option>
                  <option value="adopted">Adopted Child</option>
                  <option value="grandchild">Grandchild</option>
                  <option value="dependent">Other Dependent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Guardian Preference
                  <Tooltip
                    position="right"
                    content={
                      <div className="space-y-1">
                        <p className="font-semibold">Who should care for this child?</p>
                        <p className="text-xs">Specify who you would like to have custody of this child if you're unable to care for them.</p>
                      </div>
                    }
                  />
                </label>
                <input
                  type="text"
                  value={formData.guardianPreference}
                  onChange={(e) => setFormData(prev => ({ ...prev, guardianPreference: e.target.value }))}
                  placeholder="Full name of preferred guardian..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              {formData.dob && (() => {
                const birthDate = new Date(formData.dob);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
                const isMinor = age < 18;
                return (
                  <div className="md:col-span-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900">
                      <strong>Age:</strong> {age} years old {isMinor ? '(Minor)' : '(Adult)'}
                    </p>
                  </div>
                );
              })()}
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

          {/* School Information */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">School Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={formData.schoolName}
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolName: e.target.value }))}
                  placeholder="Name of school..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grade Level</label>
                <input
                  type="text"
                  value={formData.grade}
                  onChange={(e) => setFormData(prev => ({ ...prev, grade: e.target.value }))}
                  placeholder="e.g., 3rd, K, Pre-K"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Phone</label>
                <input
                  type="tel"
                  value={formData.schoolPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, schoolPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Medical Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Physician</label>
                <input
                  type="text"
                  value={formData.primaryPhysician}
                  onChange={(e) => setFormData(prev => ({ ...prev, primaryPhysician: e.target.value }))}
                  placeholder="Dr. Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Physician Phone</label>
                <input
                  type="tel"
                  value={formData.physicianPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, physicianPhone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Allergies
                  <Tooltip
                    position="right"
                    content={
                      <div className="space-y-1">
                        <p className="font-semibold">Critical Medical Information</p>
                        <p className="text-xs">List all known allergies (food, medication, environmental)</p>
                      </div>
                    }
                  />
                </label>
                <textarea
                  value={formData.allergies}
                  onChange={(e) => setFormData(prev => ({ ...prev, allergies: e.target.value }))}
                  rows={2}
                  placeholder="List all known allergies (food, medication, environmental)..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                <textarea
                  value={formData.medications}
                  onChange={(e) => setFormData(prev => ({ ...prev, medications: e.target.value }))}
                  rows={2}
                  placeholder="List current medications, dosages, and frequency..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="space-y-4 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes & Special Considerations
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Any special needs, preferences, important information..."
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
              {loading ? 'Saving...' : child ? 'Update Child' : 'Add Child'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
