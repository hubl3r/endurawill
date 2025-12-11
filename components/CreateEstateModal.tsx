'use client';

import { useState } from 'react';
import { X, Home, Users } from 'lucide-react';

interface CreateEstateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEstateCreated: (estate: { id: string; name: string; role: string }) => void;
  estateCount: number;
}

export default function CreateEstateModal({ 
  isOpen, 
  onClose, 
  onEstateCreated,
  estateCount 
}: CreateEstateModalProps) {
  const [estateName, setEstateName] = useState('');
  const [estateType, setEstateType] = useState<'individual' | 'joint'>('individual');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (estateCount >= 3) {
      setError('You have reached the maximum of 3 estates. Please contact support to request an increase.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const response = await fetch('/api/estate/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: estateName.trim() || null,
          type: estateType,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        // Not JSON - likely an error page
        const text = await response.text();
        console.error('Non-JSON response:', text);
        setError('Server error. Please check console for details.');
        return;
      }

      if (response.ok && data.success) {
        onEstateCreated({
          id: data.estate.id,
          name: data.estate.name,
          role: 'primary_owner'
        });
        onClose();
        setEstateName('');
        setEstateType('individual');
      } else {
        setError(data.error || 'Failed to create estate');
      }
    } catch (err) {
      console.error('Error creating estate:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the estate');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Create New Estate</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isCreating}
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Estate Count Warning */}
          {estateCount >= 3 ? (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-900 text-sm font-medium">
                You have reached the maximum of 3 estates. Please contact support to request an increase.
              </p>
            </div>
          ) : estateCount === 2 ? (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-amber-900 text-sm">
                You are creating your final estate (3/3 limit). Contact support if you need more.
              </p>
            </div>
          ) : null}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-900 text-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Estate Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estate Name (Optional)
              </label>
              <input
                type="text"
                value={estateName}
                onChange={(e) => setEstateName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Estate of John Doe"
                disabled={isCreating || estateCount >= 3}
              />
              <p className="mt-1 text-xs text-gray-500">
                Leave blank to use "Estate of [Your Name]"
              </p>
            </div>

            {/* Estate Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Estate Type
              </label>
              <div className="space-y-3">
                <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="individual"
                    checked={estateType === 'individual'}
                    onChange={(e) => setEstateType(e.target.value as 'individual')}
                    className="mt-1"
                    disabled={isCreating || estateCount >= 3}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Home className="h-5 w-5 text-blue-600" />
                      <p className="font-medium text-gray-900">Individual Estate</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      One owner manages the estate (you). Best for single individuals.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-4 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    value="joint"
                    checked={estateType === 'joint'}
                    onChange={(e) => setEstateType(e.target.value as 'joint')}
                    className="mt-1"
                    disabled={isCreating || estateCount >= 3}
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-5 w-5 text-purple-600" />
                      <p className="font-medium text-gray-900">Joint Estate</p>
                    </div>
                    <p className="text-sm text-gray-600">
                      Up to two owners can manage together. Perfect for married couples or partners.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isCreating}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isCreating || estateCount >= 3}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isCreating ? 'Creating...' : 'Create Estate'}
              </button>
            </div>
          </form>

          {/* Info */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Note:</strong> You can create up to 3 estates. After creating, you can invite co-owners and delegates to help manage your estate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
