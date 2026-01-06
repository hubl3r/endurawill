// app/poa/agent/[agentId]/accept/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, FileText, User } from 'lucide-react';
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

export default function AgentAcceptPage({ params }: PageProps) {
  const [agentId, setAgentId] = useState<string>('');
  const [poa, setPOA] = useState<POA | null>(null);
  const [currentAgent, setCurrentAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [accepted, setAccepted] = useState(false);
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

  const handleAccept = async () => {
    if (!currentAgent) return;

    setAccepting(true);
    setError(null);

    try {
      const response = await fetch(`/api/poa/agent/${agentId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();

      if (result.success) {
        setAccepted(true);
      } else {
        setError(result.error || 'Failed to accept appointment');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setAccepting(false);
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

  if (accepted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Appointment Accepted</h1>
          <p className="text-gray-600 mb-4">
            You have successfully accepted your appointment as {currentAgent.type} agent 
            for {poa.principalName}.
          </p>
          <p className="text-sm text-gray-500">
            The principal has been notified of your acceptance.
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
          <div className="bg-blue-600 px-6 py-4">
            <h1 className="text-2xl font-bold text-white flex items-center">
              <FileText className="h-6 w-6 mr-2" />
              Power of Attorney Agent Appointment
            </h1>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Agent Appointment Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Your Role</label>
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Responsibilities</h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <ul className="space-y-2 text-sm text-yellow-800">
                  <li>• Act in the principal's best interests at all times</li>
                  <li>• Keep accurate records of all transactions</li>
                  <li>• Avoid conflicts of interest</li>
                  <li>• Follow the terms and limitations specified in the POA</li>
                  <li>• Report to the principal as requested</li>
                </ul>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Important Notice</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  <strong>This is a legal responsibility.</strong> By accepting this appointment, 
                  you are agreeing to serve as an agent under a Power of Attorney. This carries 
                  legal obligations and potential liability. Please ensure you understand your 
                  duties before accepting.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleAccept}
                disabled={accepting}
                className={`flex items-center justify-center px-8 py-3 text-lg font-medium rounded-lg ${
                  accepting
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-500'
                }`}
              >
                {accepting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Accepting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Accept Appointment
                  </>
                )}
              </button>

              <a
                href={`/poa/agent/${agentId}/decline`}
                className="flex items-center justify-center px-8 py-3 text-lg font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500"
              >
                <User className="h-5 w-5 mr-2" />
                Decline Appointment
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
