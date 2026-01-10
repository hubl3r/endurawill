// app/poa/create/financial/page.tsx
// File path: /app/poa/create/financial/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { WizardEngine } from '@/lib/wizards/core/WizardEngine';
import { financialPOADocument } from '@/lib/wizards/documents/financial-poa/config';
import { WizardShell } from '@/components/wizards/WizardShell';
import { DocumentTypeSelector } from '@/components/wizards/financial-poa/DocumentTypeSelector';

interface FinancialPOAPageProps {
  searchParams?: {
    session?: string;
    resume?: string;
  };
}

export default function FinancialPOAPage({ searchParams }: FinancialPOAPageProps) {
  const router = useRouter();
  const [engine, setEngine] = useState<WizardEngine | null>(null);
  const [currentStepId, setCurrentStepId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate or get session ID
  const sessionId = searchParams?.session || `poa_financial_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Initialize wizard engine
  useEffect(() => {
    const initializeWizard = async () => {
      try {
        setIsLoading(true);
        
        let existingData = null;
        
        // Try to load existing progress if resuming
        if (searchParams?.resume) {
          try {
            const response = await fetch(`/api/wizard/progress/${sessionId}`);
            if (response.ok) {
              const data = await response.json();
              existingData = data.progress;
            }
          } catch (err) {
            console.warn('Could not load existing progress:', err);
          }
        }

        // Create wizard engine with existing data or fresh start
        const wizardEngine = existingData
          ? WizardEngine.deserialize(financialPOADocument, existingData)
          : new WizardEngine(financialPOADocument, { sessionId });

        setEngine(wizardEngine);
        setCurrentStepId(wizardEngine.getCurrentStep()?.id || '');
        
        // Update URL with session ID if not present
        if (!searchParams?.session) {
          const newUrl = `/poa/create/financial?session=${sessionId}`;
          window.history.replaceState({}, '', newUrl);
        }

      } catch (err) {
        console.error('Failed to initialize wizard:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize wizard');
      } finally {
        setIsLoading(false);
      }
    };

    initializeWizard();
  }, [sessionId, searchParams]);

  // Handle step changes
  const handleStepChange = (stepId: string, sectionId: string) => {
    setCurrentStepId(stepId);
    
    // Update URL to maintain deep linking
    const newUrl = `/poa/create/financial?session=${sessionId}&step=${stepId}`;
    window.history.replaceState({}, '', newUrl);
  };

  // Handle wizard progress saving
  const handleSaveProgress = async (data: any) => {
    try {
      const response = await fetch('/api/wizard/progress', {
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
          estimatedCompletion: data.estimatedCompletion,
          timeSpent: data.timeSpent,
          isCompleted: data.isComplete,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (err) {
      console.error('Failed to save wizard progress:', err);
    }
  };

  // Handle wizard completion
  const handleWizardComplete = async (finalData: any) => {
    try {
      // Submit to POA creation API
      const response = await fetch('/api/poa/financial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...finalData,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create POA');
      }

      const result = await response.json();
      
      // Redirect to success page
      router.push(`/poa/success?id=${result.poa.id}&type=financial`);
      
    } catch (err) {
      console.error('Failed to create POA:', err);
      setError(err instanceof Error ? err.message : 'Failed to create POA');
    }
  };

  // Render current step component
  const renderStepComponent = () => {
    if (!engine || !currentStepId) return null;

    const currentStep = engine.getCurrentStep();
    if (!currentStep) return null;

    const formData = engine.serialize().formData;
    
    const updateFormData = (path: string, value: any) => {
      engine.updateFormData(path, value);
    };

    // Route to appropriate component based on step
    switch (currentStep.component) {
      case 'DocumentTypeSelector':
        return (
          <DocumentTypeSelector
            formData={formData}
            updateFormData={updateFormData}
          />
        );
        
      case 'PrincipalForm':
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Principal Form Component</h3>
            <p className="text-gray-600">This component will be implemented next in our iterative approach.</p>
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-700">
                <strong>Current form data:</strong> {JSON.stringify(formData, null, 2)}
              </p>
            </div>
          </div>
        );
        
      case 'AgentSelectionForm':
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Agent Selection Component</h3>
            <p className="text-gray-600">This component will be implemented after Principal Form.</p>
          </div>
        );
        
      default:
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Component: {currentStep.component}</h3>
            <p className="text-gray-600">This component is not yet implemented.</p>
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border border-gray-300 rounded-full border-t-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-medium text-gray-900">Loading Financial POA Wizard...</h2>
          <p className="text-gray-600">Initializing your secure session</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-xl">⚠</span>
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Error Loading Wizard</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="space-x-3">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!engine) {
    return null;
  }

  return (
    <WizardShell
      engine={engine}
      onStepChange={handleStepChange}
      onSave={handleSaveProgress}
      autoSaveInterval={30000} // Save every 30 seconds
    >
      {renderStepComponent()}
    </WizardShell>
  );
}
