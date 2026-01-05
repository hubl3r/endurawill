// components/legal/DisclaimerCheckbox.tsx
'use client';

export function DisclaimerCheckbox({ 
  checked, 
  onChange 
}: { 
  checked: boolean; 
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="bg-red-50 border-2 border-red-200 p-6 rounded-lg mb-6">
      <h3 className="text-lg font-bold text-red-900 mb-3 flex items-center">
        <span className="text-2xl mr-2">⚠️</span>
        Important Legal Disclaimer
      </h3>
      
      <div className="space-y-3 text-sm text-red-800 mb-4">
        <p>
          <strong>This is NOT legal advice.</strong> This tool generates a Power of Attorney document template 
          based on the information you provide, but it cannot replace the expertise of a qualified attorney.
        </p>
        <p>
          <strong>State laws vary significantly.</strong> Each state has different requirements for valid 
          Power of Attorney documents. What is valid in one state may not be valid in another.
        </p>
        <p>
          <strong>Important decisions require professional guidance.</strong> A Power of Attorney grants 
          significant authority over your affairs. We strongly recommend consulting with a licensed attorney 
          in your state before executing this document.
        </p>
        <p>
          <strong>You assume all responsibility.</strong> By using this tool and executing the resulting 
          document, you acknowledge that you are solely responsible for ensuring it meets your state's 
          legal requirements and serves your intended purposes.
        </p>
      </div>

      <label className="flex items-start space-x-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
        />
        <span className="text-sm font-medium text-red-900">
          I understand and acknowledge this disclaimer. I agree that I am solely responsible for ensuring 
          this document meets my state's legal requirements and serves my intended purposes. I understand 
          this tool does not provide legal advice.
        </span>
      </label>
    </div>
  );
}
