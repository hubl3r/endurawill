// components/wizards/financial-poa/PowerSelection.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Check, AlertTriangle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface PowerCategory {
  id: string;
  categoryNumber: number;
  categoryName: string;
  categoryLetter?: string;
  plainLanguageDesc: string;
  isDangerous: boolean;
  dangerWarningText?: string;
  examples: any;
  subPowers: PowerSubPower[];
}

interface PowerSubPower {
  id: string;
  powerText: string;
  isDangerous: boolean;
  sortOrder: number;
}

interface PowerSelectionProps {
  formData: any;
  updateFormData: (path: string, value: any) => void;
}

export function PowerSelection({ formData, updateFormData }: PowerSelectionProps) {
  const [categories, setCategories] = useState<PowerCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  const grantAllPowers = formData.grantedPowers?.grantAllPowers ?? true;
  const selectedCategoryIds = formData.grantedPowers?.categoryIds || [];

  useEffect(() => {
    fetchPowerCategories();
  }, []);

  const fetchPowerCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/poa/categories');
      
      if (!response.ok) {
        throw new Error('Failed to fetch power categories');
      }

      const data = await response.json();
      
      if (data.success && data.categories) {
        setCategories(data.categories);
        
        // If grantAllPowers is true, select all categories by default
        if (grantAllPowers && selectedCategoryIds.length === 0) {
          const allCategoryIds = data.categories.map((cat: PowerCategory) => cat.id);
          updateFormData('grantedPowers.categoryIds', allCategoryIds);
        }
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load power categories');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantAllToggle = (checked: boolean) => {
    updateFormData('grantedPowers.grantAllPowers', checked);
    
    if (checked) {
      // Select all categories
      const allCategoryIds = categories.map(cat => cat.id);
      updateFormData('grantedPowers.categoryIds', allCategoryIds);
      updateFormData('grantedPowers.grantAllSubPowers', true);
    } else {
      // Keep current selection or clear if none
      if (selectedCategoryIds.length === 0) {
        updateFormData('grantedPowers.categoryIds', []);
      }
      updateFormData('grantedPowers.grantAllSubPowers', false);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const isSelected = selectedCategoryIds.includes(categoryId);
    
    if (isSelected) {
      // Remove category
      updateFormData(
        'grantedPowers.categoryIds',
        selectedCategoryIds.filter((id: string) => id !== categoryId)
      );
    } else {
      // Add category
      updateFormData('grantedPowers.categoryIds', [...selectedCategoryIds, categoryId]);
    }
    
    // If manually selecting, turn off "grant all"
    if (grantAllPowers) {
      updateFormData('grantedPowers.grantAllPowers', false);
    }
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <span className="ml-3 text-gray-600">Loading power categories...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900">Error Loading Powers</h4>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={fetchPowerCategories}
              className="mt-3 text-sm font-medium text-red-600 hover:text-red-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Powers to Grant
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          {formData.poaType === 'DURABLE' 
            ? 'Choose which powers to grant your agent. For a Durable POA, granting all powers is most common.'
            : 'Select the specific powers you want to grant to your agent.'}
        </p>

        {/* Grant All Powers Toggle */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={grantAllPowers}
              onChange={(e) => handleGrantAllToggle(e.target.checked)}
              className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
            />
            <div className="flex-1">
              <div className="font-medium text-blue-900">
                Grant All Powers (Recommended)
              </div>
              <p className="text-sm text-blue-700 mt-1">
                Your agent will have broad authority to manage all your financial matters. 
                This is the most common choice for Durable POAs and provides maximum flexibility.
              </p>
            </div>
          </label>
        </div>

        {/* Power Categories List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium text-gray-900">
              {grantAllPowers ? 'All Powers Granted' : 'Select Specific Powers'}
            </h4>
            <span className="text-sm text-gray-500">
              {selectedCategoryIds.length} of {categories.length} selected
            </span>
          </div>

          {categories.map((category) => {
            const isSelected = selectedCategoryIds.includes(category.id);
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <div
                key={category.id}
                className={`border rounded-lg transition-all ${
                  isSelected 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-200 bg-white'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCategoryToggle(category.id)}
                      disabled={grantAllPowers}
                      className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5 disabled:opacity-50"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h5 className="font-medium text-gray-900">
                              {category.categoryNumber}. {category.categoryName}
                            </h5>
                            {category.isDangerous && (
                              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Important
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {category.plainLanguageDesc}
                          </p>
                          
                          {category.isDangerous && category.dangerWarningText && isSelected && (
                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                              <AlertTriangle className="h-3 w-3 inline mr-1" />
                              {category.dangerWarningText}
                            </div>
                          )}
                        </div>
                        
                        {category.subPowers && category.subPowers.length > 0 && (
                          <button
                            type="button"
                            onClick={() => toggleCategoryExpanded(category.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-gray-600"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        )}
                      </div>
                      
                      {/* Sub-powers (expanded) */}
                      {isExpanded && category.subPowers && category.subPowers.length > 0 && (
                        <div className="mt-3 pl-4 border-l-2 border-gray-200 space-y-2">
                          {category.subPowers.map((subPower) => (
                            <div key={subPower.id} className="text-sm">
                              <div className="flex items-start space-x-2">
                                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700">{subPower.powerText}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Notice */}
        <div className="mt-6 bg-gray-50 border border-gray-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-1">About Power Categories</p>
              <p>
                These power categories are based on the Uniform Power of Attorney Act (UPOAA). 
                Each category grants your agent specific authority to act on your behalf. 
                You can expand any category to see the specific sub-powers included.
              </p>
            </div>
          </div>
        </div>

        {/* Warning if no powers selected */}
        {!grantAllPowers && selectedCategoryIds.length === 0 && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="text-sm text-yellow-800">
                  <strong>Warning:</strong> You haven't selected any powers. 
                  Your agent will not be able to act on your behalf without granted powers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
