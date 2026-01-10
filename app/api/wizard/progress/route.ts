// app/api/wizard/progress/route.ts
// File path: /app/api/wizard/progress/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUserAndTenant } from '@/lib/tenant-context';

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      sessionId,
      documentType,
      currentSection,
      currentStep,
      completedSections,
      completedSteps,
      formData,
      validationErrors,
      estimatedCompletion,
      timeSpent,
      isCompleted,
    } = body;

    if (!sessionId || !documentType) {
      return NextResponse.json(
        { error: 'Session ID and document type are required' },
        { status: 400 }
      );
    }

    await prisma.wizardProgress.upsert({
      where: {
        sessionId,
      },
      create: {
        sessionId,
        tenantId: auth.tenantId,
        userId: auth.user.id,
        documentType,
        currentSection: currentSection || '',
        currentStep: currentStep || '',
        completedSections: completedSections || [],
        completedSteps: completedSteps || [],
        formData: formData || {},
        validationErrors: validationErrors || {},
        estimatedCompletion,
        timeSpent: timeSpent || 0,
        isCompleted: isCompleted || false,
        isAbandoned: false,
        lastActivity: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      update: {
        currentSection: currentSection || '',
        currentStep: currentStep || '',
        completedSections: completedSections || [],
        completedSteps: completedSteps || [],
        formData: formData || {},
        validationErrors: validationErrors || {},
        estimatedCompletion,
        timeSpent: timeSpent || 0,
        isCompleted: isCompleted || false,
        lastActivity: new Date(),
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Wizard progress saved successfully',
    });

  } catch (error) {
    console.error('Error saving wizard progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save wizard progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedUserAndTenant();
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const progress = await prisma.wizardProgress.findUnique({
      where: {
        sessionId,
      },
    });

    if (!progress) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (progress.tenantId !== auth.tenantId || progress.userId !== auth.user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      progress,
    });

  } catch (error) {
    console.error('Error loading wizard progress:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load wizard progress',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
