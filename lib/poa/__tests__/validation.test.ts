import { 
  validateFinancialPOA, 
  validateHealthcarePOA,
  validateUniqueAgentEmail,
  validateAgentOrder 
} from '../validation';

// Test 1: Valid Durable POA
console.log('=== Test 1: Valid Durable POA ===');
const validDurablePOA = {
  principal: {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    fullName: 'John Doe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      city: 'Miami',
      state: 'FL',
      zipCode: '33101'
    }
  },
  poaType: 'durable' as const,
  state: 'FL',
  isDurable: true,
  isSpringing: false,
  isLimited: false,
  agents: [
    {
      type: 'primary' as const,
      fullName: 'Jane Doe',
      email: 'jane@example.com',
      address: {
        street: '456 Oak Ave',
        city: 'Miami',
        state: 'FL',
        zipCode: '33102'
      }
    }
  ],
  grantedPowers: {
    categoryIds: ['123e4567-e89b-12d3-a456-426614174002'],
    grantAllSubPowers: true
  }
};

const result1 = validateFinancialPOA(validDurablePOA);
console.log('Valid durable POA:', result1.success ? '✅ PASSED' : '❌ FAILED');
if (!result1.success) console.log('Errors:', result1.error);

// Test 2: Invalid - Missing Required Fields
console.log('\n=== Test 2: Missing Required Fields ===');
const invalidPOA = {
  principal: {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'John Doe',
    // Missing email, tenantId, address
  }
};

const result2 = validateFinancialPOA(invalidPOA);
console.log('Missing fields:', result2.success ? '❌ FAILED (should reject)' : '✅ PASSED (correctly rejected)');
if (!result2.success) console.log('Expected errors:', result2.error.errors.map((e: any) => e.message));

// Test 3: Invalid Email
console.log('\n=== Test 3: Invalid Email ===');
const invalidEmail = {
  ...validDurablePOA,
  principal: {
    ...validDurablePOA.principal,
    email: 'not-an-email'
  }
};

const result3 = validateFinancialPOA(invalidEmail);
console.log('Invalid email:', result3.success ? '❌ FAILED' : '✅ PASSED');

// Test 4: Invalid ZIP Code
console.log('\n=== Test 4: Invalid ZIP Code ===');
const invalidZip = {
  ...validDurablePOA,
  principal: {
    ...validDurablePOA.principal,
    address: {
      ...validDurablePOA.principal.address,
      zipCode: '1234' // Too short
    }
  }
};

const result4 = validateFinancialPOA(invalidZip);
console.log('Invalid ZIP:', result4.success ? '❌ FAILED' : '✅ PASSED');

// Test 5: Springing POA Without Physicians
console.log('\n=== Test 5: Springing POA Missing Physicians ===');
const springingNoDocs = {
  ...validDurablePOA,
  isSpringing: true,
  // Missing springingCondition and numberOfPhysiciansRequired
};

const result5 = validateFinancialPOA(springingNoDocs);
console.log('Springing without physicians:', result5.success ? '❌ FAILED' : '✅ PASSED');

// Test 6: Valid Springing POA
console.log('\n=== Test 6: Valid Springing POA ===');
const validSpringing = {
  ...validDurablePOA,
  state: 'TX', // TX allows springing
  isSpringing: true,
  springingCondition: 'Incapacity as certified by physician',
  numberOfPhysiciansRequired: 1
};

const result6 = validateFinancialPOA(validSpringing);
console.log('Valid springing:', result6.success ? '✅ PASSED' : '❌ FAILED');

// Test 7: Limited POA Without Expiration
console.log('\n=== Test 7: Limited POA Missing Expiration ===');
const limitedNoExpiration = {
  ...validDurablePOA,
  isLimited: true,
  specificPurpose: 'Sell house',
  // Missing expirationDate
};

const result7 = validateFinancialPOA(limitedNoExpiration);
console.log('Limited without expiration:', result7.success ? '❌ FAILED' : '✅ PASSED');

// Test 8: Valid Healthcare POA
console.log('\n=== Test 8: Valid Healthcare POA ===');
const validHealthcare = {
  principal: validDurablePOA.principal,
  state: 'FL',
  agents: validDurablePOA.agents,
  healthcarePowers: {
    medicalTreatment: true,
    mentalHealthTreatment: false,
    endOfLifeDecisions: true,
    organDonation: false,
    autopsyDecision: false,
    dispositionOfRemains: false
  },
  lifeSustainingTreatment: 'agent_decides' as const,
  witnesses: [
    {
      fullName: 'Witness One',
      address: validDurablePOA.principal.address
    },
    {
      fullName: 'Witness Two',
      address: validDurablePOA.principal.address
    }
  ]
};

const result8 = validateHealthcarePOA(validHealthcare);
console.log('Valid healthcare POA:', result8.success ? '✅ PASSED' : '❌ FAILED');

// Test 9: Unique Agent Emails
console.log('\n=== Test 9: Unique Agent Emails ===');
const uniqueEmails = validateUniqueAgentEmail([
  { email: 'agent1@example.com' },
  { email: 'agent2@example.com' }
]);
console.log('Unique emails:', uniqueEmails.success ? '✅ PASSED' : '❌ FAILED');

const duplicateEmails = validateUniqueAgentEmail([
  { email: 'agent1@example.com' },
  { email: 'agent1@example.com' } // Duplicate
]);
console.log('Duplicate emails:', duplicateEmails.success ? '❌ FAILED' : '✅ PASSED');

// Test 10: Agent Order Validation
console.log('\n=== Test 10: Agent Order Validation ===');
const validOrder = validateAgentOrder([
  { type: 'primary', order: undefined },
  { type: 'successor', order: 1 },
  { type: 'successor', order: 2 }
]);
console.log('Valid successor order:', validOrder.success ? '✅ PASSED' : '❌ FAILED');

const invalidOrder = validateAgentOrder([
  { type: 'primary', order: undefined },
  { type: 'successor', order: 1 },
  { type: 'successor', order: 1 } // Duplicate order
]);
console.log('Duplicate order:', invalidOrder.success ? '❌ FAILED' : '✅ PASSED');

console.log('\n=== Validation Tests Complete ===');
