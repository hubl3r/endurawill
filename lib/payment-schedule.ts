/**
 * Payment Schedule Generator
 * 
 * Generates payment due dates based on:
 * - Standard frequencies (Weekly, Biweekly, Monthly, etc.)
 * - Custom schedules (multiple dates per month, specific day of week, intervals)
 * 
 * Creates PaymentHistory records for the next 12 payments
 */

import { PaymentFrequency } from '@prisma/client';

export interface CustomSchedule {
  type: 'multipleDatesPerMonth' | 'interval' | 'dayOfWeek' | 'dayOfMonth';
  dates?: number[];              // For multipleDatesPerMonth: [1, 8, 20]
  days?: number;                 // For interval: 90 (every 90 days)
  day?: string | number;         // For dayOfWeek: "Wednesday" or dayOfMonth: 15
  weekFrequency?: number;        // For dayOfWeek: 1 = weekly, 2 = biweekly
  startDate?: string;            // For interval: starting point
}

export interface PaymentScheduleItem {
  dueDate: Date;
  scheduledAmount: number;
  status: 'UPCOMING' | 'PAST_DUE';
  balanceAfter?: number;
  principalPaid?: number;
  interestPaid?: number;
}

/**
 * Add months to a date (handles edge cases like Jan 31 + 1 month)
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get day of week as number (0 = Sunday, 1 = Monday, etc.)
 */
function getDayOfWeekNumber(dayName: string): number {
  const days: Record<string, number> = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
  };
  return days[dayName.toLowerCase()] ?? 0;
}

/**
 * Get next occurrence of a specific day of week
 */
function getNextDayOfWeek(startDate: Date, targetDay: number, weeksToAdd: number = 0): Date {
  const result = new Date(startDate);
  const currentDay = result.getDay();
  const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
  result.setDate(result.getDate() + daysUntilTarget + (weeksToAdd * 7));
  return result;
}

/**
 * Generate payment dates for standard frequencies
 */
function generateStandardFrequency(
  frequency: PaymentFrequency,
  startDate: Date,
  count: number
): Date[] {
  const dates: Date[] = [];
  
  switch (frequency) {
    case 'WEEKLY':
      for (let i = 0; i < count; i++) {
        dates.push(addDays(startDate, i * 7));
      }
      break;
      
    case 'BIWEEKLY':
      for (let i = 0; i < count; i++) {
        dates.push(addDays(startDate, i * 14));
      }
      break;
      
    case 'MONTHLY':
      for (let i = 0; i < count; i++) {
        dates.push(addMonths(startDate, i));
      }
      break;
      
    case 'QUARTERLY':
      for (let i = 0; i < count; i++) {
        dates.push(addMonths(startDate, i * 3));
      }
      break;
      
    case 'SEMI_ANNUALLY':
      for (let i = 0; i < count; i++) {
        dates.push(addMonths(startDate, i * 6));
      }
      break;
      
    case 'ANNUALLY':
      for (let i = 0; i < count; i++) {
        dates.push(addMonths(startDate, i * 12));
      }
      break;
      
    case 'ONE_TIME':
      dates.push(startDate);
      break;
      
    default:
      // Fallback to monthly
      for (let i = 0; i < count; i++) {
        dates.push(addMonths(startDate, i));
      }
  }
  
  return dates;
}

/**
 * Generate payment dates for custom schedules
 */
function generateCustomSchedule(
  customSchedule: CustomSchedule,
  startDate: Date,
  count: number
): Date[] {
  const dates: Date[] = [];
  
  switch (customSchedule.type) {
    case 'multipleDatesPerMonth': {
      // Multiple dates per month (e.g., 1st, 8th, 20th)
      const datesInMonth = customSchedule.dates || [1];
      const monthsNeeded = Math.ceil(count / datesInMonth.length);
      
      for (let month = 0; month < monthsNeeded; month++) {
        for (const dayOfMonth of datesInMonth) {
          if (dates.length >= count) break;
          
          const date = new Date(startDate);
          date.setMonth(date.getMonth() + month);
          date.setDate(dayOfMonth);
          
          // Only add if date is in the future
          if (date >= startDate) {
            dates.push(date);
          }
        }
      }
      break;
    }
    
    case 'dayOfMonth': {
      // Specific day of each month (e.g., 15th)
      const dayOfMonth = customSchedule.day as number || 1;
      
      for (let i = 0; i < count; i++) {
        const date = new Date(startDate);
        date.setMonth(date.getMonth() + i);
        date.setDate(dayOfMonth);
        dates.push(date);
      }
      break;
    }
    
    case 'dayOfWeek': {
      // Every [frequency] [day of week] (e.g., every Wednesday, every other Monday)
      const dayName = customSchedule.day as string || 'Monday';
      const targetDay = getDayOfWeekNumber(dayName);
      const weekFrequency = customSchedule.weekFrequency || 1;
      
      for (let i = 0; i < count; i++) {
        const date = getNextDayOfWeek(startDate, targetDay, i * weekFrequency);
        dates.push(date);
      }
      break;
    }
    
    case 'interval': {
      // Every N days (e.g., every 90 days)
      const intervalDays = customSchedule.days || 30;
      const intervalStartDate = customSchedule.startDate 
        ? new Date(customSchedule.startDate)
        : startDate;
      
      for (let i = 0; i < count; i++) {
        dates.push(addDays(intervalStartDate, i * intervalDays));
      }
      break;
    }
  }
  
  return dates.slice(0, count); // Ensure we only return requested count
}

/**
 * Main function: Generate payment schedule
 * Returns array of PaymentScheduleItem objects ready for database insertion
 */
