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
                {isDurable ? (
                  <p>
                    <strong>Durable POAs are effective immediately upon signing.</strong> This
                    Power of Attorney will remain in effect even if you become incapacitated.
                  </p>
                ) : (
                  <p>
                    If no date is selected below, this Power of Attorney will be{' '}
                    <strong>effective immediately upon signing</strong>.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Optional specific date */}
          {!isDurable && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Effective Date (Optional)
              </label>
              <input
                type="date"
                value={effectiveDate}
                onChange={(e) => updateFormData('effectiveDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Leave blank for immediate effect upon signing
              </p>
            </div>
          )}

          {/* Expiration date for LIMITED POAs */}
          {formData.isLimited && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date {formData.poaType === 'LIMITED' ? '(Required for Limited POA)' : '(Optional)'}
              </label>
              <input
                type="date"
                value={formData.expirationDate || ''}
                onChange={(e) => updateFormData('expirationDate', e.target.value)}
                min={effectiveDate || new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Limited POAs must have an expiration date
              </p>
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

      {/* Summary box */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Summary of Additional Terms</h4>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-gray-600">Effective Date:</dt>
            <dd className="text-gray-900 font-medium">
              {isDurable
                ? 'Immediately upon signing (Durable)'
                : effectiveDate
                ? new Date(effectiveDate).toLocaleDateString()
                : 'Immediately upon signing'}
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
        </dl>
      </div>
    </div>
  );
}
