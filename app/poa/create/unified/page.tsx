'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';
import { DisclaimerCheckbox } from '@/components/legal/DisclaimerCheckbox';
import { WizardStep } from '@/components/poa/WizardStep';
import { AgentForm } from '@/components/poa/AgentForm';

interface FormData {
  // POA Selection
  poaTypes: ('financial' | 'healthcare')[];
  
  // Financial POA specific
  financialPoaType: 'durable' | 'springing' | 'limited';
  
  // Principal Information
  principal: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    dateOfBirth?: string;
  };
  
  // Agents (shared for both types)
  agents: Array<{
    type: 'primary' | 'successor' | 'co-agent';
    fullName: string;
    email: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    relationship?: string;
  }>;
  
  // Financial Powers
  grantedPowers: {
    categoryIds: string[];
    grantAllSubPowers: boolean;
  };
  
  // Healthcare Powers
  healthcarePowers: {
    medicalTreatment: boolean;
    mentalHealthTreatment: boolean;
    endOfLifeDecisions: boolean;
    organDonation: boolean;
    autopsyDecision: boolean;
    dispositionOfRemains: boolean;
  };
  
  // Healthcare Preferences
  lifeSustainingTreatment: 'prolong_life' | 'comfort_care_only' | 'agent_decides' | 'not_specified';
  organDonationPreference: 'any_needed' | 'transplant_only' | 'research_only' | 'no_donation' | 'not_specified';
  
  // Shared Options
  coAgentsMustActJointly: boolean;
  useStatutoryForm: boolean;
  specialInstructions: string;
  additionalDirectives: string;
  
  // Legal
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

