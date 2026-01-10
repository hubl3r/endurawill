// lib/wizards/core/WizardEngine.ts
// File path: /lib/wizards/core/WizardEngine.ts

import { z } from 'zod';

// ============================================
// CORE WIZARD INTERFACES
// ============================================

export interface WizardStep {
  id: string;
  title: string;
  description?: string;
  component: string; // Component name to render
  validation: z.ZodSchema;
  dependencies?: string[]; // Step IDs that must be completed first
  conditional?: (data: any) => boolean; // Function to determine if step should show
  estimatedMinutes?: number;
  isOptional?: boolean;
}

export interface WizardSection {
  id: string;
  title: string;
  description: string;
  steps: WizardStep[];
  dependencies?: string[]; // Section IDs that must be completed first
  conditional?: (data: any) => boolean;
  estimatedMinutes?: number;
  icon?: string;
  color?: string; // For visual distinction
}

export interface WizardDocument {
  id: string;
  title: string;
  type: 'financial-poa' | 'medical-poa' | 'healthcare-directives' | 'will' | 'trust' | 'final-arrangements';
  description: string;
  sections: WizardSection[];
  globalValidation: z.ZodSchema;
  estimatedMinutes?: number;
}

export interface WizardData {
  documentId: string;
  documentType: string;
  sessionId: string;
  
  // Navigation state
  currentSection: string;
  currentStep: string;
  completedSteps: Set<string>;
  completedSections: Set<string>;
  
  // Form data
  formData: Record<string, any>;
  validationErrors: Record<string, string[]>;
  
  // Progress tracking
  startedAt: Date;
  lastSavedAt: Date;
  estimatedCompletion?: number;
  timeSpent: number; // minutes
  
  // State management
  isComplete: boolean;
  isSubmitted: boolean;
}

// ============================================
// WIZARD ENGINE CLASS
// ============================================

export class WizardEngine {
  private document: WizardDocument;
  private data: WizardData;
  private listeners: Map<string, Function[]> = new Map();

  constructor(document: WizardDocument, initialData?: Partial<WizardData>) {
    this.document = document;
    this.data = {
      documentId: document.id,
      documentType: document.type,
      sessionId: initialData?.sessionId || this.generateSessionId(),
      currentSection: document.sections[0]?.id || '',
      currentStep: document.sections[0]?.steps[0]?.id || '',
      completedSteps: new Set(initialData?.completedSteps || []),
      completedSections: new Set(initialData?.completedSections || []),
      formData: initialData?.formData || {},
      validationErrors: initialData?.validationErrors || {},
      startedAt: initialData?.startedAt || new Date(),
      lastSavedAt: new Date(),
      timeSpent: initialData?.timeSpent || 0,
      isComplete: false,
      isSubmitted: false,
    };
  }

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  getCurrentSection(): WizardSection | null {
    return this.document.sections.find(s => s.id === this.data.currentSection) || null;
  }

  getCurrentStep(): WizardStep | null {
    const section = this.getCurrentSection();
    return section?.steps.find(s => s.id === this.data.currentStep) || null;
  }

  canGoToStep(stepId: string): boolean {
    const step = this.findStep(stepId);
    if (!step) return false;

    // Check step dependencies
    if (step.dependencies) {
      return step.dependencies.every(dep => this.data.completedSteps.has(dep));
    }

    // Check conditional logic
    if (step.conditional) {
      return step.conditional(this.data.formData);
    }

    return true;
  }

  goToStep(stepId: string): boolean {
    if (!this.canGoToStep(stepId)) return false;

    const section = this.findSectionByStep(stepId);
    if (!section) return false;

    this.data.currentSection = section.id;
    this.data.currentStep = stepId;
    this.emit('stepChanged', { stepId, sectionId: section.id });
    return true;
  }

  getNextStep(): string | null {
    const section = this.getCurrentSection();
    if (!section) return null;

    const currentStepIndex = section.steps.findIndex(s => s.id === this.data.currentStep);
    if (currentStepIndex === -1) return null;

    // Look for next step in current section
    for (let i = currentStepIndex + 1; i < section.steps.length; i++) {
      const step = section.steps[i];
      if (this.canGoToStep(step.id)) {
        return step.id;
      }
    }

    // Look for next section
    const currentSectionIndex = this.document.sections.findIndex(s => s.id === this.data.currentSection);
    if (currentSectionIndex === -1) return null;

    for (let i = currentSectionIndex + 1; i < this.document.sections.length; i++) {
      const nextSection = this.document.sections[i];
      const firstStep = nextSection.steps.find(step => this.canGoToStep(step.id));
      if (firstStep) return firstStep.id;
    }

    return null;
  }

