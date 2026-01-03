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
      plainLanguageDesc: 'Buy, sell, lease, mortgage, or manage real estate including your home and land.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Buy, sell, or exchange real property',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Mortgage, refinance, or encumber real property',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Lease real property as landlord or tenant',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Release, assign, satisfy, or enforce mortgages',
          isDangerous: false,
          sortOrder: 4
        },
        {
          powerText: 'Grant easements or rights of way',
          isDangerous: false,
          sortOrder: 5
        }
      ]
    },
    {
      categoryNumber: 2,
      categoryLetter: 'B',
      categoryName: 'Tangible Personal Property',
      statutoryDefinition: 'To buy, sell, and otherwise deal with tangible personal property.',
      plainLanguageDesc: 'Buy, sell, or manage physical items like vehicles, furniture, jewelry, and other belongings.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Buy, sell, exchange, or lease tangible personal property',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Accept, receive, or deliver tangible personal property',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Insure tangible personal property',
          isDangerous: false,
          sortOrder: 3
        }
      ]
    },
    {
      categoryNumber: 3,
      categoryLetter: 'C',
      categoryName: 'Stock and Bond Transactions',
      statutoryDefinition: 'To buy, sell, and otherwise deal with stocks, bonds, mutual funds, and other securities.',
      plainLanguageDesc: 'Buy, sell, or manage stocks, bonds, mutual funds, and other investments.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Buy, sell, exchange stocks, bonds, and securities',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Vote shares and exercise shareholder rights',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Receive dividends and interest',
          isDangerous: false,
          sortOrder: 3
        }
      ]
    },
    {
      categoryNumber: 4,
      categoryLetter: 'D',
      categoryName: 'Commodity and Option Transactions',
      statutoryDefinition: 'To buy, sell, and otherwise deal with commodities and commodity futures and options.',
      plainLanguageDesc: 'Trade commodities, futures, and options (advanced investments).',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Buy, sell, exchange commodities and futures',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Trade options and derivatives',
          isDangerous: false,
          sortOrder: 2
        }
      ]
    },
    {
      categoryNumber: 5,
      categoryLetter: 'E',
      categoryName: 'Banking and Financial Institution Transactions',
      statutoryDefinition: 'To conduct banking and other financial institution transactions.',
      plainLanguageDesc: 'Manage bank accounts, write checks, make deposits and withdrawals.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Open, close, and manage bank accounts',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Make deposits and withdrawals',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Write checks and transfer funds',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Access safe deposit boxes',
          isDangerous: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 6,
      categoryLetter: 'F',
      categoryName: 'Business Operating Transactions',
      statutoryDefinition: 'To operate, buy, sell, merge, dissolve, or otherwise deal with a business interest.',
      plainLanguageDesc: 'Operate, sell, or close a business. This includes making major business decisions.',
      isDangerous: true,
      dangerWarningText: 'WARNING: This power allows your agent to sell your business, dissolve it, or bind it to contracts and debts. Only grant if you fully trust your agent with your business.',
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
          powerText: 'Operate business and make business decisions',
          isDangerous: true,
          sortOrder: 1
        },
        {
          powerText: 'Buy, sell, or dissolve business interests',
          isDangerous: true,
          sortOrder: 2
        },
        {
          powerText: 'Hire, fire, and manage employees',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Sign contracts and bind business to obligations',
          isDangerous: true,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 7,
      categoryLetter: 'G',
      categoryName: 'Insurance and Annuity Transactions',
      statutoryDefinition: 'To buy, borrow against, cash in, and otherwise deal with insurance and annuity policies.',
      plainLanguageDesc: 'Manage insurance policies and annuities, including life, health, and property insurance.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Buy, maintain, or cancel insurance policies',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Pay premiums and file claims',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Borrow against or surrender policies',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Change beneficiaries on policies',
          isDangerous: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 8,
      categoryLetter: 'H',
      categoryName: 'Estate, Trust, and Beneficiary Transactions',
      statutoryDefinition: 'To create, amend, revoke trusts; make gifts; change beneficiaries; disclaim property; and deal with estate planning matters.',
      plainLanguageDesc: 'Make gifts, change beneficiaries, create trusts, and handle estate planning. Can give away your assets.',
      isDangerous: true,
      dangerWarningText: 'DANGER: This power allows your agent to make gifts of YOUR assets (including to themselves), change beneficiaries, and create or modify trusts. Your agent could give away everything you own. Only grant to someone you trust completely.',
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
          powerText: 'Make gifts of principal\'s property (including to agent)',
          isDangerous: true,
          sortOrder: 1
        },
        {
          powerText: 'Create, amend, or revoke trusts',
          isDangerous: true,
          sortOrder: 2
        },
        {
          powerText: 'Change beneficiaries on any accounts or policies',
          isDangerous: true,
          sortOrder: 3
        },
        {
          powerText: 'Disclaim or refuse inheritances',
          isDangerous: true,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 9,
      categoryLetter: 'I',
      categoryName: 'Claims and Litigation',
      statutoryDefinition: 'To pursue, settle, or abandon claims and lawsuits.',
      plainLanguageDesc: 'File lawsuits, settle legal claims, and handle litigation on your behalf.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Assert, prosecute, and settle claims',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Defend against claims and lawsuits',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Hire attorneys and represent principal',
          isDangerous: false,
          sortOrder: 3
        }
      ]
    },
    {
      categoryNumber: 10,
      categoryLetter: 'J',
      categoryName: 'Personal and Family Maintenance',
      statutoryDefinition: 'To provide for the support, maintenance, health, and education of the principal and principal\'s dependents.',
      plainLanguageDesc: 'Pay for your living expenses, housing, food, medical care, and support of your family.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Pay for food, clothing, shelter, and necessities',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Pay medical, dental, and healthcare expenses',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Support spouse, children, and dependents',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Employ household staff and caregivers',
          isDangerous: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 11,
      categoryLetter: 'K',
      categoryName: 'Government Benefits',
      statutoryDefinition: 'To apply for and receive government benefits such as Social Security, Medicare, Medicaid, and veterans benefits.',
      plainLanguageDesc: 'Apply for and manage government benefits like Social Security, Medicare, Medicaid, and VA benefits.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Apply for Social Security and SSI benefits',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Manage Medicare and Medicaid',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Apply for and manage veterans benefits',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Apply for government assistance programs',
          isDangerous: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 12,
      categoryLetter: 'L',
      categoryName: 'Retirement Plan Transactions',
      statutoryDefinition: 'To deal with retirement plans including 401(k)s, IRAs, pensions, and other retirement accounts.',
      plainLanguageDesc: 'Manage retirement accounts like 401(k), IRA, pension. Can change beneficiaries and take distributions.',
      isDangerous: true,
      dangerWarningText: 'CAUTION: This power allows your agent to change beneficiaries on your retirement accounts, take distributions, and potentially deplete your retirement savings. Grant carefully.',
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
          powerText: 'Contribute to and manage retirement accounts',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Take distributions from retirement accounts',
          isDangerous: true,
          sortOrder: 2
        },
        {
          powerText: 'Change beneficiaries on retirement accounts',
          isDangerous: true,
          sortOrder: 3
        },
        {
          powerText: 'Rollover and transfer retirement accounts',
          isDangerous: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 13,
      categoryLetter: 'M',
      categoryName: 'Tax Matters',
      statutoryDefinition: 'To prepare, sign, and file tax returns and deal with tax authorities.',
      plainLanguageDesc: 'Prepare and file your tax returns, represent you before the IRS, and handle all tax matters.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Prepare and file federal, state, and local tax returns',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Pay taxes and estimated taxes',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Represent principal before tax authorities',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Sign tax returns and tax documents',
          isDangerous: false,
          sortOrder: 4
        }
      ]
    },
    {
      categoryNumber: 14,
      categoryLetter: 'N',
      categoryName: 'Digital Assets',
      statutoryDefinition: 'To access, manage, and control digital assets including email, social media, cryptocurrency, and online accounts.',
      plainLanguageDesc: 'Manage email, social media, online accounts, cryptocurrency, and other digital property.',
      isDangerous: false,
      dangerWarningText: null,
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
          powerText: 'Access email and online accounts',
          isDangerous: false,
          sortOrder: 1
        },
        {
          powerText: 'Manage social media and digital content',
          isDangerous: false,
          sortOrder: 2
        },
        {
          powerText: 'Buy, sell, and transfer cryptocurrency',
          isDangerous: false,
          sortOrder: 3
        },
        {
          powerText: 'Access cloud storage and digital files',
          isDangerous: false,
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
