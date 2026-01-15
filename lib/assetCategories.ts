// lib/assetCategories.ts
// Comprehensive asset and liability categorization based on Restatement Third Trusts
// and Sitkoff's Wills, Trusts, and Estates

import {
  Home,
  Wallet,
  TrendingUp,
  PiggyBank,
  Shield,
  Car,
  Package,
  Briefcase,
  Coins,
  FileText,
  DollarSign,
  Building2,
  CreditCard,
  Receipt,
  Scale,
  AlertCircle,
} from 'lucide-react';

export interface SubType {
  id: string;
  label: string;
  description?: string;
}

export interface AssetCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  subtypes: SubType[];
}

export interface LiabilityCategory {
  id: string;
  label: string;
  icon: any;
  color: string;
  subtypes: SubType[];
}

// ============================================
// ASSET CATEGORIES
// ============================================

export const ASSET_CATEGORIES: AssetCategory[] = [
  {
    id: 'real_estate',
    label: 'Real Estate',
    icon: Home,
    color: 'blue',
    subtypes: [
      { id: 'primary_residence', label: 'Primary Residence' },
      { id: 'vacation_home', label: 'Vacation Home' },
      { id: 'rental_property', label: 'Rental Property' },
      { id: 'commercial_property', label: 'Commercial Property' },
      { id: 'undeveloped_land', label: 'Undeveloped Land' },
      { id: 'timeshare', label: 'Timeshare' },
    ],
  },
  {
    id: 'financial_accounts',
    label: 'Financial Accounts',
    icon: Wallet,
    color: 'green',
    subtypes: [
      { id: 'checking', label: 'Checking Account' },
      { id: 'savings', label: 'Savings Account' },
      { id: 'money_market', label: 'Money Market Account' },
      { id: 'cd', label: 'Certificate of Deposit (CD)' },
      { id: 'cash', label: 'Cash on Hand' },
      { id: 'safe_deposit_box', label: 'Safe Deposit Box Contents' },
    ],
  },
  {
    id: 'investments',
    label: 'Investments',
    icon: TrendingUp,
    color: 'purple',
    subtypes: [
      { id: 'stocks', label: 'Stocks' },
      { id: 'bonds', label: 'Bonds' },
      { id: 'mutual_funds', label: 'Mutual Funds' },
      { id: 'etfs', label: 'ETFs' },
      { id: 'brokerage_account', label: 'Brokerage Account' },
      { id: 'commodities', label: 'Commodities' },
      { id: 'options', label: 'Options/Derivatives' },
    ],
  },
  {
    id: 'retirement_accounts',
    label: 'Retirement Accounts',
    icon: PiggyBank,
    color: 'orange',
    subtypes: [
      { id: '401k', label: '401(k)' },
      { id: 'traditional_ira', label: 'Traditional IRA' },
      { id: 'roth_ira', label: 'Roth IRA' },
      { id: 'sep_ira', label: 'SEP IRA' },
      { id: 'simple_ira', label: 'SIMPLE IRA' },
      { id: 'pension', label: 'Pension Plan' },
      { id: 'annuity', label: 'Annuity' },
      { id: '403b', label: '403(b)' },
      { id: '457', label: '457 Plan' },
    ],
  },
  {
    id: 'insurance',
    label: 'Insurance Policies',
    icon: Shield,
    color: 'cyan',
    subtypes: [
      { id: 'life_insurance', label: 'Life Insurance Policy' },
      { id: 'disability_insurance', label: 'Disability Insurance' },
      { id: 'long_term_care', label: 'Long-Term Care Insurance' },
      { id: 'annuity_insurance', label: 'Annuity (Insurance Product)' },
    ],
  },
  {
    id: 'vehicles',
    label: 'Vehicles & Transportation',
    icon: Car,
    color: 'red',
    subtypes: [
      { id: 'automobile', label: 'Automobile' },
      { id: 'motorcycle', label: 'Motorcycle' },
      { id: 'boat', label: 'Boat/Watercraft' },
      { id: 'rv', label: 'RV/Motorhome' },
      { id: 'aircraft', label: 'Aircraft' },
      { id: 'trailer', label: 'Trailer' },
      { id: 'atv', label: 'ATV/Off-Road Vehicle' },
    ],
  },
  {
    id: 'personal_property',
    label: 'Personal Property',
    icon: Package,
    color: 'pink',
    subtypes: [
      { id: 'jewelry', label: 'Jewelry & Watches' },
      { id: 'artwork', label: 'Artwork & Paintings' },
      { id: 'antiques', label: 'Antiques' },
      { id: 'collectibles', label: 'Collectibles' },
      { id: 'furniture', label: 'Furniture' },
      { id: 'electronics', label: 'Electronics' },
      { id: 'firearms', label: 'Firearms' },
      { id: 'musical_instruments', label: 'Musical Instruments' },
      { id: 'wine_collection', label: 'Wine Collection' },
      { id: 'sports_equipment', label: 'Sports Equipment' },
      { id: 'tools', label: 'Tools & Equipment' },
    ],
  },
  {
    id: 'business_interests',
    label: 'Business Interests',
    icon: Briefcase,
    color: 'indigo',
    subtypes: [
      { id: 'sole_proprietorship', label: 'Sole Proprietorship' },
      { id: 'partnership', label: 'Partnership Interest' },
      { id: 'llc_shares', label: 'LLC Membership Interest' },
      { id: 'corporate_stock', label: 'Corporate Stock (Private)' },
      { id: 's_corp', label: 'S-Corporation Interest' },
      { id: 'franchise', label: 'Franchise Ownership' },
    ],
  },
  {
    id: 'digital_assets',
    label: 'Digital Assets',
    icon: Coins,
    color: 'yellow',
    subtypes: [
      { id: 'cryptocurrency', label: 'Cryptocurrency' },
      { id: 'nfts', label: 'NFTs' },
      { id: 'online_accounts', label: 'Online Accounts (Social Media, Email)' },
      { id: 'digital_media', label: 'Digital Media (Photos, Music, Videos)' },
      { id: 'domain_names', label: 'Domain Names' },
      { id: 'websites', label: 'Websites/Blogs' },
    ],
  },
  {
    id: 'intellectual_property',
    label: 'Intellectual Property',
    icon: FileText,
    color: 'teal',
    subtypes: [
      { id: 'patent', label: 'Patent' },
      { id: 'copyright', label: 'Copyright' },
      { id: 'trademark', label: 'Trademark' },
      { id: 'royalties', label: 'Royalty Rights' },
      { id: 'trade_secrets', label: 'Trade Secrets' },
    ],
  },
  {
    id: 'other',
    label: 'Other Assets',
    icon: DollarSign,
    color: 'gray',
    subtypes: [
      { id: 'livestock', label: 'Livestock' },
      { id: 'mineral_rights', label: 'Mineral Rights' },
      { id: 'promissory_notes', label: 'Promissory Notes (Money Owed to You)' },
      { id: 'inheritance_expected', label: 'Expected Inheritance' },
      { id: 'legal_claims', label: 'Legal Claims/Settlements' },
      { id: 'other', label: 'Other' },
    ],
  },
];