  getPreviousStep(): string | null {
    const section = this.getCurrentSection();
    if (!section) return null;

    const currentStepIndex = section.steps.findIndex(s => s.id === this.data.currentStep);
    if (currentStepIndex === -1) return null;

    // Look for previous step in current section
    for (let i = currentStepIndex - 1; i >= 0; i--) {
      const step = section.steps[i];
      if (this.canGoToStep(step.id)) {
        return step.id;
      }
    }

    // Look for previous section
    const currentSectionIndex = this.document.sections.findIndex(s => s.id === this.data.currentSection);
    if (currentSectionIndex === -1) return null;

    for (let i = currentSectionIndex - 1; i >= 0; i--) {
      const prevSection = this.document.sections[i];
      for (let j = prevSection.steps.length - 1; j >= 0; j--) {
        const step = prevSection.steps[j];
        if (this.canGoToStep(step.id)) {
          return step.id;
        }
      }
    }

    return null;
  }

  next(): boolean {
    const nextStep = this.getNextStep();
    if (nextStep) {
      return this.goToStep(nextStep);
    }
    return false;
  }

  previous(): boolean {
    const prevStep = this.getPreviousStep();
    if (prevStep) {
      return this.goToStep(prevStep);
    }
    return false;
  }

  // ============================================
  // DATA MANAGEMENT
  // ============================================

  updateFormData(path: string, value: any): void {
    // Support nested paths like 'principal.address.street'
    const keys = path.split('.');
    let current = this.data.formData;
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!(keys[i] in current)) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    this.data.lastSavedAt = new Date();
    this.emit('dataChanged', { path, value });
  }

  getFormData(path?: string): any {
    if (!path) return this.data.formData;
    
    const keys = path.split('.');
    let current = this.data.formData;
    
    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        return undefined;
      }
    }
    
    return current;
  }

  // ============================================
  // VALIDATION METHODS
  // ============================================

  validateCurrentStep(): { isValid: boolean; errors: string[] } {
    const step = this.getCurrentStep();
    if (!step) return { isValid: false, errors: ['Step not found'] };

    try {
      step.validation.parse(this.data.formData);
      this.data.validationErrors[step.id] = [];
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
        this.data.validationErrors[step.id] = errors;
        return { isValid: false, errors };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  markStepComplete(): boolean {
    const currentStep = this.getCurrentStep();
    if (!currentStep) return false;

    const validation = this.validateCurrentStep();
    if (!validation.isValid) return false;

    this.data.completedSteps.add(currentStep.id);
    this.emit('stepCompleted', { stepId: currentStep.id });
    return true;
  }

  // ============================================
  // PROGRESS TRACKING
  // ============================================

  getProgress(): { completed: number; total: number; percentage: number } {
    const totalSteps = this.getTotalSteps();
    const completedSteps = this.data.completedSteps.size;
    
    return {
      completed: completedSteps,
      total: totalSteps,
      percentage: totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0
    };
  }

  // ============================================
  // EVENT SYSTEM
  // ============================================

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(callback);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(data));
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  private findStep(stepId: string): WizardStep | null {
    for (const section of this.document.sections) {
      const step = section.steps.find(s => s.id === stepId);
      if (step) return step;
    }
    return null;
  }

  private findSectionByStep(stepId: string): WizardSection | null {
    return this.document.sections.find(section => 
      section.steps.some(step => step.id === stepId)
    ) || null;
  }

  private getTotalSteps(): number {
    return this.document.sections.reduce((total, section) => 
      total + section.steps.length, 0
    );
  }

  private generateSessionId(): string {
    return `wizard_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ============================================
  // SERIALIZATION
  // ============================================

  serialize(): any {
    return {
      ...this.data,
      completedSteps: Array.from(this.data.completedSteps),
      completedSections: Array.from(this.data.completedSections)
    };
  }

  static deserialize(document: WizardDocument, data: any): WizardEngine {
    const engine = new WizardEngine(document, {
      ...data,
      completedSteps: new Set(data.completedSteps || []),
      completedSections: new Set(data.completedSections || [])
    });
    
    return engine;
  }
}
