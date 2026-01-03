// lib/poa/pdf-generator.ts
// PDF generation for Power of Attorney documents using PDFKit

import PDFDocument from 'pdfkit';
import type { CreateFinancialPOAInput, CreateHealthcarePOAInput } from './validation';

// ============================================
// TYPES
// ============================================

export interface GeneratePOAPDFParams {
  poaData: CreateFinancialPOAInput | CreateHealthcarePOAInput;
  stateRequirements?: any; // StateRequirements from database
  statutoryForm?: any; // StatutoryPOAForm from database
  notaryTemplate?: any; // NotaryBlockTemplate from database
}

export interface PDFGenerationResult {
  buffer: Buffer;
  filename: string;
  pageCount: number;
}

// ============================================
// PDF GENERATION - FINANCIAL POA
// ============================================

/**
 * Generate Financial POA PDF document
 * Supports: Durable, Springing, and Limited POAs
 */
export async function generateFinancialPOAPDF(
  params: GeneratePOAPDFParams
): Promise<PDFGenerationResult> {
  const { poaData } = params;
  const data = poaData as CreateFinancialPOAInput;

  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: {
          top: 72,
          bottom: 72,
          left: 72,
          right: 72,
        },
        info: {
          Title: `Power of Attorney - ${data.principal.fullName}`,
          Author: 'Endurawill',
          Subject: 'Financial Power of Attorney',
          Creator: 'Endurawill POA System',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const buffer = Buffer.concat(buffers);
        const filename = `poa_financial_${data.state}_${sanitizeName(data.principal.fullName)}_${formatDate(new Date())}.pdf`;
        
        resolve({
          buffer,
          filename,
          pageCount: (doc as any).bufferedPageRange().count,
        });
      });
      doc.on('error', reject);

      // Build PDF content
      addPDFHeader(doc, 'FINANCIAL POWER OF ATTORNEY', data.state);
      addPOATypeSection(doc, data);
      addPrincipalSection(doc, data.principal);
      addAgentSection(doc, data.agents);
      addPowersSection(doc, data);
      addHotPowersSection(doc, data);
      addDurabilitySection(doc, data);
      
      if (data.isSpringing) {
        addSpringingSection(doc, data);
      }
      
      if (data.isLimited) {
        addLimitedSection(doc, data);
      }
      
      addExecutionSection(doc, data);
      addNotarySection(doc, data);
      addSignatureBlocks(doc, data);

      // Finalize PDF
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================
// PDF GENERATION - HEALTHCARE POA
// ============================================

/**
 * Generate Healthcare POA PDF document
 */
export async function generateHealthcarePOAPDF(
  params: GeneratePOAPDFParams
): Promise<PDFGenerationResult> {
  const { poaData } = params;
  const data = poaData as CreateHealthcarePOAInput;

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'LETTER',
        margins: { top: 72, bottom: 72, left: 72, right: 72 },
        info: {
          Title: `Healthcare Power of Attorney - ${data.principal.fullName}`,
          Author: 'Endurawill',
          Subject: 'Healthcare Power of Attorney',
          Creator: 'Endurawill POA System',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const buffer = Buffer.concat(buffers);
        const filename = `poa_healthcare_${data.state}_${sanitizeName(data.principal.fullName)}_${formatDate(new Date())}.pdf`;
        
        resolve({
          buffer,
          filename,
          pageCount: (doc as any).bufferedPageRange().count,
        });
      });
      doc.on('error', reject);

      // Build PDF content
      addPDFHeader(doc, 'HEALTHCARE POWER OF ATTORNEY', data.state);
      addPrincipalSection(doc, data.principal);
      addAgentSection(doc, data.agents);
      addHealthcarePowersSection(doc, data);
      addLifeSustainingSection(doc, data);
      addOrganDonationSection(doc, data);
      addExecutionSection(doc, data);
      addNotarySection(doc, data);
      addSignatureBlocks(doc, data);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================
