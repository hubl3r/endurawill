'use client';

import React from 'react';
import { WizardEngine } from '@/lib/wizards/core/WizardEngine';
import { financialPOADocument } from '@/lib/wizards/documents/financial-poa/config';
import { WizardShell } from '@/components/wizards/WizardShell';

export default function FinancialPOAPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Financial POA Test</h1>
      <p>WizardEngine imported successfully.</p>
    </div>
  );
}
