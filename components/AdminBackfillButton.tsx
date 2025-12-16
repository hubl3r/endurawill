// /components/AdminBackfillButton.tsx
'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';

export default function AdminBackfillButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleBackfill = async () => {
    if (!confirm('Generate payments for all existing accounts? This should only be done once.')) {
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/admin/backfill-payments', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.results);
      } else {
        setError(data.error || 'Failed to backfill payments');
      }
    } catch (err) {
      setError('Network error: ' + String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Backfill Payment History
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Generate 12 months of payment projections for all existing accounts.
        This should only be run once after deploying the payment system.
      </p>

      <button
        onClick={handleBackfill}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center gap-2"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        {loading ? 'Processing...' : 'Run Backfill'}
      </button>

      {result && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✓ Backfill Complete</h4>
          <div className="text-sm text-green-800 space-y-1">
            <div>Total accounts: {result.total}</div>
            <div>Processed: {result.processed}</div>
            <div>Skipped (already had payments): {result.skipped}</div>
            <div className="font-semibold">Payments generated: {result.generated}</div>
            {result.errors.length > 0 && (
              <div className="mt-2 text-red-600">
                <div className="font-semibold">Errors:</div>
                {result.errors.map((err: string, i: number) => (
                  <div key={i} className="text-xs">{err}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <h4 className="font-semibold text-red-900 mb-2">✗ Error</h4>
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}
    </div>
  );
}
