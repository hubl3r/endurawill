// app/api/poa/healthcare/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateHealthcarePOA } from '@/lib/poa/validation';
import { generateHealthcarePOAPDF } from '@/lib/poa/pdf-generator';
import { uploadPOADocument } from '@/lib/poa/storage';

/**
 * POST /api/poa/healthcare
 * Create a new Healthcare Power of Attorney
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validation = validateHealthcarePOA(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: validation.error.errors
        },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Start database transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create HealthcarePOA record
      const hcpoa = await tx.healthcarePOA.create({
        data: {
          tenantId: data.principal.tenantId,
          principalUserId: data.principal.userId,
          principalName: data.principal.fullName,
          principalAddress: data.principal.address.street,
          principalCity: data.principal.address.city,
          principalState: data.principal.address.state,
          principalZip: data.principal.address.zipCode,
          principalEmail: data.principal.email,
          principalPhone: data.principal.phone,
          principalDOB: data.principal.dateOfBirth ? new Date(data.principal.dateOfBirth) : null,
          
          // Primary agent
          agentName: data.agents[0].fullName,
          agentRelationship: data.agents[0].relationship,
          agentPhone: data.agents[0].phone,
          agentEmail: data.agents[0].email,
          agentAddress: `${data.agents[0].address.street}, ${data.agents[0].address.city}, ${data.agents[0].address.state} ${data.agents[0].address.zipCode}`,
          
          // Alternate agents (successors)
          alternateAgents: data.agents.slice(1).map((agent, idx) => ({
            order: idx + 1,
            fullName: agent.fullName,
            relationship: agent.relationship,
            phone: agent.phone,
            email: agent.email,
            address: `${agent.address.street}, ${agent.address.city}, ${agent.address.state} ${agent.address.zipCode}`
          })),
          
          // Healthcare powers
          generalMedicalCare: data.healthcarePowers.medicalTreatment,
          mentalHealthTreatment: data.healthcarePowers.mentalHealthTreatment,
          endOfLifeDecisions: data.healthcarePowers.endOfLifeDecisions,
          organDonation: data.healthcarePowers.organDonation,
          autopsyConsent: data.healthcarePowers.autopsyDecision,
          
          // Life sustaining treatment
          endOfLifePreferences: data.lifeSustainingTreatment === 'prolong_life' 
            ? 'I want my life prolonged to the greatest extent possible'
            : data.lifeSustainingTreatment === 'comfort_care_only'
            ? 'I want comfort care only. Do not prolong my life.'
            : data.lifeSustainingTreatment === 'agent_decides'
            ? 'I want my agent to decide based on their best judgment'
            : null,
          
          // Organ donation details
          organDonationDetails: data.organDonation 
            ? data.organDonation === 'any_needed' ? 'Donate any needed organs and tissues'
            : data.organDonation === 'transplant_only' ? 'Donate for transplantation only'
            : data.organDonation === 'research_only' ? 'Donate for research only'
            : data.organDonation === 'no_donation' ? 'No organ donation'
            : null
            : null,
          
          specialInstructions: data.additionalDirectives,
          
          state: data.state,
          statutoryFormUsed: data.useStatutoryForm,
          
          status: 'DRAFT',
          
          createdById: data.principal.userId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      // 2. Create Witnesses
      const witnessPromises = data.witnesses.map((witness) =>
        tx.healthcarePOAWitness.create({
          data: {
            healthcarePOAId: hcpoa.id,
            fullName: witness.fullName,
            address: witness.address.street,
            city: witness.address.city,
            state: witness.address.state,
            zip: witness.address.zipCode,
            relationship: witness.relationship,
            createdAt: new Date()
          }
        })
      );
      await Promise.all(witnessPromises);

      // 3. Create Audit Log
      await tx.healthcarePOAAuditLog.create({
        data: {
          healthcarePOAId: hcpoa.id,
          userId: data.principal.userId,
          action: 'HCPOA_CREATED',
          category: 'creation',
          details: {
            principalName: data.principal.fullName,
            agentName: data.agents[0].fullName,
            alternateAgentCount: data.agents.length - 1
          },
          timestamp: new Date()
        }
      });

      return { hcpoa };
    });

    const { hcpoa } = result;

    // 4. Generate PDF (outside transaction)
    const { buffer, filename } = await generateHealthcarePOAPDF({
      poaData: data
    });

    // 5. Upload PDF to Vercel Blob
    const { url: documentUrl } = await uploadPOADocument({
      file: buffer,
      filename,
      contentType: 'application/pdf',
      tenantId: data.principal.tenantId,
      poaId: hcpoa.id
    });

    // 6. Update HealthcarePOA with document URL
    const updatedHCPOA = await prisma.healthcarePOA.update({
      where: { id: hcpoa.id },
      data: { 
        generatedDocument: documentUrl,
        updatedAt: new Date()
      },
      include: {
        witnesses: true
      }
    });

    // 7. Create audit log for PDF generation
    await prisma.healthcarePOAAuditLog.create({
      data: {
        healthcarePOAId: hcpoa.id,
        userId: data.principal.userId,
        action: 'PDF_GENERATED',
        category: 'document',
        details: {
          filename,
          documentUrl,
          fileSize: buffer.length
        },
        timestamp: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Healthcare POA created successfully',
      healthcarePOA: {
        id: updatedHCPOA.id,
        status: updatedHCPOA.status,
        documentUrl: updatedHCPOA.generatedDocument,
        createdAt: updatedHCPOA.createdAt
      },
      agent: {
        name: updatedHCPOA.agentName,
        email: updatedHCPOA.agentEmail,
        relationship: updatedHCPOA.agentRelationship
      },
      witnesses: updatedHCPOA.witnesses
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating healthcare POA:', error);
    
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create healthcare POA',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/poa/healthcare?id=xxx
 * Fetch a specific healthcare POA by ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const hcpoaId = searchParams.get('id');

    if (!hcpoaId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Healthcare POA ID is required'
        },
        { status: 400 }
      );
    }

    const hcpoa = await prisma.healthcarePOA.findUnique({
      where: { id: hcpoaId },
      include: {
        witnesses: true,
        auditLogs: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });

    if (!hcpoa) {
      return NextResponse.json(
        {
          success: false,
          error: 'Healthcare POA not found'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      healthcarePOA: hcpoa
    });

  } catch (error) {
    console.error('Error fetching healthcare POA:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch healthcare POA',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