// PDF SECTION BUILDERS
// ============================================

function addPDFHeader(doc: PDFKit.PDFDocument, title: string, state: string) {
  doc
    .fontSize(18)
    .font('Helvetica-Bold')
    .text(title, { align: 'center' })
    .moveDown(0.3);

  doc
    .fontSize(12)
    .font('Helvetica')
    .text(`State of ${getStateName(state)}`, { align: 'center' })
    .moveDown(1);
}

function addPOATypeSection(doc: PDFKit.PDFDocument, data: CreateFinancialPOAInput) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('TYPE OF POWER OF ATTORNEY')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica');

  if (data.isDurable) {
    doc.text('☑ DURABLE POWER OF ATTORNEY', { indent: 20 });
    doc.text(
      'This power of attorney shall not be affected by my subsequent disability or incapacity.',
      { indent: 40, width: 450 }
    );
  }

  if (data.isSpringing) {
    doc.text('☑ SPRINGING POWER OF ATTORNEY', { indent: 20 });
    doc.text(
      'This power of attorney shall become effective upon my incapacity as determined by physician certification.',
      { indent: 40, width: 450 }
    );
  }

  if (data.isLimited) {
    doc.text('☑ LIMITED POWER OF ATTORNEY', { indent: 20 });
    doc.text(
      `This power of attorney is limited in scope and duration.`,
      { indent: 40, width: 450 }
    );
  }

  doc.moveDown(1);
}

function addPrincipalSection(doc: PDFKit.PDFDocument, principal: any) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('PRINCIPAL INFORMATION')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text(`I, ${principal.fullName.toUpperCase()}, currently residing at:`, { continued: false })
    .moveDown(0.3);

  doc.text(principal.address.street, { indent: 20 });
  doc.text(`${principal.address.city}, ${principal.address.state} ${principal.address.zipCode}`, { indent: 20 });
  
  if (principal.email) {
    doc.moveDown(0.3);
    doc.text(`Email: ${principal.email}`, { indent: 20 });
  }
  
  if (principal.phone) {
    doc.text(`Phone: ${principal.phone}`, { indent: 20 });
  }

  doc.moveDown(1);
}

function addAgentSection(doc: PDFKit.PDFDocument, agents: any[]) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('APPOINTMENT OF AGENT(S)')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('I hereby appoint the following person(s) as my agent(s) to act on my behalf:')
    .moveDown(0.5);

  agents.forEach((agent, index) => {
    const typeLabel = agent.type === 'primary' ? 'PRIMARY AGENT' :
                     agent.type === 'successor' ? `SUCCESSOR AGENT ${agent.order || index + 1}` :
                     'CO-AGENT';

    doc
      .fontSize(11)
      .font('Helvetica-Bold')
      .text(typeLabel, { indent: 20 });

    doc
      .font('Helvetica')
      .text(`Name: ${agent.fullName}`, { indent: 40 });

    if (agent.email) {
      doc.text(`Email: ${agent.email}`, { indent: 40 });
    }

    if (agent.phone) {
      doc.text(`Phone: ${agent.phone}`, { indent: 40 });
    }

    doc.text('Address:', { indent: 40 });
    doc.text(agent.address.street, { indent: 60 });
    doc.text(`${agent.address.city}, ${agent.address.state} ${agent.address.zipCode}`, { indent: 60 });

    if (agent.relationship) {
      doc.text(`Relationship: ${agent.relationship}`, { indent: 40 });
    }

    doc.moveDown(0.5);
  });

  doc.moveDown(0.5);
}

