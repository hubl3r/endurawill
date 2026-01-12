// lib/poa/pdf-generator.ts
// Hybrid PDF generation for Power of Attorney documents
// Combines checkbox style with comprehensive legal sections

import { PDFDocument, rgb, StandardFonts, PDFFont, PDFPage } from 'pdf-lib';

// ============================================
// TYPES
// ============================================

export interface GeneratePOAPDFParams {
  poaData: any;
  stateRequirements?: {
    requiresNotary: boolean;
    requiresWitnesses: boolean;
    numberOfWitnesses: number;
    notaryTemplate?: string;
  };
  powerCategories?: any[];
}

export interface PDFGenerationResult {
  buffer: Buffer;
  filename: string;
  pageCount: number;
}

// Default UPOAA Power Categories (a-o format for consistency)
const DEFAULT_POWER_CATEGORIES = [
  {
    letter: 'a',
    title: 'BANKING',
    description: 'To receive and deposit funds in any financial institution, and to withdraw funds by check or otherwise to pay for goods, services, and any other personal and business expenses for my benefit. If necessary to affect my Agent\'s powers, my Agent is authorized to execute any document required to be signed by such banking institution. Agent may continue, modify, and terminate an account or other banking arrangement made by or on behalf of the Principal.'
  },
  {
    letter: 'b',
    title: 'SAFE DEPOSIT BOX',
    description: 'To have access at any time to any safe deposit box rented by me or to which I may have access, wheresoever located, including drilling, if necessary, and to remove all or any part of the contents thereof, and to surrender or relinquish said safe deposit box; and any institution in which any such safe deposit box may be located shall not incur any liability to me or my estate as a result of permitting my Agent to exercise this power.'
  },
  {
    letter: 'c',
    title: 'LENDING OR BORROWING',
    description: 'To make loans in my name; to borrow money in my name, individually or jointly with others; to give promissory notes or other obligations therefor; and to deposit or mortgage as collateral or for security for the payment thereof any or all of my securities, real estate, personal property, or other property of whatever nature and wherever situated, held by me personally or in trust for my benefit.'
  },
  {
    letter: 'd',
    title: 'GOVERNMENT BENEFITS',
    description: 'To apply for and receive any government benefits for which I may be eligible or become eligible, including but not limited to Social Security, Medicare and Medicaid.'
  },
  {
    letter: 'e',
    title: 'RETIREMENT PLAN',
    description: 'To contribute to, select payment option of, roll-over, and receive benefits of any retirement plan or IRA I may own, except my Agent shall not have power to change the beneficiary of any of my retirement plans or IRAs.'
  },
  {
    letter: 'f',
    title: 'TAXES',
    description: 'To complete and sign any local, state and federal tax returns on my behalf, pay any taxes and assessments due and receive credits and refunds owed to me and to sign any tax agency documents necessary to effectuate these powers.'
  },
  {
    letter: 'g',
    title: 'INSURANCE',
    description: 'To purchase, pay premiums and make claims on life, health, automobile and homeowners\' insurance on my behalf, except my Agent shall not have the power to cash in or change the beneficiary of any life insurance policy.'
  },
  {
    letter: 'h',
    title: 'REAL ESTATE',
    description: 'To acquire, purchase, exchange, lease, grant options to sell, and sell and convey real property, or any interests therein, on such terms and conditions, including credit arrangements, as my Agent shall deem proper; to execute, acknowledge and deliver, under seal or otherwise, any and all assignments, transfers, deeds, papers, documents or instruments which my Agent shall deem necessary in connection therewith.'
  },
  {
    letter: 'i',
    title: 'PERSONAL PROPERTY',
    description: 'To acquire, purchase, exchange, lease, grant options to sell, and sell and convey personal property, or any interests therein, on such terms and conditions, including credit arrangements, as my Agent shall deem proper; to execute, acknowledge and deliver, under seal or otherwise, any and all assignments, transfers, titles, papers, documents or instruments which my Agent shall deem necessary in connection therewith.'
  },
  {
    letter: 'j',
    title: 'STOCKS, BONDS AND SECURITIES',
    description: 'To purchase, sell or otherwise dispose of, assign, transfer and convey shares of stock, bonds, securities and other personal property now or hereafter belonging to me, whether standing in my name or otherwise, and wherever situated.'
  },
  {
    letter: 'k',
    title: 'PROPERTY MANAGEMENT',
    description: 'To maintain, repair, improve, invest, manage, insure, rent, lease, encumber, and in any manner deal with any real or personal property, tangible or intangible, or any interests therein, that I now own or may hereafter acquire, in my name and for my benefit, upon such terms and conditions as my Agent shall deem proper.'
  },
  {
    letter: 'l',
    title: 'GIFTS',
    description: 'To make gifts, grants, or other transfers (including the forgiveness of indebtedness and the completion of any charitable pledges I may have made) without consideration, either outright or in trust to such person(s) (including my Agent hereunder) or organizations as my Agent shall select.'
  },
  {
    letter: 'm',
    title: 'LEGAL ADVICE AND PROCEEDINGS',
    description: 'To obtain and pay for legal advice, to initiate or defend legal and administrative proceedings on my behalf, including actions against third parties who refuse, without cause, to honor this instrument.'
  },
  {
    letter: 'n',
    title: 'DIGITAL ASSETS',
    description: 'To access, manage, control, and make decisions regarding my digital assets, including email accounts, social media accounts, online financial accounts, cloud storage, cryptocurrency, and any other electronic records or communications.'
  },
  {
    letter: 'o',
    title: 'SPECIAL INSTRUCTIONS',
    description: 'On the following lines are any special instructions limiting or extending the powers I give to my Agent:'
  }
];

