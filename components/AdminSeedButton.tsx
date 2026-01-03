// /components/AdminSeedButton.tsx
'use client';

import { useState } from 'react';
import { Database, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface SeedResult {
  success: boolean;
  message: string;
  counts?: {
    powerCategories: number;
    subPowers: number;
    stateRequirements: number;
    statutoryForms: number;
    notaryTemplates: number;
    incapacityDefinitions: number;
    healthcareForms: number;
  };
  total?: number;
  error?: string;
}

export default function AdminSeedButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SeedResult | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');

  const runSeeds = async () => {
    if (!password.trim()) {
      setResult({
        success: false,
        message: 'Please enter the seed password',
        error: 'Password required'
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/admin/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();
      setResult(data);

      // Clear password on success
      if (data.success) {
        setPassword('');
        setShowPassword(false);
      }
    } catch (error) {
      setResult({
        success: false,
        message: 'Network error',
        error: String(error)
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="inline-flex p-3 rounded-lg bg-purple-50 text-purple-600">
          <Database className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Run Database Seeds
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Populate the database with POA reference data (power categories, state requirements, statutory forms, etc.)
          </p>

          {/* Password Input */}
          {!result?.success && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seed Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter seed password"
                className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={loading}
              />
              <label className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded"
                />
                Show password
              </label>
            </div>
          )}

          {/* Action Button */}
          {!result?.success && (
            <button
              onClick={runSeeds}
              disabled={loading || !password.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running seeds...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Run Seeds
                </>
              )}
            </button>
          )}

          {/* Result Display */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.success 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {result.success ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    result.success ? 'text-green-900' : 'text-red-900'
                  }`}>
                    {result.success ? 'Seeds Completed Successfully!' : 'Seed Failed'}
                  </h4>
                  
                  <p className={`text-sm mt-1 ${
                    result.success ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {result.message}
                  </p>

                  {/* Success Details */}
                  {result.success && result.counts && (
                    <div className="mt-3 space-y-1">
                      <p className="text-sm font-medium text-green-900">
                        Total Records: {result.total}
                      </p>
                      <details className="text-sm text-green-700">
                        <summary className="cursor-pointer hover:text-green-900">
                          View breakdown
                        </summary>
                        <ul className="mt-2 ml-4 space-y-1">
                          <li>• Power Categories: {result.counts.powerCategories}</li>
                          <li>• Sub-Powers: {result.counts.subPowers}</li>
                          <li>• State Requirements: {result.counts.stateRequirements}</li>
                          <li>• Statutory Forms: {result.counts.statutoryForms}</li>
                          <li>• Notary Templates: {result.counts.notaryTemplates}</li>
                          <li>• Incapacity Definitions: {result.counts.incapacityDefinitions}</li>
                          <li>• Healthcare Forms: {result.counts.healthcareForms}</li>
                        </ul>
                      </details>
                    </div>
                  )}

                  {/* Error Details */}
                  {!result.success && result.error && (
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                      {result.error}
                    </pre>
                  )}

                  {/* Reset Button */}
                  {result.success && (
                    <button
                      onClick={() => setResult(null)}
                      className="mt-3 text-sm text-green-700 hover:text-green-900 underline"
                    >
                      Run seeds again
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Warning Message */}
          {!result && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Important:</strong> Only run seeds ONCE after initial deployment. 
                Seeds are idempotent but should only be executed during setup.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
