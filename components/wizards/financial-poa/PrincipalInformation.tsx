// components/wizards/financial-poa/PrincipalInformation.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { User, Calendar, Mail, Phone, MapPin } from 'lucide-react';

interface PrincipalInformationProps {
  formData: any;
  updateFormData: (path: string, value: any) => void;
}

interface StateOption {
  state: string;
  stateName: string;
}

const US_STATES: StateOption[] = [
  { state: 'AL', stateName: 'Alabama' },
  { state: 'AK', stateName: 'Alaska' },
  { state: 'AZ', stateName: 'Arizona' },
  { state: 'AR', stateName: 'Arkansas' },
  { state: 'CA', stateName: 'California' },
  { state: 'CO', stateName: 'Colorado' },
  { state: 'CT', stateName: 'Connecticut' },
  { state: 'DE', stateName: 'Delaware' },
  { state: 'FL', stateName: 'Florida' },
  { state: 'GA', stateName: 'Georgia' },
  { state: 'HI', stateName: 'Hawaii' },
  { state: 'ID', stateName: 'Idaho' },
  { state: 'IL', stateName: 'Illinois' },
  { state: 'IN', stateName: 'Indiana' },
  { state: 'IA', stateName: 'Iowa' },
  { state: 'KS', stateName: 'Kansas' },
  { state: 'KY', stateName: 'Kentucky' },
  { state: 'LA', stateName: 'Louisiana' },
  { state: 'ME', stateName: 'Maine' },
  { state: 'MD', stateName: 'Maryland' },
  { state: 'MA', stateName: 'Massachusetts' },
  { state: 'MI', stateName: 'Michigan' },
  { state: 'MN', stateName: 'Minnesota' },
  { state: 'MS', stateName: 'Mississippi' },
  { state: 'MO', stateName: 'Missouri' },
  { state: 'MT', stateName: 'Montana' },
  { state: 'NE', stateName: 'Nebraska' },
  { state: 'NV', stateName: 'Nevada' },
  { state: 'NH', stateName: 'New Hampshire' },
  { state: 'NJ', stateName: 'New Jersey' },
  { state: 'NM', stateName: 'New Mexico' },
  { state: 'NY', stateName: 'New York' },
  { state: 'NC', stateName: 'North Carolina' },
  { state: 'ND', stateName: 'North Dakota' },
  { state: 'OH', stateName: 'Ohio' },
  { state: 'OK', stateName: 'Oklahoma' },
  { state: 'OR', stateName: 'Oregon' },
  { state: 'PA', stateName: 'Pennsylvania' },
  { state: 'RI', stateName: 'Rhode Island' },
  { state: 'SC', stateName: 'South Carolina' },
  { state: 'SD', stateName: 'South Dakota' },
  { state: 'TN', stateName: 'Tennessee' },
  { state: 'TX', stateName: 'Texas' },
  { state: 'UT', stateName: 'Utah' },
  { state: 'VT', stateName: 'Vermont' },
  { state: 'VA', stateName: 'Virginia' },
  { state: 'WA', stateName: 'Washington' },
  { state: 'WV', stateName: 'West Virginia' },
  { state: 'WI', stateName: 'Wisconsin' },
  { state: 'WY', stateName: 'Wyoming' },
];

export function PrincipalInformation({
  formData,
  updateFormData,
}: PrincipalInformationProps) {
  const principal = formData.principal || {};

  const handleChange = (field: string, value: string) => {
    updateFormData(`principal.${field}`, value);
    
    // Auto-set the state field at root level for POA
    if (field === 'address.state') {
      updateFormData('state', value);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Your Information
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Enter your information as the person granting power of attorney (the Principal).
        </p>

        {/* Personal Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
          <div className="flex items-center space-x-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Personal Information</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                value={principal.fullName || ''}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder="John Michael Doe"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="date"
                  value={principal.dateOfBirth || ''}
                  onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={principal.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="john.doe@email.com"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={principal.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="(555) 123-4567"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4 mt-4">
          <div className="flex items-center space-x-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Address</h4>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address *
              </label>
              <input
                type="text"
                value={principal.address?.street || ''}
                onChange={(e) => handleChange('address.street', e.target.value)}
                placeholder="123 Main Street"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  value={principal.address?.city || ''}
                  onChange={(e) => handleChange('address.city', e.target.value)}
                  placeholder="City"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State *
                </label>
                <select
                  value={principal.address?.state || ''}
                  onChange={(e) => handleChange('address.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Select State</option>
                  {US_STATES.map((state) => (
                    <option key={state.state} value={state.state}>
                      {state.stateName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={principal.address?.zipCode || ''}
                  onChange={(e) => handleChange('address.zipCode', e.target.value)}
                  placeholder="12345"
                  pattern="[0-9]{5}"
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Notice */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> This information will appear on your legal Power of Attorney document. 
            Please ensure all information is accurate and matches your legal identification.
          </p>
        </div>
      </div>
    </div>
  );
}
