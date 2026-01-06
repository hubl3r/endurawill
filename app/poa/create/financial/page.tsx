// app/poa/create/financial/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';
import { DisclaimerCheckbox } from '@/components/legal/DisclaimerCheckbox';
import { WizardStep } from '@/components/poa/WizardStep';
import { AgentForm } from '@/components/poa/AgentForm';

interface FormData {
  poaType: 'durable' | 'springing' | 'limited';
  principal: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  agents: Array<{
    type: 'primary' | 'successor' | 'co-agent';
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }>;
  grantedPowers: {
    categoryIds: string[];
    grantAllSubPowers: boolean;
  };
  coAgentsMustActJointly: boolean;
  useStatutoryForm: boolean;
  specialInstructions: string;
  disclaimerAccepted: boolean;
}

interface PowerCategory {
  id: string;
  categoryName: string;
  plainLanguageDesc: string;
}

interface State {
  state: string;
  stateName: string;
}

export default function CreateFinancialPOAPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdPOA, setCreatedPOA] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [powerCategories, setPowerCategories] = useState<PowerCategory[]>([]);
  const [states, setStates] = useState<State[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    poaType: 'durable',
    principal: {
      fullName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    agents: [],
    grantedPowers: {
      categoryIds: [],
      grantAllSubPowers: true,
    },
    coAgentsMustActJointly: false,
    useStatutoryForm: true,
    specialInstructions: '',
    disclaimerAccepted: false,
  });

  // Fetch categories and states on mount
  useEffect(() => {
    Promise.all([
      fetch('/api/poa/categories').then(r => r.json()),
      fetch('/api/poa/states').then(r => r.json())
    ])
    .then(([categoriesData, statesData]) => {
      // Handle categories
      if (categoriesData.success && categoriesData.categories) {
        setPowerCategories(categoriesData.categories);
      } else if (Array.isArray(categoriesData)) {
        setPowerCategories(categoriesData);
      }
      
      // Handle states - try multiple possible structures
      if (statesData.success && statesData.states) {
        setStates(statesData.states);
      } else if (Array.isArray(statesData)) {
        setStates(statesData);
      } else if (statesData.data) {
        setStates(statesData.data);
      }
    })
    .catch(err => {
      setError('Failed to load form data');
    });
  }, []);

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current = newData as any;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      
      return newData;
    });
  };

  const canGoNext = () => {
    switch (currentStep) {
      case 1: return true; // poaType defaults to 'durable', always valid
      case 2: 
        const p = formData.principal;
        return !!(p.fullName && p.email && p.address && p.city && p.state && p.zipCode);
      case 3: return formData.agents.some(agent => agent.type === 'primary' && agent.fullName && agent.email);
      case 4: return formData.grantedPowers.categoryIds.length > 0;
      case 5: return true;
      case 6: return true;
      case 7: return formData.disclaimerAccepted;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 7) {
      handleSubmit();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        principal: {
          fullName: formData.principal.fullName,
          email: formData.principal.email,
          phone: formData.principal.phone,
          address: {
            street: formData.principal.address,
            city: formData.principal.city,
            state: formData.principal.state,
            zipCode: formData.principal.zipCode,
          },
        },
        poaType: formData.poaType,
        state: formData.principal.state,
        isDurable: formData.poaType === 'durable',
        isSpringing: formData.poaType === 'springing',
        isLimited: formData.poaType === 'limited',
        coAgentsMustActJointly: formData.coAgentsMustActJointly,
        agents: formData.agents.map((agent, index) => ({
          type: agent.type,
          agentType: agent.type,
          order: index + 1,
          fullName: agent.fullName,
          email: agent.email,
          address: {
            street: agent.address,
            city: agent.city,
            state: agent.state,
            zipCode: agent.zipCode,
          },
        })),
        grantedPowers: formData.grantedPowers,
        useStatutoryForm: formData.useStatutoryForm,
        specialInstructions: formData.specialInstructions,
      };

      console.log('Submitting payload:', payload);

      const response = await fetch('/api/poa/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      console.log('API response:', result);
      console.log('Validation details:', result.details);
      
      if (result.success) {
        setCreatedPOA(result.poa);
        setSuccess(true);
      } else {
        const errorMsg = result.details 
          ? `Validation failed: ${result.details.map((d: any) => `${d.path}: ${d.message}`).join(', ')}`
          : result.error || `Failed to create POA: ${JSON.stringify(result)}`;
        setError(errorMsg);
      }
    } catch (err) {
      console.error('Submit error:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Select Power of Attorney Type</h3>
            <div className="space-y-3">
              {[
                { value: 'durable', label: 'Durable POA', description: 'Remains effective if you become incapacitated' },
                { value: 'springing', label: 'Springing POA', description: 'Only becomes effective upon incapacitation' },
                { value: 'limited', label: 'Limited POA', description: 'Restricted to specific purposes and time periods' }
              ].map((option) => (
                <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                  <input
                    type="radio"
                    name="poaType"
                    value={option.value}
                    checked={formData.poaType === option.value}
                    onChange={(e) => updateFormData('poaType', e.target.value)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium">{option.label}</div>
                    <div className="text-sm text-gray-600">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Principal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.principal.fullName}
                  onChange={(e) => updateFormData('principal.fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full legal name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.principal.email}
                  onChange={(e) => updateFormData('principal.email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.principal.phone}
                  onChange={(e) => updateFormData('principal.phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                <select
                  value={formData.principal.state}
                  onChange={(e) => updateFormData('principal.state', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.state} value={state.state}>{state.stateName}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
                <input
                  type="text"
                  value={formData.principal.address}
                  onChange={(e) => updateFormData('principal.address', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="123 Main Street"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                <input
                  type="text"
                  value={formData.principal.city}
                  onChange={(e) => updateFormData('principal.city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  value={formData.principal.zipCode}
                  onChange={(e) => updateFormData('principal.zipCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Agent Information</h3>
            <AgentForm
              agents={formData.agents}
              onChange={(agents) => updateFormData('agents', agents)}
              states={states}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Select Powers to Grant</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    const allCategoryIds = powerCategories.map(cat => cat.id);
                    updateFormData('grantedPowers.categoryIds', allCategoryIds);
                  }}
                  className="px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={() => updateFormData('grantedPowers.categoryIds', [])}
                  className="px-3 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Select None
                </button>
              </div>
            </div>
            
            {powerCategories.length === 0 ? (
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-600">Loading power categories...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{formData.grantedPowers.categoryIds.length} of {powerCategories.length}</strong> power categories selected
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {powerCategories.map((category) => (
                    <label key={category.id} className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.grantedPowers.categoryIds.includes(category.id)}
                        onChange={(e) => {
                          const categoryIds = e.target.checked
                            ? [...formData.grantedPowers.categoryIds, category.id]
                            : formData.grantedPowers.categoryIds.filter(id => id !== category.id);
                          updateFormData('grantedPowers.categoryIds', categoryIds);
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">{category.categoryName}</div>
                        <div className="text-sm text-gray-600">{category.plainLanguageDesc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Additional Options</h3>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.coAgentsMustActJointly}
                  onChange={(e) => updateFormData('coAgentsMustActJointly', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Co-agents must act jointly</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.useStatutoryForm}
                  onChange={(e) => updateFormData('useStatutoryForm', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <span>Use statutory form (recommended)</span>
              </label>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Special Instructions (Optional)
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter any specific instructions or limitations for your agents..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  These instructions will be included in your Power of Attorney document.
                </p>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Review Your Information</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h4 className="font-medium mb-2">POA Type</h4>
              <p className="capitalize mb-4">{formData.poaType}</p>
              
              <h4 className="font-medium mb-2">Principal</h4>
              <p>{formData.principal.fullName}</p>
              <p>{formData.principal.email}</p>
              <p>{formData.principal.address}, {formData.principal.city}, {formData.principal.state} {formData.principal.zipCode}</p>
              
              <h4 className="font-medium mb-2 mt-4">Agents</h4>
              <p>{formData.agents.length} agent(s) added</p>
              
              <h4 className="font-medium mb-2 mt-4">Powers</h4>
              <p>{formData.grantedPowers.categoryIds.length} power categories selected</p>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Final Acknowledgment</h3>
            <DisclaimerCheckbox
              checked={formData.disclaimerAccepted}
              onChange={(checked) => updateFormData('disclaimerAccepted', checked)}
            />
          </div>
        );

      default:
        return null;
    }
  };

  const getStepTitle = () => {
    const titles = [
      'Select POA Type',
      'Principal Information',
      'Add Agents',
      'Grant Powers',
      'Additional Options',
      'Review Details',
      'Legal Acknowledgment'
    ];
    return titles[currentStep - 1] || '';
  };

  if (success && createdPOA) {
    // POA type-specific theming
    const poaTypeConfig = {
      durable: {
        bgColor: 'bg-blue-600',
        iconBg: 'bg-blue-50',
        iconColor: 'text-blue-600',
        borderColor: 'border-blue-200',
        icon: '🔒',
        title: 'Durable Power of Attorney Created',
        subtitle: 'Your agent can act immediately and power continues if you become incapacitated',
        description: 'This document grants broad authority to your designated agent(s) and remains effective even if you become unable to make decisions.',
      },
      springing: {
        bgColor: 'bg-green-600', 
        iconBg: 'bg-green-50',
        iconColor: 'text-green-600',
        borderColor: 'border-green-200',
        icon: '🌱',
        title: 'Springing Power of Attorney Created',
        subtitle: 'Power activates only upon your incapacitation as determined by medical professionals',
        description: 'This document will "spring" into effect when you become incapacitated, giving your agent authority only when needed.',
      },
      limited: {
        bgColor: 'bg-purple-600',
        iconBg: 'bg-purple-50', 
        iconColor: 'text-purple-600',
        borderColor: 'border-purple-200',
        icon: '📋',
        title: 'Limited Power of Attorney Created',
        subtitle: 'Grants specific powers for defined purposes and time periods',
        description: 'This document grants limited authority to your agent for the specific purposes and timeframe you designated.',
      }
    };

    const config = poaTypeConfig[formData.poaType as keyof typeof poaTypeConfig];

    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header Card */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
            <div className={`${config.bgColor} px-6 py-6`}>
              <div className="flex items-center">
                <div className={`${config.iconBg} rounded-full p-3 mr-4`}>
                  <span className="text-2xl">{config.icon}</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{config.title}</h1>
                  <p className="text-blue-100 mt-1">{config.subtitle}</p>
                </div>
              </div>
            </div>

            {/* Document Details */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className={`${config.iconBg} ${config.borderColor} border rounded-lg p-4`}>
                  <h3 className="font-medium text-gray-900 mb-1">Principal</h3>
                  <p className={`${config.iconColor} font-medium`}>{formData.principal.fullName}</p>
                  <p className="text-sm text-gray-500">{formData.principal.state}</p>
                </div>
                
                <div className={`${config.iconBg} ${config.borderColor} border rounded-lg p-4`}>
                  <h3 className="font-medium text-gray-900 mb-1">Agents</h3>
                  <p className={`${config.iconColor} font-medium`}>{formData.agents.length} designated</p>
                  <p className="text-sm text-gray-500">
                    {formData.agents.filter(a => a.type === 'primary').length} primary, {formData.agents.filter(a => a.type === 'successor').length} successor
                  </p>
                </div>
                
                <div className={`${config.iconBg} ${config.borderColor} border rounded-lg p-4`}>
                  <h3 className="font-medium text-gray-900 mb-1">Powers Granted</h3>
                  <p className={`${config.iconColor} font-medium`}>{formData.grantedPowers.categoryIds.length} categories</p>
                  <p className="text-sm text-gray-500">Financial authority</p>
                </div>
              </div>

              <div className={`${config.iconBg} ${config.borderColor} border rounded-lg p-4 mb-6`}>
                <h3 className="font-medium text-gray-900 mb-2">About Your {formData.poaType.charAt(0).toUpperCase() + formData.poaType.slice(1)} POA</h3>
                <p className="text-sm text-gray-600">{config.description}</p>
              </div>
            </div>
          </div>

          {/* Actions Card */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Document Actions</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => window.open(createdPOA.generatedDocument, '_blank')}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <span className="text-2xl mb-2">👀</span>
                <span className="font-medium text-gray-900">View PDF</span>
                <span className="text-xs text-gray-500">Review document</span>
              </button>

              <a
                href={createdPOA.generatedDocument}
                download={`POA_${formData.principal.fullName.replace(/\s+/g, '_')}_${formData.poaType}.pdf`}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <span className="text-2xl mb-2">💾</span>
                <span className="font-medium text-gray-900">Download</span>
                <span className="text-xs text-gray-500">Save to device</span>
              </a>

              <button
                onClick={() => {
                  const subject = `${formData.poaType.charAt(0).toUpperCase() + formData.poaType.slice(1)} Power of Attorney - ${formData.principal.fullName}`;
                  const body = `Please find attached the Power of Attorney document.\n\nDocument Details:\n- Principal: ${formData.principal.fullName}\n- Type: ${formData.poaType} POA\n- Agents: ${formData.agents.length}\n- Created: ${new Date().toLocaleDateString()}\n\nDocument: ${createdPOA.generatedDocument}`;
                  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <span className="text-2xl mb-2">📧</span>
                <span className="font-medium text-gray-900">Share</span>
                <span className="text-xs text-gray-500">Email document</span>
              </button>

              <button
                onClick={() => {
                  setSuccess(false);
                  setCreatedPOA(null);
                  setCurrentStep(1);
                  setFormData({
                    poaType: 'durable',
                    principal: { fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' },
                    agents: [],
                    grantedPowers: { categoryIds: [], grantAllSubPowers: true },
                    coAgentsMustActJointly: false,
                    useStatutoryForm: true,
                    specialInstructions: '',
                    disclaimerAccepted: false,
                  });
                }}
                className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                <span className="text-2xl mb-2">➕</span>
                <span className="font-medium text-gray-900">Create New</span>
                <span className="text-xs text-gray-500">Another POA</span>
              </button>
            </div>
          </div>

          {/* Next Steps Card */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-medium">1</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Review and Verify</p>
                  <p className="text-sm text-gray-600">Carefully review the document for accuracy before execution</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-medium">2</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Execute Properly</p>
                  <p className="text-sm text-gray-600">Follow your state's requirements for notarization and witnesses</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-medium">3</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Notify Your Agents</p>
                  <p className="text-sm text-gray-600">Your agents have been sent acceptance emails automatically</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 text-sm font-medium">4</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Store Safely</p>
                  <p className="text-sm text-gray-600">Keep originals secure and provide copies to relevant institutions</p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Link 
                  href="/dashboard" 
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  ← Return to Dashboard
                </Link>
                <button
                  onClick={() => window.open('/poa/create/healthcare', '_blank')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Create Healthcare POA
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner />
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        )}

        <WizardStep
          currentStep={currentStep}
          totalSteps={7}
          title={getStepTitle()}
          onBack={() => setCurrentStep(prev => Math.max(1, prev - 1))}
          onNext={handleNext}
          canGoNext={canGoNext()}
          isLastStep={currentStep === 7}
          isSubmitting={isSubmitting}
        >
          {renderStepContent()}
        </WizardStep>
      </div>
    </div>
  );
}
