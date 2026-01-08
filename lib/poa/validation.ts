// lib/poa/validation.ts
// Validation schemas for Power of Attorney creation

import { z } from 'zod';

// ============================================
// SHARED SCHEMAS
// ============================================

const addressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2-letter code'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
});

const agentSchema = z.object({
  type: z.enum(['primary', 'successor', 'co_agent']),
  fullName: z.string().min(1, 'Agent name is required'),
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  address: addressSchema,
  relationship: z.string().optional(),
  order: z.number().int().min(1).optional(),
});

const witnessSchema = z.object({
  fullName: z.string().min(1, 'Witness name is required'),
  address: addressSchema,
  relationship: z.string().optional(),
});

// ============================================
// FINANCIAL POA SCHEMA
// ============================================

export const createFinancialPOASchema = z.object({
  // Principal Information
  principal: z.object({
    userId: z.string().uuid('Invalid user ID'),
    tenantId: z.string().uuid('Invalid tenant ID'),
    fullName: z.string().min(1, 'Principal name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: addressSchema,
    dateOfBirth: z.string().datetime().optional(),
  }),

  // POA Type and Configuration
  poaType: z.enum(['durable', 'springing', 'limited']),
  state: z.string().length(2, 'State must be 2-letter code'),
  
  // Durability
  isDurable: z.boolean().default(true),
  
  // Springing POA Fields (conditional)
  isSpringing: z.boolean().default(false),
  springingCondition: z.string().optional(),
  numberOfPhysiciansRequired: z.number().int().min(1).max(2).optional(),
  physicianNames: z.array(z.string()).optional(),
  
  // Limited POA Fields (conditional)
  isLimited: z.boolean().default(false),
  specificPurpose: z.string().optional(),
  expirationDate: z.string().datetime().optional(),
  
  // Agents
  agents: z.array(agentSchema).min(1, 'At least one agent is required'),
  coAgentsMustActJointly: z.boolean().default(false),
  
  // Powers
  grantedPowers: z.object({
    // Array of category IDs
    categoryIds: z.array(z.string().uuid()).min(1, 'At least one power category must be selected'),
    // Optional: specific sub-powers within categories
    subPowerIds: z.array(z.string().uuid()).optional(),
    // Whether to grant all powers within selected categories
    grantAllSubPowers: z.boolean().default(true),
  }),
  
  // Hot Powers (dangerous powers requiring separate consent)
  hotPowersConsent: z.object({
    gifting: z.boolean().default(false),
    trustModification: z.boolean().default(false),
    beneficiaryChanges: z.boolean().default(false),
    realEstateGifting: z.boolean().default(false),
  }).optional(),
  
  // Execution Requirements
  witnesses: z.array(witnessSchema).optional(),
  notaryPublic: z.object({
    fullName: z.string().min(1, 'Notary name is required'),
    commissionNumber: z.string().optional(),
    commissionExpiration: z.string().datetime().optional(),
    county: z.string().optional(),
    state: z.string().length(2).optional(),
  }).optional(),
  
  // Metadata
  useStatutoryForm: z.boolean().default(true),
  additionalInstructions: z.string().optional(),
  
  // Professional POA Features
  
  // Limitations and Restrictions
  limitations: z.object({
    financialLimitations: z.array(z.string()).optional(),
    prohibitedActions: z.array(z.string()).optional(),
    reportingRequirements: z.array(z.string()).optional(),
    timeRestrictions: z.array(z.string()).optional(),
    customLimitations: z.string().optional(),
  }).optional(),
  
  // Authority Clauses
  authorityClausesSelected: z.array(z.enum([
    'third_party_reliance',
    'no_inquiry',
    'hot_powers_initials'
  ])).default(['third_party_reliance']),
  
  // Liability Clauses  
  liabilityClausesSelected: z.array(z.enum([
    'good_faith',
    'no_liability_inaction',
    'indemnification'
  ])).default(['good_faith']),
  
  // Compensation
  compensationType: z.enum(['none', 'reasonable', 'hourly', 'professional']).default('reasonable'),
  hourlyRate: z.number().positive().optional(),
  
  // Execution Requirements (state-specific)
  executionRequirements: z.object({
    notaryRequired: z.boolean().default(true),
    witnessesRequired: z.boolean().default(false),
    witnessCount: z.number().int().min(0).max(4).default(0),
    additionalWitnesses: z.boolean().default(false),
    additionalNotarization: z.boolean().default(false),
  }).optional(),
  
}).refine(
  (data) => {
    // If springing, require springing fields
    if (data.isSpringing) {
      return !!data.springingCondition && !!data.numberOfPhysiciansRequired;
    }
    return true;
  },
  {
    message: 'Springing POA requires springing condition and number of physicians',
    path: ['springingCondition'],
  }
).refine(
  (data) => {
    // If limited, require purpose and expiration
    if (data.isLimited) {
      return !!data.specificPurpose && !!data.expirationDate;
    }
    return true;
  },
  {
    message: 'Limited POA requires specific purpose and expiration date',
    path: ['specificPurpose'],
  }
).refine(
  (data) => {
    // If state requires witnesses, must provide them
    // This would need state requirements lookup in real implementation
    return true; // Placeholder
  },
  {
    message: 'This state requires witnesses',
    path: ['witnesses'],
  }
);

export type CreateFinancialPOAInput = z.infer<typeof createFinancialPOASchema>;

// ============================================
// HEALTHCARE POA SCHEMA
// ============================================

export const createHealthcarePOASchema = z.object({
  // Principal Information
  principal: z.object({
    userId: z.string().uuid('Invalid user ID'),
    tenantId: z.string().uuid('Invalid tenant ID'),
    fullName: z.string().min(1, 'Principal name is required'),
    email: z.string().email('Invalid email address'),
    phone: z.string().optional(),
    address: addressSchema,
    dateOfBirth: z.string().datetime().optional(),
  }),

  // State
  state: z.string().length(2, 'State must be 2-letter code'),

  // Healthcare Agents
  agents: z.array(agentSchema).min(1, 'At least one healthcare agent is required'),

  // Healthcare Powers
  healthcarePowers: z.object({
    medicalTreatment: z.boolean().default(true),
    mentalHealthTreatment: z.boolean().default(false),
    endOfLifeDecisions: z.boolean().default(false),
    organDonation: z.boolean().default(false),
    autopsyDecision: z.boolean().default(false),
    dispositionOfRemains: z.boolean().default(false),
  }),

  // Life-Sustaining Treatment Preferences
  lifeSustainingTreatment: z.enum([
    'prolong_life',
    'comfort_care_only',
    'agent_decides',
    'not_specified'
  ]).default('agent_decides'),

  // Additional Directives
  additionalDirectives: z.string().optional(),
  
  // Healthcare Limitations
  limitations: z.object({
    healthcareLimitations: z.array(z.string()).optional(),
    customDirectives: z.string().optional(),
  }).optional(),

  // Organ Donation Preferences
  organDonation: z.enum([
    'any_needed',
    'transplant_only',
    'research_only',
    'no_donation',
    'not_specified'
  ]).optional(),

  // Witnesses (typically 2 required for healthcare POA)
  witnesses: z.array(witnessSchema).min(2, 'Healthcare POA typically requires 2 witnesses'),

  // Notary (some states allow notary instead of witnesses)
  notaryPublic: z.object({
    fullName: z.string().min(1, 'Notary name is required'),
    commissionNumber: z.string().optional(),
    commissionExpiration: z.string().datetime().optional(),
    county: z.string().optional(),
    state: z.string().length(2).optional(),
  }).optional(),

  // Metadata
  useStatutoryForm: z.boolean().default(true),
});

export type CreateHealthcarePOAInput = z.infer<typeof createHealthcarePOASchema>;

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Validate financial POA input
 */
export function validateFinancialPOA(input: unknown) {
  return createFinancialPOASchema.safeParse(input);
}

/**
 * Validate healthcare POA input
 */
export function validateHealthcarePOA(input: unknown) {
  return createHealthcarePOASchema.safeParse(input);
}

/**
 * Check if state allows springing POAs
 * @param state - 2-letter state code
 * @returns boolean
 */
export async function stateAllowsSpringing(state: string): Promise<boolean> {
  // This would query the StateRequirements table
  // For now, hardcode known states that ban springing
  const banningSpringing = ['FL'];
  return !banningSpringing.includes(state.toUpperCase());
}

/**
 * Get witness requirements for state
 * @param state - 2-letter state code
 * @returns object with witness requirements
 */
export async function getWitnessRequirements(state: string) {
  // This would query StateRequirements table
  // Placeholder implementation
  return {
    required: true,
    numberOfWitnesses: 2,
    agentCannotBeWitness: true,
    notaryCannotBeWitness: false,
  };
}

/**
 * Validate agent email is unique (not already used by another agent for this principal)
 */
export function validateUniqueAgentEmail(agents: Array<{ email?: string }>) {
  const emails = agents.map(a => a.email).filter(Boolean);
  const uniqueEmails = new Set(emails);
  
  if (emails.length !== uniqueEmails.size) {
    return {
      success: false,
      error: 'Each agent must have a unique email address',
    };
  }
  
  return { success: true };
}

/**
 * Validate agent order for co-agents and successors
 */
export function validateAgentOrder(agents: Array<{ type: string; order?: number }>) {
  const successors = agents.filter(a => a.type === 'successor');
  
  // Successors must have unique, sequential order numbers
  if (successors.length > 0) {
    const orders = successors.map(s => s.order).filter(Boolean) as number[];
    const uniqueOrders = new Set(orders);
    
    if (orders.length !== uniqueOrders.size) {
      return {
        success: false,
        error: 'Successor agents must have unique order numbers',
      };
    }
    
    // Orders should be sequential starting from 1
    const sortedOrders = [...orders].sort((a, b) => a - b);
    for (let i = 0; i < sortedOrders.length; i++) {
      if (sortedOrders[i] !== i + 1) {
        return {
          success: false,
          error: 'Successor agent order must be sequential starting from 1',
        };
      }
    }
  }
  
  return { success: true };
}
