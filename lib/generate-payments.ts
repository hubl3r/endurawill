// /lib/generate-payments.ts

/**
 * Generate payment projections for the next 12 months
 * based on account payment frequency and next payment date
 */

interface GeneratePaymentsParams {
  accountId: string;
  tenantId: string;
  nextPaymentDate: Date;
  anticipatedAmount: number;
  paymentFrequency: string;
}

interface PaymentProjection {
  dueDate: Date;
  scheduledDate: Date;
  scheduledAmount: number;
  status: 'UPCOMING';
}

export function generatePaymentProjections(
  params: GeneratePaymentsParams
): PaymentProjection[] {
  const {
    nextPaymentDate,
    anticipatedAmount,
    paymentFrequency,
  } = params;

  if (!nextPaymentDate || !anticipatedAmount || paymentFrequency === 'NONE') {
    return [];
  }

  const projections: PaymentProjection[] = [];
  let currentDate = new Date(nextPaymentDate);

  for (let i = 0; i < 12; i++) {
    projections.push({
      dueDate: new Date(currentDate),
      scheduledDate: new Date(currentDate),
      scheduledAmount: anticipatedAmount,
      status: 'UPCOMING',
    });

    // Calculate next payment date based on frequency
    currentDate = getNextPaymentDate(currentDate, paymentFrequency);
  }

  return projections;
}

/**
 * Calculate the next payment date based on frequency
 */
function getNextPaymentDate(currentDate: Date, frequency: string): Date {
  const next = new Date(currentDate);

  switch (frequency) {
    case 'WEEKLY':
      next.setDate(next.getDate() + 7);
      break;
    case 'BIWEEKLY':
      next.setDate(next.getDate() + 14);
      break;
    case 'MONTHLY':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'QUARTERLY':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'SEMI_ANNUALLY':
      next.setMonth(next.getMonth() + 6);
      break;
    case 'ANNUALLY':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      // For ONE_TIME, OTHER, or unknown frequencies, don't generate future payments
      return next;
  }

  return next;
}

/**
 * Generate payment data for API creation
 */
export function generatePaymentRecords(params: GeneratePaymentsParams) {
  const projections = generatePaymentProjections(params);
  
  return projections.map(projection => ({
    accountId: params.accountId,
    tenantId: params.tenantId,
    dueDate: projection.dueDate,
    scheduledDate: projection.scheduledDate,
    scheduledAmount: projection.scheduledAmount,
    status: projection.status,
  }));
}