// ============================================
// HYBRID PDF GENERATOR CLASS
// ============================================

class POAPDFBuilder {
  private doc: PDFDocument | null = null;
  private font: PDFFont | null = null;
  private fontBold: PDFFont | null = null;
  private page: PDFPage | null = null;
  private y: number = 0;
  
  private readonly PAGE_WIDTH = 612;
  private readonly PAGE_HEIGHT = 792;
  private readonly MARGIN = 72;
  private readonly LINE_HEIGHT = 14;
  private readonly CONTENT_WIDTH = this.PAGE_WIDTH - (this.MARGIN * 2);

  async initialize(): Promise<void> {
    this.doc = await PDFDocument.create();
    this.font = await this.doc.embedFont(StandardFonts.Helvetica);
    this.fontBold = await this.doc.embedFont(StandardFonts.HelveticaBold);
    this.addPage();
  }

  private addPage(): void {
    if (!this.doc) return;
    this.page = this.doc.addPage([this.PAGE_WIDTH, this.PAGE_HEIGHT]);
    this.y = this.PAGE_HEIGHT - this.MARGIN;
  }

  private checkPageBreak(spaceNeeded: number = 80): void {
    if (this.y - spaceNeeded < this.MARGIN) {
      this.addPage();
    }
  }

  private writeText(text: string, size = 11, bold = false, indent = 0): void {
    if (!this.page || !this.font) return;
    
    this.checkPageBreak();
    const currentFont = bold ? this.fontBold! : this.font;
    
    this.page.drawText(text, {
      x: this.MARGIN + indent,
      y: this.y,
      size: size,
      font: currentFont,
      color: rgb(0, 0, 0),
    });
    
    this.y -= this.LINE_HEIGHT + 2;
  }

  private writeCentered(text: string, size = 12, bold = false): void {
    if (!this.page || !this.font) return;
    
    this.checkPageBreak();
    const currentFont = bold ? this.fontBold! : this.font;
    const textWidth = currentFont.widthOfTextAtSize(text, size);
    const x = (this.PAGE_WIDTH - textWidth) / 2;
    
    this.page.drawText(text, {
      x,
      y: this.y,
      size,
      font: currentFont,
      color: rgb(0, 0, 0),
    });
    
    this.y -= this.LINE_HEIGHT + 4;
  }

  private writeMultiline(text: string, size = 11, bold = false, indent = 0): void {
    if (!this.font) return;
    
    const currentFont = bold ? this.fontBold! : this.font;
    const words = text.split(' ');
    let line = '';
    const maxWidth = this.CONTENT_WIDTH - indent;
    
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const width = currentFont.widthOfTextAtSize(testLine, size);
      
      if (width > maxWidth && line) {
        this.writeText(line, size, bold, indent);
        line = word;
      } else {
        line = testLine;
      }
    }
    
