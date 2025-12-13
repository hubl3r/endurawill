import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';
import { rateLimiters } from '@/lib/ratelimit';
import { encryptFields, decryptFields } from '@/lib/encryption';
import { updatePaymentStatuses } from '@/lib/update-payment-statuses';

// Sensitive fields that need encryption
const ENCRYPTED_ACCOUNT_FIELDS = ['loginUsername', 'loginPassword'] as const;

/**
 * GET /api/accounts
 * List all accounts for the active tenant
 * Query params:
 * - category: filter by category
 * - status: active/inactive
 * - hasPayments: true/false
 */
export async function GET(request: Request) {
  try {
    // Get authenticated user and validated tenant (from Redis, secure)
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ 
        error: 'Unauthorized or no active estate selected' 
      }, { status: 401 });
    }

    const { user, tenant, tenantId } = auth;

    // Update payment statuses before fetching accounts
    await updatePaymentStatuses(tenantId);

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const isActive = searchParams.get('status') === 'active' ? true : 
                    searchParams.get('status') === 'inactive' ? false : 
                    undefined;
    const includeDetails = searchParams.get('details') === 'true';

    const whereClause: any = {
      tenantId: tenantId,
    };

    if (category) whereClause.category = category;
    if (isActive !== undefined) whereClause.isActive = isActive;

    // Fetch accounts with optional detail tables
    const accounts = await prisma.account.findMany({
      where: whereClause,
      include: {
        financialDetails: includeDetails,
        loanDetails: includeDetails,
        vehicleDetails: includeDetails,
        insuranceDetails: includeDetails,
        propertyDetails: includeDetails,
        createdBy: {
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
      orderBy: [
        { isActive: 'desc' },
        { updatedAt: 'desc' }
      ]
    });

    // Decrypt sensitive fields (credentials NOT included in list view for security)
    // Only decrypt when specifically requested via /api/vault/credentials

    // Create audit log for account list view
    await prisma.auditLog.create({
      data: {
        tenantId: tenantId,
        userId: user.id,
        actorType: 'user',
        actorName: user.fullName,
        action: 'accounts_viewed',
        category: 'account',
        result: 'success',
        details: {
          count: accounts.length,
          category: category || 'all',
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      accounts,
      tenant: {
        id: tenant.id,
        name: tenant.name,
      },
    });
  } catch (error) {
    console.error('Error loading accounts:', error);
    return NextResponse.json({ 
      error: 'Failed to load accounts' 
    }, { status: 500 });
  }
}

/**
 * POST /api/accounts
 * Create a new account
 */
export async function POST(request: Request) {
  try {
    // Get authenticated user and validated tenant
    const auth = await getAuthenticatedUserAndTenant();
    
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user, tenant, tenantId, clerkUser } = auth;

    // Rate limiting: 50 account creations per hour
    const { success: rateLimitSuccess } = await rateLimiters.documentUpload.limit(clerkUser.id);
    if (!rateLimitSuccess) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
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
      loginUsername,
      loginPassword,
      paymentFrequency,
      customSchedule,
      anticipatedAmount,
      nextPaymentDate,
      calculationMode,
      balanceRemaining,
      notes,
      // Detail table data
      financialDetails,
      loanDetails,
      vehicleDetails,
      insuranceDetails,
      propertyDetails,
    } = body;

    // Validate required fields
    if (!accountName || !companyName || !category) {
      return NextResponse.json(
        { error: 'Account name, company name, and category are required' },
        { status: 400 }
      );
    }

    // Prepare account data with encryption for sensitive fields
    const accountData: any = {
      category,
      subcategory,
      accountName,
      companyName,
      companyAddress,
      companyPhone,
      companyWebsite,
      paymentFrequency: paymentFrequency || 'MONTHLY',
      customSchedule,
      anticipatedAmount: anticipatedAmount ? parseFloat(anticipatedAmount) : null,
      nextPaymentDate: nextPaymentDate ? new Date(nextPaymentDate) : null,
      calculationMode: calculationMode || 'MANUAL',
      balanceRemaining: balanceRemaining ? parseFloat(balanceRemaining) : null,
      notes,
      isActive: true,
      tenantId: tenantId,
      createdById: user.id,
    };

    // Encrypt sensitive fields if provided
    if (loginUsername) {
      accountData.loginUsername = loginUsername;
    }
    if (loginPassword) {
      accountData.loginPassword = loginPassword;
    }

    const encryptedAccountData = encryptFields(accountData, ENCRYPTED_ACCOUNT_FIELDS);

    // Create account with optional detail tables
    const account = await prisma.account.create({
      data: {
        ...encryptedAccountData,
        // Create related detail records if provided
        ...(financialDetails && {
          financialDetails: {
            create: encryptFields({
              accountNumber: financialDetails.accountNumber,
              routingNumber: financialDetails.routingNumber,
              institutionType: financialDetails.institutionType,
              accountType: financialDetails.accountType,
              currentBalance: financialDetails.currentBalance ? parseFloat(financialDetails.currentBalance) : null,
              interestRate: financialDetails.interestRate ? parseFloat(financialDetails.interestRate) : null,
            }, ['accountNumber', 'routingNumber'])
          }
        }),
        ...(loanDetails && {
          loanDetails: {
            create: encryptFields({
              accountNumber: loanDetails.accountNumber,
              principalAmount: loanDetails.principalAmount ? parseFloat(loanDetails.principalAmount) : null,
              currentBalance: loanDetails.currentBalance ? parseFloat(loanDetails.currentBalance) : null,
              interestRate: loanDetails.interestRate ? parseFloat(loanDetails.interestRate) : null,
              loanTerm: loanDetails.loanTerm ? parseInt(loanDetails.loanTerm) : null,
              maturityDate: loanDetails.maturityDate ? new Date(loanDetails.maturityDate) : null,
              minimumPayment: loanDetails.minimumPayment ? parseFloat(loanDetails.minimumPayment) : null,
              loanType: loanDetails.loanType,
            }, ['accountNumber'])
          }
        }),
        ...(vehicleDetails && {
          vehicleDetails: {
            create: encryptFields({
              vin: vehicleDetails.vin,
              make: vehicleDetails.make,
              model: vehicleDetails.model,
              year: vehicleDetails.year ? parseInt(vehicleDetails.year) : null,
              licensePlate: vehicleDetails.licensePlate,
              loanAmount: vehicleDetails.loanAmount ? parseFloat(vehicleDetails.loanAmount) : null,
              registrationExpires: vehicleDetails.registrationExpires ? new Date(vehicleDetails.registrationExpires) : null,
            }, ['vin'])
          }
        }),
        ...(insuranceDetails && {
          insuranceDetails: {
            create: encryptFields({
              policyNumber: insuranceDetails.policyNumber,
              policyType: insuranceDetails.policyType,
              coverageAmount: insuranceDetails.coverageAmount ? parseFloat(insuranceDetails.coverageAmount) : null,
              deductible: insuranceDetails.deductible ? parseFloat(insuranceDetails.deductible) : null,
              policyStart: insuranceDetails.policyStart ? new Date(insuranceDetails.policyStart) : null,
              policyEnd: insuranceDetails.policyEnd ? new Date(insuranceDetails.policyEnd) : null,
              beneficiaries: insuranceDetails.beneficiaries,
              agentName: insuranceDetails.agentName,
              agentContact: insuranceDetails.agentContact,
            }, ['policyNumber'])
          }
        }),
        ...(propertyDetails && {
          propertyDetails: {
            create: {
              propertyAddress: propertyDetails.propertyAddress,
              unitNumber: propertyDetails.unitNumber,
              propertyType: propertyDetails.propertyType,
              loanAmount: propertyDetails.loanAmount ? parseFloat(propertyDetails.loanAmount) : null,
              interestRate: propertyDetails.interestRate ? parseFloat(propertyDetails.interestRate) : null,
              leaseEndDate: propertyDetails.leaseEndDate ? new Date(propertyDetails.leaseEndDate) : null,
            }
          }
        }),
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
        action: 'account_created',
        category: 'account',
        result: 'success',
        resourceType: 'account',
        resourceId: account.id,
        details: {
          accountName,
          category,
          companyName,
        },
      },
    });

    // Don't return encrypted credentials in response
    const { loginUsername: _, loginPassword: __, ...safeAccount } = account;

    return NextResponse.json({ 
      success: true, 
      account: safeAccount 
    });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
}
