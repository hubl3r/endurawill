// components/AdminPhase2TestButton.tsx
'use client';

import { useState } from 'react';
import { Flask, CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

interface TestResult {
  name: string;
  passed: boolean;
  message: string;
  error: string | null;
  details?: any;
}

interface TestCategory {
  category: string;
  tests: TestResult[];
}

interface TestResponse {
  success: boolean;
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: string;
  };
  results: TestCategory[];
  timestamp: string;
  error?: string;
}

export default function AdminPhase2TestButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TestResponse | null>(null);
  const [testType, setTestType] = useState<'all' | 'validation' | 'storage' | 'pdf'>('all');

  const runTests = async (type: typeof testType) => {
    setLoading(true);
    setResult(null);
    setTestType(type);

    try {
      const response = await fetch('/api/admin/test-phase2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType: type }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        summary: { total: 0, passed: 0, failed: 0, passRate: '0%' },
        results: [],
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-start gap-4">
        <div className="inline-flex p-3 rounded-lg bg-green-50 text-green-600">
          <Flask className="h-6 w-6" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Test Phase 2 Libraries
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Run automated tests for validation, storage, and PDF generation libraries.
          </p>

          {/* Test Type Buttons */}
          {!result && (
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => runTests('all')}
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && testType === 'all' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Running All Tests...
                  </>
                ) : (
                  <>
                    <Flask className="h-4 w-4" />
                    Run All Tests
                  </>
                )}
              </button>

              <button
                onClick={() => runTests('validation')}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading && testType === 'validation' ? 'Running...' : 'Validation Only'}
              </button>

              <button
                onClick={() => runTests('storage')}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading && testType === 'storage' ? 'Running...' : 'Storage Only'}
              </button>

              <button
                onClick={() => runTests('pdf')}
                disabled={loading}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading && testType === 'pdf' ? 'Running...' : 'PDF Only'}
              </button>
            </div>
          )}

          {/* Results Display */}
          {result && (
            <div className={`mt-4 p-4 rounded-lg ${
              result.success && result.summary.failed === 0
                ? 'bg-green-50 border border-green-200' 
                : result.error
                ? 'bg-red-50 border border-red-200'
                : 'bg-yellow-50 border border-yellow-200'
            }`}>
              {/* Summary */}
              <div className="flex items-start gap-3 mb-4">
                {result.success && result.summary.failed === 0 ? (
                  <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : result.error ? (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                )}
                
                <div className="flex-1">
                  <h4 className={`font-semibold ${
                    result.success && result.summary.failed === 0
                      ? 'text-green-900' 
                      : result.error
                      ? 'text-red-900'
                      : 'text-yellow-900'
                  }`}>
                    {result.error 
                      ? 'Test Execution Failed' 
                      : result.summary.failed === 0
                      ? 'All Tests Passed! ✅'
                      : `${result.summary.failed} Test(s) Failed`
                    }
                  </h4>
                  
                  {!result.error && (
                    <p className={`text-sm mt-1 ${
                      result.summary.failed === 0 ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {result.summary.passed} / {result.summary.total} tests passed ({result.summary.passRate})
                    </p>
                  )}

                  {result.error && (
                    <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-x-auto">
                      {result.error}
                    </pre>
                  )}
                </div>
              </div>

              {/* Detailed Results */}
              {!result.error && result.results.length > 0 && (
                <div className="space-y-4">
                  {result.results.map((category, idx) => (
                    <details key={idx} className="group" open={category.tests.some(t => !t.passed)}>
                      <summary className="cursor-pointer font-medium text-gray-900 flex items-center gap-2">
                        <span className="text-sm">
                          {category.category} ({category.tests.filter(t => t.passed).length}/{category.tests.length})
                        </span>
                      </summary>
                      <div className="mt-2 ml-4 space-y-2">
                        {category.tests.map((test, testIdx) => (
                          <div key={testIdx} className="flex items-start gap-2 text-sm">
                            {test.passed ? (
                              <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className={test.passed ? 'text-gray-700' : 'text-red-700'}>
                                <span className="font-medium">{test.name}:</span> {test.message}
                              </div>
                              {test.error && (
                                <div className="text-xs text-red-600 mt-1 bg-red-50 p-1 rounded">
                                  {test.error}
                                </div>
                              )}
                              {test.details && (
                                <details className="text-xs text-gray-600 mt-1">
                                  <summary className="cursor-pointer">Details</summary>
                                  <pre className="mt-1 bg-gray-50 p-2 rounded overflow-x-auto">
                                    {JSON.stringify(test.details, null, 2)}
                                  </pre>
                                </details>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              )}

              {/* Timestamp */}
              <div className="mt-4 pt-4 border-t border-gray-200 text-xs text-gray-500">
                Completed: {new Date(result.timestamp).toLocaleString()}
              </div>

              {/* Run Again Button */}
              <button
                onClick={() => setResult(null)}
                className="mt-3 text-sm text-gray-700 hover:text-gray-900 underline"
              >
                Run tests again
              </button>
            </div>
          )}

          {/* Info Box */}
          {!result && !loading && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>💡 What gets tested:</strong>
              </p>
              <ul className="text-sm text-blue-700 mt-2 space-y-1 ml-4">
                <li>• <strong>Validation:</strong> Input validation, email/ZIP checks, conditional rules</li>
                <li>• <strong>Storage:</strong> Filename sanitization, path generation, file validation</li>
                <li>• <strong>PDF:</strong> Document generation for durable, springing, limited, and healthcare POAs</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
