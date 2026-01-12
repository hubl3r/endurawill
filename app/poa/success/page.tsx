// app/poa/success/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, Download, FileText, ArrowRight, Loader2 } from 'lucide-react';

export default function POASuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const poaId = searchParams.get('id');
  
  const [poa, setPoa] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!poaId) {
      setError('No POA ID provided');
      setLoading(false);
      return;
    }

    // Fetch POA details
    fetch(`/api/poa/financial?id=${poaId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPoa(data.poa);
        } else {
          setError(data.error || 'Failed to load POA');
        }
      })
      .catch(err => {
        setError('Failed to load POA details');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [poaId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your Power of Attorney...</p>
        </div>
      </div>
    );
  }

  if (error || !poa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-red-200 p-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FileText className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading POA</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.push('/poa')}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const primaryAgent = poa.agents?.find((a: any) => a.type === 'PRIMARY');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <CheckCircle className="h-10 w-10 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Power of Attorney Created!
            </h1>
            <p className="text-lg text-gray-600">
              Your financial power of attorney has been successfully created and is ready for execution.
            </p>
          </div>
        </div>

        {/* POA Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Document Details</h2>
          
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Document Type:</dt>
              <dd className="text-sm text-gray-900 font-medium">
                {poa.isDurable ? 'Durable' : poa.isSpringing ? 'Springing' : poa.isLimited ? 'Limited' : ''} Financial POA
              </dd>
            </div>
            
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">State:</dt>
              <dd className="text-sm text-gray-900">{poa.state}</dd>
            </div>
            
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Principal:</dt>
              <dd className="text-sm text-gray-900">{poa.principalName}</dd>
            </div>
            
            {primaryAgent && (
              <div className="flex justify-between">
                <dt className="text-sm font-medium text-gray-600">Primary Agent:</dt>
                <dd className="text-sm text-gray-900">{primaryAgent.fullName}</dd>
              </div>
            )}
            
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Created:</dt>
              <dd className="text-sm text-gray-900">
                {new Date(poa.createdAt).toLocaleDateString()}
              </dd>
            </div>
            
            <div className="flex justify-between">
              <dt className="text-sm font-medium text-gray-600">Status:</dt>
              <dd>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {poa.status}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        {/* Download Section */}
        {poa.generatedDocument && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-start space-x-3">
              <Download className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Download Your Document
                </h3>
                <p className="text-sm text-blue-800 mb-4">
                  Your Power of Attorney is ready to download. Please review the document carefully
                  before signing.
                </p>
                <a
                  href={poa.generatedDocument}
                  download
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Next Steps</h2>
          
          <ol className="space-y-4">
            <li className="flex items-start">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-medium text-gray-900">Review the Document</p>
                <p className="text-sm text-gray-600">
                  Read through the entire Power of Attorney to ensure all information is correct.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-medium text-gray-900">Print and Sign</p>
                <p className="text-sm text-gray-600">
                  Print the document and sign it in the presence of a notary public
                  {poa.state && (
                    <> as required by {poa.state} law</>
                  )}.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-medium text-gray-900">Agent Acceptance</p>
                <p className="text-sm text-gray-600">
                  Have your agent(s) sign the acceptance page to formally accept their role.
                </p>
              </div>
            </li>
            
            <li className="flex items-start">
              <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm mr-3 flex-shrink-0">
                4
              </span>
              <div>
                <p className="font-medium text-gray-900">Store Safely</p>
                <p className="text-sm text-gray-600">
                  Keep the original in a safe place and provide copies to your agent(s) and
                  relevant financial institutions.
                </p>
              </div>
            </li>
          </ol>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            Important Legal Notice
          </h3>
          <p className="text-sm text-amber-800">
            This Power of Attorney is a legal document. We recommend having it reviewed by an
            attorney before execution to ensure it meets your specific needs and complies with
            all applicable laws in your state.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => router.push('/poa')}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
          >
            Return to Dashboard
          </button>
          
          <button
            onClick={() => router.push('/poa/create/financial')}
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium inline-flex items-center justify-center"
          >
            Create Another POA
            <ArrowRight className="h-4 w-4 ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