function addPowersSection(doc: PDFKit.PDFDocument, data: CreateFinancialPOAInput) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('POWERS GRANTED')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'I grant my agent(s) the authority to perform the following actions on my behalf:',
      { width: 450 }
    )
    .moveDown(0.5);

  // In real implementation, these would come from database
  // For now, placeholder text
  doc.text('The agent is granted authority over the following categories:', { indent: 20 });
  doc.moveDown(0.3);
  doc.text('• Real Property Transactions', { indent: 40 });
  doc.text('• Tangible Personal Property Transactions', { indent: 40 });
  doc.text('• Banking and Financial Institution Transactions', { indent: 40 });
  doc.text('• And additional powers as selected by the principal', { indent: 40 });

  doc.moveDown(1);
}

function addHotPowersSection(doc: PDFKit.PDFDocument, data: CreateFinancialPOAInput) {
  if (!data.hotPowersConsent) return;

  const hasHotPowers = Object.values(data.hotPowersConsent).some(v => v === true);
  if (!hasHotPowers) return;

  doc.addPage();
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('SPECIAL POWERS - SEPARATE CONSENT REQUIRED')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'The following powers are considered "hot powers" and require my separate, explicit consent:',
      { width: 450 }
    )
    .moveDown(0.5);

  if (data.hotPowersConsent.gifting) {
    doc.text('☑ AUTHORITY TO MAKE GIFTS', { indent: 20, continued: false });
    doc.text(
      'I authorize my agent to make gifts of my property, including gifts to the agent, up to the annual gift tax exclusion amount.',
      { indent: 40, width: 430 }
    );
    doc.moveDown(0.5);
  }

  if (data.hotPowersConsent.trustModification) {
    doc.text('☑ AUTHORITY TO MODIFY TRUSTS', { indent: 20 });
    doc.text(
      'I authorize my agent to create, amend, revoke, or terminate trusts on my behalf.',
      { indent: 40, width: 430 }
    );
    doc.moveDown(0.5);
  }

  if (data.hotPowersConsent.beneficiaryChanges) {
    doc.text('☑ AUTHORITY TO CHANGE BENEFICIARIES', { indent: 20 });
    doc.text(
      'I authorize my agent to change beneficiaries on my life insurance policies, retirement accounts, and other assets.',
      { indent: 40, width: 430 }
    );
    doc.moveDown(0.5);
  }

  doc.moveDown(1);
}

function addDurabilitySection(doc: PDFKit.PDFDocument, data: CreateFinancialPOAInput) {
  if (!data.isDurable) return;

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('DURABILITY PROVISION')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'This power of attorney shall not be affected by my subsequent disability or incapacity, or by the lapse of time. This power of attorney shall continue until my death or until revoked by me in writing.',
      { width: 450 }
    );

  doc.moveDown(1);
}

function addSpringingSection(doc: PDFKit.PDFDocument, data: CreateFinancialPOAInput) {
  doc.addPage();
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('SPRINGING POWER OF ATTORNEY PROVISIONS')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text(
      'This power of attorney shall become effective only upon the occurrence of the following condition:',
      { width: 450 }
    )
    .moveDown(0.5);

  doc.text(data.springingCondition || 'My incapacity as certified by physician(s)', { indent: 20, width: 430 });
  doc.moveDown(0.5);

  doc.text(
    `Certification of incapacity shall be provided by ${data.numberOfPhysiciansRequired || 1} licensed physician(s).`,
    { width: 450 }
  );

  doc.moveDown(1);
}

function addLimitedSection(doc: PDFKit.PDFDocument, data: CreateFinancialPOAInput) {
  doc.addPage();
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('LIMITED POWER OF ATTORNEY PROVISIONS')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('SPECIFIC PURPOSE:', { continued: false })
    .moveDown(0.3);

  doc.text(data.specificPurpose || 'As specified by principal', { indent: 20, width: 430 });
  doc.moveDown(0.5);

  doc.text('EXPIRATION DATE:', { continued: false });
  doc.moveDown(0.3);
  doc.text(
    data.expirationDate ? new Date(data.expirationDate).toLocaleDateString() : 'Not specified',
    { indent: 20 }
  );

  doc.moveDown(1);
}

