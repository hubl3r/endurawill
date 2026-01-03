import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedNotaryTemplates() {
  console.log('  🔏 Seeding notary block templates...');

  // Check if already seeded
  const existingCount = await prisma.notaryBlockTemplate.count();
  if (existingCount > 0) {
    console.log('  ⏭️  Notary templates already seeded, skipping...');
    return;
  }

  const templates = [
    // Florida - includes remote notarization option
    {
      state: 'FL',
      documentType: 'FINANCIAL_POA',
      templateText: `STATE OF FLORIDA
COUNTY OF _______________

The foregoing instrument was acknowledged before me by means of ☐ physical presence or ☐ online notarization, this _____ day of _____________, 20___, by [PRINCIPAL NAME], who is personally known to me or has produced [TYPE OF IDENTIFICATION] as identification.

_________________________________
(Signature of Notary Public)
(Print, Type, or Stamp Commissioned Name of Notary Public)

Personally Known _____ OR Produced Identification _____
Type of Identification Produced: _________________`,
      statutoryCitation: 'Fla. Stat. §117.05',
      effectiveDate: new Date('2024-01-01'),
      supersededDate: null,
      isCurrentVersion: true,
      requiresWitnesses: true,
      numberOfWitnesses: 2,
      witnessRelationshipRules: 'Agent cannot be witness',
      requiresNotary: true,
      notaryCanBeWitness: false,
      requiresMaritalStatus: false,
      requiresCommissionNumber: false,
      requiresSeal: true,
      allowsOnlineNotarization: true,
      specialInstructions: 'Check appropriate box for physical or online notarization',
      commonRejectionReasons: 'Missing checkbox selection, identification type not specified',
      uploadedById: null,
      usageCount: 0,
      lastUsedAt: null
    },

    // New York
    {
      state: 'NY',
      documentType: 'FINANCIAL_POA',
      templateText: `STATE OF NEW YORK
COUNTY OF _______________

On this _____ day of _____________, 20___, before me personally appeared [PRINCIPAL NAME], personally known to me or proved to me on the basis of satisfactory evidence to be the person whose name is subscribed to the within instrument and acknowledged to me that he/she executed the same in his/her authorized capacity, and that by his/her signature on the instrument the person, or the entity upon behalf of which the person acted, executed the instrument.

_________________________________
Notary Public

My commission expires: _________________`,
      statutoryCitation: 'NY Exec. Law §135-b',
      effectiveDate: new Date('2024-01-01'),
      supersededDate: null,
      isCurrentVersion: true,
      requiresWitnesses: false,
      numberOfWitnesses: null,
      witnessRelationshipRules: null,
      requiresNotary: true,
      notaryCanBeWitness: false,
      requiresMaritalStatus: false,
      requiresCommissionNumber: false,
      requiresSeal: true,
      allowsOnlineNotarization: true,
      specialInstructions: 'Must include commission expiration date',
      commonRejectionReasons: 'Missing expiration date, using wrong format',
      uploadedById: null,
      usageCount: 0,
      lastUsedAt: null
    },

    // California
    {
      state: 'CA',
      documentType: 'FINANCIAL_POA',
      templateText: `A notary public or other officer completing this certificate verifies only the identity of the individual who signed the document to which this certificate is attached, and not the truthfulness, accuracy, or validity of that document.

STATE OF CALIFORNIA
COUNTY OF _______________

On _____________ before me, [NAME OF NOTARY], personally appeared [PRINCIPAL NAME], who proved to me on the basis of satisfactory evidence to be the person(s) whose name(s) is/are subscribed to the within instrument and acknowledged to me that he/she/they executed the same in his/her/their authorized capacity(ies), and that by his/her/their signature(s) on the instrument the person(s), or the entity upon behalf of which the person(s) acted, executed the instrument.

I certify under PENALTY OF PERJURY under the laws of the State of California that the foregoing paragraph is true and correct.

WITNESS my hand and official seal.

_________________________________
Signature of Notary Public`,
      statutoryCitation: 'Cal. Civ. Code §1189',
      effectiveDate: new Date('2024-01-01'),
      supersededDate: null,
      isCurrentVersion: true,
      requiresWitnesses: false,
      numberOfWitnesses: 2,
      witnessRelationshipRules: 'Either notary OR 2 witnesses (cannot be agent or relatives)',
      requiresNotary: false,
      notaryCanBeWitness: false,
      requiresMaritalStatus: false,
      requiresCommissionNumber: false,
      requiresSeal: true,
      allowsOnlineNotarization: true,
      specialInstructions: 'PENALTY OF PERJURY language required. Either notary OR 2 witnesses.',
      commonRejectionReasons: 'Missing penalty of perjury statement, using agent/relative as witness',
      uploadedById: null,
      usageCount: 0,
      lastUsedAt: null
    },

    // Texas
    {
      state: 'TX',
      documentType: 'FINANCIAL_POA',
      templateText: `STATE OF TEXAS
COUNTY OF _______________

This document was acknowledged before me on _____________ (date) by [PRINCIPAL NAME].

_________________________________
Signature of Notary Public
_________________________________
Printed Name of Notary Public

My commission expires: _________________`,
      statutoryCitation: 'Tex. Gov\'t Code §406.0165',
      effectiveDate: new Date('2024-01-01'),
      supersededDate: null,
      isCurrentVersion: true,
      requiresWitnesses: false,
      numberOfWitnesses: null,
      witnessRelationshipRules: null,
      requiresNotary: true,
      notaryCanBeWitness: false,
      requiresMaritalStatus: false,
      requiresCommissionNumber: false,
      requiresSeal: true,
      allowsOnlineNotarization: true,
      specialInstructions: 'Simple acknowledgment format',
      commonRejectionReasons: 'Missing commission expiration',
      uploadedById: null,
      usageCount: 0,
      lastUsedAt: null
    },

    // Standard URAA (Uniform Recognition of Acknowledgments Act) template
    // Used for most other states
    {
      state: 'STANDARD',
      documentType: 'FINANCIAL_POA',
      templateText: `STATE OF _______________
COUNTY OF _______________

The foregoing instrument was acknowledged before me this _____ day of _____________, 20___, by [PRINCIPAL NAME].

_________________________________
Signature of Notary Public
_________________________________
Printed Name of Notary Public

My commission expires: _________________

(NOTARY SEAL)`,
      statutoryCitation: 'URAA Standard Form',
      effectiveDate: new Date('2024-01-01'),
      supersededDate: null,
      isCurrentVersion: true,
      requiresWitnesses: false,
      numberOfWitnesses: null,
      witnessRelationshipRules: null,
      requiresNotary: true,
      notaryCanBeWitness: false,
      requiresMaritalStatus: false,
      requiresCommissionNumber: false,
      requiresSeal: true,
      allowsOnlineNotarization: true,
      specialInstructions: 'Standard template used by most states following URAA',
      commonRejectionReasons: 'Missing seal, unsigned',
      uploadedById: null,
      usageCount: 0,
      lastUsedAt: null
    }
  ];

  // Create templates
  for (const template of templates) {
    await prisma.notaryBlockTemplate.create({
      data: template
    });
  }

  console.log('  ✅ Created notary templates for key states + standard template');
}
