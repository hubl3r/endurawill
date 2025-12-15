import { 
  Wallet,
  CreditCard,
  Car,
  Shield,
  Home,
  Building2,
  TrendingUp,
  Heart,
  Baby,
  Briefcase,
  DollarSign,
} from 'lucide-react';

export const ACCOUNT_CATEGORIES = [
  { id: 'Financial Accounts', label: 'Financial Accounts', icon: Wallet, color: 'blue' },
  { id: 'Credit & Loans', label: 'Credit & Loans', icon: CreditCard, color: 'purple' },
  { id: 'Vehicles & Transportation', label: 'Vehicles & Transportation', icon: Car, color: 'green' },
  { id: 'Insurance', label: 'Insurance', icon: Shield, color: 'orange' },
  { id: 'Real Estate & Property', label: 'Real Estate & Property', icon: Home, color: 'red' },
  { id: 'Utilities', label: 'Utilities', icon: Building2, color: 'cyan' },
  { id: 'Subscriptions & Memberships', label: 'Subscriptions & Memberships', icon: TrendingUp, color: 'pink' },
  { id: 'Healthcare & Medical', label: 'Healthcare & Medical', icon: Heart, color: 'rose' },
  { id: 'Childcare & Education', label: 'Childcare & Education', icon: Baby, color: 'indigo' },
  { id: 'Professional Services', label: 'Professional Services', icon: Briefcase, color: 'teal' },
  { id: 'Other Recurring', label: 'Other Recurring', icon: DollarSign, color: 'gray' },
];

export const ACCOUNT_STATUSES = [
  { value: 'ACTIVE', label: 'Active', color: 'green' },
  { value: 'SUSPENDED', label: 'Suspended', color: 'yellow' },
  { value: 'CANCELLED', label: 'Cancelled', color: 'red' },
  { value: 'CLOSED', label: 'Closed', color: 'gray' },
  { value: 'PAID_OFF', label: 'Paid Off', color: 'blue' },
];

export const SUBCATEGORIES: Record<string, string[]> = {
  'Financial Accounts': ['Checking', 'Savings', 'Money Market', 'CD', 'Investment', 'Retirement (401k/IRA)', 'HSA', '529', 'Cryptocurrency'],
  'Credit & Loans': ['Credit Card', 'Personal Loan', 'Student Loan', 'HELOC', 'Business Loan', 'Medical Debt'],
  'Real Estate & Property': ['Mortgage', 'Property Tax', 'HOA Fees', 'Rent', 'Storage Unit', 'Parking Space'],
  'Vehicles & Transportation': ['Auto Loan', 'Lease Payment', 'Motorcycle/RV/Boat', 'Truck Payment', 'Registration', 'Toll Pass'],
  'Insurance': ['Life', 'Health', 'Dental', 'Vision', 'Auto', 'Home/Renters', 'Umbrella', 'Disability', 'Long-term Care', 'Pet'],
  'Utilities': ['Electric', 'Gas', 'Water/Sewer', 'Trash/Recycling', 'Internet', 'Mobile Phone', 'Landline', 'Cable/Satellite'],
  'Subscriptions & Memberships': ['Streaming', 'Software', 'News/Magazines', 'Gym', 'Club Membership', 'Amazon Prime/Costco', 'Cloud Storage'],
  'Healthcare & Medical': ['Prescription', 'Medical Equipment', 'Therapy', 'Dental/Orthodontic', 'Payment Plan'],
  'Childcare & Education': ['Daycare', 'Tuition', 'Tutoring', 'Lessons', 'School Lunch'],
  'Professional Services': ['Lawn Care', 'Cleaning', 'Pest Control', 'Security', 'Legal', 'Accounting', 'Financial Advisor'],
  'Other Recurring': ['Charitable Donations', 'Alimony/Child Support', 'Pet Care', 'Domain/Hosting', 'PO Box'],
};

export const PAYMENT_FREQUENCIES = [
  { value: 'NONE', label: 'None (Information Only)' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'BIWEEKLY', label: 'Biweekly (Every 2 weeks)' },
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'QUARTERLY', label: 'Quarterly (Every 3 months)' },
  { value: 'SEMI_ANNUALLY', label: 'Semi-annually (Twice a year)' },
  { value: 'ANNUALLY', label: 'Annually (Once a year)' },
  { value: 'ONE_TIME', label: 'One-time' },
  { value: 'OTHER', label: 'Other (Custom schedule)' },
];
