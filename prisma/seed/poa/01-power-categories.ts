import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function seedPowerCategories() {
  console.log('  📋 Seeding power categories...');

  // Check if already seeded
  const existingCount = await prisma.pOAPowerCategoryDefinition.count();
  if (existingCount > 0) {
    console.log('  ⏭️  Power categories already seeded, skipping...');
    return;
  }

  const categories = [
    {
      categoryNumber: 1,
      categoryLetter: 'A',
      categoryName: 'Real Property Transactions',
      statutoryDefinition: 'To lease, buy, sell, mortgage, and otherwise deal with real property.',
      plainLanguageDescription: 'Buy, sell, lease, mortgage, or manage real estate including your home and land.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Buy or sell a house',
        'Refinance mortgage',
        'Sign lease agreements',
        'Manage rental properties',
        'Grant easements'
      ],
      stateSpecificNotes: {
        FL: 'Homestead sale requires specific language',
        TX: 'Spouse must consent to homestead transactions',
        CA: 'Community property considerations'
      },
      sortOrder: 1,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Buy, sell, or exchange real property',
          description: 'Authority to purchase, sell, or exchange real estate',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Mortgage, refinance, or encumber real property',
          description: 'Authority to mortgage, refinance, or place liens on real estate',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Lease real property as landlord or tenant',
          description: 'Authority to enter into lease agreements',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Release, assign, satisfy, or enforce mortgages',
          description: 'Authority to manage existing mortgages and liens',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        },
        {
          subPowerNumber: 5,
          subPowerName: 'Grant easements or rights of way',
          description: 'Authority to grant property rights to others',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 5
        }
      ]
    },
    {
      categoryNumber: 2,
      categoryLetter: 'B',
      categoryName: 'Tangible Personal Property',
      statutoryDefinition: 'To buy, sell, and otherwise deal with tangible personal property.',
      plainLanguageDescription: 'Buy, sell, or manage physical items like vehicles, furniture, jewelry, and other belongings.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Sell a car',
        'Buy furniture',
        'Donate personal items',
        'Store belongings'
      ],
      stateSpecificNotes: {},
      sortOrder: 2,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Buy, sell, exchange, or lease tangible personal property',
          description: 'Authority to transact in physical personal property',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Accept, receive, or deliver tangible personal property',
          description: 'Authority to take possession or deliver personal property',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Insure tangible personal property',
          description: 'Authority to obtain insurance for personal property',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        }
      ]
    },
    {
      categoryNumber: 3,
      categoryLetter: 'C',
      categoryName: 'Stock and Bond Transactions',
      statutoryDefinition: 'To buy, sell, and otherwise deal with stocks, bonds, mutual funds, and other securities.',
      plainLanguageDescription: 'Buy, sell, or manage stocks, bonds, mutual funds, and other investments.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Buy stocks',
        'Sell bonds',
        'Manage brokerage account',
        'Vote shares'
      ],
      stateSpecificNotes: {},
      sortOrder: 3,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Buy, sell, exchange stocks, bonds, and securities',
          description: 'Authority to trade securities',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Vote shares and exercise shareholder rights',
          description: 'Authority to vote as shareholder and exercise corporate rights',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Receive dividends and interest',
          description: 'Authority to collect investment income',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        }
      ]
    },
    {
      categoryNumber: 4,
      categoryLetter: 'D',
      categoryName: 'Commodity and Option Transactions',
      statutoryDefinition: 'To buy, sell, and otherwise deal with commodities and commodity futures and options.',
      plainLanguageDescription: 'Trade commodities, futures, and options (advanced investments).',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Trade commodity futures',
        'Buy/sell options',
        'Manage futures accounts'
      ],
      stateSpecificNotes: {},
      sortOrder: 4,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Buy, sell, exchange commodities and futures',
          description: 'Authority to trade commodities and futures contracts',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Trade options and derivatives',
          description: 'Authority to trade options and derivative securities',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        }
      ]
    },
    {
      categoryNumber: 5,
      categoryLetter: 'E',
      categoryName: 'Banking and Financial Institution Transactions',
      statutoryDefinition: 'To conduct banking and other financial institution transactions.',
      plainLanguageDescription: 'Manage bank accounts, write checks, make deposits and withdrawals.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Deposit checks',
        'Withdraw cash',
        'Pay bills',
        'Open/close accounts'
      ],
      stateSpecificNotes: {},
      sortOrder: 5,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Open, close, and manage bank accounts',
          description: 'Authority to manage banking relationships',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Make deposits and withdrawals',
          description: 'Authority to deposit and withdraw funds',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Write checks and transfer funds',
          description: 'Authority to make payments and transfers',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Access safe deposit boxes',
          description: 'Authority to access safe deposit boxes',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 6,
      categoryLetter: 'F',
      categoryName: 'Business Operating Transactions',
      statutoryDefinition: 'To operate, buy, sell, merge, dissolve, or otherwise deal with a business interest.',
      plainLanguageDescription: 'Operate, sell, or close a business. This includes making major business decisions.',
      isDangerous: true,
      dangerWarning: 'WARNING: This power allows your agent to sell your business, dissolve it, or bind it to contracts and debts. Only grant if you fully trust your agent with your business.',
      examples: [
        'Run your business',
        'Sell business assets',
        'Sign contracts',
        'Hire/fire employees'
      ],
      stateSpecificNotes: {
        NY: 'Requires separate initials',
        CA: 'Additional notice required'
      },
      sortOrder: 6,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Operate business and make business decisions',
          description: 'Authority to run and manage business operations',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Buy, sell, or dissolve business interests',
          description: 'Authority to sell or close the business',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Hire, fire, and manage employees',
          description: 'Authority to manage workforce',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Sign contracts and bind business to obligations',
          description: 'Authority to enter contracts on behalf of business',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 7,
      categoryLetter: 'G',
      categoryName: 'Insurance and Annuity Transactions',
      statutoryDefinition: 'To buy, borrow against, cash in, and otherwise deal with insurance and annuity policies.',
      plainLanguageDescription: 'Manage insurance policies and annuities, including life, health, and property insurance.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Pay insurance premiums',
        'File insurance claims',
        'Change beneficiaries',
        'Cancel policies'
      ],
      stateSpecificNotes: {},
      sortOrder: 7,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Buy, maintain, or cancel insurance policies',
          description: 'Authority to manage insurance policies',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Pay premiums and file claims',
          description: 'Authority to pay for and make claims on insurance',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Borrow against or surrender policies',
          description: 'Authority to access cash value of policies',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Change beneficiaries on policies',
          description: 'Authority to change insurance beneficiaries',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 8,
      categoryLetter: 'H',
      categoryName: 'Estate, Trust, and Beneficiary Transactions',
      statutoryDefinition: 'To create, amend, revoke trusts; make gifts; change beneficiaries; disclaim property; and deal with estate planning matters.',
      plainLanguageDescription: 'Make gifts, change beneficiaries, create trusts, and handle estate planning. Can give away your assets.',
      isDangerous: true,
      dangerWarning: 'DANGER: This power allows your agent to make gifts of YOUR assets (including to themselves), change beneficiaries, and create or modify trusts. Your agent could give away everything you own. Only grant to someone you trust completely.',
      examples: [
        'Make gifts to family',
        'Create trust',
        'Change life insurance beneficiary',
        'Fund trusts'
      ],
      stateSpecificNotes: {
        NY: 'Requires separate Gifts Rider form (statutory form P-2)',
        CA: 'Requires specific authorization language',
        FL: 'Gifts limited without separate authorization'
      },
      sortOrder: 8,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Make gifts of principal\'s property (including to agent)',
          description: 'Authority to make gifts, including to the agent themselves',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Create, amend, or revoke trusts',
          description: 'Authority to create or modify trusts',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Change beneficiaries on any accounts or policies',
          description: 'Authority to change beneficiary designations',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Disclaim or refuse inheritances',
          description: 'Authority to disclaim property or inheritances',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 9,
      categoryLetter: 'I',
      categoryName: 'Claims and Litigation',
      statutoryDefinition: 'To pursue, settle, or abandon claims and lawsuits.',
      plainLanguageDescription: 'File lawsuits, settle legal claims, and handle litigation on your behalf.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'File lawsuit',
        'Settle legal claim',
        'Represent you in court',
        'Hire attorney'
      ],
      stateSpecificNotes: {},
      sortOrder: 9,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Assert, prosecute, and settle claims',
          description: 'Authority to pursue and settle legal claims',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Defend against claims and lawsuits',
          description: 'Authority to defend against legal actions',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Hire attorneys and represent principal',
          description: 'Authority to hire legal representation',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        }
      ]
    },
    {
      categoryNumber: 10,
      categoryLetter: 'J',
      categoryName: 'Personal and Family Maintenance',
      statutoryDefinition: 'To provide for the support, maintenance, health, and education of the principal and principal\'s dependents.',
      plainLanguageDescription: 'Pay for your living expenses, housing, food, medical care, and support of your family.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Pay rent/mortgage',
        'Buy groceries',
        'Pay medical bills',
        'Support dependents'
      ],
      stateSpecificNotes: {},
      sortOrder: 10,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Pay for food, clothing, shelter, and necessities',
          description: 'Authority to provide for basic living needs',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Pay medical, dental, and healthcare expenses',
          description: 'Authority to pay for healthcare',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Support spouse, children, and dependents',
          description: 'Authority to provide for family members',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Employ household staff and caregivers',
          description: 'Authority to hire household help',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 11,
      categoryLetter: 'K',
      categoryName: 'Government Benefits',
      statutoryDefinition: 'To apply for and receive government benefits such as Social Security, Medicare, Medicaid, and veterans benefits.',
      plainLanguageDescription: 'Apply for and manage government benefits like Social Security, Medicare, Medicaid, and VA benefits.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Apply for Social Security',
        'Manage Medicare',
        'Apply for Medicaid',
        'File for VA benefits'
      ],
      stateSpecificNotes: {},
      sortOrder: 11,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Apply for Social Security and SSI benefits',
          description: 'Authority to apply for Social Security benefits',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Manage Medicare and Medicaid',
          description: 'Authority to manage health insurance benefits',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Apply for and manage veterans benefits',
          description: 'Authority to manage VA benefits',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Apply for government assistance programs',
          description: 'Authority to apply for public assistance',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 12,
      categoryLetter: 'L',
      categoryName: 'Retirement Plan Transactions',
      statutoryDefinition: 'To deal with retirement plans including 401(k)s, IRAs, pensions, and other retirement accounts.',
      plainLanguageDescription: 'Manage retirement accounts like 401(k), IRA, pension. Can change beneficiaries and take distributions.',
      isDangerous: true,
      dangerWarning: 'CAUTION: This power allows your agent to change beneficiaries on your retirement accounts, take distributions, and potentially deplete your retirement savings. Grant carefully.',
      examples: [
        'Manage 401(k)',
        'Take IRA distribution',
        'Change retirement beneficiaries',
        'Rollover accounts'
      ],
      stateSpecificNotes: {},
      sortOrder: 12,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Contribute to and manage retirement accounts',
          description: 'Authority to manage retirement plan contributions',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Take distributions from retirement accounts',
          description: 'Authority to withdraw from retirement accounts',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Change beneficiaries on retirement accounts',
          description: 'Authority to change retirement account beneficiaries',
          isDangerous: true,
          requiresSeparateConsent: true,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Rollover and transfer retirement accounts',
          description: 'Authority to move retirement funds between accounts',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 13,
      categoryLetter: 'M',
      categoryName: 'Tax Matters',
      statutoryDefinition: 'To prepare, sign, and file tax returns and deal with tax authorities.',
      plainLanguageDescription: 'Prepare and file your tax returns, represent you before the IRS, and handle all tax matters.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'File tax returns',
        'Pay taxes',
        'Respond to IRS',
        'Sign tax forms'
      ],
      stateSpecificNotes: {},
      sortOrder: 13,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Prepare and file federal, state, and local tax returns',
          description: 'Authority to file all tax returns',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Pay taxes and estimated taxes',
          description: 'Authority to make tax payments',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Represent principal before tax authorities',
          description: 'Authority to deal with IRS and state tax agencies',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Sign tax returns and tax documents',
          description: 'Authority to sign tax forms',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 14,
      categoryLetter: 'N',
      categoryName: 'Digital Assets',
      statutoryDefinition: 'To access, manage, and control digital assets including email, social media, cryptocurrency, and online accounts.',
      plainLanguageDescription: 'Manage email, social media, online accounts, cryptocurrency, and other digital property.',
      isDangerous: false,
      dangerWarning: null,
      examples: [
        'Access email',
        'Manage social media',
        'Transfer cryptocurrency',
        'Close online accounts'
      ],
      stateSpecificNotes: {},
      sortOrder: 14,
      effectiveDate: new Date('2024-01-01'),
      isCurrentVersion: true,
      subPowers: [
        {
          subPowerNumber: 1,
          subPowerName: 'Access email and online accounts',
          description: 'Authority to access email and online services',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 1
        },
        {
          subPowerNumber: 2,
          subPowerName: 'Manage social media and digital content',
          description: 'Authority to manage social media accounts',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 2
        },
        {
          subPowerNumber: 3,
          subPowerName: 'Buy, sell, and transfer cryptocurrency',
          description: 'Authority to manage cryptocurrency holdings',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 3
        },
        {
          subPowerNumber: 4,
          subPowerName: 'Access cloud storage and digital files',
          description: 'Authority to access digital files and storage',
          isDangerous: false,
          requiresSeparateConsent: false,
          sortOrder: 4
        }
      ]
    }
  ];

  // Create categories with sub-powers
  for (const category of categories) {
    const { subPowers, ...categoryData } = category;
    
    await prisma.pOAPowerCategoryDefinition.create({
      data: {
        ...categoryData,
        subPowers: {
          create: subPowers
        }
      }
    });
  }

  console.log('  ✅ Created 14 power categories with 51 sub-powers');
}
