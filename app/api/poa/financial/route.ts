// app/api/poa/financial/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateFinancialPOAPDF } from '@/lib/poa/pdf-generator';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract data from wizard
    const {
      principal,
      poaType,
      isDurable,
      isSpringing,
      isLimited,
      state,
      agents,
      grantedPowers,
      powerLimitations,
      effectiveDate,
      expirationDate,
      springingCondition,
      agentCompensation,
      compensationDetails,
      specialInstructions,
      coAgentsMustActJointly,
    } = body;

    // TODO: Get user/tenant from auth session
    // For now, create/get a default tenant and user
    let tenant = await prisma.tenant.findFirst({
      where: { name: 'Default Tenant' }
    });
    
    if (!tenant) {
      tenant = await prisma.tenant.create({
        data: {
          name: 'Default Tenant',
          type: 'individual',
        }
      });
    }

    let user = await prisma.user.findFirst({
      where: { clerkId: 'default-clerk-id' }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          tenantId: tenant.id,
          clerkId: 'default-clerk-id',
          fullName: 'Default User',
          email: 'default@endurawill.com',
          role: 'OWNER',
          isPrimary: true,
        }
      });
    }

    const userId = user.id;
    const tenantId = tenant.id;

    // Create POA record in database
    const poa = await prisma.powerOfAttorney.create({
      data: {
        tenantId,
        principalUserId: userId,
        createdById: userId,
        
        // Principal info
        principalName: principal.fullName,
        principalEmail: principal.email || null,
        principalPhone: principal.phone || null,
        principalAddress: principal.address.street,
        principalCity: principal.address.city,
        principalState: principal.address.state,
        principalZip: principal.address.zipCode,
        
        // Document type
        poaType,
        isDurable,
        isSpringing,
        isLimited,
        state,
        
        // Dates
        effectiveDate: effectiveDate ? new Date(effectiveDate) : null,
        effectiveImmediately: !effectiveDate,
        expirationDate: expirationDate ? new Date(expirationDate) : null,
        springingCondition: springingCondition || null,
        
        // Additional terms
        specialInstructions: specialInstructions || null,
        coAgentsMustActJointly: coAgentsMustActJointly || false,
        hasCoAgents: agents.some((a: any) => a.type === 'CO_AGENT'),
        agentCompensation: agentCompensation || false,
        compensationDetails: compensationDetails || null,
        
        // Status
        status: 'DRAFT',
      },
    });

    // Create agents
    const createdAgents = await Promise.all(
      agents.map(async (agent: any) => {
        return prisma.pOAAgent.create({
          data: {
            poaId: poa.id,
            agentType: agent.type,
            order: agent.order || 0,
            fullName: agent.fullName,
            email: agent.email,
            phone: agent.phone,
            relationship: agent.relationship || null,
            address: agent.address.street,
            city: agent.address.city,
            state: agent.address.state,
            zip: agent.address.zipCode,
            hasAccepted: false,
          },
        });
      })
    );

    // Fetch power categories from database
    const powerCategories = await prisma.pOAPowerCategoryDefinition.findMany({
      where: {
        id: {
          in: grantedPowers.categoryIds || [],
        },
      },
      include: {
        subPowers: true,
      },
    });

    // Create granted powers and their limitations
    const grantedPowerRecords = await Promise.all(
      powerCategories.map(async (category) => {
        return prisma.pOAGrantedPower.create({
          data: {
            poaId: poa.id,
            categoryId: category.id,
            grantAllSubPowers: grantedPowers.grantAllSubPowers || false,
            grantedSubPowers: {}, // Empty object for now, could be populated with specific sub-powers
          },
        });
      })
    );

    // Create power limitations (if any) linked to granted powers
    if (powerLimitations && powerLimitations.length > 0) {
      await Promise.all(
        powerLimitations.map(async (limitation: any) => {
          // Find the granted power record for this category
          const grantedPower = grantedPowerRecords.find(
            gp => powerCategories.find(pc => pc.id === gp.categoryId)?.id === limitation.categoryId
          );
          
          if (!grantedPower) {
            console.warn(`No granted power found for limitation on category ${limitation.categoryId}`);
            return;
          }

          return prisma.pOAPowerLimitation.create({
            data: {
              poaId: poa.id,
              grantedPowerId: grantedPower.id,
              limitationType: limitation.limitationType,
              limitationText: limitation.limitationText,
              monetaryLimit: limitation.monetaryLimit || null,
              timeLimit: limitation.timeLimit ? new Date(limitation.timeLimit) : null,
              geographicLimit: limitation.geographicLimit || null,
              specificAsset: limitation.specificAsset || null,
            },
          });
        })
      );
    }

    // Get state requirements for PDF generation
    const stateRequirements = await prisma.stateRequirements.findUnique({
      where: { state },
    });

    // Prepare data for PDF generation
    const pdfData = {
      principal: {
        fullName: principal.fullName,
        email: principal.email,
        phone: principal.phone,
        address: principal.address,
      },
      poaType,
      isDurable,
      isSpringing,
      isLimited,
      state,
      agents: agents.map((agent: any) => ({
        type: agent.type,
        fullName: agent.fullName,
        email: agent.email,
        phone: agent.phone,
        relationship: agent.relationship,
        address: agent.address,
        order: agent.order || 0,
      })),
      grantedPowers: {
        categoryIds: grantedPowers.categoryIds,
        grantAllPowers: grantedPowers.grantAllPowers,
        grantAllSubPowers: grantedPowers.grantAllSubPowers,
      },
      powerLimitations: powerLimitations || [],
      effectiveDate,
      expirationDate,
      springingCondition,
      agentCompensation,
      compensationDetails,
      specialInstructions,
      coAgentsMustActJointly,
    };

    // Generate PDF
    const pdfResult = await generateFinancialPOAPDF({
      poaData: pdfData,
      stateRequirements: stateRequirements ? {
        requiresNotary: stateRequirements.notarizationRequired,
        requiresWitnesses: stateRequirements.witnessesRequired,
        numberOfWitnesses: stateRequirements.numberOfWitnesses || 2,
        notaryTemplate: undefined, // Could fetch from NotaryBlockTemplate if needed
      } : {
        requiresNotary: true, // Default to requiring notary
        requiresWitnesses: false,
        numberOfWitnesses: 0,
      },
      powerCategories: powerCategories.map(cat => ({
        id: cat.id,
        letter: cat.categoryLetter,
        title: cat.categoryName,
        description: cat.plainLanguageDesc,
        categoryName: cat.categoryName,
        plainLanguageDesc: cat.plainLanguageDesc,
        categoryLetter: cat.categoryLetter,
      })),
    });

    // Upload PDF to Vercel Blob storage
    const blob = await put(pdfResult.filename, pdfResult.buffer, {
      access: 'public',
      contentType: 'application/pdf',
    });

    // Update POA record with PDF URL
    await prisma.powerOfAttorney.update({
      where: { id: poa.id },
      data: {
        generatedDocument: blob.url,
      },
    });

    // Create audit log entry
    await prisma.pOAAuditLog.create({
      data: {
        poaId: poa.id,
        userId,
        action: 'CREATED',
        category: 'POA_LIFECYCLE',
        details: {
          poaType,
          state,
          agentCount: agents.length,
          powerCount: powerCategories.length,
          principalName: principal.fullName,
        },
      },
    });

    // Return success response
    return NextResponse.json({
      success: true,
      poa: {
        id: poa.id,
        documentUrl: blob.url,
        filename: pdfResult.filename,
        pageCount: pdfResult.pageCount,
      },
    });

  } catch (error) {
    console.error('Error creating financial POA:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve POA by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'POA ID is required' },
        { status: 400 }
      );
    }

    const poa = await prisma.powerOfAttorney.findUnique({
      where: { id },
      include: {
        agents: true,
        grantedPowers: {
          include: {
            category: true,
          },
        },
        powerLimitations: true,
        revocations: true,
        auditLogs: {
          orderBy: {
            timestamp: 'desc',
          },
          take: 10,
        },
      },
    });

    if (!poa) {
      return NextResponse.json(
        { success: false, error: 'POA not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      poa,
    });

  } catch (error) {
    console.error('Error fetching POA:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
