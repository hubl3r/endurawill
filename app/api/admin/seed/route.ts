import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { seedPOA } from '@/prisma/seed/poa';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    // Simple password protection (change this!)
    const body = await request.json();
    const password = body.password;
    
    // Change this to your own secret password
    if (password !== 'Endura-7786') {
      return NextResponse.json({ 
        error: 'Unauthorized - incorrect password' 
      }, { status: 401 });
    }

    console.log('🌱 Starting seed via API...');
    
    // Run the seeds
    await seedPOA();
    
    console.log('✅ Seeds completed successfully');

    // Return success with counts
    const counts = {
      powerCategories: await prisma.pOAPowerCategoryDefinition.count(),
      subPowers: await prisma.pOASubPowerDefinition.count(),
      stateRequirements: await prisma.stateRequirements.count(),
      statutoryForms: await prisma.statutoryPOAForm.count(),
      notaryTemplates: await prisma.notaryBlockTemplate.count(),
      incapacityDefinitions: await prisma.incapacityDefinition.count(),
      healthcareForms: await prisma.healthcarePOAStateForm.count()
    };

    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

    return NextResponse.json({ 
      success: true,
      message: 'Seeds completed successfully!',
      counts,
      total,
      timestamp: new Date().toISOString()
    });
    
  } catch (error: any) {
    console.error('❌ Seed error:', error);
    
    return NextResponse.json({ 
      success: false,
      error: 'Seed failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// GET endpoint for testing (shows instructions)
export async function GET() {
  return NextResponse.json({ 
    message: 'POA Seed API Endpoint',
    instructions: 'Send POST request with JSON body: { "password": "your-password" }',
    note: 'Delete this API route after seeding for security'
  });
}
