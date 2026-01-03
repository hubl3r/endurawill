import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedIncapacityDefinitions() {
  console.log('  🏥 Seeding incapacity definitions...');

  // Check if already seeded
  const existingCount = await prisma.incapacityDefinition.count();
  if (existingCount > 0) {
    console.log('  ⏭️  Incapacity definitions already seeded, skipping...');
    return;
  }

  const definitions = [
    // California - 2 physicians required
    {
      state: 'CA',
      definitionType: 'MULTI_PHYSICIAN',
      statutoryText: 'A principal shall be deemed incapacitated when a licensed physician, or a licensed psychologist acting within the scope of his or her license, after examination, certifies in writing that the principal lacks the capacity to manage his or her own financial affairs.',
      plainLanguage: 'You are considered incapacitated when two licensed healthcare professionals (either 2 physicians, or 1 physician + 1 psychologist) examine you and write that you cannot manage your finances.',
      isUPOAAState: false,
      includesMissing: false,
      includesAbroad: false,
      requiresCognitiveTesting: false,
      requiresFunctionalAssess: true,
      requiresSpecificDiagnosis: false,
      physicianGuidance: 'Must examine the principal and assess capacity to manage financial affairs. Document examination and findings. Both healthcare professionals must independently certify.',
      exampleFindings: 'Unable to understand financial transactions, cannot make reasoned decisions about property, lacks awareness of financial situation',
      specialNotes: 'California requires 2 healthcare professionals: either 2 physicians OR 1 physician + 1 psychologist'
    },

    // Texas - 1 physician or court
    {
      state: 'TX',
      definitionType: 'PHYSICIAN_DETERMINATION',
      statutoryText: 'A principal is incapacitated if a physician certifies in writing that, in the physician\'s opinion, the principal is mentally incapable of managing the principal\'s financial affairs.',
      plainLanguage: 'You are incapacitated when a doctor examines you and writes that you cannot manage your money and property due to mental impairment, OR when a court declares you incapacitated.',
      isUPOAAState: false,
      includesMissing: false,
      includesAbroad: false,
      requiresCognitiveTesting: false,
      requiresFunctionalAssess: true,
      requiresSpecificDiagnosis: false,
      physicianGuidance: 'Examine principal and assess mental capacity to manage financial affairs. Certification should state opinion on financial capacity specifically.',
      exampleFindings: 'Mentally incapable of understanding financial matters, unable to make financial decisions, lacks capacity to manage property',
      specialNotes: 'Can also use court determination instead of physician certification'
    },

    // New York - 2 physicians recommended
    {
      state: 'NY',
      definitionType: 'MULTI_PHYSICIAN',
      statutoryText: 'Incapacity means inability to manage one\'s affairs by reason of age, illness, infirmity or mental or physical disability.',
      plainLanguage: 'You are incapacitated when you cannot manage your affairs because of age, illness, disability, or infirmity. Usually certified by 2 physicians or by court order.',
      isUPOAAState: false,
      includesMissing: false,
      includesAbroad: false,
      requiresCognitiveTesting: false,
      requiresFunctionalAssess: true,
      requiresSpecificDiagnosis: false,
      physicianGuidance: 'Two physicians recommended to certify incapacity. Assess ability to manage financial and personal affairs. Court determination also acceptable.',
      exampleFindings: 'Unable to manage affairs due to dementia, stroke, severe mental illness, or other incapacitating condition',
      specialNotes: '2 physicians recommended but not strictly required. Court order is also acceptable.'
    },

    // Pennsylvania - 1 physician or court
    {
      state: 'PA',
      definitionType: 'PHYSICIAN_DETERMINATION',
      statutoryText: 'An individual is incapacitated if the individual is impaired by reason of mental illness, mental deficiency, physical illness or disability, chronic use of drugs, chronic intoxication, or other cause to the extent of lacking sufficient understanding or capacity to make or communicate responsible decisions.',
      plainLanguage: 'You are incapacitated when illness, disability, or other condition prevents you from understanding or making responsible decisions about your property. Certified by a doctor or determined by court.',
      isUPOAAState: true,
      includesMissing: false,
      includesAbroad: false,
      requiresCognitiveTesting: false,
      requiresFunctionalAssess: true,
      requiresSpecificDiagnosis: false,
      physicianGuidance: 'Certify whether principal lacks understanding or capacity to make responsible decisions about property and financial matters.',
      exampleFindings: 'Lacks capacity due to dementia, brain injury, severe mental illness, or substance abuse',
      specialNotes: 'Court determination of incapacity is also acceptable'
    },

    // Standard UPOAA definition - used by UPOAA states
    {
      state: 'STANDARD_UPOAA',
      definitionType: 'PHYSICIAN_DETERMINATION',
      statutoryText: 'Incapacity means inability of an individual to manage property or business affairs because the individual: (A) has an impairment in the ability to receive and evaluate information or make or communicate decisions even with the use of technological assistance; or (B) is: (i) missing; (ii) detained, including incarcerated in a penal system; or (iii) outside the United States and unable to return.',
      plainLanguage: 'You are incapacitated when you cannot manage your property because: (1) you cannot receive information, make decisions, or communicate - even with help, OR (2) you are missing, detained/imprisoned, or outside the U.S. and cannot return.',
      isUPOAAState: true,
      includesMissing: true,
      includesAbroad: true,
      requiresCognitiveTesting: false,
      requiresFunctionalAssess: true,
      requiresSpecificDiagnosis: false,
      physicianGuidance: 'Assess whether principal can receive and evaluate information, make decisions, and communicate decisions about property management. Consider use of assistive technology.',
      exampleFindings: 'Cannot process financial information, unable to make reasoned property decisions, cannot communicate wishes regarding finances',
      specialNotes: 'UPOAA definition used by 28 states. Includes missing persons and those detained abroad as "incapacitated" for POA purposes.'
    },

    // Standard non-UPOAA definition
    {
      state: 'STANDARD',
      definitionType: 'PHYSICIAN_DETERMINATION',
      statutoryText: 'A principal is incapacitated when unable to manage property and business affairs effectively for reasons such as mental illness, mental deficiency, physical illness or disability, chronic use of drugs, chronic intoxication, confinement, detention by a foreign power, or disappearance.',
      plainLanguage: 'You are incapacitated when you cannot effectively manage your property because of illness, disability, detention, disappearance, or similar reasons. Usually certified by a physician.',
      isUPOAAState: false,
      includesMissing: true,
      includesAbroad: true,
      requiresCognitiveTesting: false,
      requiresFunctionalAssess: true,
      requiresSpecificDiagnosis: false,
      physicianGuidance: 'Certify whether principal can effectively manage property and business affairs. Consider all relevant factors affecting capacity.',
      exampleFindings: 'Unable to manage property due to dementia, severe illness, or detention',
      specialNotes: 'Standard definition for non-UPOAA states'
    }
  ];

  // Create definitions
  for (const definition of definitions) {
    await prisma.incapacityDefinition.create({
      data: definition
    });
  }

  console.log('  ✅ Created incapacity definitions for key states + standards');
}
