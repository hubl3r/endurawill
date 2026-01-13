// components/wizards/financial-poa/ReviewAndSubmit.tsx
'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  User, 
  Users, 
  Shield, 
  CheckCircle, 
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ReviewAndSubmitProps {
  formData: any;
  updateFormData: (path: string, value: any) => void;
}

export function ReviewAndSubmit({ formData, updateFormData }: ReviewAndSubmitProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  const handleSubmit = async () => {
    if (!disclaimerAccepted) {
      setError('Please accept the disclaimer to continue');
      return;
    }

    // Friendly validation checks
    if (!formData.principal?.fullName) {
      setError('Please complete Step 2: Your Information before submitting');
      return;
    }

    if (!formData.agents || formData.agents.length === 0) {
      setError('Please complete Step 3: Select Your Agents before submitting');
      return;
    }

    if (!formData.grantedPowers?.grantAllPowers && (!formData.grantedPowers?.categoryIds || formData.grantedPowers.categoryIds.length === 0)) {
      setError('Please complete Step 4: Grant Powers before submitting');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Prepare data for API
      const payload = {
        principal: {
          ...formData.principal,
          userId: '', // Will be set by API
          tenantId: '', // Will be set by API
        },
        poaType: formData.poaType,
        isDurable: formData.isDurable || false,
        isSpringing: formData.isSpringing || false,
        isLimited: formData.isLimited || false,
        state: formData.state || formData.principal?.address?.state,
        agents: (formData.agents || []).map((agent: any, index: number) => ({
          type: agent.type,
          order: index + 1,
          fullName: agent.fullName,
          email: agent.email,
          phone: agent.phone,
          relationship: agent.relationship,
          address: agent.address,
        })),
        grantedPowers: {
          categoryIds: formData.grantedPowers?.categoryIds || [],
          grantAllPowers: formData.grantedPowers?.grantAllPowers || false,
          grantAllSubPowers: formData.grantedPowers?.grantAllSubPowers || true,
          subPowerIds: formData.grantedPowers?.subPowerIds || [],
        },
        powerLimitations: formData.powerLimitations || [],
        effectiveDate: formData.effectiveDate || null,
        expirationDate: formData.expirationDate || null,
        springingCondition: formData.springingCondition || null,
        agentCompensation: formData.agentCompensation || false,
        compensationDetails: formData.compensationDetails || null,
        specialInstructions: formData.specialInstructions || null,
        coAgentsMustActJointly: formData.coAgentsMustActJointly || false,
        useStatutoryForm: false,
        additionalInstructions: formData.additionalInstructions || '',
      };

      const response = await fetch('/api/poa/financial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create POA');
      }

      // Success! Redirect to success page
      router.push('/poa/success?id=' + result.poa.id);

    } catch (err) {
      console.error('Error submitting POA:', err);
      setError(err instanceof Error ? err.message : 'Failed to create POA. Please try again.');
      setIsSubmitting(false);
    }
  };

  const getPoaTypeName = () => {
    switch (formData.poaType) {
      case 'DURABLE': return 'Durable Power of Attorney';
      case 'SPRINGING': return 'Springing Power of Attorney';
      case 'LIMITED': return 'Limited Power of Attorney';
      default: return 'Power of Attorney';
    }
  };

  const primaryAgent = formData.agents?.find((a: any) => a.type === 'PRIMARY');
  const successorAgents = formData.agents?.filter((a: any) => a.type === 'SUCCESSOR') || [];
  const coAgents = formData.agents?.filter((a: any) => a.type === 'CO_AGENT') || [];
  const selectedPowerCount = formData.grantedPowers?.categoryIds?.length || 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Review Your Power of Attorney
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Please review all information carefully before creating your document.
        </p>

        {/* Document Type Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Document Type</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Type:</span>
              <span className="text-sm font-medium text-gray-900">{getPoaTypeName()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">State:</span>
              <span className="text-sm font-medium text-gray-900">
                {formData.state || formData.principal?.address?.state}
              </span>
            </div>
            {formData.isSpringing && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Physicians Required:</span>
                <span className="text-sm font-medium text-gray-900">
                  {formData.numberOfPhysiciansRequired || 1}
                </span>
              </div>
            )}
            {formData.isLimited && formData.expirationDate && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Expires:</span>
                <span className="text-sm font-medium text-gray-900">
                  {new Date(formData.expirationDate).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Principal Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Principal (You)</h4>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Name:</span>
              <span className="text-sm font-medium text-gray-900">{formData.principal?.fullName}</span>
            </div>
            {formData.principal?.email && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm font-medium text-gray-900">{formData.principal.email}</span>
              </div>
            )}
            {formData.principal?.phone && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Phone:</span>
                <span className="text-sm font-medium text-gray-900">{formData.principal.phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Address:</span>
              <span className="text-sm font-medium text-gray-900 text-right">
                {formData.principal?.address?.street}<br />
                {formData.principal?.address?.city}, {formData.principal?.address?.state} {formData.principal?.address?.zipCode}
              </span>
            </div>
          </div>
        </div>

        {/* Agents Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Agents</h4>
          </div>
          
          {primaryAgent && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Primary Agent</div>
              <div className="pl-4 space-y-1">
                <div className="text-sm text-gray-900 font-medium">{primaryAgent.fullName}</div>
                {primaryAgent.relationship && (
                  <div className="text-sm text-gray-600">Relationship: {primaryAgent.relationship}</div>
                )}
                <div className="text-sm text-gray-600">{primaryAgent.email}</div>
                <div className="text-sm text-gray-600">{primaryAgent.phone}</div>
              </div>
            </div>
          )}

          {successorAgents.length > 0 && (
            <div className="mb-4">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Successor Agents ({successorAgents.length})
              </div>
              <div className="pl-4 space-y-2">
                {successorAgents.map((agent: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-gray-900">{index + 1}. {agent.fullName}</span>
                    <span className="text-gray-600"> - {agent.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {coAgents.length > 0 && (
            <div>
              <div className="text-sm font-medium text-gray-700 mb-2">
                Co-Agents ({coAgents.length})
              </div>
              <div className="pl-4 space-y-2">
                {coAgents.map((agent: any, index: number) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium text-gray-900">{agent.fullName}</span>
                    <span className="text-gray-600"> - {agent.email}</span>
                  </div>
                ))}
              </div>
              {formData.coAgentsMustActJointly && (
                <div className="mt-2 text-sm text-blue-700 bg-blue-50 p-2 rounded">
                  Co-agents must act jointly
                </div>
              )}
            </div>
          )}
        </div>

        {/* Powers Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Shield className="h-5 w-5 text-blue-600" />
            <h4 className="font-medium text-gray-900">Powers Granted</h4>
          </div>
          <div className="space-y-2">
            {formData.grantedPowers?.grantAllPowers ? (
              <div className="flex items-center space-x-2 text-sm">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-gray-900">All Powers Granted</span>
              </div>
            ) : (
              <div className="text-sm text-gray-900">
                {selectedPowerCount} specific power{selectedPowerCount !== 1 ? 's' : ''} selected
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h4 className="font-medium text-yellow-900 mb-2">Important Legal Notice</h4>
              <div className="text-sm text-yellow-800 space-y-2">
                <p>
                  By creating this Power of Attorney, you are granting another person significant 
                  authority to act on your behalf in financial matters. Please understand:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>This is a legally binding document</li>
                  <li>Your agent will have the authority to make decisions as specified</li>
                  <li>You should only grant powers to someone you trust completely</li>
                  <li>This document should be reviewed by an attorney if you have any questions</li>
                  <li>State requirements for witnesses and notarization may apply</li>
                </ul>
                <p className="font-medium mt-3">
                  This platform provides document generation services. We do not provide legal advice. 
                  For legal guidance, please consult with a licensed attorney in your state.
                </p>
              </div>

              <label className="flex items-start space-x-3 mt-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={disclaimerAccepted}
                  onChange={(e) => setDisclaimerAccepted(e.target.checked)}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                />
                <span className="text-sm font-medium text-yellow-900">
                  I have read and understand this notice. I acknowledge that I should consult with 
                  an attorney if I have any questions about this document.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-900">Error</h4>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!disclaimerAccepted || isSubmitting}
            className={`flex items-center px-8 py-3 text-base font-medium rounded-md ${
              !disclaimerAccepted || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Creating Your POA...
              </>
            ) : (
              <>
                <CheckCircle className="h-5 w-5 mr-2" />
                Create Power of Attorney
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
