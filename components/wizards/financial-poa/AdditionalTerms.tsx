// components/wizards/financial-poa/AdditionalTerms.tsx
'use client';

import React from 'react';
import { Calendar, DollarSign, Info } from 'lucide-react';

interface AdditionalTermsProps {
  formData: any;
  updateFormData: (path: string, value: any) => void;
}

export function AdditionalTerms({ formData, updateFormData }: AdditionalTermsProps) {
  const effectiveDate = formData.effectiveDate || '';
  const agentCompensation = formData.agentCompensation || false;
  const compensationDetails = formData.compensationDetails || '';
  const isDurable = formData.isDurable || false;
  const [dateError, setDateError] = React.useState<string | null>(null);
  const [expirationError, setExpirationError] = React.useState<string | null>(null);

  const handleEffectiveDateChange = (value: string) => {
    // Validate date is not in the past
    if (value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to start of day
      
      if (selectedDate < today) {
        setDateError('Effective date cannot be in the past');
        return;
      }
    }
    
    setDateError(null);
    updateFormData('effectiveDate', value);
  };

  const handleExpirationDateChange = (value: string) => {
    // Validate expiration is not in the past and is after effective date
    if (value) {
      const selectedDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        setExpirationError('Expiration date cannot be in the past');
        return;
      }
      
      if (effectiveDate) {
        const effective = new Date(effectiveDate);
        if (selectedDate <= effective) {
          setExpirationError('Expiration date must be after effective date');
          return;
        }
      }
    }
    
    setExpirationError(null);
    updateFormData('expirationDate', value);
  };

  return (
    <div className="space-y-8">
      {/* Effective Date Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-3 mb-4">
          <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Effective Date</h3>
            <p className="text-sm text-gray-600 mt-1">
              When should this Power of Attorney take effect?
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Default behavior notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p>
                  {isDurable && (
                    <>
                      <strong>Durable POAs typically take effect immediately upon signing.</strong> 
                      However, you may optionally specify a future effective date below.
                    </>
                  )}
                  {!isDurable && (
                    <>
                      If no date is selected below, this Power of Attorney will be{' '}
                      <strong>effective immediately upon signing</strong>.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Optional specific date - NOW AVAILABLE FOR ALL TYPES */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Specific Effective Date (Optional)
            </label>
            <input
              type="date"
              value={effectiveDate}
              onChange={(e) => handleEffectiveDateChange(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${
                dateError
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              }`}
            />
            {dateError ? (
              <p className="text-xs text-red-600 mt-1">{dateError}</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for immediate effect upon signing
              </p>
            )}
          </div>

          {/* Expiration date for LIMITED POAs */}
          {formData.isLimited && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date {formData.poaType === 'LIMITED' ? '(Required for Limited POA)' : '(Optional)'}
              </label>
              <input
                type="date"
                value={formData.expirationDate || ''}
                onChange={(e) => handleExpirationDateChange(e.target.value)}
                min={effectiveDate || new Date().toISOString().split('T')[0]}
                className={`w-full px-4 py-2 border rounded-md focus:ring-2 ${
                  expirationError
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                }`}
              />
              {expirationError ? (
                <p className="text-xs text-red-600 mt-1">{expirationError}</p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">
                  Limited POAs must have an expiration date
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Agent Compensation Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-3 mb-4">
          <DollarSign className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Agent Compensation</h3>
            <p className="text-sm text-gray-600 mt-1">
              Specify whether your agent should receive compensation for their services
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Default reimbursement notice */}
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="flex items-start space-x-2">
              <Info className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-green-900">
                <p>
                  <strong>Your agent is always entitled to reimbursement</strong> for reasonable
                  expenses incurred while acting on your behalf (travel, postage, filing fees,
                  etc.).
                </p>
              </div>
            </div>
          </div>

          {/* Compensation checkbox */}
          <div className="flex items-start space-x-3">
            <input
              type="checkbox"
              id="agentCompensation"
              checked={agentCompensation}
              onChange={(e) => {
                updateFormData('agentCompensation', e.target.checked);
                if (!e.target.checked) {
                  updateFormData('compensationDetails', '');
                }
              }}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="agentCompensation" className="flex-1 cursor-pointer">
              <span className="text-sm font-medium text-gray-900">
                My agent shall receive additional compensation (beyond reimbursement)
              </span>
              <p className="text-xs text-gray-500 mt-1">
                Check this box if you want to compensate your agent for their time and services
              </p>
            </label>
          </div>

          {/* Compensation details (conditional) */}
          {agentCompensation && (
            <div className="ml-7 mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compensation Details <span className="text-red-500">*</span>
              </label>
              <textarea
                value={compensationDetails}
                onChange={(e) => updateFormData('compensationDetails', e.target.value)}
                placeholder="e.g., $50 per hour, 5% of estate value annually, reasonable hourly rate not to exceed $100/hour"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Specify the amount, rate, or method of calculating compensation
              </p>
              {agentCompensation && !compensationDetails && (
                <p className="text-xs text-red-600 mt-1">
                  Please provide compensation details if you checked the box above
                </p>
              )}
            </div>
          )}

          {/* No compensation selected */}
          {!agentCompensation && (
            <div className="ml-7 pt-2">
              <p className="text-sm text-gray-600 italic">
                Your agent will serve without additional compensation, but will still be entitled
                to reimbursement for reasonable expenses.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Special Instructions Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-start space-x-3 mb-4">
          <Info className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-900">Special Instructions</h3>
            <p className="text-sm text-gray-600 mt-1">
              Add any special instructions, limitations, or conditions for your agent (optional)
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions or Limitations (Optional)
          </label>
          <textarea
            value={formData.specialInstructions || ''}
            onChange={(e) => updateFormData('specialInstructions', e.target.value)}
            rows={6}
            placeholder="Example: My agent may not sell or mortgage my primary residence without my written consent..."
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            Use this field to add specific instructions, limitations, or conditions that apply to all granted powers.
            These instructions will appear in the final POA document.
          </p>
        </div>
      </div>

      {/* Summary box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Summary of Additional Terms</h4>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Effective Date:</dt>
            <dd className="text-gray-900 font-medium">
              {effectiveDate
                ? new Date(effectiveDate).toLocaleDateString()
                : 'Immediately upon signing'}
              {isDurable && ' (Durable - survives incapacity)'}
            </dd>
          </div>
          {formData.expirationDate && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Expiration Date:</dt>
              <dd className="text-gray-900 font-medium">
                {new Date(formData.expirationDate).toLocaleDateString()}
              </dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-gray-600">Agent Compensation:</dt>
            <dd className="text-gray-900 font-medium">
              {agentCompensation ? 'Yes - ' + (compensationDetails || 'Details required') : 'No (expenses only)'}
            </dd>
          </div>
          {formData.specialInstructions && (
            <div className="flex justify-between">
              <dt className="text-gray-600">Special Instructions:</dt>
              <dd className="text-gray-900 font-medium">Added</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
