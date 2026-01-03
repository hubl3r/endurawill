import { generateFinancialPOAPDF, generateHealthcarePOAPDF } from '../pdf-generator';
import { writeFileSync } from 'fs';
import { join } from 'path';

console.log('=== PDF Generator Tests ===\n');

// Test 1: Generate Durable POA PDF
console.log('Test 1: Generate Durable POA PDF');
const durablePOAData = {
  principal: {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    tenantId: '123e4567-e89b-12d3-a456-426614174001',
    fullName: 'John Michael Doe',
    email: 'john@example.com',
    phone: '(555) 123-4567',
    address: {
      street: '123 Main Street',
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
      fullName: 'Jane Elizabeth Doe',
      email: 'jane@example.com',
      phone: '(555) 234-5678',
      address: {
        street: '456 Oak Avenue',
        city: 'Miami',
        state: 'FL',
        zipCode: '33102'
      },
      relationship: 'Spouse'
    },
    {
      type: 'successor' as const,
      fullName: 'Robert James Doe',
      email: 'robert@example.com',
      address: {
        street: '789 Pine Road',
        city: 'Tampa',
        state: 'FL',
        zipCode: '33601'
      },
      relationship: 'Son',
      order: 1
    }
  ],
  grantedPowers: {
    categoryIds: ['cat-1', 'cat-2', 'cat-3'],
    grantAllSubPowers: true
  },
  hotPowersConsent: {
    gifting: true,
    trustModification: false,
    beneficiaryChanges: true,
    realEstateGifting: false
  },
  witnesses: [
    {
      fullName: 'Alice Smith',
      address: {
        street: '111 Witness Lane',
        city: 'Miami',
        state: 'FL',
        zipCode: '33103'
      }
    },
    {
      fullName: 'Bob Johnson',
      address: {
        street: '222 Observer Ave',
        city: 'Miami',
        state: 'FL',
        zipCode: '33104'
      }
    }
  ],
  notaryPublic: {
    fullName: 'Carol Notary',
    commissionNumber: 'FF123456',
    commissionExpiration: '2025-12-31T00:00:00Z',
    county: 'Miami-Dade',
    state: 'FL'
  },
  useStatutoryForm: true,
  additionalInstructions: 'This POA is for test purposes only.'
};

(async () => {
  try {
    const result1 = await generateFinancialPOAPDF({
      poaData: durablePOAData
    });

    console.log('PDF generated successfully ✅');
    console.log('Filename:', result1.filename);
    console.log('Buffer size:', (result1.buffer.length / 1024).toFixed(2), 'KB');
    console.log('Page count:', result1.pageCount);

    // Save to test file
    const testFile1 = join(process.cwd(), 'test-durable-poa.pdf');
    writeFileSync(testFile1, result1.buffer);
    console.log('Saved to:', testFile1);
    console.log('✅ Open this file to verify it renders correctly');

    // Test 2: Generate Springing POA
    console.log('\nTest 2: Generate Springing POA PDF');
    const springingPOAData = {
      ...durablePOAData,
      state: 'TX', // TX allows springing
      isSpringing: true,
      springingCondition: 'Incapacity as determined by physician certification',
      numberOfPhysiciansRequired: 1,
      physicianNames: ['Dr. Sarah Medical, MD']
    };

    const result2 = await generateFinancialPOAPDF({
      poaData: springingPOAData
    });

    console.log('Springing PDF generated ✅');
    console.log('Filename:', result2.filename);
    console.log('Page count:', result2.pageCount);

    const testFile2 = join(process.cwd(), 'test-springing-poa.pdf');
    writeFileSync(testFile2, result2.buffer);
    console.log('Saved to:', testFile2);

    // Test 3: Generate Limited POA
    console.log('\nTest 3: Generate Limited POA PDF');
    const limitedPOAData = {
      ...durablePOAData,
      isLimited: true,
      specificPurpose: 'To sell the property located at 555 Real Estate Drive, Miami, FL 33105',
      expirationDate: '2024-12-31T23:59:59Z'
    };

    const result3 = await generateFinancialPOAPDF({
      poaData: limitedPOAData
    });

    console.log('Limited PDF generated ✅');
    console.log('Filename:', result3.filename);
    console.log('Page count:', result3.pageCount);

    const testFile3 = join(process.cwd(), 'test-limited-poa.pdf');
    writeFileSync(testFile3, result3.buffer);
    console.log('Saved to:', testFile3);

    // Test 4: Generate Healthcare POA
    console.log('\nTest 4: Generate Healthcare POA PDF');
    const healthcarePOAData = {
      principal: durablePOAData.principal,
      state: 'FL',
      agents: [durablePOAData.agents[0]], // Primary agent only
      healthcarePowers: {
        medicalTreatment: true,
        mentalHealthTreatment: true,
        endOfLifeDecisions: true,
        organDonation: true,
        autopsyDecision: false,
        dispositionOfRemains: true
      },
      lifeSustainingTreatment: 'comfort_care_only' as const,
      organDonation: 'any_needed' as const,
      additionalDirectives: 'I prefer to die at home if possible. Please honor my wishes.',
      witnesses: durablePOAData.witnesses,
      notaryPublic: durablePOAData.notaryPublic,
      useStatutoryForm: true
    };

    const result4 = await generateHealthcarePOAPDF({
      poaData: healthcarePOAData
    });

    console.log('Healthcare PDF generated ✅');
    console.log('Filename:', result4.filename);
    console.log('Page count:', result4.pageCount);

    const testFile4 = join(process.cwd(), 'test-healthcare-poa.pdf');
    writeFileSync(testFile4, result4.buffer);
    console.log('Saved to:', testFile4);

    console.log('\n=== PDF Generator Tests Complete ===');
    console.log('\n📄 Manual Verification Steps:');
    console.log('1. Open test-durable-poa.pdf - verify all sections present');
    console.log('2. Open test-springing-poa.pdf - verify springing section included');
    console.log('3. Open test-limited-poa.pdf - verify expiration and purpose shown');
    console.log('4. Open test-healthcare-poa.pdf - verify healthcare directives');
    console.log('\nCheck that:');
    console.log('- All text is readable');
    console.log('- Principal/agent info displays correctly');
    console.log('- Signature blocks are properly formatted');
    console.log('- Notary section appears');
    console.log('- Multi-page PDFs have all pages');

  } catch (error) {
    console.error('❌ PDF Generation Error:', error);
  }
})();
