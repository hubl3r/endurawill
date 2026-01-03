import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedHealthcarePOAStateForms() {
  console.log('  ⚕️  Seeding healthcare POA state forms...');

  // Check if already seeded
  const existingCount = await prisma.healthcarePOAStateForm.count();
  if (existingCount > 0) {
    console.log('  ⏭️  Healthcare POA forms already seeded, skipping...');
    return;
  }

  const forms = [
    // California
    {
      state: 'CA',
      stateName: 'California',
      formName: 'Advance Health Care Directive',
      pdfLink: 'https://leginfo.legislature.ca.gov',
      spanishLink: null,
      requiresNotary: false,
      requiresWitnesses: true,
      numberOfWitnesses: 2,
      notaryOrWitnesses: true,
      witnessRestrictions: 'Agent cannot witness. Relatives cannot witness. Healthcare providers cannot witness. Facility owners/operators cannot witness.',
      includesDNR: false,
      includesPOLST: false,
      includesOrganDonation: true,
      includesLivingWill: true,
      specialInstructions: 'Combines healthcare agent designation with living will. Either 2 witnesses OR notary. Very specific witness restrictions.',
      commonMistakes: 'Using healthcare provider as witness, using agent as witness, using facility operator as witness',
      lastUpdated: new Date('2024-01-01')
    },

    // Florida
    {
      state: 'FL',
      stateName: 'Florida',
      formName: 'Designation of Health Care Surrogate',
      pdfLink: 'https://www.floridabar.org',
      spanishLink: null,
      requiresNotary: true,
      requiresWitnesses: true,
      numberOfWitnesses: 2,
      notaryOrWitnesses: false,
      witnessRestrictions: 'Agent cannot witness.',
      includesDNR: false,
      includesPOLST: false,
      includesOrganDonation: false,
      includesLivingWill: false,
      specialInstructions: 'Separate from Living Will in Florida. Requires both notary AND 2 witnesses.',
      commonMistakes: 'Confusing with Living Will (separate document), missing notarization',
      lastUpdated: new Date('2024-01-01')
    },

    // New York
    {
      state: 'NY',
      stateName: 'New York',
      formName: 'Health Care Proxy',
      pdfLink: 'https://www.health.ny.gov',
      spanishLink: 'https://www.health.ny.gov/forms/proxy_spanish.pdf',
      requiresNotary: false,
      requiresWitnesses: true,
      numberOfWitnesses: 2,
      notaryOrWitnesses: false,
      witnessRestrictions: 'Agent cannot witness.',
      includesDNR: false,
      includesPOLST: false,
      includesOrganDonation: false,
      includesLivingWill: false,
      specialInstructions: 'Simple form. Does not require notary, just 2 witnesses. Separate from Living Will.',
      commonMistakes: 'Agent witnessing own appointment',
      lastUpdated: new Date('2024-01-01')
    },

    // Texas
    {
      state: 'TX',
      stateName: 'Texas',
      formName: 'Medical Power of Attorney',
      pdfLink: 'https://statutes.capitol.texas.gov',
      spanishLink: null,
      requiresNotary: false,
      requiresWitnesses: true,
      numberOfWitnesses: 2,
      notaryOrWitnesses: true,
      witnessRestrictions: 'Agent cannot witness. Healthcare provider cannot witness. Facility administrator cannot witness. Relatives cannot witness.',
      includesDNR: false,
      includesPOLST: false,
      includesOrganDonation: false,
      includesLivingWill: false,
      specialInstructions: 'Either 2 witnesses OR notary. Extensive witness restrictions. Separate from Directive to Physicians (Living Will).',
      commonMistakes: 'Using relative as witness, using healthcare provider as witness',
      lastUpdated: new Date('2024-01-01')
    },

    // Pennsylvania
    {
      state: 'PA',
      stateName: 'Pennsylvania',
      formName: 'Health Care Power of Attorney',
      pdfLink: 'https://www.legis.state.pa.us',
      spanishLink: null,
      requiresNotary: true,
      requiresWitnesses: true,
      numberOfWitnesses: 2,
      notaryOrWitnesses: false,
      witnessRestrictions: 'Agent cannot witness.',
      includesDNR: false,
      includesPOLST: false,
      includesOrganDonation: false,
      includesLivingWill: false,
      specialInstructions: 'Requires both notary AND 2 witnesses. Part of Combined Health Care Directive.',
      commonMistakes: 'Missing notarization',
      lastUpdated: new Date('2024-01-01')
    },

    // Illinois
    {
      state: 'IL',
      stateName: 'Illinois',
      formName: 'Illinois Power of Attorney for Health Care',
      pdfLink: 'https://www.ilga.gov',
      spanishLink: null,
      requiresNotary: false,
      requiresWitnesses: true,
      numberOfWitnesses: 1,
      notaryOrWitnesses: false,
      witnessRestrictions: 'Agent cannot witness.',
      includesDNR: false,
      includesPOLST: false,
      includesOrganDonation: true,
      includesLivingWill: true,
      specialInstructions: 'Only requires 1 witness. Includes living will provisions and organ donation.',
      commonMistakes: 'Not completing organ donation section',
      lastUpdated: new Date('2024-01-01')
    },

    // Georgia
    {
      state: 'GA',
      stateName: 'Georgia',
      formName: 'Georgia Advance Directive for Health Care',
      pdfLink: 'https://aging.georgia.gov',
      spanishLink: null,
      requiresNotary: true,
      requiresWitnesses: true,
      numberOfWitnesses: 2,
      notaryOrWitnesses: false,
      witnessRestrictions: 'Agent cannot witness. Blood relatives cannot witness. Healthcare providers cannot witness.',
      includesDNR: false,
      includesPOLST: false,
      includesOrganDonation: true,
      includesLivingWill: true,
      specialInstructions: 'Comprehensive form combining healthcare agent with living will. Strict witness restrictions.',
      commonMistakes: 'Using relative as witness, using healthcare provider as witness',
      lastUpdated: new Date('2024-01-01')
    }
  ];

  // Create forms
  for (const form of forms) {
    await prisma.healthcarePOAStateForm.create({
      data: form
    });
  }

  console.log('  ✅ Created healthcare POA forms for 7 states');
}