// ============================================
// LIABILITY CATEGORIES
// ============================================

export const LIABILITY_CATEGORIES: LiabilityCategory[] = [
  {
    id: 'mortgages',
    label: 'Mortgages',
    icon: Home,
    color: 'blue',
    subtypes: [
      { id: 'primary_home_mortgage', label: 'Primary Home Mortgage' },
      { id: 'vacation_home_mortgage', label: 'Vacation Home Mortgage' },
      { id: 'investment_property_mortgage', label: 'Investment Property Mortgage' },
      { id: 'commercial_mortgage', label: 'Commercial Property Mortgage' },
      { id: 'second_mortgage', label: 'Second Mortgage/HELOC' },
      { id: 'reverse_mortgage', label: 'Reverse Mortgage' },
    ],
  },
  {
    id: 'loans',
    label: 'Loans',
    icon: CreditCard,
    color: 'purple',
    subtypes: [
      { id: 'auto_loan', label: 'Auto Loan' },
      { id: 'student_loan', label: 'Student Loan' },
      { id: 'personal_loan', label: 'Personal Loan' },
      { id: 'business_loan', label: 'Business Loan' },
      { id: 'home_equity_loan', label: 'Home Equity Loan' },
      { id: 'margin_loan', label: 'Margin Loan (Investment)' },
      { id: 'boat_rv_loan', label: 'Boat/RV Loan' },
    ],
  },
  {
    id: 'credit_cards',
    label: 'Credit Card Debt',
    icon: CreditCard,
    color: 'red',
    subtypes: [
      { id: 'personal_credit_card', label: 'Personal Credit Card' },
      { id: 'business_credit_card', label: 'Business Credit Card' },
      { id: 'store_credit_card', label: 'Store Credit Card' },
      { id: 'charge_card', label: 'Charge Card' },
    ],
  },
  {
    id: 'medical_bills',
    label: 'Medical Bills',
    icon: Receipt,
    color: 'green',
    subtypes: [
      { id: 'hospital_bills', label: 'Hospital Bills' },
      { id: 'doctor_bills', label: 'Doctor/Physician Bills' },
      { id: 'dental_bills', label: 'Dental Bills' },
      { id: 'prescription_debt', label: 'Prescription Debt' },
      { id: 'medical_equipment', label: 'Medical Equipment Debt' },
    ],
  },
  {
    id: 'taxes_owed',
    label: 'Taxes Owed',
    icon: Building2,
    color: 'orange',
    subtypes: [
      { id: 'federal_income_tax', label: 'Federal Income Tax' },
      { id: 'state_income_tax', label: 'State Income Tax' },
      { id: 'property_tax', label: 'Property Tax' },
      { id: 'estate_tax', label: 'Estate/Inheritance Tax' },
      { id: 'capital_gains_tax', label: 'Capital Gains Tax' },
      { id: 'payroll_tax', label: 'Payroll Tax (Business)' },
    ],
  },
  {
    id: 'legal_obligations',
    label: 'Legal Obligations',
    icon: Scale,
    color: 'indigo',
    subtypes: [
      { id: 'judgment', label: 'Court Judgment' },
      { id: 'pending_lawsuit', label: 'Pending Lawsuit Liability' },
      { id: 'alimony', label: 'Alimony' },
      { id: 'child_support', label: 'Child Support' },
      { id: 'restitution', label: 'Criminal Restitution' },
      { id: 'liens', label: 'Liens' },
    ],
  },
  {
    id: 'other_debts',
    label: 'Other Debts',
    icon: AlertCircle,
    color: 'gray',
    subtypes: [
      { id: 'utility_bills', label: 'Utility Bills' },
      { id: 'funeral_expenses', label: 'Prepaid Funeral Expenses' },
      { id: 'irs_payment_plan', label: 'IRS Payment Plan' },
      { id: 'family_loan', label: 'Loan from Family/Friends' },
      { id: 'business_debt', label: 'Business Debt (Personal Guarantee)' },
      { id: 'contractor_debt', label: 'Contractor/Service Provider Debt' },
      { id: 'other', label: 'Other Debt' },
    ],
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getAssetCategory(categoryId: string): AssetCategory | undefined {
  return ASSET_CATEGORIES.find((cat) => cat.id === categoryId);
}

export function getLiabilityCategory(categoryId: string): LiabilityCategory | undefined {
  return LIABILITY_CATEGORIES.find((cat) => cat.id === categoryId);
}

export function getAssetSubtype(categoryId: string, subtypeId: string): SubType | undefined {
  const category = getAssetCategory(categoryId);
  return category?.subtypes.find((sub) => sub.id === subtypeId);
}

export function getLiabilitySubtype(categoryId: string, subtypeId: string): SubType | undefined {
  const category = getLiabilityCategory(categoryId);
  return category?.subtypes.find((sub) => sub.id === subtypeId);
}

export function getAllAssetTypes(): string[] {
  return ASSET_CATEGORIES.map((cat) => cat.id);
}

export function getAllLiabilityTypes(): string[] {
  return LIABILITY_CATEGORIES.map((cat) => cat.id);
}