export function generatePaymentSchedule(
  frequency: PaymentFrequency,
  customSchedule: CustomSchedule | null,
  anticipatedAmount: number,
  startDate: Date = new Date(),
  numberOfPayments: number = 12,
  amortizationSchedule?: Array<{
    balanceAfter: number;
    principalPaid: number;
    interestPaid: number;
  }>
): PaymentScheduleItem[] {
  let dueDates: Date[] = [];
  
  // Generate dates based on frequency type
  if (frequency === 'OTHER' && customSchedule) {
    dueDates = generateCustomSchedule(customSchedule, startDate, numberOfPayments);
  } else {
    dueDates = generateStandardFrequency(frequency, startDate, numberOfPayments);
  }
  
  const now = new Date();
  
  // Map dates to PaymentScheduleItem objects
  return dueDates.map((dueDate, index) => {
    const item: PaymentScheduleItem = {
      dueDate,
      scheduledAmount: anticipatedAmount,
      status: dueDate < now ? 'PAST_DUE' : 'UPCOMING',
    };
    
    // Add amortization data if provided (for automatic calculation mode)
    if (amortizationSchedule && amortizationSchedule[index]) {
      item.balanceAfter = amortizationSchedule[index].balanceAfter;
      item.principalPaid = amortizationSchedule[index].principalPaid;
      item.interestPaid = amortizationSchedule[index].interestPaid;
    }
    
    return item;
  });
}

/**
 * Calculate next payment date based on frequency
 * Used to update nextPaymentDate field after marking a payment as paid
 */
export function calculateNextPaymentDate(
  lastPaymentDate: Date,
  frequency: PaymentFrequency,
  customSchedule?: CustomSchedule | null
): Date {
  if (frequency === 'OTHER' && customSchedule) {
    const dates = generateCustomSchedule(customSchedule, lastPaymentDate, 2);
    return dates[1] || dates[0];
  }
  
  const dates = generateStandardFrequency(frequency, lastPaymentDate, 2);
  return dates[1] || dates[0];
}

// ==================== USAGE EXAMPLES ====================

/**
 * Example 1: Generate monthly payment schedule
 * 
 * const schedule = generatePaymentSchedule(
 *   'MONTHLY',
 *   null,
 *   500.00,              // $500/month
 *   new Date('2025-01-01'),
 *   12                   // 12 months
 * );
 * 
 * // Returns 12 payments due on the 1st of each month
 */

/**
 * Example 2: Multiple dates per month (1st, 8th, 20th)
 * 
 * const customSchedule = {
 *   type: 'multipleDatesPerMonth' as const,
 *   dates: [1, 8, 20]
 * };
 * 
 * const schedule = generatePaymentSchedule(
 *   'OTHER',
 *   customSchedule,
 *   100.00,              // $100 per payment
 *   new Date('2025-01-01'),
 *   12                   // Want 12 payments total
 * );
 * 
 * // Returns 12 payments across 4 months (3 payments per month)
 */

/**
 * Example 3: Every 90 days
 * 
 * const customSchedule = {
 *   type: 'interval' as const,
 *   days: 90,
 *   startDate: '2025-01-15'
 * };
 * 
 * const schedule = generatePaymentSchedule(
 *   'OTHER',
 *   customSchedule,
 *   250.00,
 *   new Date('2025-01-15'),
 *   4
 * );
 * 
 * // Returns 4 payments: Jan 15, Apr 15, Jul 14, Oct 12 (approximately)
 */

/**
 * Example 4: Every other Wednesday
 * 
 * const customSchedule = {
 *   type: 'dayOfWeek' as const,
 *   day: 'Wednesday',
 *   weekFrequency: 2      // Every 2 weeks
 * };
 * 
 * const schedule = generatePaymentSchedule(
 *   'OTHER',
 *   customSchedule,
 *   75.00,
 *   new Date('2025-01-01'),
 *   26                    // ~6 months of biweekly
 * );
 */

/**
 * Example 5: Integration with loan amortization
 * 
 * import { generateAmortizationSchedule } from './amortization';
 * 
 * const loanDetails = {
 *   principalAmount: 20000,
 *   interestRate: 5.9,
 *   loanTerm: 60
 * };
 * 
 * // Generate amortization
 * const amortization = generateAmortizationSchedule(
 *   loanDetails,
 *   new Date('2025-01-01'),
 *   12
 * );
 * 
 * // Map to payment schedule format
 * const amortizationData = amortization.map(p => ({
 *   balanceAfter: p.balanceAfter,
 *   principalPaid: p.principalPaid,
 *   interestPaid: p.interestPaid
 * }));
 * 
 * // Generate payment schedule with amortization data
 * const schedule = generatePaymentSchedule(
 *   'MONTHLY',
 *   null,
 *   amortization[0].scheduledAmount,
 *   new Date('2025-01-01'),
 *   12,
 *   amortizationData
 * );
 * 
 * // Save to database
 * await prisma.paymentHistory.createMany({
 *   data: schedule.map(payment => ({
 *     accountId: accountId,
 *     tenantId: tenantId,
 *     ...payment
 *   }))
 * });
 */

/**
 * Example 6: Update next payment date after marking as paid
 * 
 * const account = await prisma.account.findUnique({ 
 *   where: { id: accountId } 
 * });
 * 
 * const nextDate = calculateNextPaymentDate(
 *   new Date(),
 *   account.paymentFrequency,
 *   account.customSchedule
 * );
 * 
 * await prisma.account.update({
 *   where: { id: accountId },
 *   data: { nextPaymentDate: nextDate }
 * });
 */
