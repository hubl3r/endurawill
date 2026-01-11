// app/poa/create/financial/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { WizardShell } from '@/components/wizards/WizardShell';
import { WizardEngine, WizardDocument } from '@/lib/wizards/core/WizardEngine';
import { DocumentTypeSelector } from '@/components/wizards/financial-poa/DocumentTypeSelector';
import { PrincipalInformation } from '@/components/wizards/financial-poa/PrincipalInformation';
import { AgentSelection } from '@/components/wizards/financial-poa/AgentSelection';
import { PowerSelection } from '@/components/wizards/financial-poa/PowerSelection';
import { ReviewAndSubmit } from '@/components/wizards/financial-poa/ReviewAndSubmit';
import { z } from 'zod';

// Validation schemas for each step
const documentTypeSchema = z.object({
  poaType: z.enum(['DURABLE', 'SPRINGING', 'LIMITED']),
  isDurable: z.boolean().optional(),
  isSpringing: z.boolean().optional(),
  isLimited: z.boolean().optional(),
});

const principalSchema = z.object({
  principal: z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().optional(),
    dateOfBirth: z.string().optional(),
    address: z.object({
      street: z.string().min(1, 'Street address is required'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(2, 'State is required'),
      zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
    }),
  }),
});

const agentSchema = z.object({
  agents: z.array(z.object({
    type: z.enum(['PRIMARY', 'SUCCESSOR', 'CO_AGENT']),
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(1),
    relationship: z.string().optional(),
    address: z.object({
      street: z.string().min(1),
      city: z.string().min(1),
      state: z.string().min(2),
      zipCode: z.string().regex(/^\d{5}$/),
    }),
  })).min(1, 'At least one agent is required')
    .refine(agents => agents.some(a => a.type === 'PRIMARY'), {
      message: 'At least one primary agent is required',
    }),
});

const powerSchema = z.object({
  grantedPowers: z.object({
    grantAllPowers: z.boolean().optional(),
    categoryIds: z.array(z.string()).min(1, 'At least one power must be granted'),
    grantAllSubPowers: z.boolean().optional(),
  }),
});

export default function FinancialPOAWizardPage() {
  const [engine, setEngine] = useState<WizardEngine | null>(null);
  const [currentStepId, setCurrentStepId] = useState('document-type');

  useEffect(() => {
    // Create WizardDocument definition
    const wizardDocument: WizardDocument = {
      id: 'financial-poa-wizard',
      type: 'financial-poa',
      title: 'Financial Power of Attorney',
      description: 'Create a comprehensive financial power of attorney',
      estimatedMinutes: 17,
      globalValidation: z.object({}),
      sections: [
        {
          id: 'basics',
          title: 'POA Basics',
          description: 'Basic document and principal information',
          steps: [
            {
              id: 'document-type',
              title: 'Document Type',
              description: 'Choose the type of Power of Attorney',
              component: 'DocumentTypeSelector',
              estimatedMinutes: 2,
              validation: documentTypeSchema,
            },
            {
              id: 'principal-info',
              title: 'Your Information',
              description: 'Enter your personal information',
              component: 'PrincipalInformation',
              estimatedMinutes: 3,
              validation: principalSchema,
            },
          ],
        },
        {
          id: 'agents',
          title: 'Agents',
          description: 'Select who will act on your behalf',
          steps: [
            {
              id: 'agent-selection',
              title: 'Select Your Agents',
              description: 'Choose who will act on your behalf',
              component: 'AgentSelection',
              estimatedMinutes: 5,
              validation: agentSchema,
            },
          ],
        },
        {
          id: 'powers',
          title: 'Powers & Review',
          description: 'Grant powers and review your document',
          steps: [
            {
              id: 'power-selection',
              title: 'Grant Powers',
              description: 'Choose which powers to grant',
              component: 'PowerSelection',
              estimatedMinutes: 4,
              validation: powerSchema,
            },
            {
              id: 'review',
              title: 'Review & Submit',
              description: 'Review and create your POA',
              component: 'ReviewAndSubmit',
              estimatedMinutes: 3,
              validation: z.object({}),
            },
          ],
        },
      ],
    };

    // Initialize wizard engine with the document
    const wizardEngine = new WizardEngine(wizardDocument);

    setEngine(wizardEngine);
  }, []);

  const handleSave = async (data: any) => {
    try {
      const sessionId = `poa-${Date.now()}`;
      await fetch('/api/wizard/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          documentType: 'financial-poa',
          ...data,
        }),
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  };

  const handleStepChange = (stepId: string, sectionId: string) => {
    setCurrentStepId(stepId);
  };

  if (!engine) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading wizard...</div>
      </div>
    );
  }

  const renderCurrentStep = () => {
    const formData = engine.getFormData();
    const updateFormData = (path: string, value: any) => {
      engine.updateFormData(path, value);
    };

    switch (currentStepId) {
      case 'document-type':
        return (
          <DocumentTypeSelector
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 'principal-info':
        return (
          <PrincipalInformation
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 'agent-selection':
        return (
          <AgentSelection
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 'power-selection':
        return (
          <PowerSelection
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      case 'review':
        return (
          <ReviewAndSubmit
            formData={formData}
            updateFormData={updateFormData}
          />
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <WizardShell
      engine={engine}
      onStepChange={handleStepChange}
      onSave={handleSave}
      autoSaveInterval={30000}
    >
      {renderCurrentStep()}
    </WizardShell>
  );
}