    if (line) {
      this.writeText(line, size, bold, indent);
    }
  }

  private writeCheckbox(letter: string, title: string, checked: boolean, indent = 0): void {
    const checkbox = checked ? `${letter}) ___X___ ${title}` : `${letter}) _______ ${title}`;
    this.writeText(checkbox, 11, false, indent);
  }

  private spacer(lines = 1): void {
    this.y -= (this.LINE_HEIGHT * lines);
  }

  async save(): Promise<Uint8Array> {
    if (!this.doc) throw new Error('Document not initialized');
    return await this.doc.save();
  }

  getPageCount(): number {
    return this.doc?.getPageCount() || 0;
  }

  // ============================================
  // SECTION BUILDERS
  // ============================================

  buildHeader(data: any): void {
    this.spacer(0.5);
    const title = `${data.state.toUpperCase()} ${this.getDocumentTypeTitle(data)}`;
    this.writeCentered(title, 14, true);
    this.spacer(1);
  }

  private getDocumentTypeTitle(data: any): string {
    if (data.isDurable) return 'DURABLE FINANCIAL POWER OF ATTORNEY';
    if (data.isSpringing) return 'SPRINGING FINANCIAL POWER OF ATTORNEY';
    if (data.isLimited) return 'LIMITED FINANCIAL POWER OF ATTORNEY';
    return 'FINANCIAL POWER OF ATTORNEY';
  }

  buildPreamble(data: any): void {
    const principalAddress = `${data.principal.address.street}, ${data.principal.address.city}, ${data.principal.address.state} ${data.principal.address.zipCode}`;
    
    this.writeMultiline(
      `I, ${data.principal.fullName}, of ${principalAddress}, as Principal appoint the following person(s) as my Agent (Attorney in Fact) to act for me and in my name (in any way I could act in person).`
    );
    this.spacer(1);
  }

  buildEffectiveDate(data: any): void {
    this.writeText('EFFECTIVE ON:', 11, true);
    this.spacer(0.5);
    
    if (data.isDurable) {
      this.writeText('[X] This power of attorney is DURABLE and effective immediately.', 11, false, 20);
      this.writeMultiline(
        'This power of attorney shall continue in effect notwithstanding my subsequent disability or incapacity.',
        10, false, 30
      );
    } else if (data.isSpringing) {
      this.writeText('[X] This power of attorney becomes effective upon disability or incapacity.', 11, false, 20);
      if (data.springingCondition) {
        this.writeMultiline(
          `Condition: ${data.springingCondition}`,
          10, false, 30
        );
      }
    } else if (data.effectiveDate) {
      this.writeText(`[X] This power of attorney becomes effective on ${new Date(data.effectiveDate).toLocaleDateString()}.`, 11, false, 20);
    } else {
      this.writeText('[X] This power of attorney is effective immediately.', 11, false, 20);
    }
    
    if (data.expirationDate) {
      this.spacer(0.5);
      this.writeText(`This power of attorney expires on ${new Date(data.expirationDate).toLocaleDateString()}.`, 11, false, 20);
    }
    
    this.spacer(1);
  }

  buildAgentDesignation(data: any): void {
    const primaryAgent = data.agents?.find((a: any) => a.type === 'PRIMARY');
    if (!primaryAgent) return;
    
    this.writeText('AGENT DESIGNATION:', 11, true);
    this.spacer(0.5);
    
    this.writeText(`Name: ${primaryAgent.fullName}`, 11, false, 20);
    this.writeText(`Address: ${primaryAgent.address.street}, ${primaryAgent.address.city}, ${primaryAgent.address.state} ${primaryAgent.address.zipCode}`, 11, false, 20);
    if (primaryAgent.email) this.writeText(`Email: ${primaryAgent.email}`, 11, false, 20);
    if (primaryAgent.phone) this.writeText(`Phone: ${primaryAgent.phone}`, 11, false, 20);
    
    this.spacer(1);
  }

  buildPowersOfAgent(data: any, powerCategories: any[]): void {
    this.writeText('POWERS OF AGENT - I grant my Agent authority to act on my behalf in the', 11, false);
    this.writeText('following areas (initial each area granted):', 11, false);
    this.spacer(1);
    
    // Get granted power IDs
    const grantedIds = new Set(data.grantedPowers?.categoryIds || []);
    const grantAll = data.grantedPowers?.grantAllPowers;
    
    powerCategories.forEach((category: any) => {
      const isGranted = grantAll || grantedIds.has(category.id);
      
      this.checkPageBreak(60);
      this.writeCheckbox(category.categoryLetter || category.letter, category.categoryName || category.title, isGranted);
      
      if (isGranted) {
        const description = category.plainLanguageDesc || category.description;
        this.writeMultiline(description, 10, false, 20);
      }
      
      // Add special instructions for the last category
      if (category.letter === 'o' && data.specialInstructions) {
        this.spacer(0.5);
        const instructions = data.specialInstructions.split('\n');
        instructions.forEach((line: string) => {
          this.writeText(line, 10, false, 30);
        });
      }
      
      this.spacer(0.5);
    });
  }

  buildSuccessorAgents(data: any): void {
    const successors = data.agents?.filter((a: any) => a.type === 'SUCCESSOR').sort((a: any, b: any) => a.order - b.order) || [];
    const coAgents = data.agents?.filter((a: any) => a.type === 'CO_AGENT') || [];
    
    if (successors.length === 0 && coAgents.length === 0) return;
    
    this.checkPageBreak(100);
    this.writeText('SUCCESSOR AGENTS:', 11, true);
    this.spacer(0.5);
    
    if (successors.length > 0) {
      successors.forEach((agent: any, index: number) => {
        this.writeText(
          `${index + 1}${index === 0 ? 'st' : index === 1 ? 'nd' : index === 2 ? 'rd' : 'th'} Successor: ${agent.fullName}, ${agent.address.street}, ${agent.address.city}, ${agent.address.state} ${agent.address.zipCode}`,
          11, false, 20
        );
      });
      this.spacer(0.5);
    }
    
    if (coAgents.length > 0) {
      this.writeText('CO-AGENTS:', 11, true);
      this.spacer(0.5);
      
      coAgents.forEach((agent: any) => {
        this.writeText(
          `${agent.fullName}, ${agent.address.street}, ${agent.address.city}, ${agent.address.state} ${agent.address.zipCode}`,
          11, false, 20
        );
      });
      
      this.spacer(0.5);
      if (data.coAgentsMustActJointly) {
        this.writeText('All co-agents must act jointly and unanimously.', 11, false, 20);
      } else {
        this.writeText('Co-agents may act independently.', 11, false, 20);
      }
      this.spacer(0.5);
    }
  }

  buildLimitations(data: any): void {
    if (!data.powerLimitations || data.powerLimitations.length === 0) return;
    
    this.checkPageBreak(100);
    this.writeText('LIMITATIONS AND RESTRICTIONS:', 11, true);
    this.spacer(0.5);
    
    this.writeMultiline(
      'The powers granted to my agent are subject to the following limitations and restrictions:'
    );
    this.spacer(0.5);
    
    data.powerLimitations.forEach((limitation: any, index: number) => {
      this.checkPageBreak(40);
      this.writeText(`${index + 1}. ${limitation.limitationType}:`, 11, true, 20);
      this.writeMultiline(limitation.limitationText, 10, false, 30);
      this.spacer(0.5);
    });
    
    this.spacer(0.5);
  }

  buildDutiesOfAgent(): void {
    this.checkPageBreak(100);
    this.writeText('DUTIES OF AGENT:', 11, true);
    this.spacer(0.5);
    
    this.writeMultiline(
      'My Agent must act in good faith and in my best interest, use reasonable caution and diligence, keep my assets separate and identifiable, maintain records of all transactions, and act only within the scope of authority granted in this document.'
    );
    this.spacer(1);
  }

  buildCompensation(data: any): void {
    this.checkPageBreak(80);
    this.writeText('REIMBURSEMENT AND COMPENSATION OF AGENT:', 11, true);
    this.spacer(0.5);
    
    this.writeMultiline(
      'My Agent is entitled to reimbursement for reasonable expenses incurred in exercising powers hereunder.'
    );
    this.spacer(0.5);
    
    if (data.agentCompensation && data.compensationDetails) {
      this.writeText('Compensation:', 11, true, 20);
      this.writeMultiline(data.compensationDetails, 11, false, 30);
    } else {
      this.writeMultiline(
        'My Agent shall serve without additional compensation beyond reimbursement of expenses.',
        11, false, 20
      );
    }
    
    this.spacer(1);
  }

  buildRevocation(): void {
    this.checkPageBreak(80);
    this.writeText('AMENDMENT AND REVOCATION:', 11, true);
    this.spacer(0.5);
    
    this.writeMultiline(
      'I can amend or revoke this power of attorney through a writing delivered to my Agent. Any amendment or revocation is ineffective as to a third party until such third party has notice of such revocation or amendment.'
    );
    this.spacer(1);
  }

  buildGoverningLaw(data: any): void {
    this.checkPageBreak(60);
    this.writeText('STATE LAW:', 11, true);
    this.spacer(0.5);
    
    this.writeMultiline(
      `This Power of Attorney is governed by the laws of the State of ${data.state}.`
    );
    this.spacer(1);
    
    this.writeText('PHOTOCOPIES:', 11, true);
    this.spacer(0.5);
    
    this.writeMultiline(
      'Photocopies of this document can be relied upon as though they were originals.'
    );
  }

  buildSignaturePage(data: any, stateReqs?: any): void {
    // New page for signatures
    this.addPage();
    this.spacer(1);
    
    this.writeText('PRINCIPAL SIGNATURE', 12, true);
    this.spacer(1.5);
    
    this.writeMultiline(
      'IN WITNESS WHEREOF, I have on ______________________ (mm/dd/yyyy) executed this Financial Power of Attorney.'
    );
    this.spacer(2);
    
    this.writeText('_______________________________________ Principal\'s Signature', 11, false);
    this.writeText(data.principal.fullName, 11, false);
    this.spacer(2);
    
    this.writeText(`STATE OF ${data.state.toUpperCase()}`, 11, false);
    this.spacer(0.5);
    this.writeText('________________ County, ss.', 11, false);
    this.spacer(2);
    
    // Notarization
    if (stateReqs?.requiresNotary !== false) {
      this.buildNotarization(data);
    }
    
    // Witnesses
    if (stateReqs?.requiresWitnesses) {
      this.buildWitnesses(stateReqs.numberOfWitnesses || 2);
    }
  }

  buildNotarization(data: any): void {
    this.checkPageBreak(150);
    this.writeText('NOTARIZATION', 12, true);
    this.spacer(1);
    
    this.writeMultiline(
      'On ________________ (mm/dd/yyyy), before me appeared ______________________, as Principal of this Power of Attorney who proved to me through government-issued photo identification to be the above-named person, who in my presence executed the foregoing instrument and acknowledged that (s)he executed the same as his/her free act and deed.'
    );
    this.spacer(2);
    
    this.writeText('                                        ________________________________', 11, false);
    this.writeText('                                        Notary Public', 11, false);
    this.spacer(1);
    this.writeText('                                        My commission expires: ________________', 11, false);
  }

  buildWitnesses(count: number): void {
    this.checkPageBreak(150);
    this.spacer(2);
    this.writeText('WITNESSES', 12, true);
    this.spacer(1);
    
    for (let i = 0; i < count; i++) {
      this.checkPageBreak(100);
      this.writeText(`Witness ${i + 1}:`, 11, true);
      this.spacer(0.5);
      this.writeText('_________________________________________', 11, false, 20);
      this.writeText('Signature', 10, false, 20);
      this.spacer(0.5);
      this.writeText('_________________________________________', 11, false, 20);
      this.writeText('Printed Name', 10, false, 20);
      this.spacer(0.5);
      this.writeText('_________________________________________', 11, false, 20);
      this.writeText('Address', 10, false, 20);
      this.spacer(1.5);
    }
  }

  buildAgentAcceptance(data: any): void {
    this.addPage();
    this.spacer(1);
    
    this.writeText('AGENT\'S CERTIFICATION AND ACCEPTANCE OF AUTHORITY', 12, true);
    this.spacer(1.5);
    
    const primaryAgent = data.agents?.find((a: any) => a.type === 'PRIMARY');
    const agentName = primaryAgent?.fullName || '__________________';
    
    this.writeMultiline(
      `I, ${agentName}, certify that the attached is a true copy of a power of attorney naming me as Agent for ${data.principal.fullName}. I certify that to the best of my knowledge the Principal has the capacity to execute the power of attorney, is alive, and has not revoked the power of attorney; that my power as Agent have not been altered or terminated; and that the power of attorney remains in full force and effect.`
    );
    this.spacer(1);
    
    this.writeMultiline(
      'I accept the appointment as Agent under this power of attorney.'
    );
    this.spacer(1);
    
    this.writeMultiline(
      'This certification and acceptance is made under penalty of perjury.'
    );
    this.spacer(3);
    
    this.writeText('Agent\'s Signature ___________________________________', 11, false);
    this.spacer(1);
    
    if (primaryAgent) {
      this.writeText(
        `${primaryAgent.fullName} of ${primaryAgent.address.street}, ${primaryAgent.address.city}, ${data.state}, ${primaryAgent.address.zipCode}.`,
        11, false
      );
    }
  }
}

