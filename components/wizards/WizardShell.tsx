// components/wizards/WizardShell.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Clock, CheckCircle, Menu, X, Check } from 'lucide-react';
import { WizardEngine, WizardSection, WizardStep } from '@/lib/wizards/core/WizardEngine';

interface WizardShellProps {
  engine: WizardEngine;
  children: React.ReactNode;
  onStepChange?: (stepId: string, sectionId: string) => void;
  onSave?: (data: any) => Promise<void>;
  autoSaveInterval?: number;
}

export function WizardShell({
  engine,
  children,
  onStepChange,
  onSave,
  autoSaveInterval = 30000,
}: WizardShellProps) {
  const [currentSection, setCurrentSection] = useState<WizardSection | null>(null);
  const [currentStep, setCurrentStep] = useState<WizardStep | null>(null);
  const [progress, setProgress] = useState({ completed: 0, total: 0, percentage: 0 });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Update state when engine changes
  useEffect(() => {
    const updateState = () => {
      setCurrentSection(engine.getCurrentSection());
      setCurrentStep(engine.getCurrentStep());
      setProgress(engine.getProgress());
    };

    updateState();

    engine.on('stepChanged', updateState);
    engine.on('sectionChanged', updateState);
    engine.on('stepCompleted', updateState);

    return () => {
      engine.off('stepChanged', updateState);
      engine.off('sectionChanged', updateState);
      engine.off('stepCompleted', updateState);
    };
  }, [engine]);

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
    const validation = engine.validateCurrentStep();
    
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

  const handleStepClick = (stepId: string) => {
    const success = engine.goToStep(stepId);
    
    if (success && onStepChange) {
      const newStep = engine.getCurrentStep();
      const newSection = engine.getCurrentSection();
      onStepChange(newStep?.id || '', newSection?.id || '');
    }
    
    setSidebarOpen(false);
  };

  const canGoNext = engine.validateCurrentStep().isValid;
  const canGoPrevious = engine.getPreviousStep() !== null;
  const isLastStep = engine.getNextStep() === null;

  const allSections = engine.getAllSections();
  const completedSteps = engine.getCompletedSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Progress */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Hamburger Menu Button */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">
                Financial Power of Attorney
              </h1>
              <div className="hidden sm:block text-xs sm:text-sm text-gray-500">
                Step {progress.completed + 1} of {progress.total}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Progress Bar */}
              <div className="w-24 sm:w-48 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
              <span className="text-xs sm:text-sm font-medium text-gray-700">
                {progress.percentage}%
              </span>
              
              {/* Auto-save indicator */}
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                {isSaving ? (
                  <>
                    <div className="animate-spin h-3 w-3 border border-gray-400 rounded-full border-t-transparent" />
                    <span className="hidden md:inline">Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span className="hidden md:inline">Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar Navigation - Desktop Always Visible */}
        <div className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="h-full overflow-y-auto pt-16 lg:pt-0">
            <div className="p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Wizard Steps</h3>
              
              <nav className="space-y-1">
                {allSections.map((section, sectionIdx) => (
                  <div key={section.id}>
                    <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      {section.title}
                    </div>
                    {section.steps.map((step, stepIdx) => {
                      const isCompleted = completedSteps.includes(step.id);
                      const isCurrent = currentStep?.id === step.id;
                      const stepNumber = allSections
                        .slice(0, sectionIdx)
                        .reduce((acc, s) => acc + s.steps.length, 0) + stepIdx + 1;
                      
                      return (
                        <button
                          key={step.id}
                          onClick={() => handleStepClick(step.id)}
                          className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                            isCurrent
                              ? 'bg-blue-50 text-blue-700 font-medium'
                              : isCompleted
                              ? 'text-gray-700 hover:bg-gray-50'
                              : 'text-gray-400'
                          }`}
                        >
                          <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                            isCurrent
                              ? 'bg-blue-600 text-white'
                              : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {isCompleted ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <span className="text-xs">{stepNumber}</span>
                            )}
                          </div>
                          <span className="flex-1 text-left">{step.title}</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          <div className="max-w-4xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
            <div className="bg-white rounded-lg shadow-sm border">
              {/* Step Header */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                  <div>
                    <h2 className="text-base sm:text-lg font-medium text-gray-900">
                      {currentStep?.title}
                    </h2>
                    {currentStep?.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {currentStep.description}
                      </p>
                    )}
                  </div>
                  
                  {currentStep?.estimatedMinutes && (
                    <div className="flex items-center text-xs sm:text-sm text-gray-500">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      ~{currentStep.estimatedMinutes} min
                    </div>
                  )}
                </div>
              </div>

              {/* Step Content */}
              <div className="px-4 sm:px-6 py-4 sm:py-6">
                {children}
              </div>

              {/* Navigation Footer */}
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                  <button
                    type="button"
                    onClick={handlePrevious}
                    disabled={!canGoPrevious}
                    className={`flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md ${
                      !canGoPrevious
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </button>

                  <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    {/* Mobile save indicator */}
                    <div className="flex sm:hidden items-center text-xs text-gray-500">
                      {isSaving ? (
                        <>
                          <div className="animate-spin h-3 w-3 border border-gray-400 rounded-full border-t-transparent mr-2" />
                          <span>Saving...</span>
                        </>
                      ) : lastSaved ? (
                        <>
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                        </>
                      ) : null}
                    </div>

                    {onSave && (
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {isSaving ? 'Saving...' : 'Save Progress'}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleNext}
                      disabled={!canGoNext}
                      className={`w-full sm:w-auto flex items-center justify-center px-6 py-2 text-sm font-medium rounded-md ${
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
