// components/legal/DisclaimerBanner.tsx
'use client';

import { AlertTriangle } from 'lucide-react';

export function DisclaimerBanner() {
  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 rounded">
      <div className="flex">
        <AlertTriangle className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
        <div className="ml-3">
          <p className="text-sm text-yellow-800">
            <strong>Not Legal Advice:</strong> This tool helps you create a Power of Attorney document, 
            but does not constitute legal advice. We strongly recommend consulting with a licensed attorney 
            in your state before executing this document.
          </p>
        </div>
      </div>
    </div>
  );
}
