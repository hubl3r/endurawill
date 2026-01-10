'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WizardEngine } from '@/lib/wizards/core/WizardEngine';
import { financialPOADocument } from '@/lib/wizards/documents/financial-poa/config';
import { WizardShell } from '@/components/wizards/WizardShell';
import { DocumentTypeSelector } from '@/components/wizards/financial-poa/DocumentTypeSelector';

export default function FinancialPOAPage() {
  const router = useRouter();
  const [engine, setEngine] = useState<WizardEngine | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>('');

  // Generate session ID
  const sessionId = `poa_financial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    const wizardEngine = new WizardEngine(financialPOADocument, { sessionId });
    setEngine(wizardEngine);
    setCurrentStepId(wizardEngine.getCurrentStep()?.id || '');
  }, [sessionId]);

  const handleStepChange = (stepId: string, sectionId: string) => {
    setCurrentStepId(stepId);
  };

  const handleSaveProgress = async (data: any) => {
    try {
      await fetch('/api/wizard/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: data.sessionId,
          documentType: data.documentType,
          currentSection: data.currentSection,
          currentStep: data.currentStep,
          completedSections: data.completedSections,
          completedSteps: data.completedSteps,
          formData: data.formData,
          validationErrors: data.validationErrors,
          timeSpent: data.timeSpent,
          isCompleted: data.isComplete,
        }),
      });
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const renderStepComponent = () => {
    if (!engine || !currentStepId) return null;

    const currentStep = engine.getCurrentStep();
    if (!currentStep) return null;

    const formData = engine.serialize().formData;
    const updateFormData = (path: string, value: any) => {
      engine.updateFormData(path, value);
    };

    switch (currentStep.component) {
      case 'DocumentTypeSelector':
        return (
          <DocumentTypeSelector
            formData={formData}
            updateFormData={updateFormData}
          />
        );
        
      default:
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Step: {currentStep.title}
            </h3>
            <p className="text-gray-600">This step component will be implemented next.</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                <strong>Form data:</strong> {JSON.stringify(formData, null, 2)}
              </p>
            </div>
          </div>
        );
    }
  };

  if (!engine) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border border-gray-300 rounded-full border-t-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900">Loading Financial POA Wizard...</h2>
        </div>
      </div>
    );
  }

  return (
    <WizardShell
      engine={engine}
      onStepChange={handleStepChange}
      onSave={handleSaveProgress}
      autoSaveInterval={30000}
    >
      {renderStepComponent()}
    </WizardShell>
  );
}
