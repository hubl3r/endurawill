/**
 * Amortization Calculator for Automatic Loan Payment Calculations
 * 
 * Calculates:
 * - Monthly payment amounts
 * - Principal and interest breakdown per payment
 * - Remaining balance after each payment
 * - Full amortization schedule
 * 
 * Supports:
 * - Fixed-rate loans (mortgages, auto loans, personal loans)
 * - Credit cards with minimum payments
 * - Student loans
 */

export interface LoanDetails {
  principalAmount: number;      // Original loan amount
  interestRate: number;          // Annual interest rate (percentage, e.g., 5.5)
  loanTerm: number;              // Total number of months
  currentBalance?: number;       // Current balance (if different from principal)
  paymentAmount?: number;        // Custom payment amount (overrides calculated)
}

export interface PaymentBreakdown {
  paymentNumber: number;         // 1, 2, 3, etc.
  dueDate: Date;                 // When payment is due
  scheduledAmount: number;       // Total payment amount
  principalPaid: number;         // Amount going to principal
  interestPaid: number;          // Amount going to interest
  balanceAfter: number;          // Remaining balance after payment
}

/**
 * Calculate monthly payment for a fixed-rate loan
 * Uses the standard amortization formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) {
    // No interest - simple division
    return principal / termMonths;
  }
  
  const monthlyRate = annualRate / 100 / 12; // Convert percentage to decimal monthly rate
  const numerator = monthlyRate * Math.pow(1 + monthlyRate, termMonths);
  const denominator = Math.pow(1 + monthlyRate, termMonths) - 1;
  
  return principal * (numerator / denominator);
}

/**
 * Calculate interest for a single period
 */
function calculateInterest(balance: number, annualRate: number): number {
  const monthlyRate = annualRate / 100 / 12;
  return balance * monthlyRate;
}

/**
 * Generate a single payment breakdown
 */
export function calculatePaymentBreakdown(
  paymentNumber: number,
  currentBalance: number,
  paymentAmount: number,
  annualRate: number,
  dueDate: Date
): PaymentBreakdown {
  const interestPaid = calculateInterest(currentBalance, annualRate);
  const principalPaid = Math.min(paymentAmount - interestPaid, currentBalance);
  const balanceAfter = Math.max(currentBalance - principalPaid, 0);
  
  return {
    paymentNumber,
    dueDate,
    scheduledAmount: paymentAmount,
    principalPaid: Math.round(principalPaid * 100) / 100, // Round to 2 decimals
    interestPaid: Math.round(interestPaid * 100) / 100,
    balanceAfter: Math.round(balanceAfter * 100) / 100,
  };
}

/**
 * Generate full amortization schedule for a loan
 * Returns array of payment breakdowns for the specified number of payments
 */
export function generateAmortizationSchedule(
  loan: LoanDetails,
  startDate: Date,
  numberOfPayments: number = 12
): PaymentBreakdown[] {
  const {
    principalAmount,
    interestRate,
    loanTerm,
    currentBalance = principalAmount,
    paymentAmount: customPayment,
  } = loan;
  
  // Calculate monthly payment if not provided
  const monthlyPayment = customPayment || calculateMonthlyPayment(
    principalAmount,
    interestRate,
    loanTerm
  );
  
  const schedule: PaymentBreakdown[] = [];
  let remainingBalance = currentBalance;
  
  for (let i = 0; i < numberOfPayments; i++) {
    if (remainingBalance <= 0) break;
    
    // Calculate due date (add i months to start date)
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i + 1);
    
    const payment = calculatePaymentBreakdown(
      i + 1,
      remainingBalance,
      monthlyPayment,
      interestRate,
      dueDate
    );
    
    schedule.push(payment);
    remainingBalance = payment.balanceAfter;
  }
  
  return schedule;
}

/**
 * Calculate total interest paid over the life of a loan
 */
export function calculateTotalInterest(loan: LoanDetails): number {
  const schedule = generateAmortizationSchedule(loan, new Date(), loan.loanTerm);
  return schedule.reduce((total, payment) => total + payment.interestPaid, 0);
}

/**
 * Calculate payoff date for a loan
 */
export function calculatePayoffDate(loan: LoanDetails, startDate: Date): Date {
  const schedule = generateAmortizationSchedule(loan, startDate, loan.loanTerm);
  const lastPayment = schedule[schedule.length - 1];
  return lastPayment?.dueDate || startDate;
}

/**
 * Calculate how much extra payment would save in interest
 */
