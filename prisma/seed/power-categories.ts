// POA Power Categories Seed Data
// These are the 14 standard power categories used across most states

export const POA_POWER_CATEGORIES = [
  {
    categoryNumber: 1,
    categoryName: "Real Property Transactions",
    categoryLetter: "A",
    isDangerous: false,
    description: "Authority to buy, sell, lease, mortgage, and manage real estate",
    statutoryDefinition: `Authority to demand, buy, lease, receive, accept as a gift or as security for an extension of credit, or otherwise acquire or reject an interest in real property or a right incident to real property; sell, exchange, convey with or without covenants, representations, or warranties, quit claim, release, surrender, retain title for security, encumber, partition, consent to partitioning, subject to an easement or covenant, subdivide, apply for zoning or other governmental permits, plat or consent to platting, develop, grant an option concerning, lease, sublease, contribute to an entity in exchange for an interest in that entity, or otherwise grant or dispose of an interest in real property or a right incident to real property.`,
    sortOrder: 1,
    subPowers: [
      { powerText: "Buy, sell, exchange, or partition real estate", isDangerous: false, sortOrder: 1 },
      { powerText: "Grant, convey, mortgage, lease (as landlord or tenant), or release any interest in real property", isDangerous: false, sortOrder: 2 },
      { powerText: "Execute, acknowledge, and deliver deeds, mortgages, deeds of trust, leases, easements, or any other instrument", isDangerous: false, sortOrder: 3 },
      { powerText: "Accept or reject title insurance, surveys, appraisals", isDangerous: false, sortOrder: 4 },
      { powerText: "Pay or contest real-estate taxes and assessments", isDangerous: false, sortOrder: 5 },
      { powerText: "Foreclose or redeem from foreclosure", isDangerous: false, sortOrder: 6 },
      { powerText: "Manage, insure, repair, improve, subdivide, or vacate property", isDangerous: false, sortOrder: 7 }
    ]
  },
  
  {
    categoryNumber: 2,
    categoryName: "Tangible Personal Property Transactions",
    categoryLetter: "B",
    isDangerous: false,
    description: "Authority to buy, sell, and manage personal property (vehicles, furniture, jewelry, etc.)",
    statutoryDefinition: `Authority to buy, sell, lease, exchange, store, ship, pledge, or abandon any vehicle, boat, aircraft, furniture, jewelry, collectibles, animals, equipment, firearms, or other tangible items; register, title, insure, or transfer ownership of titled property.`,
    sortOrder: 2,
    subPowers: [
      { powerText: "Buy, sell, lease, exchange vehicles, boats, aircraft, furniture, jewelry, collectibles, or other tangible items", isDangerous: false, sortOrder: 1 },
      { powerText: "Register, title, insure, or transfer ownership of titled property", isDangerous: false, sortOrder: 2 }
    ]
  },
  
  {
    categoryNumber: 3,
    categoryName: "Stock and Bond Transactions",
    categoryLetter: "C",
    isDangerous: false,
    description: "Authority to buy, sell, and manage securities",
    statutoryDefinition: `Authority to buy, sell, assign, transfer, pledge, or hypothecate stocks, bonds, mutual funds, ETFs, options, warrants, treasury securities, or any other securities; open, close, or maintain brokerage, margin, or options accounts; exercise voting rights, tender offers, conversions, or rights offerings.`,
    sortOrder: 3,
    subPowers: [
      { powerText: "Buy, sell, and exchange stocks, bonds, mutual funds, ETFs, or other securities", isDangerous: false, sortOrder: 1 },
      { powerText: "Open, close, or modify brokerage accounts", isDangerous: false, sortOrder: 2 },
      { powerText: "Exercise voting rights as shareholder", isDangerous: false, sortOrder: 3 }
    ]
  },
  
  {
    categoryNumber: 4,
    categoryName: "Commodity and Option Transactions",
    categoryLetter: "D",
    isDangerous: false,
    description: "Authority to trade commodities, futures, and options",
    statutoryDefinition: `Authority to buy, sell, exercise, or close out futures contracts, options on futures, commodities, precious metals, or currencies.`,
    sortOrder: 4,
    subPowers: [
      { powerText: "Buy, sell, exercise, or close out commodity futures contracts and options", isDangerous: false, sortOrder: 1 }
    ]
  },
  
  {
    categoryNumber: 5,
    categoryName: "Banking and Financial Institution Transactions",
    categoryLetter: "E",
    isDangerous: false,
    description: "Authority to access and manage bank accounts",
    statutoryDefinition: `Authority to open, close, modify, or freeze checking, savings, money-market, certificate-of-deposit, or safe-deposit accounts; deposit, withdraw, transfer funds, sign checks, drafts, or withdrawal slips; borrow money (unsecured or secured except real-estate mortgages); pledge accounts as collateral; transact by wire, ACH, or any electronic means.`,
    sortOrder: 5,
    subPowers: [
      { powerText: "Open, close, modify, or freeze bank accounts", isDangerous: false, sortOrder: 1 },
      { powerText: "Deposit, withdraw, or transfer funds", isDangerous: false, sortOrder: 2 },
      { powerText: "Sign checks, drafts, or withdrawal slips", isDangerous: false, sortOrder: 3 },
      { powerText: "Borrow money or pledge accounts as collateral", isDangerous: false, sortOrder: 4 },
      { powerText: "Access safe deposit boxes", isDangerous: false, sortOrder: 5 }
    ]
  },
  
  {
    categoryNumber: 6,
    categoryName: "Business Operating Transactions",
    categoryLetter: "F",
    isDangerous: true, // DANGEROUS POWER
    description: "Authority to operate, manage, or dissolve businesses",
    statutoryDefinition: `Authority to form, operate, reorganize, merge, convert, sell, purchase, or dissolve any sole proprietorship, partnership, limited-liability company, corporation, or joint venture; enter, modify, or terminate contracts, leases, or licenses; hire, fire, set compensation, or bind the business to debt or guarantees; admit or remove partners, members, or shareholders.`,
    sortOrder: 6,
    subPowers: [
      { powerText: "Form, operate, sell, or dissolve any business entity", isDangerous: true, sortOrder: 1 },
      { powerText: "Enter, modify, or terminate business contracts", isDangerous: true, sortOrder: 2 },
      { powerText: "Hire, fire employees, or set compensation", isDangerous: true, sortOrder: 3 },
      { powerText: "Bind business to debt or guarantees", isDangerous: true, sortOrder: 4 }
    ]
  },
  
  {
    categoryNumber: 7,
    categoryName: "Insurance and Annuity Transactions",
    categoryLetter: "G",
    isDangerous: false,
    description: "Authority to manage insurance policies and annuities",
    statutoryDefinition: `Authority to apply for, modify, cancel, borrow against, or surrender life, health, disability, long-term-care, property, liability, or annuity contracts; change ownership or beneficiaries on insurance contracts; accept assignments of policies.`,
    sortOrder: 7,
    subPowers: [
      { powerText: "Apply for, modify, or cancel insurance policies", isDangerous: false, sortOrder: 1 },
      { powerText: "Borrow against or surrender insurance policies", isDangerous: false, sortOrder: 2 },
      { powerText: "Change ownership or beneficiaries (unless limited by #12)", isDangerous: false, sortOrder: 3 }
    ]
  },
  
  {
    categoryNumber: 8,
    categoryName: "Estate, Trust, and Beneficiary Transactions",
    categoryLetter: "H",
    isDangerous: true, // DANGEROUS POWER
    description: "Authority to create trusts, make gifts, and change beneficiaries",
    statutoryDefinition: `Authority to create, amend, fund, or revoke revocable or irrevocable trusts; add or remove trust property or beneficiaries; exercise powers of appointment; disclaim or renounce any interest in property or inheritance; make gifts of any amount to any person or charity; change payable-on-death, transfer-on-death, or joint-account designations; fund or invade irrevocable trusts.`,
    sortOrder: 8,
    subPowers: [
      { powerText: "Create, amend, fund, or revoke trusts", isDangerous: true, sortOrder: 1 },
      { powerText: "Make gifts of any amount to any person or charity", isDangerous: true, sortOrder: 2 },
      { powerText: "Change payable-on-death or transfer-on-death designations", isDangerous: true, sortOrder: 3 },
      { powerText: "Disclaim or renounce inheritances", isDangerous: true, sortOrder: 4 },
      { powerText: "Exercise powers of appointment", isDangerous: true, sortOrder: 5 }
    ]
  },
  
  {
    categoryNumber: 9,
    categoryName: "Claims and Litigation",
    categoryLetter: "I",
    isDangerous: false,
    description: "Authority to initiate or settle legal claims",
    statutoryDefinition: `Authority to initiate, defend, settle, abandon, or appeal any lawsuit, arbitration, or administrative proceeding; hire, fire, or pay attorneys or experts; bind principal to settlements, judgments, or confessions of liability.`,
    sortOrder: 9,
    subPowers: [
      { powerText: "Initiate, defend, or settle lawsuits", isDangerous: false, sortOrder: 1 },
      { powerText: "Hire or pay attorneys and experts", isDangerous: false, sortOrder: 2 },
      { powerText: "Bind principal to settlements or judgments", isDangerous: false, sortOrder: 3 }
    ]
  },
  
  {
    categoryNumber: 10,
    categoryName: "Personal and Family Maintenance",
    categoryLetter: "J",
    isDangerous: false,
    description: "Authority to pay household expenses and support family",
    statutoryDefinition: `Authority to pay household expenses, medical bills, tuition, support for spouse, children, or dependents; hire caregivers, enter contracts for nursing-home or assisted-living care; apply for public benefits (Medicaid, SSI, food stamps, housing assistance).`,
    sortOrder: 10,
    subPowers: [
      { powerText: "Pay household expenses and medical bills", isDangerous: false, sortOrder: 1 },
      { powerText: "Support spouse, children, or dependents", isDangerous: false, sortOrder: 2 },
      { powerText: "Hire caregivers or enter care facility contracts", isDangerous: false, sortOrder: 3 },
      { powerText: "Apply for public benefits", isDangerous: false, sortOrder: 4 }
    ]
  },
  
  {
    categoryNumber: 11,
    categoryName: "Benefits from Governmental Programs or Civil/Military Service",
    categoryLetter: "K",
    isDangerous: false,
    description: "Authority to manage Social Security, Medicare, VA benefits, etc.",
    statutoryDefinition: `Authority to apply for, modify, or terminate Social Security, Medicare, Medicaid, VA benefits, military pensions, or any other federal, state, or local benefit.`,
    sortOrder: 11,
    subPowers: [
      { powerText: "Apply for or modify Social Security benefits", isDangerous: false, sortOrder: 1 },
      { powerText: "Manage Medicare or Medicaid benefits", isDangerous: false, sortOrder: 2 },
      { powerText: "Manage VA benefits or military pensions", isDangerous: false, sortOrder: 3 }
    ]
  },
  
  {
    categoryNumber: 12,
    categoryName: "Retirement Plan Transactions",
    categoryLetter: "L",
    isDangerous: true, // DANGEROUS POWER
    description: "Authority to manage retirement accounts and change beneficiaries",
    statutoryDefinition: `Authority to change beneficiaries on 401(k), 403(b), IRA, Roth IRA, SEP, SIMPLE, pension, profit-sharing, or any qualified or non-qualified plan; increase, decrease, or stop contributions; reallocate investments, take loans, hardship withdrawals, or required minimum distributions; roll over, convert, or cash out entire plans; designate or change death beneficiaries.`,
    sortOrder: 12,
    subPowers: [
      { powerText: "Change beneficiaries on retirement accounts", isDangerous: true, sortOrder: 1 },
      { powerText: "Take withdrawals or distributions", isDangerous: true, sortOrder: 2 },
      { powerText: "Roll over, convert, or cash out retirement plans", isDangerous: true, sortOrder: 3 },
      { powerText: "Reallocate investments within retirement accounts", isDangerous: false, sortOrder: 4 }
    ]
  },
  
  {
    categoryNumber: 13,
    categoryName: "Tax Matters",
    categoryLetter: "M",
    isDangerous: false,
    description: "Authority to prepare, file, and manage tax returns",
    statutoryDefinition: `Authority to prepare, sign, and file federal, state, and local income, gift, estate, or other tax returns; represent principal before the IRS or any tax authority; make tax elections, consent to gift splitting, allocate GST exemption; pay taxes or receive refunds.`,
    sortOrder: 13,
    subPowers: [
      { powerText: "Prepare, sign, and file tax returns", isDangerous: false, sortOrder: 1 },
      { powerText: "Represent principal before IRS or tax authorities", isDangerous: false, sortOrder: 2 },
      { powerText: "Pay taxes or receive refunds", isDangerous: false, sortOrder: 3 }
    ]
  },
  
  {
    categoryNumber: 14,
    categoryName: "Digital Assets",
    categoryLetter: "N",
    isDangerous: false,
    description: "Authority to access and manage digital property and online accounts",
    statutoryDefinition: `Authority to access and manage digital assets including cryptocurrency wallets, social media accounts, cloud storage (Google Drive, iCloud, Dropbox), digital wallets, email accounts, online financial accounts, and any other digital property.`,
    sortOrder: 14,
    subPowers: [
      { powerText: "Access and manage cryptocurrency and digital wallets", isDangerous: false, sortOrder: 1 },
      { powerText: "Manage social media and email accounts", isDangerous: false, sortOrder: 2 },
      { powerText: "Access cloud storage (Google Drive, iCloud, Dropbox)", isDangerous: false, sortOrder: 3 },
      { powerText: "Manage online financial and investment accounts", isDangerous: false, sortOrder: 4 }
    ]
  }
];

// Dangerous power summary
export const DANGEROUS_POWERS = [6, 8, 12]; // Business, Estate/Trust/Gifts, Retirement Plans

export const DANGEROUS_POWER_WARNINGS = {
  6: "⚠️ BUSINESS OPERATIONS: Agent could dissolve your business, fire employees, or bind you to major debt.",
  8: "⚠️ ESTATE & GIFTS: Agent could gift all your assets to themselves or change who inherits your estate.",
  12: "⚠️ RETIREMENT PLANS: Agent could change beneficiaries on all retirement accounts or cash them out entirely."
};