export default function UnifiedPOAWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdPOAs, setCreatedPOAs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    poaTypes: ['financial'],
    financialPoaType: 'durable',
    principal: { fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' },
    agents: [],
    grantedPowers: { categoryIds: [], grantAllSubPowers: true },
    healthcarePowers: {
      medicalTreatment: true,
      mentalHealthTreatment: false,
      endOfLifeDecisions: false,
      organDonation: false,
      autopsyDecision: false,
      dispositionOfRemains: false,
    },
    lifeSustainingTreatment: 'agent_decides',
    organDonationPreference: 'not_specified',
    coAgentsMustActJointly: false,
    useStatutoryForm: true,
    specialInstructions: '',
    additionalDirectives: '',
    disclaimerAccepted: false,
  });

  const [powerCategories, setPowerCategories] = useState<PowerCategory[]>([]);
  const [states, setStates] = useState<State[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, statesRes] = await Promise.all([
          fetch('/api/poa/categories'),
          fetch('/api/poa/states')
        ]);

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setPowerCategories(categoriesData.categories || []);
        }

        if (statesRes.ok) {
          const statesData = await statesRes.json();
          setStates(statesData.states || []);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const updateFormData = (path: string, value: any) => {
    setFormData(prev => {
      const keys = path.split('.');
      const newData = { ...prev };
      let current: any = newData;

      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }

      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return formData.poaTypes.length > 0;
      case 2:
        return !!(formData.principal.fullName && formData.principal.email && 
                 formData.principal.address && formData.principal.city && 
                 formData.principal.state && formData.principal.zipCode);
      case 3:
        return formData.agents.length > 0 && 
               formData.agents.every(agent => !!(agent.fullName && agent.email));
      case 4:
        // Financial powers step
        if (!formData.poaTypes.includes('financial')) return true;
        return formData.grantedPowers.categoryIds.length > 0;
      case 5:
        // Healthcare powers step
        if (!formData.poaTypes.includes('healthcare')) return true;
        return Object.values(formData.healthcarePowers).some(v => v);
      case 6:
        return true; // Additional options always valid
      case 7:
        return true; // Review always valid
      case 8:
        return formData.disclaimerAccepted;
      default:
        return true;
    }
  };

  const getCurrentSteps = (): number => {
    // Dynamic steps based on POA types selected
    let steps = 4; // POA Type, Principal, Agents, Review
    
    if (formData.poaTypes.includes('financial')) steps += 1; // Financial Powers
    if (formData.poaTypes.includes('healthcare')) steps += 1; // Healthcare Powers
    
    steps += 2; // Additional Options, Legal Disclaimer
    
    return steps;
  };

  const getStepNumber = (stepType: string): number => {
    const baseSteps = ['type', 'principal', 'agents'];
    let stepNum = baseSteps.indexOf(stepType) + 1;
    
    if (stepNum > 0) return stepNum;
    
    let currentStep = 4;
    
    if (stepType === 'financial-powers') {
      return formData.poaTypes.includes('financial') ? currentStep : -1;
    }
    
    if (formData.poaTypes.includes('financial')) currentStep++;
    
    if (stepType === 'healthcare-powers') {
      return formData.poaTypes.includes('healthcare') ? currentStep : -1;
    }
    
    if (formData.poaTypes.includes('healthcare')) currentStep++;
    
    if (stepType === 'options') return currentStep;
    if (stepType === 'review') return currentStep + 1;
    if (stepType === 'disclaimer') return currentStep + 2;
    
    return -1;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const results = [];
      
      // Submit Financial POA if selected
      if (formData.poaTypes.includes('financial')) {
        const financialPayload = {
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
          poaType: formData.financialPoaType,
          state: formData.principal.state,
          isDurable: formData.financialPoaType === 'durable',
          isSpringing: formData.financialPoaType === 'springing',
          isLimited: formData.financialPoaType === 'limited',
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

        const financialResponse = await fetch('/api/poa/financial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(financialPayload),
        });

        const financialResult = await financialResponse.json();
        console.log('Financial POA response:', financialResult);
        
        if (financialResult.success) {
          results.push({ type: 'financial', ...financialResult.poa });
        } else {
          setError(`Financial POA failed: ${financialResult.error || JSON.stringify(financialResult)}`);
          return;
        }
      }
      
      // Submit Healthcare POA if selected
      if (formData.poaTypes.includes('healthcare')) {
        const healthcarePayload = {
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
            dateOfBirth: formData.principal.dateOfBirth,
          },
          state: formData.principal.state,
          agents: formData.agents.map((agent, index) => ({
            type: agent.type,
            order: index + 1,
            fullName: agent.fullName,
            email: agent.email,
            relationship: agent.relationship,
            address: {
              street: agent.address,
              city: agent.city,
              state: agent.state,
              zipCode: agent.zipCode,
            },
          })),
          healthcarePowers: formData.healthcarePowers,
          lifeSustainingTreatment: formData.lifeSustainingTreatment,
          organDonation: formData.organDonationPreference,
          additionalDirectives: formData.additionalDirectives,
          useStatutoryForm: formData.useStatutoryForm,
        };

        const healthcareResponse = await fetch('/api/poa/healthcare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(healthcarePayload),
        });

        const healthcareResult = await healthcareResponse.json();
        console.log('Healthcare POA response:', healthcareResult);
        
        if (healthcareResult.success) {
          results.push({ type: 'healthcare', ...healthcareResult.poa });
        } else {
          setError(`Healthcare POA failed: ${healthcareResult.error || JSON.stringify(healthcareResult)}`);
          return;
        }
      }

      setCreatedPOAs(results);
      setSuccess(true);
      
    } catch (err) {
      console.error('Submit error:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    const titles = [
      'Select POA Types',
      'Principal Information',
      'Add Agents',
      ...(formData.poaTypes.includes('financial') ? ['Financial Powers'] : []),
      ...(formData.poaTypes.includes('healthcare') ? ['Healthcare Powers'] : []),
      'Additional Options',
      'Review Details',
      'Legal Acknowledgment'
    ];
    return titles[currentStep - 1] || '';
  };

  const renderStepContent = () => {
    // Determine actual step content based on POA types selected
    let stepMapping: { [key: number]: string } = { 1: 'type', 2: 'principal', 3: 'agents' };
    let stepCounter = 4;
    
    if (formData.poaTypes.includes('financial')) {
      stepMapping[stepCounter] = 'financial-powers';
      stepCounter++;
    }
    
    if (formData.poaTypes.includes('healthcare')) {
      stepMapping[stepCounter] = 'healthcare-powers';
      stepCounter++;
    }
    
    stepMapping[stepCounter] = 'options';
    stepMapping[stepCounter + 1] = 'review';
    stepMapping[stepCounter + 2] = 'disclaimer';

    const stepType = stepMapping[currentStep];

    switch (stepType) {
      case 'type':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">What type of Power of Attorney do you need?</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.poaTypes.includes('financial')}
                  onChange={(e) => {
                    const types = e.target.checked 
                      ? [...formData.poaTypes, 'financial']
                      : formData.poaTypes.filter(t => t !== 'financial');
                    updateFormData('poaTypes', types);
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-blue-600">💰 Financial Power of Attorney</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Manage financial affairs, banking, real estate, investments, and business transactions.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.poaTypes.includes('healthcare')}
                  onChange={(e) => {
                    const types = e.target.checked 
                      ? [...formData.poaTypes, 'healthcare']
                      : formData.poaTypes.filter(t => t !== 'healthcare');
                    updateFormData('poaTypes', types);
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-green-600">🏥 Healthcare Power of Attorney</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Make medical decisions, end-of-life care, and healthcare treatment choices.
                  </div>
                </div>
              </label>
            </div>

            {formData.poaTypes.includes('financial') && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-3">Financial POA Type</h4>
                <div className="space-y-2">
                  {(['durable', 'springing', 'limited'] as const).map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="financialPoaType"
                        value={type}
                        checked={formData.financialPoaType === type}
                        onChange={(e) => updateFormData('financialPoaType', e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="capitalize">{type} POA</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 'principal':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Principal Information</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter your personal information as the person granting power of attorney.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                <input
                  type="text"
                  value={formData.principal.fullName}
                  onChange={(e) => updateFormData('principal.fullName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full legal name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email *</label>
                <input
                  type="email"
                  value={formData.principal.email}
                  onChange={(e) => updateFormData('principal.email', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  value={formData.principal.phone}
                  onChange={(e) => updateFormData('principal.phone', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              {formData.poaTypes.includes('healthcare') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.principal.dateOfBirth || ''}
                    onChange={(e) => updateFormData('principal.dateOfBirth', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Street Address *</label>
              <input
                type="text"
                value={formData.principal.address}
                onChange={(e) => updateFormData('principal.address', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text"
                  value={formData.principal.city}
                  onChange={(e) => updateFormData('principal.city', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State *</label>
                <select
                  value={formData.principal.state}
                  onChange={(e) => updateFormData('principal.state', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state.state} value={state.state}>
                      {state.stateName} ({state.state})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">ZIP Code *</label>
                <input
                  type="text"
                  value={formData.principal.zipCode}
                  onChange={(e) => updateFormData('principal.zipCode', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="12345"
                />
              </div>
            </div>
          </div>
        );

      case 'agents':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Add Agents</h3>
            <p className="text-sm text-gray-600 mb-4">
              Designate trusted individuals to act on your behalf. You need at least one primary agent.
            </p>

            <AgentForm
              agents={formData.agents}
              onChange={(agents) => updateFormData('agents', agents)}
              states={states}
            />
          </div>
        );

      case 'financial-powers':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Select Financial Powers to Grant</h3>
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
                <p className="text-gray-600">Loading financial power categories...</p>
              </div>
            ) : (
              <>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>{formData.grantedPowers.categoryIds.length} of {powerCategories.length}</strong> financial power categories selected
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

      case 'healthcare-powers':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Select Healthcare Powers to Grant</h3>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Healthcare Decision Authority</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries({
                  medicalTreatment: 'General Medical Treatment',
                  mentalHealthTreatment: 'Mental Health Treatment',
                  endOfLifeDecisions: 'End-of-Life Decisions',
                  organDonation: 'Organ Donation Decisions',
                  autopsyDecision: 'Autopsy Decisions',
                  dispositionOfRemains: 'Disposition of Remains'
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={formData.healthcarePowers[key as keyof typeof formData.healthcarePowers]}
                      onChange={(e) => updateFormData(`healthcarePowers.${key}`, e.target.checked)}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Life-Sustaining Treatment Preferences</h4>
              <div className="space-y-2">
                {[
                  { value: 'prolong_life', label: 'Prolong my life to the greatest extent possible' },
                  { value: 'comfort_care_only', label: 'Provide comfort care only. Do not prolong my life.' },
                  { value: 'agent_decides', label: 'Let my agent decide based on their best judgment' },
                  { value: 'not_specified', label: 'Not specified' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="lifeSustainingTreatment"
                      value={option.value}
                      checked={formData.lifeSustainingTreatment === option.value}
                      onChange={(e) => updateFormData('lifeSustainingTreatment', e.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Organ Donation Preferences</h4>
              <div className="space-y-2">
                {[
                  { value: 'any_needed', label: 'Donate any needed organs and tissues' },
                  { value: 'transplant_only', label: 'Donate for transplantation only' },
                  { value: 'research_only', label: 'Donate for research only' },
                  { value: 'no_donation', label: 'No organ donation' },
                  { value: 'not_specified', label: 'Not specified' }
                ].map(option => (
                  <label key={option.value} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="organDonationPreference"
                      value={option.value}
                      checked={formData.organDonationPreference === option.value}
                      onChange={(e) => updateFormData('organDonationPreference', e.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        );

      case 'options':
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
              
              {formData.poaTypes.includes('financial') && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Special Financial Instructions (Optional)
                  </label>
                  <textarea
                    value={formData.specialInstructions}
                    onChange={(e) => updateFormData('specialInstructions', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter any specific financial instructions or limitations for your agents..."
                  />
                </div>
              )}
              
              {formData.poaTypes.includes('healthcare') && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Healthcare Directives (Optional)
                  </label>
                  <textarea
                    value={formData.additionalDirectives}
                    onChange={(e) => updateFormData('additionalDirectives', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter any specific healthcare directives, treatment preferences, or medical instructions..."
                  />
                </div>
              )}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Review Your Information</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">POA Types Selected</h4>
              <ul className="list-disc list-inside space-y-1">
                {formData.poaTypes.map(type => (
                  <li key={type} className="capitalize">
                    {type} Power of Attorney
                    {type === 'financial' && ` (${formData.financialPoaType})`}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Principal</h4>
              <p>{formData.principal.fullName}</p>
              <p>{formData.principal.address}, {formData.principal.city}, {formData.principal.state} {formData.principal.zipCode}</p>
              <p>{formData.principal.email}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Agents ({formData.agents.length})</h4>
              {formData.agents.map((agent, idx) => (
                <div key={idx} className="mb-2 last:mb-0">
                  <p className="font-medium">{agent.fullName} ({agent.type})</p>
                  <p className="text-sm text-gray-600">{agent.email}</p>
                </div>
              ))}
            </div>

            {formData.poaTypes.includes('financial') && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Financial Powers</h4>
                <p>{formData.grantedPowers.categoryIds.length} categories selected</p>
              </div>
            )}

            {formData.poaTypes.includes('healthcare') && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Healthcare Powers</h4>
                <p>Life-sustaining treatment: {formData.lifeSustainingTreatment.replace('_', ' ')}</p>
                <p>Organ donation: {formData.organDonationPreference.replace('_', ' ')}</p>
              </div>
            )}
          </div>
        );

      case 'disclaimer':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Legal Acknowledgment</h3>
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

  if (success && createdPOAs.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="bg-green-600 -m-6 mb-6 px-6 py-6 rounded-t-lg">
              <h1 className="text-2xl font-bold text-white">✅ Power of Attorney Documents Created!</h1>
              <p className="text-green-100">Successfully created {createdPOAs.length} POA document(s)</p>
            </div>

            <div className="space-y-6">
              {createdPOAs.map((poa, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2 capitalize">{poa.type} Power of Attorney</h3>
                  <p className="text-gray-600 mb-4">Document ID: {poa.id}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => window.open(poa.generatedDocument, '_blank')}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-2xl mb-2">👀</span>
                      <span className="font-medium text-gray-900">View PDF</span>
                    </button>

                    <a
                      href={poa.generatedDocument}
                      download={`POA_${poa.type}_${formData.principal.fullName.replace(/\s+/g, '_')}.pdf`}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-2xl mb-2">💾</span>
                      <span className="font-medium text-gray-900">Download</span>
                    </a>

                    <button
                      onClick={() => {
                        const subject = `${poa.type.charAt(0).toUpperCase() + poa.type.slice(1)} Power of Attorney`;
                        const body = `Please find attached the Power of Attorney document.\n\nType: ${poa.type}\nPrincipal: ${formData.principal.fullName}\n\nDocument: ${poa.generatedDocument}`;
                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-2xl mb-2">📧</span>
                      <span className="font-medium text-gray-900">Share</span>
                    </button>

                    <button
                      onClick={() => {
                        setSuccess(false);
                        setCreatedPOAs([]);
                        setCurrentStep(1);
                        setFormData({
                          poaTypes: ['financial'],
                          financialPoaType: 'durable',
                          principal: { fullName: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' },
                          agents: [],
                          grantedPowers: { categoryIds: [], grantAllSubPowers: true },
                          healthcarePowers: {
                            medicalTreatment: true,
                            mentalHealthTreatment: false,
                            endOfLifeDecisions: false,
                            organDonation: false,
                            autopsyDecision: false,
                            dispositionOfRemains: false,
                          },
                          lifeSustainingTreatment: 'agent_decides',
                          organDonationPreference: 'not_specified',
                          coAgentsMustActJointly: false,
                          useStatutoryForm: true,
                          specialInstructions: '',
                          additionalDirectives: '',
                          disclaimerAccepted: false,
                        });
                      }}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <span className="text-2xl mb-2">➕</span>
                      <span className="font-medium text-gray-900">Create New</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 font-medium">
                ← Return to Dashboard
              </Link>
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
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <WizardStep
          currentStep={currentStep}
          totalSteps={getCurrentSteps()}
          title={getStepTitle()}
          onNext={currentStep === getCurrentSteps() ? handleSubmit : handleNext}
          onBack={currentStep > 1 ? handlePrevious : undefined}
          canGoNext={validateStep(currentStep)}
          isLastStep={currentStep === getCurrentSteps()}
          isSubmitting={isSubmitting}
        >
          {renderStepContent()}
        </WizardStep>
      </div>
    </div>
  );
}
