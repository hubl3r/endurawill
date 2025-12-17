import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';
import { decryptFields } from '@/lib/encryption';
import { generatePaymentRecords } from '@/lib/generate-payments';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * GET /api/accounts/[id]
 * Get a single account with all details
 * Does NOT include decrypted credentials (use /api/vault/credentials for that)
 */
export async function GET(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ 
        error: 'Unauthorized or no active estate selected' 
      }, { status: 401 });
    }

    const { user, tenantId } = auth;
    const { id } = await params;

    // Fetch account with all details
    const account = await prisma.account.findFirst({
      where: {
        id,
        tenantId, // CRITICAL: Ensure user can only access their tenant's accounts
      },
      include: {
        financialDetails: true,
        loanDetails: true,
        vehicleDetails: true,
        insuranceDetails: true,
        propertyDetails: true,
        createdBy: {
          select: {
            id: true,
            fullName: true,
          }
        },
        modifiedBy: {
          select: {
            id: true,
            fullName: true,
          }
        },
        _count: {
          select: {
            paymentHistory: true,
          }
        }
      },
    });

    if (!account) {
      return NextResponse.json({ 
        error: 'Account not found' 
      }, { status: 404 });
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'account_viewed',
        category: 'account',
        result: 'success',
        resourceType: 'account',
        resourceId: account.id,
        details: {
          accountName: account.accountName,
          category: account.category,
        },
      },
    });

    // Remove encrypted credentials from response (for security)
    // Credentials only accessible via /api/vault/credentials with re-auth
    const { loginUsername, loginPassword, ...safeAccount } = account;

    return NextResponse.json({ 
      success: true, 
      account: safeAccount 
    });
  } catch (error) {
    console.error('Error fetching account:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch account' 
    }, { status: 500 });
  }
}

/**
 * PUT /api/accounts/[id]
 * Update an account
 */
export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenantId } = auth;
    const { id } = await params;

    // Verify account exists and belongs to this tenant
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        tenantId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ 
        error: 'Account not found' 
      }, { status: 404 });
    }

    const body = await request.json();
    const {
      category,
      subcategory,
      accountName,
      companyName,
      companyAddress,
      companyPhone,
      companyWebsite,
      paymentFrequency,
      customSchedule,
      anticipatedAmount,
      nextPaymentDate,
      calculationMode,
      balanceRemaining,
      notes,
      isActive,
    } = body;

    // Update account (note: credentials updated via separate secure endpoint)
    const updatedAccount = await prisma.account.update({
      where: { id },
      data: {
        ...(category && { category }),
        ...(subcategory !== undefined && { subcategory }),
        ...(accountName && { accountName }),
        ...(companyName && { companyName }),
        ...(companyAddress !== undefined && { companyAddress }),
        ...(companyPhone !== undefined && { companyPhone }),
        ...(companyWebsite !== undefined && { companyWebsite }),
        ...(paymentFrequency && { paymentFrequency }),
        ...(customSchedule !== undefined && { customSchedule }),
        ...(anticipatedAmount !== undefined && { 
          anticipatedAmount: anticipatedAmount ? parseFloat(anticipatedAmount) : null 
        }),
        ...(nextPaymentDate !== undefined && { 
          nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null 
        }),
        ...(calculationMode && { calculationMode }),
        ...(balanceRemaining !== undefined && { 
          balanceRemaining: balanceRemaining ? parseFloat(balanceRemaining) : null 
        }),
        ...(notes !== undefined && { notes }),
        ...(isActive !== undefined && { isActive }),
        modifiedById: user.id,
      },
      include: {
        financialDetails: true,
        loanDetails: true,
        vehicleDetails: true,
        insuranceDetails: true,
        propertyDetails: true,
      }
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'account_updated',
        category: 'account',
        result: 'success',
        resourceType: 'account',
        resourceId: id,
        details: {
          accountName: updatedAccount.accountName,
          changes: Object.keys(body),
        },
      },
    });

    // Auto-regenerate payment projections if payment details changed
    if (updatedAccount.nextPaymentDate && updatedAccount.anticipatedAmount && updatedAccount.paymentFrequency !== 'NONE') {
      try {
        // Delete existing upcoming payments
        await prisma.paymentHistory.deleteMany({
          where: {
            accountId: updatedAccount.id,
            status: 'UPCOMING',
          },
        });

        // Generate new projections with updated details
        const paymentRecords = generatePaymentRecords({
          accountId: updatedAccount.id,
          tenantId: tenantId,
          nextPaymentDate: updatedAccount.nextPaymentDate,
          anticipatedAmount: Number(updatedAccount.anticipatedAmount),
          paymentFrequency: updatedAccount.paymentFrequency,
        });

        await prisma.paymentHistory.createMany({
          data: paymentRecords,
        });

        console.log(`Regenerated ${paymentRecords.length} payments for updated account ${updatedAccount.id}`);
      } catch (error) {
        console.error('Error regenerating payments:', error);
        // Don't fail the account update if payment generation fails
      }
    }

    // Remove credentials from response
    const { loginUsername, loginPassword, ...safeAccount } = updatedAccount;

    return NextResponse.json({ 
      success: true, 
      account: safeAccount 
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json({ 
      error: 'Failed to update account' 
    }, { status: 500 });
  }
}

/**
 * DELETE /api/accounts/[id]
 * Delete an account
 */
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenantId } = auth;
    const { id } = await params;

    // Verify account exists and belongs to this tenant
    const account = await prisma.account.findFirst({
      where: {
        id,
        tenantId,
      },
      select: {
        id: true,
        accountName: true,
        category: true,
      }
    });

    if (!account) {
      return NextResponse.json({ 
        error: 'Account not found' 
      }, { status: 404 });
    }

    // Delete account (cascade will delete related records)
    await prisma.account.delete({
      where: { id },
    });

    // Create audit log
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'account_deleted',
        category: 'account',
        result: 'success',
        resourceType: 'account',
        resourceId: id,
        details: {
          accountName: account.accountName,
          category: account.category,
        },
      },
    });

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ 
      error: 'Failed to delete account' 
    }, { status: 500 });
  }
}
