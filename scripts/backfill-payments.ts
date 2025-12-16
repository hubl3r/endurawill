// /scripts/backfill-payments.ts
/**
 * One-time script to generate payments for all existing accounts
 * Run this after deploying the payment generation feature
 * 
 * Usage: npx tsx scripts/backfill-payments.ts
 */

import { prisma } from '../lib/prisma';
import { generatePaymentRecords } from '../lib/generate-payments';

async function backfillPayments() {
  console.log('Starting payment backfill...');
  
  try {
    // Get all accounts that need payments generated
    const accounts = await prisma.account.findMany({
      where: {
        AND: [
          { nextPaymentDate: { not: null } },
          { anticipatedAmount: { not: null } },
          { paymentFrequency: { not: 'NONE' } },
        ],
      },
    });

    console.log(`Found ${accounts.length} accounts to process`);

    let totalGenerated = 0;
    let successCount = 0;
    let skipCount = 0;

    for (const account of accounts) {
      try {
        // Check if payments already exist
        const existingCount = await prisma.paymentHistory.count({
          where: {
            accountId: account.id,
            status: 'UPCOMING',
          },
        });

        if (existingCount > 0) {
          console.log(`Skipping ${account.accountName} - already has ${existingCount} payments`);
          skipCount++;
          continue;
        }

        // Generate payment records
        const paymentRecords = generatePaymentRecords({
          accountId: account.id,
          tenantId: account.tenantId,
          nextPaymentDate: account.nextPaymentDate!,
          anticipatedAmount: Number(account.anticipatedAmount!),
          paymentFrequency: account.paymentFrequency,
        });

        // Create all payment records
        const result = await prisma.paymentHistory.createMany({
          data: paymentRecords,
        });

        console.log(`✓ Generated ${result.count} payments for ${account.accountName}`);
        totalGenerated += result.count;
        successCount++;

      } catch (error) {
        console.error(`✗ Error processing ${account.accountName}:`, error);
      }
    }

    console.log('\n=== Backfill Complete ===');
    console.log(`Accounts processed: ${successCount}`);
    console.log(`Accounts skipped: ${skipCount}`);
    console.log(`Total payments generated: ${totalGenerated}`);

  } catch (error) {
    console.error('Fatal error during backfill:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillPayments();