function addExecutionSection(doc: PDFKit.PDFDocument, data: any) {
  doc.addPage();
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('EXECUTION AND WITNESSES')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('This document was executed on the date indicated below.')
    .moveDown(0.5);

  if (data.witnesses && data.witnesses.length > 0) {
    doc.text(`Witnesses (${data.witnesses.length} required):`, { continued: false });
    doc.moveDown(0.5);

    data.witnesses.forEach((witness: any, index: number) => {
      doc.text(`WITNESS ${index + 1}:`, { indent: 20 });
      doc.text(`Name: ${witness.fullName}`, { indent: 40 });
      doc.text('Address:', { indent: 40 });
      doc.text(witness.address.street, { indent: 60 });
      doc.text(`${witness.address.city}, ${witness.address.state} ${witness.address.zipCode}`, { indent: 60 });
      doc.moveDown(0.5);
    });
  }

  doc.moveDown(1);
}

function addNotarySection(doc: PDFKit.PDFDocument, data: any) {
  if (!data.notaryPublic) return;

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('NOTARY ACKNOWLEDGMENT')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('State of ________________', { continued: false })
    .moveDown(0.3);

  doc.text('County of ________________');
  doc.moveDown(0.5);

  doc.text(
    'On this _____ day of _____________, 20____, before me personally appeared ______________________, known to me to be the person described in and who executed the foregoing instrument, and acknowledged that they executed the same as their free act and deed.',
    { width: 450 }
  );

  doc.moveDown(1);
  doc.text('________________________________', { indent: 100 });
  doc.text('Notary Public', { indent: 100 });
  doc.text('My Commission Expires: __________', { indent: 100 });

  doc.moveDown(1);
}

function addHealthcarePowersSection(doc: PDFKit.PDFDocument, data: CreateHealthcarePOAInput) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('HEALTHCARE DECISION POWERS')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica')
    .text('I grant my healthcare agent(s) the authority to make the following decisions:')
    .moveDown(0.5);

  const powers = data.healthcarePowers;

  if (powers.medicalTreatment) {
    doc.text('☑ General medical treatment decisions', { indent: 20 });
  }
  if (powers.mentalHealthTreatment) {
    doc.text('☑ Mental health treatment decisions', { indent: 20 });
  }
  if (powers.endOfLifeDecisions) {
    doc.text('☑ End-of-life decisions', { indent: 20 });
  }
  if (powers.organDonation) {
    doc.text('☑ Organ donation decisions', { indent: 20 });
  }
  if (powers.autopsyDecision) {
    doc.text('☑ Autopsy decisions', { indent: 20 });
  }
  if (powers.dispositionOfRemains) {
    doc.text('☑ Disposition of remains', { indent: 20 });
  }

  doc.moveDown(1);
}

function addLifeSustainingSection(doc: PDFKit.PDFDocument, data: CreateHealthcarePOAInput) {
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('LIFE-SUSTAINING TREATMENT PREFERENCES')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica');

  const preference = data.lifeSustainingTreatment;
  
  if (preference === 'prolong_life') {
    doc.text('☑ I want my life to be prolonged to the greatest extent possible.', { indent: 20, width: 430 });
  } else if (preference === 'comfort_care_only') {
    doc.text('☑ I want comfort care only. Do not prolong my life.', { indent: 20, width: 430 });
  } else if (preference === 'agent_decides') {
    doc.text('☑ I want my agent to decide based on their best judgment.', { indent: 20, width: 430 });
  } else {
    doc.text('☐ Preference not specified.', { indent: 20, width: 430 });
  }

  doc.moveDown(1);
}

