// components/CreateAssetModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, AlertCircle, Info } from 'lucide-react';
import Tooltip from '@/components/Tooltip';
import {
  ASSET_CATEGORIES,
  getAssetCategory,
  type AssetCategory,
  type SubType,
} from '@/lib/assetCategories';

interface CreateAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editAsset?: any;
}

export default function CreateAssetModal({
  isOpen,
  onClose,
  onSuccess,
  editAsset,
}: CreateAssetModalProps) {
  const [formData, setFormData] = useState({
    // Basic Info
    category: '',
    type: '',
    description: '',
    estimatedValue: '',
    valuationDate: new Date().toISOString().split('T')[0],
    currency: 'USD',
    
    // Identification
    accountNumber: '',
    institution: '',
    location: '',
    serialNumber: '',
    
    // Ownership
    ownershipType: 'sole',
    hasBeneficiary: false,
    
    // Estate Planning
    probateStatus: '',
    includedInEstate: true,
    
    // Advanced Tax Options (hidden by default)
    acquisitionDate: '',
    acquisitionMethod: '',
    originalCostBasis: '',
    adjustedBasis: '',
    fairMarketValueAtAcquisition: '',
    holdingPeriod: '',
    basisNotes: '',
    
    // Other
    notes: '',
  });

  const [showAdvancedTax, setShowAdvancedTax] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | null>(null);
  const [availableSubtypes, setAvailableSubtypes] = useState<SubType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editAsset) {
      setFormData({
        category: editAsset.category || '',
        type: editAsset.type || '',
        description: editAsset.description || '',
        estimatedValue: editAsset.estimatedValue?.toString() || '',
        valuationDate: editAsset.valuationDate ? new Date(editAsset.valuationDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        currency: editAsset.currency || 'USD',
        accountNumber: editAsset.accountNumber || '',
        institution: editAsset.institution || '',
        location: editAsset.location || '',
        serialNumber: editAsset.serialNumber || '',
        ownershipType: editAsset.ownershipType || 'sole',
        hasBeneficiary: editAsset.hasBeneficiary || false,
        probateStatus: editAsset.probateStatus || '',
        includedInEstate: editAsset.includedInEstate !== false,
        acquisitionDate: editAsset.acquisitionDate ? new Date(editAsset.acquisitionDate).toISOString().split('T')[0] : '',
        acquisitionMethod: editAsset.acquisitionMethod || '',
        originalCostBasis: editAsset.originalCostBasis?.toString() || '',
        adjustedBasis: editAsset.adjustedBasis?.toString() || '',
        fairMarketValueAtAcquisition: editAsset.fairMarketValueAtAcquisition?.toString() || '',
        holdingPeriod: editAsset.holdingPeriod || '',
        basisNotes: editAsset.basisNotes || '',
        notes: editAsset.notes || '',
      });

      // Set category if editing
      if (editAsset.category) {
        const cat = getAssetCategory(editAsset.category);
        if (cat) {
          setSelectedCategory(cat);
          setAvailableSubtypes(cat.subtypes);
        }
      }
    }
  }, [editAsset]);

  const handleCategoryChange = (categoryId: string) => {
    const category = getAssetCategory(categoryId);
    setSelectedCategory(category || null);
    setAvailableSubtypes(category?.subtypes || []);
    setFormData(prev => ({
      ...prev,
      category: categoryId,
      type: '', // Reset subtype when category changes
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!formData.category) {
        setError('Please select an asset category');
        setLoading(false);
        return;
      }
      if (!formData.type) {
        setError('Please select an asset type');
        setLoading(false);
        return;
      }
      if (!formData.description) {
        setError('Please provide a description');
        setLoading(false);
        return;
      }

      const payload = {
        ...formData,
        estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : null,
        originalCostBasis: formData.originalCostBasis ? parseFloat(formData.originalCostBasis) : null,
        adjustedBasis: formData.adjustedBasis ? parseFloat(formData.adjustedBasis) : null,
        fairMarketValueAtAcquisition: formData.fairMarketValueAtAcquisition ? parseFloat(formData.fairMarketValueAtAcquisition) : null,
        acquisitionDate: formData.acquisitionDate || null,
        valuationDate: formData.valuationDate || null,
      };

      const url = editAsset ? `/api/assets/${editAsset.id}` : '/api/assets';
      const method = editAsset ? 'PUT' : 'POST';

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
        setError(data.error || 'Failed to save asset');
      }
    } catch (error) {
      console.error('Error saving asset:', error);
      setError('Failed to save asset. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {editAsset ? 'Edit Asset' : 'Add New Asset'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
          >
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

          {/* Category and Type (Cascading Dropdowns) */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Asset Category</h3>
            
            {/* Category Selection */}
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
                {ASSET_CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Subtype Selection */}
            {availableSubtypes.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Asset Type <span className="text-red-600">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  required
                >
                  <option value="">Select asset type...</option>
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
                placeholder="e.g., Chase Checking Account, 2020 Toyota Camry"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.estimatedValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, estimatedValue: e.target.value }))}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valuation Date
                </label>
                <input
                  type="date"
                  value={formData.valuationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, valuationDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Identification Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Identification Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institution/Company
                </label>
                <input
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
                  placeholder="e.g., Chase Bank, Tesla"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Number
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location/Address
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Physical location or address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Serial/VIN/Parcel ID
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                  placeholder="Identifier number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Estate Planning */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Estate Planning</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ownership Type
                  <Tooltip content={
                    <div className="space-y-2">
                      <p className="font-semibold">How is this asset owned?</p>
                      <ul className="space-y-1 text-xs">
                        <li><strong>Sole:</strong> You own it alone</li>
                        <li><strong>Joint (JTWROS):</strong> Passes automatically to surviving owner, avoids probate</li>
                        <li><strong>Tenancy in Common:</strong> Your share goes through probate to your beneficiaries</li>
                        <li><strong>Community Property:</strong> Married couples in community property states</li>
                      </ul>
                    </div>
                  } />
                </label>
                <select
                  value={formData.ownershipType}
                  onChange={(e) => setFormData(prev => ({ ...prev, ownershipType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="sole">Sole Ownership</option>
                  <option value="joint">Joint with Rights of Survivorship</option>
                  <option value="tenancy_in_common">Tenancy in Common</option>
                  <option value="community">Community Property</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Probate Status
                  <Tooltip content={
                    <div className="space-y-2">
                      <p className="font-semibold">How will this asset transfer after death?</p>
                      <ul className="space-y-1 text-xs">
                        <li><strong>Probate:</strong> Goes through court process, follows will/intestacy laws</li>
                        <li><strong>Non-Probate:</strong> Has beneficiary designation (TOD, POD, JTWROS), bypasses probate</li>
                        <li><strong>Trust Asset:</strong> Held in trust, transfers per trust terms</li>
                        <li><strong>Exempt:</strong> Small estate exemption or other statutory exception</li>
                      </ul>
                      <p className="text-xs italic mt-2">Tip: Assets with beneficiaries or joint ownership often avoid probate</p>
                    </div>
                  } />
                </label>
                <select
                  value={formData.probateStatus}
                  onChange={(e) => setFormData(prev => ({ ...prev, probateStatus: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Select status...</option>
                  <option value="PROBATE">Subject to Probate</option>
                  <option value="NON_PROBATE">Non-Probate (TOD, JTWROS)</option>
                  <option value="TRUST_ASSET">Trust Asset</option>
                  <option value="EXEMPT">Exempt</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="hasBeneficiary"
                checked={formData.hasBeneficiary}
                onChange={(e) => setFormData(prev => ({ ...prev, hasBeneficiary: e.target.checked }))}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600"
              />
              <label htmlFor="hasBeneficiary" className="text-sm font-medium text-gray-700">
                Has designated beneficiary
              </label>
            </div>
          </div>

          {/* Advanced Tax Options Toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvancedTax(!showAdvancedTax)}
              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <ChevronDown className={`h-5 w-5 transition-transform ${showAdvancedTax ? 'transform rotate-180' : ''}`} />
              Advanced Tax Options
            </button>
          </div>

          {/* Advanced Tax Fields */}
          {showAdvancedTax && (
            <div className="space-y-4 pl-4 border-l-2 border-blue-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-2">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">
                  These fields help track cost basis for capital gains calculations per IRC §1012, §1014, §1015.
                  Consult your tax advisor for proper reporting.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acquisition Date
                  </label>
                  <input
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, acquisitionDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Acquisition Method
                    <Tooltip content={
                      <div className="space-y-2">
                        <p className="font-semibold">How did you acquire this asset?</p>
                        <ul className="space-y-1 text-xs">
                          <li><strong>Purchase:</strong> Bought with your own money</li>
                          <li><strong>Gift:</strong> Received as a gift (carryover basis)</li>
                          <li><strong>Inheritance:</strong> Inherited (stepped-up basis)</li>
                          <li><strong>Created:</strong> You created it (IP, business)</li>
                          <li><strong>1031 Exchange:</strong> Tax-deferred property exchange</li>
                          <li><strong>Conversion:</strong> Property type conversion</li>
                        </ul>
                        <p className="text-xs italic mt-2">This affects your tax basis calculation</p>
                      </div>
                    } />
                  </label>
                  <select
                    value={formData.acquisitionMethod}
                    onChange={(e) => setFormData(prev => ({ ...prev, acquisitionMethod: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  >
                    <option value="">Select method...</option>
                    <option value="PURCHASE">Purchase</option>
                    <option value="GIFT">Gift</option>
                    <option value="INHERITANCE">Inheritance</option>
                    <option value="CREATION">Created</option>
                    <option value="EXCHANGE">1031 Exchange</option>
                    <option value="CONVERSION">Conversion</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Cost Basis
                    <Tooltip 
                      position="right"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">What was your initial investment?</p>
                          <p className="text-xs">This is what you paid for the asset, including:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Purchase price</li>
                            <li>• Closing costs</li>
                            <li>• Sales tax</li>
                            <li>• Installation fees</li>
                          </ul>
                          <p className="text-xs italic mt-2">For gifts: donor's basis. For inheritance: FMV at death</p>
                        </div>
                      } 
                    />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.originalCostBasis}
                      onChange={(e) => setFormData(prev => ({ ...prev, originalCostBasis: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Adjusted Basis
                    <Tooltip 
                      position="right"
                      content={
                        <div className="space-y-2">
                          <p className="font-semibold">Current basis after adjustments</p>
                          <p className="text-xs">Original basis plus:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Capital improvements</li>
                            <li>• Renovation costs</li>
                          </ul>
                          <p className="text-xs">Minus:</p>
                          <ul className="space-y-1 text-xs">
                            <li>• Depreciation taken</li>
                            <li>• Casualty losses</li>
                          </ul>
                          <p className="text-xs italic mt-2">Used to calculate capital gains tax</p>
                        </div>
                      } 
                    />
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.adjustedBasis}
                      onChange={(e) => setFormData(prev => ({ ...prev, adjustedBasis: e.target.value }))}
                      className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Holding Period
                  <Tooltip content={
                    <div className="space-y-2">
                      <p className="font-semibold">How long have you owned this?</p>
                      <ul className="space-y-1 text-xs">
                        <li><strong>Short-term (≤1 year):</strong> Taxed as ordinary income</li>
                        <li><strong>Long-term (&gt;1 year):</strong> Lower capital gains tax rates (0%, 15%, 20%)</li>
                        <li><strong>Inherited:</strong> Automatic long-term treatment regardless of actual holding period</li>
                      </ul>
                      <p className="text-xs italic mt-2">Holding period affects your capital gains tax rate when you sell</p>
                    </div>
                  } />
                </label>
                <select
                  value={formData.holdingPeriod}
                  onChange={(e) => setFormData(prev => ({ ...prev, holdingPeriod: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                >
                  <option value="">Select period...</option>
                  <option value="SHORT_TERM">Short-term (≤1 year)</option>
                  <option value="LONG_TERM">Long-term (&gt;1 year)</option>
                  <option value="INHERITED">Inherited</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Basis Notes
                </label>
                <textarea
                  value={formData.basisNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, basisNotes: e.target.value }))}
                  rows={3}
                  placeholder="References to IRS publications, court cases, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                />
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              placeholder="Any additional information about this asset..."
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
              {loading ? 'Saving...' : editAsset ? 'Update Asset' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
