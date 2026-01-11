// app/poa/create/financial/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { WizardShell } from '@/components/wizards/WizardShell';
import { WizardEngine } from '@/lib/wizards/core/WizardEngine';
import { DocumentTypeSelector } from '@/components/wizards/financial-poa/DocumentTypeSelector';
import { PrincipalInformation } from '@/components/wizards/financial-poa/PrincipalInformation';
import { AgentSelection } from '@/components/wizards/financial-poa/AgentSelection';
import { PowerSelection } from '@/components/wizards/financial-poa/PowerSelection';
import { ReviewAndSubmit } from '@/components/wizards/financial-poa/ReviewAndSubmit';

export default function FinancialPOAWizardPage() {
  const [engine, setEngine] = useState<WizardEngine | null>(null);
  const [currentStepId, setCurrentStepId] = useState('document-type');

  useEffect(() => {
    // Initialize the WizardEngine with proper configuration
    const wizardEngine = new WizardEngine({
      documentType: 'financial-poa',
      sections: [
        {
          id: 'basics',
          title: 'POA Basics',
          steps: [
            {
              id: 'document-type',
              title: 'Document Type',
              description: 'Choose the type of Power of Attorney',
              component: 'DocumentTypeSelector',
              estimatedMinutes: 2,
            },
            {
              id: 'principal-info',
              title: 'Your Information',
              description: 'Enter your personal information',
              component: 'PrincipalInformation',
              estimatedMinutes: 3,
            },
          ],
        },
        {
          id: 'agents',
          title: 'Agents',
          steps: [
            {
              id: 'agent-selection',
              title: 'Select Your Agents',
              description: 'Choose who will act on your behalf',
              component: 'AgentSelection',
              estimatedMinutes: 5,
            },
          ],
        },
        {
          id: 'powers',
          title: 'Powers & Review',
          steps: [
            {
              id: 'power-selection',
              title: 'Grant Powers',
              description: 'Choose which powers to grant',
              component: 'PowerSelection',
              estimatedMinutes: 4,
            },
            {
              id: 'review',
              title: 'Review & Submit',
              description: 'Review and create your POA',
              component: 'ReviewAndSubmit',
              estimatedMinutes: 3,
            },
          ],
        },
      ],
    });

    setEngine(wizardEngine);
  }, []);

  const handleStepChange = (stepId: string, sectionId: string) => {
    setCurrentStepId(stepId);
  };

  const handleSave = async (data: any) => {
    // Auto-save functionality
    try {
      const sessionId = `poa-${Date.now()}`;
      await fetch('/api/wizard/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          documentType: 'financial-poa',
          currentSection: data.currentSection,
          currentStep: data.currentStep,
          formData: data.formData,
        }),
      });
    } catch (error) {
      console.error('Failed to save wizard progress:', error);
    }
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