export function calculateExtraPaymentSavings(
  loan: LoanDetails,
  extraMonthlyPayment: number
): {
  monthsSaved: number;
  interestSaved: number;
  newPayoffDate: Date;
} {
  const originalSchedule = generateAmortizationSchedule(loan, new Date(), loan.loanTerm);
  const originalInterest = originalSchedule.reduce((sum, p) => sum + p.interestPaid, 0);
  
  const modifiedLoan = {
    ...loan,
    paymentAmount: (loan.paymentAmount || calculateMonthlyPayment(
      loan.principalAmount,
      loan.interestRate,
      loan.loanTerm
    )) + extraMonthlyPayment,
  };
  
  const newSchedule = generateAmortizationSchedule(modifiedLoan, new Date(), loan.loanTerm);
  const newInterest = newSchedule.reduce((sum, p) => sum + p.interestPaid, 0);
  
  return {
    monthsSaved: originalSchedule.length - newSchedule.length,
    interestSaved: originalInterest - newInterest,
    newPayoffDate: newSchedule[newSchedule.length - 1]?.dueDate || new Date(),
  };
}

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Calculate monthly payment for a mortgage
 * 
 * const mortgage = {
 *   principalAmount: 300000,  // $300,000 loan
 *   interestRate: 6.5,        // 6.5% APR
 *   loanTerm: 360             // 30 years (360 months)
 * };
 * 
 * const monthlyPayment = calculateMonthlyPayment(
 *   mortgage.principalAmount,
 *   mortgage.interestRate,
 *   mortgage.loanTerm
 * );
 * // Result: ~$1,896.20/month
 */

/**
 * Example 2: Generate 12-month payment schedule
 * 
 * const autoLoan = {
 *   principalAmount: 25000,   // $25,000 car loan
 *   interestRate: 5.9,        // 5.9% APR
 *   loanTerm: 60,             // 5 years (60 months)
 *   currentBalance: 20000     // Already paid down to $20,000
 * };
 * 
 * const schedule = generateAmortizationSchedule(
 *   autoLoan,
 *   new Date('2025-01-01'),
 *   12
 * );
 * 
 * // Returns array of 12 payments with principal/interest breakdown
 * schedule.forEach(payment => {
 *   console.log(`Payment ${payment.paymentNumber}:`);
 *   console.log(`  Due: ${payment.dueDate.toLocaleDateString()}`);
 *   console.log(`  Amount: $${payment.scheduledAmount.toFixed(2)}`);
 *   console.log(`  Principal: $${payment.principalPaid.toFixed(2)}`);
 *   console.log(`  Interest: $${payment.interestPaid.toFixed(2)}`);
 *   console.log(`  Balance: $${payment.balanceAfter.toFixed(2)}`);
 * });
 */

/**
 * Example 3: Calculate savings from extra payments
 * 
 * const studentLoan = {
 *   principalAmount: 50000,
 *   interestRate: 6.8,
 *   loanTerm: 120  // 10 years
 * };
 * 
 * const savings = calculateExtraPaymentSavings(studentLoan, 100);
 * console.log(`Paying $100 extra per month would:`);
 * console.log(`  Save ${savings.monthsSaved} months`);
 * console.log(`  Save $${savings.interestSaved.toFixed(2)} in interest`);
 * console.log(`  New payoff: ${savings.newPayoffDate.toLocaleDateString()}`);
 */

/**
 * Example 4: Integration with Account creation
 * 
 * // When user creates a loan account with automatic calculation:
 * const accountData = {
 *   accountName: "Auto Loan - Honda",
 *   category: "Vehicles",
 *   calculationMode: "AUTOMATIC",
 *   paymentFrequency: "MONTHLY"
 * };
 * 
 * const loanDetails = {
 *   principalAmount: 25000,
 *   interestRate: 5.9,
 *   loanTerm: 60,
 *   loanType: "Auto"
 * };
 * 
 * // 1. Calculate monthly payment
 * const monthlyPayment = calculateMonthlyPayment(
 *   loanDetails.principalAmount,
 *   loanDetails.interestRate,
 *   loanDetails.loanTerm
 * );
 * 
 * accountData.anticipatedAmount = monthlyPayment;
 * 
 * // 2. Generate 12-month schedule
 * const schedule = generateAmortizationSchedule(
 *   loanDetails,
 *   new Date(),
 *   12
 * );
 * 
 * // 3. Create PaymentHistory records
 * const paymentRecords = schedule.map(payment => ({
 *   dueDate: payment.dueDate,
 *   scheduledAmount: payment.scheduledAmount,
 *   status: 'UPCOMING',
 *   balanceAfter: payment.balanceAfter,
 *   principalPaid: payment.principalPaid,
 *   interestPaid: payment.interestPaid
 * }));
 * 
 * // Save to database
 * await prisma.account.create({
 *   data: {
 *     ...accountData,
 *     loanDetails: {
 *       create: loanDetails
 *     },
 *     paymentHistory: {
 *       createMany: {
 *         data: paymentRecords
 *       }
 *     }
 *   }
 * });
 */
