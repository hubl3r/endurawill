// lib/poa/pdf-generator.ts
// PDF generation for Power of Attorney documents using pdf-lib (serverless-friendly)

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { CreateFinancialPOAInput, CreateHealthcarePOAInput } from './validation';

// ============================================
// TYPES
// ============================================

export interface GeneratePOAPDFParams {
  poaData: CreateFinancialPOAInput | CreateHealthcarePOAInput;
  stateRequirements?: any;
  statutoryForm?: any;
  notaryTemplate?: any;
}

export interface PDFGenerationResult {
  buffer: Buffer;
  filename: string;
  pageCount: number;
}

// ============================================
// PDF GENERATION - FINANCIAL POA
// ============================================

export async function generateFinancialPOAPDF(
  params: GeneratePOAPDFParams
): Promise<PDFGenerationResult> {
  const { poaData } = params;
  const data = poaData as CreateFinancialPOAInput;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add pages as needed
  let page = pdfDoc.addPage([612, 792]); // Letter size
  let { width, height } = page.getSize();
  let y = height - 72; // Start 1 inch from top
  const margin = 72;
  const lineHeight = 20;

  // Helper to add new page if needed
  const checkNewPage = () => {
    if (y < 100) {
      page = pdfDoc.addPage([612, 792]);
      y = height - 72;
    }
  };

  // Helper to write text
  const writeText = (text: string, size: number = 11, bold: boolean = false) => {
    checkNewPage();
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  };

  const writeTextIndent = (text: string, indent: number = 40, size: number = 11) => {
    checkNewPage();
    page.drawText(text, {
      x: margin + indent,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  };

  // Title
  const title = 'FINANCIAL POWER OF ATTORNEY';
  page.drawText(title, {
    x: (width - (title.length * 7)) / 2,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  // State
  const stateLine = `State of ${getStateName(data.state)}`;
  page.drawText(stateLine, {
    x: (width - (stateLine.length * 5)) / 2,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  // POA Type
  writeText('TYPE OF POWER OF ATTORNEY', 14, true);
  y -= 5;
  
  if (data.isDurable) {
    writeTextIndent('✓ DURABLE POWER OF ATTORNEY', 20);
    writeTextIndent('This power of attorney shall not be affected by subsequent', 40, 10);
    writeTextIndent('disability or incapacity of the principal.', 40, 10);
    y -= 5;
  }
  
  if (data.isSpringing) {
    writeTextIndent('✓ SPRINGING POWER OF ATTORNEY', 20);
    writeTextIndent('Becomes effective upon incapacity as determined by', 40, 10);
    writeTextIndent('physician certification.', 40, 10);
    y -= 5;
  }
  
  if (data.isLimited) {
    writeTextIndent('✓ LIMITED POWER OF ATTORNEY', 20);
    writeTextIndent('Limited in scope and duration as specified below.', 40, 10);
    y -= 5;
  }
  
  y -= 10;

  // Principal Information
  writeText('PRINCIPAL INFORMATION', 14, true);
  y -= 5;
  writeText(`I, ${data.principal.fullName.toUpperCase()}, currently residing at:`);
  writeTextIndent(data.principal.address.street, 20);
  writeTextIndent(`${data.principal.address.city}, ${data.principal.address.state} ${data.principal.address.zipCode}`, 20);
  
  if (data.principal.email) {
    writeTextIndent(`Email: ${data.principal.email}`, 20);
  }
  if (data.principal.phone) {
    writeTextIndent(`Phone: ${data.principal.phone}`, 20);
  }
  y -= 10;

  // Agents
  writeText('APPOINTMENT OF AGENT(S)', 14, true);
  y -= 5;
  writeText('I hereby appoint the following person(s) as my agent(s):');
  y -= 5;

  data.agents.forEach((agent, idx) => {
    const typeLabel = agent.type === 'primary' ? 'PRIMARY AGENT' :
                     agent.type === 'successor' ? `SUCCESSOR AGENT ${agent.order || idx + 1}` :
                     'CO-AGENT';
    
    writeText(typeLabel, 11, true);
    writeTextIndent(`Name: ${agent.fullName}`, 20);
    
    if (agent.email) {
      writeTextIndent(`Email: ${agent.email}`, 20);
    }
    if (agent.phone) {
      writeTextIndent(`Phone: ${agent.phone}`, 20);
    }
    
    writeTextIndent('Address:', 20);
    writeTextIndent(agent.address.street, 40);
    writeTextIndent(`${agent.address.city}, ${agent.address.state} ${agent.address.zipCode}`, 40);
    
    if (agent.relationship) {
      writeTextIndent(`Relationship: ${agent.relationship}`, 20);
    }
    
    y -= 10;
  });

  // Powers Granted
  writeText('POWERS GRANTED', 14, true);
  y -= 5;
  writeText('I grant my agent(s) authority to perform the following actions:');
  y -= 5;
  writeTextIndent('• Real Property Transactions', 20);
  writeTextIndent('• Tangible Personal Property Transactions', 20);
  writeTextIndent('• Banking and Financial Institution Transactions', 20);
  writeTextIndent('• And additional powers as selected by the principal', 20);
  y -= 10;

  // Hot Powers (if any)
  if (data.hotPowersConsent && Object.values(data.hotPowersConsent).some(v => v)) {
    checkNewPage();
    writeText('SPECIAL POWERS - SEPARATE CONSENT', 14, true);
    y -= 5;
    
    if (data.hotPowersConsent.gifting) {
      writeTextIndent('✓ Authority to Make Gifts', 20);
      y -= 5;
    }
    if (data.hotPowersConsent.trustModification) {
      writeTextIndent('✓ Authority to Modify Trusts', 20);
      y -= 5;
    }
    if (data.hotPowersConsent.beneficiaryChanges) {
      writeTextIndent('✓ Authority to Change Beneficiaries', 20);
      y -= 5;
    }
    y -= 10;
  }

  // Durability
  if (data.isDurable) {
    writeText('DURABILITY PROVISION', 14, true);
    y -= 5;
    writeText('This power of attorney shall not be affected by my subsequent');
    writeText('disability or incapacity, or by lapse of time.');
    y -= 10;
  }

  // Springing Details
  if (data.isSpringing) {
    checkNewPage();
    writeText('SPRINGING PROVISIONS', 14, true);
    y -= 5;
    writeText('This power of attorney becomes effective upon:');
    writeTextIndent(data.springingCondition || 'Incapacity certified by physician(s)', 20);
    writeTextIndent(`Number of physicians required: ${data.numberOfPhysiciansRequired || 1}`, 20);
    y -= 10;
  }

  // Limited Details
  if (data.isLimited) {
    checkNewPage();
    writeText('LIMITED POWER OF ATTORNEY PROVISIONS', 14, true);
    y -= 5;
    writeText('SPECIFIC PURPOSE:', 11, true);
    writeTextIndent(data.specificPurpose || 'As specified by principal', 20);
    y -= 5;
    writeText('EXPIRATION DATE:', 11, true);
    writeTextIndent(
      data.expirationDate ? new Date(data.expirationDate).toLocaleDateString() : 'Not specified',
      20
    );
    y -= 10;
  }

  // Execution
  checkNewPage();
  writeText('EXECUTION AND WITNESSES', 14, true);
  y -= 5;
  writeText('This document was executed on the date indicated below.');
  y -= 10;

  if (data.witnesses && data.witnesses.length > 0) {
    writeText(`Witnesses (${data.witnesses.length} required):`, 11, true);
    y -= 5;
    
    data.witnesses.forEach((witness, idx) => {
      writeText(`WITNESS ${idx + 1}:`, 11, true);
      writeTextIndent(`Name: ${witness.fullName}`, 20);
      writeTextIndent('Address:', 20);
      writeTextIndent(witness.address.street, 40);
      writeTextIndent(`${witness.address.city}, ${witness.address.state} ${witness.address.zipCode}`, 40);
      y -= 10;
    });
  }

  // Notary
  if (data.notaryPublic) {
    checkNewPage();
    writeText('NOTARY ACKNOWLEDGMENT', 14, true);
    y -= 5;
    writeText('State of ________________');
    writeText('County of ________________');
    y -= 10;
    writeText('On this _____ day of _____________, 20____, before me');
    writeText('personally appeared ______________________, known to me');
    writeText('to be the person described in and who executed the foregoing');
    writeText('instrument.');
    y -= 20;
    writeTextIndent('________________________________', 60);
    writeTextIndent('Notary Public', 60);
    writeTextIndent('My Commission Expires: __________', 60);
    y -= 10;
  }

  // Signatures
  checkNewPage();
  writeText('SIGNATURES', 14, true);
  y -= 10;
  
  writeText('PRINCIPAL:', 11, true);
  y -= 10;
  writeTextIndent('________________________________', 20);
  writeTextIndent(data.principal.fullName, 20);
  writeTextIndent('Date: _________________________', 20);
  y -= 20;

  writeText('AGENT ACCEPTANCE:', 11, true);
  y -= 5;
  writeText('I accept the appointment as agent and agree to serve.');
  y -= 10;
  
  data.agents.slice(0, 3).forEach(agent => {
    writeTextIndent('________________________________', 20);
    writeTextIndent(agent.fullName, 20);
    writeTextIndent('Date: _________________________', 20);
    y -= 10;
  });

  // Generate PDF
  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);
  const filename = `poa_financial_${data.state}_${sanitizeName(data.principal.fullName)}_${formatDate(new Date())}.pdf`;

  return {
    buffer,
    filename,
    pageCount: pdfDoc.getPageCount(),
  };
}

// ============================================
// PDF GENERATION - HEALTHCARE POA
// ============================================

export async function generateHealthcarePOAPDF(
  params: GeneratePOAPDFParams
): Promise<PDFGenerationResult> {
  const { poaData } = params;
  const data = poaData as CreateHealthcarePOAInput;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([612, 792]);
  let { width, height } = page.getSize();
  let y = height - 72;
  const margin = 72;
  const lineHeight = 20;

  const checkNewPage = () => {
    if (y < 100) {
      page = pdfDoc.addPage([612, 792]);
      y = height - 72;
    }
  };

  const writeText = (text: string, size: number = 11, bold: boolean = false) => {
    checkNewPage();
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: bold ? fontBold : font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  };

  const writeTextIndent = (text: string, indent: number = 40, size: number = 11) => {
    checkNewPage();
    page.drawText(text, {
      x: margin + indent,
      y,
      size,
      font,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight;
  };

  // Title
  const title = 'HEALTHCARE POWER OF ATTORNEY';
  page.drawText(title, {
    x: (width - (title.length * 7)) / 2,
    y,
    size: 16,
    font: fontBold,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  // State
  const stateLine = `State of ${getStateName(data.state)}`;
  page.drawText(stateLine, {
    x: (width - (stateLine.length * 5)) / 2,
    y,
    size: 12,
    font,
    color: rgb(0, 0, 0),
  });
  y -= lineHeight * 2;

  // Principal
  writeText('PRINCIPAL INFORMATION', 14, true);
  y -= 5;
  writeText(`I, ${data.principal.fullName.toUpperCase()}, currently residing at:`);
  writeTextIndent(data.principal.address.street, 20);
  writeTextIndent(`${data.principal.address.city}, ${data.principal.address.state} ${data.principal.address.zipCode}`, 20);
  y -= 10;

  // Healthcare Agents
  writeText('HEALTHCARE AGENT(S)', 14, true);
  y -= 5;
  
  data.agents.forEach((agent, idx) => {
    const typeLabel = agent.type === 'primary' ? 'PRIMARY HEALTHCARE AGENT' : `SUCCESSOR AGENT ${idx}`;
    writeText(typeLabel, 11, true);
    writeTextIndent(`Name: ${agent.fullName}`, 20);
    if (agent.email) writeTextIndent(`Email: ${agent.email}`, 20);
    if (agent.phone) writeTextIndent(`Phone: ${agent.phone}`, 20);
    writeTextIndent('Address:', 20);
    writeTextIndent(agent.address.street, 40);
    writeTextIndent(`${agent.address.city}, ${agent.address.state} ${agent.address.zipCode}`, 40);
    y -= 10;
  });

  // Healthcare Powers
  writeText('HEALTHCARE DECISION POWERS', 14, true);
  y -= 5;
  writeText('I grant my healthcare agent(s) authority for:');
  y -= 5;
  
  const powers = data.healthcarePowers;
  if (powers.medicalTreatment) writeTextIndent('✓ General medical treatment decisions', 20);
  if (powers.mentalHealthTreatment) writeTextIndent('✓ Mental health treatment decisions', 20);
  if (powers.endOfLifeDecisions) writeTextIndent('✓ End-of-life decisions', 20);
  if (powers.organDonation) writeTextIndent('✓ Organ donation decisions', 20);
  if (powers.autopsyDecision) writeTextIndent('✓ Autopsy decisions', 20);
  if (powers.dispositionOfRemains) writeTextIndent('✓ Disposition of remains', 20);
  y -= 10;

  // Life-Sustaining Treatment
  writeText('LIFE-SUSTAINING TREATMENT PREFERENCES', 14, true);
  y -= 5;
  
  const pref = data.lifeSustainingTreatment;
  if (pref === 'prolong_life') {
    writeTextIndent('✓ Prolong my life to the greatest extent possible', 20);
  } else if (pref === 'comfort_care_only') {
    writeTextIndent('✓ Comfort care only. Do not prolong my life.', 20);
  } else if (pref === 'agent_decides') {
    writeTextIndent('✓ My agent decides based on their best judgment', 20);
  }
  y -= 10;

  // Organ Donation
  if (data.organDonation) {
    writeText('ORGAN DONATION', 14, true);
    y -= 5;
    const donation = data.organDonation;
    if (donation === 'any_needed') writeTextIndent('✓ Donate any needed organs and tissues', 20);
    else if (donation === 'transplant_only') writeTextIndent('✓ Donate for transplantation only', 20);
    else if (donation === 'research_only') writeTextIndent('✓ Donate for research only', 20);
    else if (donation === 'no_donation') writeTextIndent('✓ No organ donation', 20);
    y -= 10;
  }

  // Signatures
  checkNewPage();
  writeText('SIGNATURES', 14, true);
  y -= 10;
  writeText('PRINCIPAL:', 11, true);
  y -= 10;
  writeTextIndent('________________________________', 20);
  writeTextIndent(data.principal.fullName, 20);
  writeTextIndent('Date: _________________________', 20);
  y -= 20;

  writeText('AGENT ACCEPTANCE:', 11, true);
  y -= 10;
  data.agents.slice(0, 2).forEach(agent => {
    writeTextIndent('________________________________', 20);
    writeTextIndent(agent.fullName, 20);
    writeTextIndent('Date: _________________________', 20);
    y -= 10;
  });

  const pdfBytes = await pdfDoc.save();
  const buffer = Buffer.from(pdfBytes);
  const filename = `poa_healthcare_${data.state}_${sanitizeName(data.principal.fullName)}_${formatDate(new Date())}.pdf`;

  return {
    buffer,
    filename,
    pageCount: pdfDoc.getPageCount(),
  };
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
