// components/wizards/WizardShell.tsx
// File path: /components/wizards/WizardShell.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { WizardEngine, WizardSection, WizardStep } from '@/lib/wizards/core/WizardEngine';

interface WizardShellProps {
  engine: WizardEngine;
  children: React.ReactNode;
  onStepChange?: (stepId: string, sectionId: string) => void;
  onDataChange?: (data: any) => void;
  onSave?: (data: any) => Promise<void>;
  autoSaveInterval?: number; // milliseconds
}

export function WizardShell({
  engine,
  children,
  onStepChange,
  onDataChange,
  onSave,
  autoSaveInterval = 30000, // 30 seconds
}: WizardShellProps) {
  const [currentSection, setCurrentSection] = useState<WizardSection | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Update state when engine changes
  useEffect(() => {
    const updateState = () => {
      setCurrentSection(engine.getCurrentSection());
      setCurrentStep(engine.getCurrentStep());
      setProgress(engine.getProgress());
    };

    updateState();

    // Listen to engine events
    engine.on('stepChanged', updateState);
    engine.on('sectionChanged', updateState);
    engine.on('stepCompleted', updateState);
    engine.on('dataChanged', () => {
      if (onDataChange) {
        onDataChange(engine.serialize().formData);
      }
    });

    return () => {
      engine.off('stepChanged', updateState);
      engine.off('sectionChanged', updateState);
      engine.off('stepCompleted', updateState);
    };
  }, [engine, onDataChange]);

  // Auto-save functionality
  useEffect(() => {
    if (!onSave || !autoSaveInterval) return;

    const interval = setInterval(async () => {
      if (engine.serialize().formData && Object.keys(engine.serialize().formData).length > 0) {
        await handleSave();
      }
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [engine, onSave, autoSaveInterval]);

  const handleSave = async () => {
    if (!onSave) return;
    
    setIsSaving(true);
    try {
      await onSave(engine.serialize());
      setLastSaved(new Date());
    } catch (error) {
      console.error('Failed to save wizard progress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = () => {
    // Validate current step before proceeding
    const validation = engine.validateCurrentStep();
    setValidationErrors(validation.errors);
    
    if (validation.isValid) {
      engine.markStepComplete();
      const success = engine.next();
      
      if (success && onStepChange) {
        const newStep = engine.getCurrentStep();
        const newSection = engine.getCurrentSection();
        onStepChange(newStep?.id || '', newSection?.id || '');
      }
    }
  };

  const handlePrevious = () => {
    const success = engine.previous();
    
    if (success && onStepChange) {
      const newStep = engine.getCurrentStep();
      const newSection = engine.getCurrentSection();
      onStepChange(newStep?.id || '', newSection?.id || '');
    }
  };

  // Remove section navigation since those methods don't exist in WizardEngine
  // const handleSectionClick = (sectionId: string) => {
  //   if (engine.canGoToSection(sectionId)) {
  //     engine.goToSection(sectionId);
  //     if (onStepChange) {
  //       const newStep = engine.getCurrentStep();
  //       const newSection = engine.getCurrentSection();
  //       onStepChange(newStep?.id || '', newSection?.id || '');
  //     }
  //   }
  // };

  const canGoNext = currentStep ? engine.validateCurrentStep().isValid : false;
  const canGoPrevious = engine.getPreviousStep() !== null;
  const isLastStep = engine.getNextStep() === null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">
                Financial Power of Attorney
              </h1>
              <div className="text-sm text-gray-500">
                Step {progress.completed + 1} of {progress.total}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Progress Bar */}
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {progress.percentage}%
              </span>
              
              {/* Auto-save indicator */}
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {isSaving ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-gray-400 rounded-full border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Section Navigation Sidebar */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-8">
              <h3 className="font-medium text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {engine['document'].sections.map((section) => {
                  const isCurrentSection = section.id === currentSection?.id;
                  const canAccess = true; // Simplified - always allow access for now
                  const isCompleted = engine['data'].completedSections.has(section.id);
                  
                  return (
                    <button
                      key={section.id}
                      onClick={() => {}} // Disabled for now
                      disabled={true} // Disable section clicking until navigation is fixed
                      className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
                        isCurrentSection
                          ? 'bg-blue-50 border border-blue-200 text-blue-900'
                          : canAccess
                          ? 'hover:bg-gray-50 text-gray-700'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex-shrink-0 mr-3">
                        {isCompleted ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : isCurrentSection ? (
                          <Circle className="h-5 w-5 text-blue-500 fill-current" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm">{section.title}</div>
                        <div className="text-xs text-gray-500 truncate">
                          {section.description}
                        </div>
                        {section.estimatedMinutes && (
                          <div className="flex items-center text-xs text-gray-400 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            {section.estimatedMinutes} min
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Step Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {currentStep?.title}
                    </h2>
                    {currentStep?.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {currentStep.description}
                      </p>
                    )}
                  </div>
                  
                  {currentStep?.estimatedMinutes && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      ~{currentStep.estimatedMinutes} minutes
                    </div>
                  )}
                </div>

                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-red-800">Please fix the following errors:</h4>
                        <ul className="mt-1 text-sm text-red-700 space-y-1">
                          {validationErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Step Content */}
              <div className="px-6 py-6">
                {children}
              </div>

              {/* Navigation Footer */}
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!canGoPrevious}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      !canGoPrevious
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex items-center space-x-4">
                    {/* Manual Save Button */}
                    {onSave && (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Progress'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canGoNext}
                      className={`flex items-center px-6 py-2 text-sm font-medium rounded-md ${
                        !canGoNext
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
                      }`}
                    >
                      {isLastStep ? 'Review & Create POA' : 'Continue'}
                      {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// WIZARD PROGRESS HOOK
// ============================================

export function useWizardProgress(sessionId: string, autoSave = true) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveProgress = async (data: any) => {
    if (!autoSave) return;
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/wizard/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          ...data,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      throw err;
    } finally {
      setIsSaving(false);
    }
  };

  const loadProgress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wizard/progress/${sessionId}`);
      
      if (response.ok) {
        const data = await response.json();
        return data;
      } else if (response.status === 404) {
        // No existing progress
        return null;
      } else {
        throw new Error('Failed to load progress');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    saveProgress,
    loadProgress,
    isLoading,
    isSaving,
    error,
  };
}