// ============================================
// PUBLIC API
// ============================================

export async function generateFinancialPOAPDF(
  params: GeneratePOAPDFParams
): Promise<PDFGenerationResult> {
  const { poaData, stateRequirements, powerCategories } = params;
  const data = poaData;
  
  // Use provided power categories or defaults
  const categories = powerCategories || DEFAULT_POWER_CATEGORIES;
  
  // Initialize PDF builder
  const builder = new POAPDFBuilder();
  await builder.initialize();
  
  // Build document sections
  builder.buildHeader(data);
  builder.buildPreamble(data);
  builder.buildEffectiveDate(data);
  builder.buildAgentDesignation(data);
  builder.buildPowersOfAgent(data, categories);
  builder.buildSuccessorAgents(data);
  builder.buildLimitations(data);
  builder.buildDutiesOfAgent();
  builder.buildCompensation(data);
  builder.buildRevocation();
  builder.buildGoverningLaw(data);
  builder.buildSignaturePage(data, stateRequirements);
  builder.buildAgentAcceptance(data);
  
  // Generate PDF
  const pdfBytes = await builder.save();
  
  // Generate filename
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const principalName = data.principal.fullName.toLowerCase().replace(/\s+/g, '_');
  const filename = `poa_financial_${data.state.toLowerCase()}_${principalName}_${date}.pdf`;
  
  return {
    buffer: Buffer.from(pdfBytes),
    filename,
    pageCount: builder.getPageCount()
  };
}

