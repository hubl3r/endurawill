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
  
  // POA Type Configuration (matching validation schema)
  poaType: 'durable' | 'springing' | 'limited';
  isDurable: boolean;
  isSpringing: boolean;
  isLimited: boolean;
  
  // Springing POA fields
  springingCondition?: string;
  numberOfPhysiciansRequired?: number;
  physicianNames?: string[];
  
  // Limited POA fields
  specificPurpose?: string;
  expirationDate?: string;
  
  // Principal Information (matching schema)
  principal: {
    fullName: string;
    email: string;
    phone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    dateOfBirth?: string; // Will be converted to datetime
  };
  
  // Agents with proper address schema
  agents: Array<{
    type: 'primary' | 'successor' | 'co-agent';
    fullName: string;
    email?: string;
    phone?: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    relationship?: string;
    order?: number;
  }>;
  
  // Powers (matching schema)
  grantedPowers: {
    categoryIds: string[]; // Will be validated as UUIDs
    subPowerIds?: string[];
    grantAllSubPowers: boolean;
  };
  
  // Hot Powers Consent (required by schema)
  hotPowersConsent: {
    gifting: boolean;
    trustModification: boolean;
    beneficiaryChanges: boolean;
    realEstateGifting: boolean;
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
  
  // Execution Requirements (matching schema)
  witnesses?: Array<{
    fullName: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    relationship?: string;
  }>;
  
  notaryPublic?: {
    fullName: string;
    commissionNumber?: string;
    commissionExpiration?: string;
    county?: string;
    state?: string;
  };
  
  // Shared Options
  coAgentsMustActJointly: boolean;
  useStatutoryForm: boolean;
  additionalInstructions: string; // Changed from specialInstructions
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

// Authority, Liability, and Compensation Options
const AUTHORITY_CLAUSES = [
  {
    id: 'third_party_reliance',
    title: 'Third-Party Reliance',
    description: 'Any third party may rely conclusively on this POA without inquiry into agent\'s authority',
    text: 'Any third party may rely conclusively on this POA without inquiry into agent\'s authority'
  },
  {
    id: 'no_inquiry',
    title: 'No Further Inquiry Required',
    description: 'No person dealing with agent need inquire into existence of facts granting authority',
    text: 'No person dealing with agent need inquire into existence of facts granting authority.'
  },
  {
    id: 'hot_powers_initials',
    title: 'Hot Powers Require Separate Initials',
    description: 'Gifting, beneficiary changes, self-dealing must be separately initialed',
    text: 'For the following powers, Principal must provide separate initials: gifting exceeding annual exclusion, beneficiary designation changes, and transactions benefiting the Agent.'
  }
];

const LIABILITY_CLAUSES = [
  {
    id: 'good_faith',
    title: 'Good Faith Exculpation',
    description: 'Agent shall not be liable for acts done in good faith, even if mistaken',
    text: 'Agent shall not be liable for acts done in good faith, even if mistaken.'
  },
  {
    id: 'no_liability_inaction',
    title: 'No Liability for Non-Action',
    description: 'Agent not liable for declining to act unless required by fiduciary duty',
    text: 'Agent not liable for declining to act unless required by fiduciary duty.'
  },
  {
    id: 'indemnification',
    title: 'Principal Indemnification',
    description: 'Principal indemnifies agent against claims arising from good-faith acts',
    text: 'Principal indemnifies agent against claims arising from good-faith acts.'
  }
];

// Limitation options by power category
const LIMITATION_OPTIONS = {
  financial: [
    'No transactions over $10,000 without co-agent approval',
    'No transactions over $25,000 without court approval',
    'No transactions over $50,000 without family notification',
    'Agent must provide monthly accounting to [designated person]',
    'Agent must provide annual accounting to [designated person]',
    'No self-dealing transactions',
    'No gifts exceeding annual exclusion except to descendants',
    'No changes to beneficiary designations',
    'No changes to retirement account beneficiaries',
    'Powers expire 5 years from execution date',
    'Powers expire upon Principal\'s recovery of capacity',
    'All real estate transactions require court approval'
  ],
  healthcare: [
    'No withholding nutrition/hydration unless terminal',
    'No experimental treatment without ethics committee approval',
    'No psychiatric treatment without second opinion',
    'No organ donation without family consultation',
    'No DNR orders without consulting [named person]',
    'Agent must consult with attending physician before major decisions',
    'Agent must follow any existing advance directive',
    'No transfer to long-term care without family meeting'
  ]
};

export default function ProfessionalPOAWizard(): JSX.Element {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdPOAs, setCreatedPOAs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    poaTypes: ['financial'],
    poaType: 'durable',
    isDurable: true,
    isSpringing: false,
    isLimited: false,
    principal: { 
      fullName: '', 
      email: '', 
      phone: '', 
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: ''
      }
    },
    agents: [],
    grantedPowers: { categoryIds: [], subPowerIds: [], grantAllSubPowers: true },
    hotPowersConsent: {
      gifting: false,
      trustModification: false,
      beneficiaryChanges: false,
      realEstateGifting: false
    },
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
    additionalInstructions: '',
    additionalDirectives: '',
    disclaimerAccepted: false,
  });

  const [powerCategories, setPowerCategories] = useState<PowerCategory[]>([]);
  const [states, setStates] = useState<State[]>([]);

  // State management hooks
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

  const getStateRequirements = (state: string) => {
    // Simplified state requirements - in production this would come from API
    const requirements: { [key: string]: any } = {
      'TN': { notaryRequired: true, witnessesRequired: false, witnessCount: 0 },
      'NC': { notaryRequired: true, witnessesRequired: false, witnessCount: 0 },
      'FL': { notaryRequired: true, witnessesRequired: true, witnessCount: 2 },
      'CA': { notaryRequired: false, witnessesRequired: true, witnessCount: 2 },
      'TX': { notaryRequired: true, witnessesRequired: false, witnessCount: 0 },
    };
    
    return requirements[state] || { notaryRequired: true, witnessesRequired: false, witnessCount: 0 };
  };

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
        if (formData.poaType === 'springing') {
          return !!(formData.springingCondition && formData.numberOfPhysiciansRequired);
        }
        if (formData.poaType === 'limited') {
          return !!(formData.specificPurpose && formData.expirationDate);
        }
        return !!formData.poaType;
      case 3:
        return !!(formData.principal.fullName && formData.principal.email && 
                 formData.principal.address.street && formData.principal.address.city && 
                 formData.principal.address.state && formData.principal.address.zipCode);
      case 4:
        return formData.agents.length > 0 && 
               formData.agents.every(agent => !!(agent.fullName && agent.address.street && 
                 agent.address.city && agent.address.state && agent.address.zipCode));
      case 5:
        if (!formData.poaTypes.includes('financial')) return true;
        return formData.grantedPowers.categoryIds.length > 0;
      case 6:
        if (!formData.poaTypes.includes('healthcare')) return true;
        return Object.values(formData.healthcarePowers).some(v => v);
      case 7:
        return true; // Hot powers and additional options always valid
      case 8:
        return true; // Execution requirements auto-set by state
      case 9:
        return true; // Additional instructions optional
      case 10:
        return true; // Review always valid
      case 11:
        return formData.disclaimerAccepted;
      default:
        return true;
    }
  };

  const getCurrentSteps = (): number => {
    let steps = 6; // Type, Effective Date, Principal, Agents, Execution, Review
    
    if (formData.poaTypes.includes('financial')) steps += 2; // Financial Powers + Hot Powers
    if (formData.poaTypes.includes('healthcare')) steps += 1; // Healthcare Powers
    
    steps += 3; // Additional Options, Review, Legal Disclaimer
    
    return steps;
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
            address: formData.principal.address,
            dateOfBirth: formData.principal.dateOfBirth ? new Date(formData.principal.dateOfBirth + 'T00:00:00.000Z').toISOString() : undefined,
          },
          poaType: formData.poaType,
          state: formData.principal.address.state,
          isDurable: formData.isDurable,
          isSpringing: formData.isSpringing,
          isLimited: formData.isLimited,
          springingCondition: formData.springingCondition,
          numberOfPhysiciansRequired: formData.numberOfPhysiciansRequired,
          physicianNames: formData.physicianNames,
          specificPurpose: formData.specificPurpose,
          expirationDate: formData.expirationDate ? new Date(formData.expirationDate).toISOString() : undefined,
          coAgentsMustActJointly: formData.coAgentsMustActJointly,
          agents: formData.agents.map((agent, index) => ({
            type: agent.type,
            fullName: agent.fullName,
            email: agent.email,
            phone: agent.phone,
            address: agent.address,
            relationship: agent.relationship,
            order: agent.order || index + 1,
          })),
          grantedPowers: {
            categoryIds: formData.grantedPowers.categoryIds,
            subPowerIds: formData.grantedPowers.subPowerIds,
            grantAllSubPowers: formData.grantedPowers.grantAllSubPowers,
          },
          hotPowersConsent: formData.hotPowersConsent,
          witnesses: formData.witnesses,
          notaryPublic: formData.notaryPublic,
          useStatutoryForm: formData.useStatutoryForm,
          additionalInstructions: formData.additionalInstructions,
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
            address: formData.principal.address,
            dateOfBirth: formData.principal.dateOfBirth ? new Date(formData.principal.dateOfBirth + 'T00:00:00.000Z').toISOString() : undefined,
          },
          state: formData.principal.address.state,
          agents: formData.agents.map((agent, index) => ({
            type: agent.type,
            order: index + 1,
            fullName: agent.fullName,
            email: agent.email,
            relationship: agent.relationship,
            address: agent.address,
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
    const stepTitles: { [key: number]: string } = {};
    let stepNum = 1;
    
    stepTitles[stepNum++] = 'Select POA Types';
    stepTitles[stepNum++] = 'Effective Date';
    stepTitles[stepNum++] = 'Principal Information';
    stepTitles[stepNum++] = 'Add Agents';
    
    if (formData.poaTypes.includes('financial')) {
      stepTitles[stepNum++] = 'Financial Powers';
      stepTitles[stepNum++] = 'Hot Powers Consent';
    }
    
    if (formData.poaTypes.includes('healthcare')) {
      stepTitles[stepNum++] = 'Healthcare Powers';
    }
    
    stepTitles[stepNum++] = 'Execution Requirements';
    stepTitles[stepNum++] = 'Additional Instructions';
    stepTitles[stepNum++] = 'Review Details';
    stepTitles[stepNum++] = 'Legal Acknowledgment';
    
    return stepTitles[currentStep] || '';
  };

  const renderStepContent = () => {
    // Determine actual step content based on dynamic flow
    const stepMapping: { [key: number]: string } = {};
    let stepNum = 1;
    
    stepMapping[stepNum++] = 'type';
    stepMapping[stepNum++] = 'effective-date';
    stepMapping[stepNum++] = 'principal';
    stepMapping[stepNum++] = 'agents';
    
    if (formData.poaTypes.includes('financial')) {
      stepMapping[stepNum++] = 'financial-powers';
      stepMapping[stepNum++] = 'hot-powers';
    }
    
    if (formData.poaTypes.includes('healthcare')) {
      stepMapping[stepNum++] = 'healthcare-powers';
    }
    
    stepMapping[stepNum++] = 'execution';
    stepMapping[stepNum++] = 'options';
    stepMapping[stepNum++] = 'review';
    stepMapping[stepNum++] = 'disclaimer';

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
          </div>
        );

      case 'effective-date':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">When should this Power of Attorney become effective?</h3>
            
            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="poaType"
                  value="durable"
                  checked={formData.poaType === 'durable'}
                  onChange={(e) => {
                    updateFormData('poaType', 'durable');
                    updateFormData('isDurable', true);
                    updateFormData('isSpringing', false);
                    updateFormData('isLimited', false);
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-blue-600">🔒 Durable - Effective Immediately</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Powers begin immediately and continue even if you become incapacitated. This is the most common choice.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="poaType"
                  value="springing"
                  checked={formData.poaType === 'springing'}
                  onChange={(e) => {
                    updateFormData('poaType', 'springing');
                    updateFormData('isDurable', false);
                    updateFormData('isSpringing', true);
                    updateFormData('isLimited', false);
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-green-600">🌱 Springing - Effective Upon Incapacity</div>
                  <div className="text-sm text-gray-600 mt-1 mb-2">
                    Powers only become effective when you are determined to be incapacitated by a physician.
                  </div>
                  {formData.poaType === 'springing' && (
                    <div className="space-y-2 mt-3">
                      <input
                        type="text"
                        placeholder="Describe the condition that triggers this POA"
                        value={formData.springingCondition || ''}
                        onChange={(e) => updateFormData('springingCondition', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                      <select
                        value={formData.numberOfPhysiciansRequired || 1}
                        onChange={(e) => updateFormData('numberOfPhysiciansRequired', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value={1}>1 Physician Required</option>
                        <option value={2}>2 Physicians Required</option>
                      </select>
                    </div>
                  )}
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="radio"
                  name="poaType"
                  value="limited"
                  checked={formData.poaType === 'limited'}
                  onChange={(e) => {
                    updateFormData('poaType', 'limited');
                    updateFormData('isDurable', false);
                    updateFormData('isSpringing', false);
                    updateFormData('isLimited', true);
                  }}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-purple-600">⏱️ Limited - Specific Purpose & Duration</div>
                  <div className="text-sm text-gray-600 mt-1 mb-2">
                    Powers are limited to a specific purpose and may have an expiration date.
                  </div>
                  {formData.poaType === 'limited' && (
                    <div className="space-y-2 mt-3">
                      <input
                        type="text"
                        placeholder="Specific purpose (e.g., sell house, manage rental property)"
                        value={formData.specificPurpose || ''}
                        onChange={(e) => updateFormData('specificPurpose', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                      <input
                        type="datetime-local"
                        value={formData.expirationDate || ''}
                        onChange={(e) => updateFormData('expirationDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  )}
                </div>
              </label>
            </div>
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
                <label className="block text-sm font-medium text-gray-700">Full Legal Name *</label>
                <input
                  type="text"
                  value={formData.principal.fullName}
                  onChange={(e) => updateFormData('principal.fullName', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter your full legal name as it appears on ID"
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
                  value={formData.principal.phone || ''}
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
                value={formData.principal.address.street}
                onChange={(e) => updateFormData('principal.address.street', e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">City *</label>
                <input
                  type="text"
                  value={formData.principal.address.city}
                  onChange={(e) => updateFormData('principal.address.city', e.target.value)}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">State *</label>
                <select
                  value={formData.principal.address.state}
                  onChange={(e) => updateFormData('principal.address.state', e.target.value)}
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
                  value={formData.principal.address.zipCode}
                  onChange={(e) => updateFormData('principal.address.zipCode', e.target.value)}
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
              Successor agents will act if the primary agent is unable to serve.
            </p>

            <AgentForm
              agents={formData.agents.map(agent => ({
                type: agent.type,
                fullName: agent.fullName,
                email: agent.email || '',
                address: agent.address.street,
                city: agent.address.city,
                state: agent.address.state,
                zipCode: agent.address.zipCode,
              }))}
              onChange={(flatAgents) => {
                const nestedAgents = flatAgents.map(flatAgent => ({
                  type: flatAgent.type,
                  fullName: flatAgent.fullName,
                  email: flatAgent.email,
                  phone: undefined,
                  address: {
                    street: flatAgent.address,
                    city: flatAgent.city,
                    state: flatAgent.state,
                    zipCode: flatAgent.zipCode,
                  },
                  relationship: undefined,
                  order: undefined,
                }));
                updateFormData('agents', nestedAgents);
              }}
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
                <div className="grid grid-cols-1 gap-3">
                  {powerCategories.map((category, index) => (
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
                      <div className="flex-1">
                        <div className="font-medium">{String.fromCharCode(97 + index)}) {category.categoryName}</div>
                        <div className="text-sm text-gray-600 mt-1">{category.plainLanguageDesc}</div>
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

      case 'hot-powers':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Hot Powers - Special Consent Required</h3>
            <p className="text-sm text-gray-600 mb-6">
              These are "hot powers" that can significantly impact your estate and require separate consent. 
              Only select these if you specifically want to grant these dangerous powers.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="text-yellow-600 mr-2">⚠️</div>
                <div>
                  <h4 className="font-medium text-yellow-900">Important Warning</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    These powers allow your agent to make gifts, change beneficiaries, and modify trusts - potentially 
                    reducing your estate significantly. Only grant if you have complete trust in your agent.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.hotPowersConsent.gifting}
                  onChange={(e) => updateFormData('hotPowersConsent.gifting', e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-red-700">🎁 Gifting Powers</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Allow agent to make gifts that exceed the annual gift tax exclusion, potentially reducing your estate.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.hotPowersConsent.trustModification}
                  onChange={(e) => updateFormData('hotPowersConsent.trustModification', e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-red-700">📜 Trust Modification</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Allow agent to modify, terminate, or create trusts on your behalf.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.hotPowersConsent.beneficiaryChanges}
                  onChange={(e) => updateFormData('hotPowersConsent.beneficiaryChanges', e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-red-700">👥 Beneficiary Changes</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Allow agent to change beneficiaries on retirement accounts, insurance policies, and other assets.
                  </div>
                </div>
              </label>

              <label className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={formData.hotPowersConsent.realEstateGifting}
                  onChange={(e) => updateFormData('hotPowersConsent.realEstateGifting', e.target.checked)}
                  className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-red-700">🏠 Real Estate Gifting</div>
                  <div className="text-sm text-gray-600 mt-1">
                    Allow agent to gift real estate, including your home and other properties.
                  </div>
                </div>
              </label>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Alternative Recommendation</h4>
              <p className="text-sm text-gray-600">
                Consider leaving these unchecked and creating specific limited powers of attorney 
                for these purposes only when needed, with clear instructions and limitations.
              </p>
            </div>
          </div>
        );
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Limitations and Restrictions</h3>
            <p className="text-sm text-gray-600 mb-6">
              Add specific limitations to control how your agent exercises the powers you've granted.
            </p>

            {formData.poaTypes.includes('financial') && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Financial Limitations</h4>
                <div className="space-y-2">
                  {LIMITATION_OPTIONS.financial.map((limitation, index) => (
                    <label key={index} className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.limitations.financialLimitations.includes(limitation)}
                        onChange={(e) => {
                          const limitations = e.target.checked
                            ? [...formData.limitations.financialLimitations, limitation]
                            : formData.limitations.financialLimitations.filter(l => l !== limitation);
                          updateFormData('limitations.financialLimitations', limitations);
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm">{limitation}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {formData.poaTypes.includes('healthcare') && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Healthcare Limitations</h4>
                <div className="space-y-2">
                  {LIMITATION_OPTIONS.healthcare.map((limitation, index) => (
                    <label key={index} className="flex items-start space-x-3 cursor-pointer p-3 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.limitations.healthcareLimitations.includes(limitation)}
                        onChange={(e) => {
                          const limitations = e.target.checked
                            ? [...formData.limitations.healthcareLimitations, limitation]
                            : formData.limitations.healthcareLimitations.filter(l => l !== limitation);
                          updateFormData('limitations.healthcareLimitations', limitations);
                        }}
                        className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">{limitation}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Custom Limitations</h4>
              <textarea
                rows={4}
                placeholder="Enter any additional limitations or restrictions not covered above..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        );

      case 'authority-liability':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Authority & Liability Clauses</h3>
            <p className="text-sm text-gray-600 mb-6">
              Choose which legal protections and authority clauses to include in your POA.
            </p>

            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-4">Authority Clauses</h4>
                <p className="text-sm text-gray-600 mb-4">These clauses define what your agent can do:</p>
                <div className="space-y-3">
                  {AUTHORITY_CLAUSES.map((clause) => (
                    <label key={clause.id} className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.authorityClausesSelected.includes(clause.id)}
                        onChange={(e) => {
                          const clauses = e.target.checked
                            ? [...formData.authorityClausesSelected, clause.id]
                            : formData.authorityClausesSelected.filter(c => c !== clause.id);
                          updateFormData('authorityClausesSelected', clauses);
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">{clause.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{clause.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Liability Clauses</h4>
                <p className="text-sm text-gray-600 mb-4">These clauses protect your agent from liability:</p>
                <div className="space-y-3">
                  {LIABILITY_CLAUSES.map((clause) => (
                    <label key={clause.id} className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <input
                        type="checkbox"
                        checked={formData.liabilityClausesSelected.includes(clause.id)}
                        onChange={(e) => {
                          const clauses = e.target.checked
                            ? [...formData.liabilityClausesSelected, clause.id]
                            : formData.liabilityClausesSelected.filter(c => c !== clause.id);
                          updateFormData('liabilityClausesSelected', clauses);
                        }}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium">{clause.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{clause.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Agent Compensation</h4>
                <div className="space-y-3">
                  {[
                    { value: 'none', label: 'No Compensation', description: 'Agent serves without compensation' },
                    { value: 'reasonable', label: 'Reasonable Compensation', description: 'Agent entitled to reasonable compensation for services' },
                    { value: 'hourly', label: 'Hourly Rate', description: 'Agent compensated at a specific hourly rate' },
                    { value: 'professional', label: 'Professional Rate', description: 'Agent entitled to same compensation as professional fiduciary' }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 cursor-pointer p-4 border rounded-lg hover:bg-gray-50">
                      <input
                        type="radio"
                        name="compensationType"
                        value={option.value}
                        checked={formData.compensationType === option.value}
                        onChange={(e) => updateFormData('compensationType', e.target.value)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                        {option.value === 'hourly' && formData.compensationType === 'hourly' && (
                          <input
                            type="number"
                            placeholder="$ per hour"
                            value={formData.hourlyRate || ''}
                            onChange={(e) => updateFormData('hourlyRate', parseFloat(e.target.value))}
                            className="mt-2 w-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 'execution':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Execution Requirements</h3>
            <p className="text-sm text-gray-600 mb-6">
              Different states have different requirements for executing a Power of Attorney. 
              Here are the requirements for <strong>{states.find(s => s.state === formData.principal.address.state)?.stateName || formData.principal.address.state}</strong>:
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-blue-900 mb-2">State Requirements</h4>
              <p className="text-sm text-blue-800">
                Based on your state, this POA will require notarization and/or witnesses as determined by state law.
                You can add additional security measures below if desired.
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Notary Information (if required by state)</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Notary Full Name</label>
                  <input
                    type="text"
                    value={formData.notaryPublic?.fullName || ''}
                    onChange={(e) => updateFormData('notaryPublic.fullName', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Leave blank if not yet selected"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Commission Number</label>
                  <input
                    type="text"
                    value={formData.notaryPublic?.commissionNumber || ''}
                    onChange={(e) => updateFormData('notaryPublic.commissionNumber', e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-2">Important Execution Notes</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• All signatures must be made in the presence of notary and/or witnesses</li>
                <li>• Witnesses cannot be your agents, relatives, or beneficiaries</li>
                <li>• Keep the original document in a safe place</li>
                <li>• Provide copies to your agents and relevant institutions</li>
              </ul>
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
                <div>
                  <span className="font-medium">Co-agents must act jointly</span>
                  <div className="text-sm text-gray-600">If you have multiple primary agents, require them to act together</div>
                </div>
              </label>
              
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={formData.useStatutoryForm}
                  onChange={(e) => updateFormData('useStatutoryForm', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-medium">Use statutory form language (recommended)</span>
                  <div className="text-sm text-gray-600">Uses your state's standard legal language for better acceptance</div>
                </div>
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
                    placeholder="Enter any specific financial instructions, account details, or limitations for your agents..."
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    These instructions will be included in your Power of Attorney document.
                  </p>
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
                  <p className="mt-1 text-sm text-gray-500">
                    These directives will be included in your Healthcare Power of Attorney document.
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium mb-4">Review Your Power of Attorney</h3>
            
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">POA Types & Effective Date</h4>
                <div className="text-sm space-y-1">
                  {formData.poaTypes.map(type => (
                    <div key={type} className="capitalize">✓ {type} Power of Attorney</div>
                  ))}
                  <div>
                    <strong>Effective:</strong> {' '}
                    {formData.effectiveDate === 'immediate' && 'Immediately (Durable)'}
                    {formData.effectiveDate === 'incapacity' && 'Upon incapacity (Springing)'}
                    {formData.effectiveDate === 'specific_date' && `On ${formData.specificDate}`}
                    {formData.effectiveDate === 'limited_duration' && `Limited to ${formData.limitedDuration}`}
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Principal</h4>
                <div className="text-sm">
                  <div>{formData.principal.fullName}</div>
                  <div>{formData.principal.address}, {formData.principal.city}, {formData.principal.state} {formData.principal.zipCode}</div>
                  <div>{formData.principal.email}</div>
                  {formData.principal.phone && <div>{formData.principal.phone}</div>}
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Agents ({formData.agents.length})</h4>
                <div className="space-y-2 text-sm">
                  {formData.agents.map((agent, idx) => (
                    <div key={idx}>
                      <div className="font-medium">{agent.fullName} ({agent.type})</div>
                      <div className="text-gray-600">{agent.email}</div>
                    </div>
                  ))}
                </div>
              </div>

              {formData.poaTypes.includes('financial') && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Financial Powers</h4>
                  <div className="text-sm">
                    <div>{formData.grantedPowers.categoryIds.length} categories selected</div>
                    <div className="mt-2 text-blue-700">
                      ✓ Includes hot powers consent settings
                    </div>
                  </div>
                </div>
              )}

              {formData.poaTypes.includes('healthcare') && (
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Healthcare Powers</h4>
                  <div className="text-sm">
                    <div>Life-sustaining treatment: {formData.lifeSustainingTreatment.replace('_', ' ')}</div>
                    <div>Organ donation: {formData.organDonationPreference.replace('_', ' ')}</div>
                  </div>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Legal Clauses</h4>
                <div className="text-sm space-y-1">
                  <div>Authority clauses: {formData.authorityClausesSelected.length} selected</div>
                  <div>Liability clauses: {formData.liabilityClausesSelected.length} selected</div>
                  <div>Compensation: {formData.compensationType}</div>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Execution Requirements</h4>
                <div className="text-sm space-y-1">
                  <div>State: {formData.principal.address.state}</div>
                  {formData.notaryPublic?.fullName && <div>✓ Notary: {formData.notaryPublic.fullName}</div>}
                  {formData.witnesses && formData.witnesses.length > 0 && (
                    <div>✓ {formData.witnesses.length} witness(es) designated</div>
                  )}
                </div>
              </div>
            </div>
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
              <h1 className="text-2xl font-bold text-white">✅ Professional Power of Attorney Documents Created!</h1>
              <p className="text-green-100">Successfully created {createdPOAs.length} comprehensive POA document(s)</p>
            </div>

            <div className="space-y-6">
              {createdPOAs.map((poa, index) => (
                <div key={index} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg mb-2 capitalize">{poa.type} Power of Attorney</h3>
                  <p className="text-gray-600 mb-4">Document ID: {poa.id}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <button
                      onClick={() => window.open(poa.generatedDocument, '_blank')}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl mb-2">👀</span>
                      <span className="font-medium text-gray-900">View PDF</span>
                      <span className="text-xs text-gray-500">Review document</span>
                    </button>

                    <a
                      href={poa.generatedDocument}
                      download={`POA_${poa.type}_${formData.principal.fullName.replace(/\s+/g, '_')}.pdf`}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl mb-2">💾</span>
                      <span className="font-medium text-gray-900">Download</span>
                      <span className="text-xs text-gray-500">Save to device</span>
                    </a>

                    <button
                      onClick={() => {
                        const subject = `${poa.type.charAt(0).toUpperCase() + poa.type.slice(1)} Power of Attorney - ${formData.principal.fullName}`;
                        const body = `Professional Power of Attorney document created.\n\nType: ${poa.type} POA\nPrincipal: ${formData.principal.fullName}\nCreated: ${new Date().toLocaleDateString()}\n\nDocument: ${poa.generatedDocument}`;
                        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                      }}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl mb-2">📧</span>
                      <span className="font-medium text-gray-900">Share</span>
                      <span className="text-xs text-gray-500">Email document</span>
                    </button>

                    <button
                      onClick={() => {
                        setSuccess(false);
                        setCreatedPOAs([]);
                        setCurrentStep(1);
                        // Reset form
                      }}
                      className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-2xl mb-2">➕</span>
                      <span className="font-medium text-gray-900">Create New</span>
                      <span className="text-xs text-gray-500">Another POA</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="text-blue-600 hover:text-blue-500 font-medium">
                  ← Return to Dashboard
                </Link>
                <div className="text-sm text-gray-600">
                  Remember to execute your POA according to your state's requirements
                </div>
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