function addOrganDonationSection(doc: PDFKit.PDFDocument, data: CreateHealthcarePOAInput) {
  if (!data.organDonation) return;

  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('ORGAN DONATION')
    .moveDown(0.5);

  doc
    .fontSize(11)
    .font('Helvetica');

  const donation = data.organDonation;
  
  if (donation === 'any_needed') {
    doc.text('☑ I want to donate any needed organs and tissues.', { indent: 20, width: 430 });
  } else if (donation === 'transplant_only') {
    doc.text('☑ I want to donate organs for transplantation only.', { indent: 20, width: 430 });
  } else if (donation === 'research_only') {
    doc.text('☑ I want to donate organs for research only.', { indent: 20, width: 430 });
  } else if (donation === 'no_donation') {
    doc.text('☑ I do not want to donate organs or tissues.', { indent: 20, width: 430 });
  }

  doc.moveDown(1);
}

function addSignatureBlocks(doc: PDFKit.PDFDocument, data: any) {
  doc.addPage();
  doc
    .fontSize(14)
    .font('Helvetica-Bold')
    .text('SIGNATURES')
    .moveDown(1);

  // Principal signature
  doc
    .fontSize(11)
    .font('Helvetica')
    .text('PRINCIPAL:', { continued: false })
    .moveDown(0.5);

  doc.text('_________________________________', { indent: 20 });
  doc.text(`${data.principal.fullName}`, { indent: 20 });
  doc.text('Date: _________________________', { indent: 20 });
  doc.moveDown(1);

  // Agent acceptance (placeholder)
  doc.text('AGENT ACCEPTANCE:', { continued: false });
  doc.moveDown(0.5);
  doc.text('I accept the appointment as agent and agree to serve in this capacity.', { indent: 20, width: 430 });
  doc.moveDown(0.5);

  data.agents.slice(0, 3).forEach((agent: any) => {
    doc.text('_________________________________', { indent: 20 });
    doc.text(`${agent.fullName}`, { indent: 20 });
    doc.text('Date: _________________________', { indent: 20 });
    doc.moveDown(0.5);
  });

  // Witness signatures
  if (data.witnesses && data.witnesses.length > 0) {
    doc.moveDown(1);
    doc.text('WITNESSES:', { continued: false });
    doc.moveDown(0.5);

    data.witnesses.forEach((witness: any, index: number) => {
      doc.text(`Witness ${index + 1}:`, { indent: 20 });
      doc.text('_________________________________', { indent: 20 });
      doc.text(`${witness.fullName}`, { indent: 20 });
      doc.text('Date: _________________________', { indent: 20 });
      doc.moveDown(0.5);
    });
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 30);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10).replace(/-/g, '');
}

function getStateName(stateCode: string): string {
  const stateNames: Record<string, string> = {
    AL: 'Alabama', AK: 'Alaska', AZ: 'Arizona', AR: 'Arkansas', CA: 'California',
    CO: 'Colorado', CT: 'Connecticut', DE: 'Delaware', FL: 'Florida', GA: 'Georgia',
    HI: 'Hawaii', ID: 'Idaho', IL: 'Illinois', IN: 'Indiana', IA: 'Iowa',
    KS: 'Kansas', KY: 'Kentucky', LA: 'Louisiana', ME: 'Maine', MD: 'Maryland',
    MA: 'Massachusetts', MI: 'Michigan', MN: 'Minnesota', MS: 'Mississippi', MO: 'Missouri',
    MT: 'Montana', NE: 'Nebraska', NV: 'Nevada', NH: 'New Hampshire', NJ: 'New Jersey',
    NM: 'New Mexico', NY: 'New York', NC: 'North Carolina', ND: 'North Dakota', OH: 'Ohio',
    OK: 'Oklahoma', OR: 'Oregon', PA: 'Pennsylvania', RI: 'Rhode Island', SC: 'South Carolina',
    SD: 'South Dakota', TN: 'Tennessee', TX: 'Texas', UT: 'Utah', VT: 'Vermont',
    VA: 'Virginia', WA: 'Washington', WV: 'West Virginia', WI: 'Wisconsin', WY: 'Wyoming',
    DC: 'District of Columbia'
  };
  return stateNames[stateCode.toUpperCase()] || stateCode;
}
