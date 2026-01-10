// components/wizards/financial-poa/DocumentTypeSelector.tsx
// File path: /components/wizards/financial-poa/DocumentTypeSelector.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Check, AlertTriangle } from 'lucide-react';

interface DocumentTypeSelectorProps {
  formData: any;
  updateFormData: (path: string, value: any) => void;
}

export function DocumentTypeSelector({
  formData,
  updateFormData,
}: DocumentTypeSelectorProps) {
  const [selectedType, setSelectedType] = useState(formData.poaType || '');

  useEffect(() => {
    if (selectedType) {
      updateFormData('poaType', selectedType);
      updateFormData('isDurable', selectedType === 'DURABLE');
      updateFormData('isSpringing', selectedType === 'SPRINGING');
      updateFormData('isLimited', selectedType === 'LIMITED');
    }
  }, [selectedType, updateFormData]);

  const poaTypes = [
    {
      id: 'DURABLE',
      name: 'Durable Power of Attorney',
      description: 'Effective immediately and survives incapacity',
      icon: Check,
      recommended: true,
      details: [
        'Takes effect as soon as you sign it',
        'Remains valid if you become incapacitated',
        'Most commonly used for ongoing financial management',
      ],
    },
    {
      id: 'SPRINGING',
      name: 'Springing Power of Attorney',
      description: 'Only becomes effective upon incapacity',
      icon: Clock,
      details: [
        'Only activates when you become incapacitated',
        'Requires physician certification of incapacity',
        'You retain full control while capable',
      ],
    },
    {
      id: 'LIMITED',
      name: 'Limited Power of Attorney',
      description: 'For specific purposes or time periods',
      icon: Calendar,
      details: [
        'Limited to specific transactions or time periods',
        'Expires on a set date or completion of purpose',
        'Good for temporary situations',
      ],
    },
  ];

  const handleTypeSelect = (typeId: string) => {
    setSelectedType(typeId);
  };

  const selectedTypeData = poaTypes.find(type => type.id === selectedType);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Choose Power of Attorney Type
        </h3>
        <p className="text-gray-600 mb-6">
          Select the type of Power of Attorney that best fits your needs.
        </p>

        <div className="grid gap-4">
          {poaTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = selectedType === type.id;
            
            return (
              <div
                key={type.id}
                className={`relative border rounded-lg p-4 cursor-pointer transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
                onClick={() => handleTypeSelect(type.id)}
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-lg ${
                      isSelected ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-5 w-5 ${
                        isSelected ? 'text-blue-600' : 'text-gray-600'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <h4 className="font-medium text-gray-900">{type.name}</h4>
                      {type.recommended && (
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                          Most Common
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{type.description}</p>
                  </div>
                  
                  <div className="ml-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedTypeData && (
        <div className="border-t pt-6">
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-medium text-gray-900 mb-3">
              About {selectedTypeData.name}
            </h4>
            
            <ul className="space-y-2">
              {selectedTypeData.details.map((detail, index) => (
                <li key={index} className="flex items-start text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedType === 'SPRINGING' && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Incapacity Configuration</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Physicians Required
              </label>
              <select
                value={formData.numberOfPhysiciansRequired || 1}
                onChange={(e) => updateFormData('numberOfPhysiciansRequired', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={1}>1 Physician (Standard)</option>
                <option value={2}>2 Physicians (More Secure)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {selectedType === 'LIMITED' && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-900 mb-4">Purpose & Duration</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Purpose (Required)
              </label>
              <textarea
                value={formData.specificPurpose || ''}
                onChange={(e) => updateFormData('specificPurpose', e.target.value)}
                placeholder="e.g., 'Sell my property at 123 Main Street'"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Expiration Date (Optional)
              </label>
              <input
                type="date"
                value={formData.expirationDate || ''}
                onChange={(e) => updateFormData('expirationDate', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
