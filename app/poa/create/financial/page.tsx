'use client';

import React, { useState, useEffect } from 'react';
import { WizardEngine } from '@/lib/wizards/core/WizardEngine';
import { financialPOADocument } from '@/lib/wizards/documents/financial-poa/config';
import { WizardShell } from '@/components/wizards/WizardShell';
import { DocumentTypeSelector } from '@/components/wizards/financial-poa/DocumentTypeSelector';

export default function FinancialPOAPage() {
  const [engine, setEngine] = useState<WizardEngine | null>(null);

  useEffect(() => {
    const wizardEngine = new WizardEngine(financialPOADocument);
    setEngine(wizardEngine);
  }, []);

  if (!engine) {
    return <div className="p-8">Loading wizard...</div>;
  }

  return (
    <WizardShell engine={engine}>
      <div>WizardShell is working!</div>
    </WizardShell>
  );
}
