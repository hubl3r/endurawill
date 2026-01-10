// lib/wizards/documents/financial-poa/config.ts
// File path: /lib/wizards/documents/financial-poa/config.ts

import { z } from 'zod';
import { WizardDocument, WizardSection, WizardStep } from '../../core/WizardEngine';

// ============================================
// VALIDATION SCHEMAS
// ============================================

const AddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2, 'Use 2-letter state code'),
  zipCode: z.string().min(5, 'ZIP code must be at least 5 digits').max(10, 'Invalid ZIP code'),
});

const PrincipalSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  dateOfBirth: z.string().optional(),
  address: AddressSchema,
});

const AgentSchema = z.object({
  type: z.enum(['primary', 'successor', 'co-agent']),
  fullName: z.string().min(2, 'Agent name is required'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: AddressSchema,
  relationship: z.string().optional(),
  order: z.number().optional(),
});

const PowerLimitationSchema = z.object({
  categoryId: z.string().uuid(),
  limitationType: z.enum(['financial_cap', 'approval_requirement', 'prohibition', 'time_restriction', 'custom']),
  dollarLimit: z.number().optional(),
  requiresCoAgent: z.boolean().default(false),
  requiresCourtApproval: z.boolean().default(false),
  requiresFamilyNotification: z.boolean().default(false),
  prohibitSelfDealing: z.boolean().default(false),
  prohibitGifting: z.boolean().default(false),
  expirationDate: z.string().optional(),
  customText: z.string().optional(),
});

const NotarySchema = z.object({
  fullName: z.string().min(2, 'Notary name is required'),
  commissionNumber: z.string().optional(),
  commissionExpiration: z.string().optional(),
  county: z.string().optional(),
  state: z.string().min(2).max(2),
});

// ============================================
// STEP DEFINITIONS
// ============================================

const documentTypeStep: WizardStep = {
  id: 'document-type',
  title: 'Document Type & Effective Date',
  description: 'Choose when your Power of Attorney becomes effective',
  component: 'DocumentTypeSelector',
  validation: z.object({
    poaType: z.enum(['durable', 'springing', 'limited']),
    isDurable: z.boolean(),
    isSpringing: z.boolean(),
    isLimited: z.boolean(),
    springingCondition: z.string().optional(),
    numberOfPhysiciansRequired: z.number().min(1).max(3).default(1),
    specificPurpose: z.string().optional(),
    expirationDate: z.string().optional(),
  }),
  estimatedMinutes: 3,
};

const principalInfoStep: WizardStep = {
  id: 'principal-info',
  title: 'Principal Information',
  description: 'Your personal information as the person granting power',
  component: 'PrincipalForm',
  validation: z.object({
    principal: PrincipalSchema,
  }),
  estimatedMinutes: 4,
};

const agentSelectionStep: WizardStep = {
  id: 'agent-selection',
  title: 'Agent Selection',
  description: 'Choose who will act on your behalf',
  component: 'AgentSelectionForm',
  validation: z.object({
    agents: z.array(AgentSchema).min(1, 'At least one primary agent is required'),
  }),
  estimatedMinutes: 6,
};

const agentHierarchyStep: WizardStep = {
  id: 'agent-hierarchy',
  title: 'Agent Authority & Co-Agent Rules',
  description: 'Set how multiple agents work together',
  component: 'AgentHierarchyForm',
  validation: z.object({
    coAgentsMustActJointly: z.boolean().default(false),
    successorActivationRules: z.string().optional(),
  }),
  conditional: (data) => data.agents?.length > 1,
  estimatedMinutes: 3,
};

const powerCategoriesStep: WizardStep = {
  id: 'power-categories',
  title: 'Power Categories',
  description: 'Select which powers to grant your agent',
  component: 'PowerCategoriesSelector',
  validation: z.object({
    grantedPowers: z.object({
      categoryIds: z.array(z.string().uuid()).min(1, 'Select at least one power category'),
      grantAllSubPowers: z.boolean().default(true),
      subPowerIds: z.array(z.string().uuid()).optional(),
    }),
  }),
  estimatedMinutes: 5,
};

const powerLimitationsStep: WizardStep = {
  id: 'power-limitations',
  title: 'Power Limitations & Restrictions',
  description: 'Add limitations to the powers you selected',
  component: 'PowerLimitationsManager',
  validation: z.object({
    powerLimitations: z.array(PowerLimitationSchema).optional(),
    additionalInstructions: z.string().optional(),
  }),
  conditional: (data) => data.grantedPowers?.categoryIds?.length > 0,
  estimatedMinutes: 8,
};

const hotPowersStep: WizardStep = {
  id: 'hot-powers',
  title: 'Hot Powers Consent',
  description: 'Special consent for high-risk powers',
  component: 'HotPowersConsent',
  validation: z.object({
    hotPowersConsent: z.object({
      gifting: z.boolean().default(false),
      trustModification: z.boolean().default(false),
      beneficiaryChanges: z.boolean().default(false),
      realEstateGifting: z.boolean().default(false),
    }),
  }),
  conditional: (data) => {
    // Show if any selected powers are "hot powers"
    const hotPowerCategories = ['GIFTS', 'TRUST_MODIFICATION', 'BENEFICIARY_CHANGES'];
    return data.grantedPowers?.categoryIds?.some((id: string) => 
      hotPowerCategories.includes(id)
    ) || false;
  },
  estimatedMinutes: 4,
};

const professionalFeaturesStep: WizardStep = {
  id: 'professional-features',
  title: 'Authority & Liability Clauses',
  description: 'Professional protections and authority level',
  component: 'ProfessionalFeatures',
  validation: z.object({
    authorityType: z.enum(['standard', 'broad', 'limited']).default('standard'),
    liabilityWaiver: z.enum(['none', 'good_faith', 'full']).default('good_faith'),
    compensationType: z.enum(['none', 'reasonable', 'hourly', 'percentage']).default('none'),
    hourlyRate: z.number().optional(),
    thirdPartyReliance: z.boolean().default(true),
  }),
  isOptional: true,
  estimatedMinutes: 5,
};

const executionRequirementsStep: WizardStep = {
  id: 'execution-requirements',
  title: 'Notary & Witnesses',
  description: 'State-specific execution requirements',
  component: 'ExecutionRequirements',
  validation: z.object({
    notaryPublic: NotarySchema.optional(),
    witnesses: z.array(z.object({
      fullName: z.string().min(2),
      address: AddressSchema,
      relationship: z.string().optional(),
    })).optional(),
    useStatutoryForm: z.boolean().default(false),
  }),
  estimatedMinutes: 4,
};

const reviewStep: WizardStep = {
  id: 'review',
  title: 'Review & Confirm',
  description: 'Review all information before creating your POA',
  component: 'ReviewAndConfirm',
  validation: z.object({
    disclaimerAccepted: z.boolean().refine(val => val === true, 'You must accept the disclaimer'),
    finalConfirmation: z.boolean().refine(val => val === true, 'Final confirmation required'),
  }),
  estimatedMinutes: 3,
};

// ============================================
// SECTION DEFINITIONS
// ============================================

const basicInformationSection: WizardSection = {
  id: 'basic-information',
  title: 'Basic Information',
  description: 'Document type and your personal details',
  steps: [documentTypeStep, principalInfoStep],
  estimatedMinutes: 7,
  icon: 'user-circle',
  color: 'blue',
};

const agentManagementSection: WizardSection = {
  id: 'agent-management',
  title: 'Agent Selection',
  description: 'Choose and configure your agents',
  steps: [agentSelectionStep, agentHierarchyStep],
  estimatedMinutes: 9,
  icon: 'users',
  color: 'green',
};

const powerConfigurationSection: WizardSection = {
  id: 'power-configuration',
  title: 'Powers & Limitations',
  description: 'Define what your agent can do and any restrictions',
  steps: [powerCategoriesStep, powerLimitationsStep, hotPowersStep],
  estimatedMinutes: 17,
  icon: 'shield-check',
  color: 'purple',
};

const advancedFeaturesSection: WizardSection = {
  id: 'advanced-features',
  title: 'Professional Features',
  description: 'Authority clauses and professional protections',
  steps: [professionalFeaturesStep],
  estimatedMinutes: 5,
  icon: 'briefcase',
  color: 'amber',
};

const executionSection: WizardSection = {
  id: 'execution',
  title: 'Execution & Review',
  description: 'Notary requirements and final review',
  steps: [executionRequirementsStep, reviewStep],
  estimatedMinutes: 7,
  icon: 'document-check',
  color: 'emerald',
};

// ============================================
// COMPLETE DOCUMENT CONFIGURATION
// ============================================

const globalValidationSchema = z.object({
  // All step schemas combined
  poaType: z.enum(['durable', 'springing', 'limited']),
  principal: PrincipalSchema,
  agents: z.array(AgentSchema).min(1),
  grantedPowers: z.object({
    categoryIds: z.array(z.string().uuid()).min(1),
    grantAllSubPowers: z.boolean().default(true),
  }),
  hotPowersConsent: z.object({
    gifting: z.boolean(),
    trustModification: z.boolean(),
    beneficiaryChanges: z.boolean(),
    realEstateGifting: z.boolean(),
  }),
  disclaimerAccepted: z.boolean().refine(val => val === true),
  finalConfirmation: z.boolean().refine(val => val === true),
});

export const financialPOADocument: WizardDocument = {
  id: 'financial-poa',
  title: 'Financial Power of Attorney',
  type: 'financial-poa',
  description: 'Create a comprehensive financial power of attorney with professional features and state-specific compliance.',
  sections: [
    basicInformationSection,
    agentManagementSection,
    powerConfigurationSection,
    advancedFeaturesSection,
    executionSection,
  ],
  globalValidation: globalValidationSchema,
  estimatedMinutes: 45,
};

// ============================================
// POWER CATEGORIES DATA
// ============================================

export interface PowerCategory {
  id: string;
  categoryName: string;
  shortCode: string;
  plainLanguageDesc: string;
  isHotPower: boolean;
  isStandardPower: boolean;
  commonLimitations: string[];
}

export const standardPowerCategories: PowerCategory[] = [
  {
    id: 'banking',
    categoryName: 'Banking and Financial Institutions',
    shortCode: 'BANK',
    plainLanguageDesc: 'Open, close, and manage bank accounts, make deposits and withdrawals, and handle all banking transactions.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['dollar_limits', 'account_types', 'transaction_frequency'],
  },
  {
    id: 'safe_deposit_box',
    categoryName: 'Safe Deposit Box',
    shortCode: 'SDB',
    plainLanguageDesc: 'Access safe deposit boxes, add or remove contents, and manage box rental agreements.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['access_restrictions', 'content_limitations'],
  },
  {
    id: 'lending_borrowing',
    categoryName: 'Lending and Borrowing',
    shortCode: 'LOAN',
    plainLanguageDesc: 'Make loans, borrow money, sign promissory notes, and manage credit agreements.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['loan_amount_limits', 'interest_rate_caps', 'collateral_restrictions'],
  },
  {
    id: 'government_benefits',
    categoryName: 'Government Benefits',
    shortCode: 'GOVT',
    plainLanguageDesc: 'Apply for and manage Social Security, Medicare, veterans benefits, and other government programs.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['benefit_types', 'application_restrictions'],
  },
  {
    id: 'retirement_plans',
    categoryName: 'Retirement Plans',
    shortCode: 'RET',
    plainLanguageDesc: 'Manage 401(k), IRA, pension, and other retirement accounts and distributions.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['distribution_limits', 'investment_restrictions', 'beneficiary_changes'],
  },
  {
    id: 'taxes',
    categoryName: 'Tax Matters',
    shortCode: 'TAX',
    plainLanguageDesc: 'File tax returns, pay taxes, handle audits, and manage all tax-related matters.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['filing_restrictions', 'refund_handling', 'audit_representation'],
  },
  {
    id: 'insurance',
    categoryName: 'Insurance',
    shortCode: 'INS',
    plainLanguageDesc: 'Buy, modify, and cancel insurance policies, file claims, and manage coverage.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['policy_types', 'coverage_limits', 'beneficiary_restrictions'],
  },
  {
    id: 'real_estate',
    categoryName: 'Real Estate',
    shortCode: 'RE',
    plainLanguageDesc: 'Buy, sell, lease, and manage real property, including mortgages and property management.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['property_value_limits', 'transaction_approval', 'primary_residence_protection'],
  },
  {
    id: 'personal_property',
    categoryName: 'Personal Property',
    shortCode: 'PROP',
    plainLanguageDesc: 'Buy, sell, and manage personal property including vehicles, collectibles, and household items.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['property_value_limits', 'sentimental_items', 'family_heirlooms'],
  },
  {
    id: 'property_management',
    categoryName: 'Property Management',
    shortCode: 'MGMT',
    plainLanguageDesc: 'Manage rental properties, collect rents, handle repairs, and deal with tenants.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['repair_amount_limits', 'eviction_restrictions', 'lease_terms'],
  },
  {
    id: 'gifts',
    categoryName: 'Gifts and Transfers',
    shortCode: 'GIFT',
    plainLanguageDesc: 'Make gifts and transfers to family, charities, and other recipients.',
    isHotPower: true,
    isStandardPower: true,
    commonLimitations: ['annual_gift_limits', 'recipient_restrictions', 'tax_considerations'],
  },
  {
    id: 'legal_proceedings',
    categoryName: 'Legal Proceedings',
    shortCode: 'LEGAL',
    plainLanguageDesc: 'Hire attorneys, pursue legal claims, and handle litigation matters.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['case_value_limits', 'attorney_selection', 'settlement_approval'],
  },
  {
    id: 'business_operations',
    categoryName: 'Business Operations',
    shortCode: 'BIZ',
    plainLanguageDesc: 'Operate businesses, make business decisions, and manage business finances.',
    isHotPower: false,
    isStandardPower: true,
    commonLimitations: ['business_scope', 'transaction_limits', 'major_decisions'],
  },
  {
    id: 'digital_assets',
    categoryName: 'Digital Assets',
    shortCode: 'DIGI',
    plainLanguageDesc: 'Manage online accounts, digital assets, cryptocurrency, and electronic records.',
    isHotPower: false,
    isStandardPower: false, // Newer category, not in all state forms
    commonLimitations: ['platform_restrictions', 'asset_types', 'security_requirements'],
  },
];

// ============================================
// STATE-SPECIFIC CONFIGURATIONS
// ============================================

export interface StateConfig {
  state: string;
  stateName: string;
  notaryRequired: boolean;
  witnessesRequired: boolean;
  numberOfWitnesses: number;
  hasStatutoryForm: boolean;
  powerCategories: PowerCategory[];
  specialRequirements: string[];
}

export const getStateConfig = async (state: string): Promise<StateConfig | null> => {
  // This would fetch from your StateRequirements table
  // For now, return a default configuration
  return {
    state: state.toUpperCase(),
    stateName: 'Default State',
    notaryRequired: true,
    witnessesRequired: false,
    numberOfWitnesses: 0,
    hasStatutoryForm: false,
    powerCategories: standardPowerCategories,
    specialRequirements: [],
  };
};