// Revocation PDF (unchanged from existing)
export async function generateRevocationPDF(params: {
  poa: any;
  revocation: any;
  revokedAt: Date;
}): Promise<PDFGenerationResult> {
  const { poa, revocation, revokedAt } = params;

  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  let page = pdfDoc.addPage([612, 792]);
  let { height } = page.getSize();
  let y = height - 50;
  const margin = 72;
  const lineHeight = 14;

  const writeText = (text: string, size = 12, bold = false, indent = 0) => {
    const currentFont = bold ? fontBold : font;
    page.drawText(text, {
      x: margin + indent,
      y: y,
      size: size,
      font: currentFont,
      color: rgb(0, 0, 0),
    });
    y -= lineHeight + 2;
  };

  writeText('REVOCATION OF POWER OF ATTORNEY', 14, true);
  y -= 20;

  writeText(`I, ${poa.principalName}, hereby revoke the Power of Attorney`, 12, false);
  writeText(`dated ${new Date(poa.createdAt).toLocaleDateString()} and all authority`, 12, false);
  writeText('granted thereunder to any agent(s) named therein.', 12, false);
  y -= 20;

  writeText(`Reason for revocation: ${revocation.reason || 'Not specified'}`, 11, false);
  writeText(`Date of revocation: ${new Date(revokedAt).toLocaleDateString()}`, 11, false);
  y -= 40;

  writeText('PRINCIPAL SIGNATURE', 12, true);
  y -= 30;
  writeText('_________________________________', 11, false);
  writeText(poa.principalName, 11, false);
  writeText(`Date: ${new Date().toLocaleDateString()}`, 11, false);

  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const filename = `poa_revocation_${poa.principalName.toLowerCase().replace(/\s+/g, '_')}_${date}.pdf`;

  const pdfBytes = await pdfDoc.save();
  
  return {
    buffer: Buffer.from(pdfBytes),
    filename,
    pageCount: pdfDoc.getPageCount()
  };
}

// Healthcare POA placeholder
export async function generateHealthcarePOAPDF(
  params: GeneratePOAPDFParams
): Promise<PDFGenerationResult> {
  throw new Error('Healthcare POA PDF generation not yet implemented');
}
