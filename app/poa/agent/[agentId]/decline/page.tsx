// app/poa/agent/[agentId]/decline/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { XCircle, AlertTriangle, FileText, ArrowLeft } from 'lucide-react';
import { DisclaimerBanner } from '@/components/legal/DisclaimerBanner';

interface Agent {
  id: string;
  type: string;
  fullName: string;
  email: string;
  status: string;
}

interface POA {
  id: string;
  principalName: string;
  principalEmail: string;
  poaType: string;
  state: string;
  status: string;
  createdAt: string;
  agents: Agent[];
}

interface PageProps {
  params: Promise<{ agentId: string }>;
}

export default function AgentDeclinePage({ params }: PageProps) {
  const [agentId, setAgentId] = useState<string>('');
  const [poa, setPOA] = useState<POA | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [declining, setDeclining] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getParams = async () => {
      const resolvedParams = await params;
      setAgentId(resolvedParams.agentId);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (!agentId) return;

    // In a real implementation, we'd fetch POA details by agent ID
    // For now, using test data
    const testPOA: POA = {
      id: 'test-poa-id',
      principalName: 'Test Principal',
      principalEmail: 'principal@test.com',
      poaType: 'durable',
      state: 'FL',
      status: 'PENDING_AGENTS',
      createdAt: new Date().toISOString(),
      agents: [{
        id: agentId,
        type: 'primary',
        fullName: 'Test Agent',
        email: 'agent@test.com',
        status: 'PENDING'
      }]
    };

    setPOA(testPOA);
    setCurrentAgent(testPOA.agents.find(a => a.id === agentId) || null);
    setLoading(false);
  }, [agentId]);

  const handleDecline = async () => {
    if (!currentAgent) return;

    setDeclining(true);
    setError(null);

    try {
      const response = await fetch(`/api/poa/agent/${agentId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim() || 'No reason provided'
        }),
      });

      const result = await response.json();

      if (result.success) {
        setDeclined(true);
      } else {
        setError(result.error || 'Failed to decline appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setDeclining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading POA details...</p>
        </div>
      </div>
    );
  }

  if (!poa || !currentAgent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">POA Not Found</h1>
          <p className="text-gray-600">
            The Power of Attorney document or agent assignment could not be found.
          </p>
        </div>
      </div>
    );
  }

  if (declined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <XCircle className="h-16 w-16 text-orange-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Declined</h1>
          <p className="text-gray-600 mb-4">
            You have declined the appointment as {currentAgent.type} agent 
            for {poa.principalName}.
          </p>
          <p className="text-sm text-gray-500">
            The principal has been notified of your decision.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <DisclaimerBanner />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="ml-3">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-orange-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Decline Agent Appointment
            </h1>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Role</label>
                    <p className="capitalize text-gray-900">{currentAgent.type} Agent</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Your Name</label>
                    <p className="text-gray-900">{currentAgent.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Principal</label>
                    <p className="text-gray-900">{poa.principalName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">POA Type</label>
                    <p className="capitalize text-gray-900">{poa.poaType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reason for Declining (Optional)</h3>
              <p className="text-sm text-gray-600 mb-4">
                You may provide a reason for declining this appointment. This will be shared with the principal.
              </p>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                placeholder="Please explain why you cannot serve as an agent (optional)..."
              />
            </div>

            <div className="mb-8">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 mb-2">Important Notice</h4>
                <p className="text-sm text-orange-800">
                  By declining this appointment, you are informing the principal that you cannot 
                  serve as their agent. The principal will need to find another person to serve 
                  in this role or modify their Power of Attorney document.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleDecline}
                disabled={declining}
                className={`flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg ${
                  declining
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-orange-600 text-white hover:bg-orange-700 focus:ring-2 focus:ring-orange-500'
                }`}
              >
                {declining ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Declining...
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 mr-2" />
                    Decline Appointment
                  </>
                )}
              </button>

              <a
                href={`/poa/agent/${agentId}/accept`}
                className="flex items-center justify-center px-8 py-3 text-lg font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Accept Page
              </a>
            </div>

            <div className="mt-8 text-center text-sm text-gray-500">
              If you have questions about this appointment, please contact {poa.principalName} 
              at {poa.principalEmail}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
