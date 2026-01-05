// components/poa/WizardStep.tsx
'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

interface WizardStepProps {
  currentStep: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  canGoNext: boolean;
  isLastStep?: boolean;
  isSubmitting?: boolean;
}

export function WizardStep({
  currentStep,
  totalSteps,
  title,
  description,
  children,
  onBack,
  onNext,
  canGoNext,
  isLastStep = false,
  isSubmitting = false,
}: WizardStepProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-gray-600">Step {currentStep} of {totalSteps}</span>
          <span className="text-sm text-gray-600">{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{title}</h2>
        {description && (
          <p className="text-gray-600">{description}</p>
        )}
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {children}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onBack}
          disabled={currentStep === 1}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            currentStep === 1
              ? 'text-gray-400 cursor-not-allowed'
              : 'text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className={`flex items-center px-6 py-2 text-sm font-medium rounded-md ${
            !canGoNext || isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
          }`}
        >
          {isSubmitting ? (
            'Creating POA...'
          ) : isLastStep ? (
            'Create POA'
          ) : (
            <>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
