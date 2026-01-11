// components/wizards/financial-poa/AgentSelection.tsx
'use client';

import React from 'react';
import { Plus, Trash2, User, AlertCircle } from 'lucide-react';

interface Agent {
  type: 'PRIMARY' | 'SUCCESSOR' | 'CO_AGENT';
  order: number;
  fullName: string;
  email: string;
  phone: string;
  relationship: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
}

interface AgentSelectionProps {
  formData: any;
  updateFormData: (path: string, value: any) => void;
}

const US_STATES = [
  { state: 'AL', stateName: 'Alabama' },
  { state: 'AK', stateName: 'Alaska' },
  { state: 'AZ', stateName: 'Arizona' },
  { state: 'AR', stateName: 'Arkansas' },
  { state: 'CA', stateName: 'California' },
  { state: 'CO', stateName: 'Colorado' },
  { state: 'CT', stateName: 'Connecticut' },
  { state: 'DE', stateName: 'Delaware' },
  { state: 'FL', stateName: 'Florida' },
  { state: 'GA', stateName: 'Georgia' },
  { state: 'HI', stateName: 'Hawaii' },
  { state: 'ID', stateName: 'Idaho' },
  { state: 'IL', stateName: 'Illinois' },
  { state: 'IN', stateName: 'Indiana' },
  { state: 'IA', stateName: 'Iowa' },
  { state: 'KS', stateName: 'Kansas' },
  { state: 'KY', stateName: 'Kentucky' },
  { state: 'LA', stateName: 'Louisiana' },
  { state: 'ME', stateName: 'Maine' },
  { state: 'MD', stateName: 'Maryland' },
  { state: 'MA', stateName: 'Massachusetts' },
  { state: 'MI', stateName: 'Michigan' },
  { state: 'MN', stateName: 'Minnesota' },
  { state: 'MS', stateName: 'Mississippi' },
  { state: 'MO', stateName: 'Missouri' },
  { state: 'MT', stateName: 'Montana' },
  { state: 'NE', stateName: 'Nebraska' },
  { state: 'NV', stateName: 'Nevada' },
  { state: 'NH', stateName: 'New Hampshire' },
  { state: 'NJ', stateName: 'New Jersey' },
  { state: 'NM', stateName: 'New Mexico' },
  { state: 'NY', stateName: 'New York' },
  { state: 'NC', stateName: 'North Carolina' },
  { state: 'ND', stateName: 'North Dakota' },
  { state: 'OH', stateName: 'Ohio' },
  { state: 'OK', stateName: 'Oklahoma' },
  { state: 'OR', stateName: 'Oregon' },
  { state: 'PA', stateName: 'Pennsylvania' },
  { state: 'RI', stateName: 'Rhode Island' },
  { state: 'SC', stateName: 'South Carolina' },
  { state: 'SD', stateName: 'South Dakota' },
  { state: 'TN', stateName: 'Tennessee' },
  { state: 'TX', stateName: 'Texas' },
  { state: 'UT', stateName: 'Utah' },
  { state: 'VT', stateName: 'Vermont' },
  { state: 'VA', stateName: 'Virginia' },
  { state: 'WA', stateName: 'Washington' },
  { state: 'WV', stateName: 'West Virginia' },
  { state: 'WI', stateName: 'Wisconsin' },
  { state: 'WY', stateName: 'Wyoming' },
];

export function AgentSelection({ formData, updateFormData }: AgentSelectionProps) {
  const agents: Agent[] = formData.agents || [];

  const addAgent = (type: Agent['type']) => {
    const newAgent: Agent = {
      type,
      order: agents.filter(a => a.type === type).length + 1,
      fullName: '',
      email: '',
      phone: '',
      relationship: '',
      address: {
        street: '',
        city: '',
        state: '',
        zipCode: '',
      },
    };
    updateFormData('agents', [...agents, newAgent]);
  };

  const updateAgent = (index: number, field: string, value: any) => {
    const updated = agents.map((agent, i) => {
      if (i === index) {
        // Handle nested address fields
        if (field.startsWith('address.')) {
          const addressField = field.split('.')[1];
          return {
            ...agent,
            address: {
              ...agent.address,
              [addressField]: value,
            },
          };
        }
        return { ...agent, [field]: value };
      }
      return agent;
    });
    updateFormData('agents', updated);
  };

  const removeAgent = (index: number) => {
    const updated = agents.filter((_, i) => i !== index);
    updateFormData('agents', updated);
  };

  const primaryAgents = agents.filter(a => a.type === 'PRIMARY');
  const successorAgents = agents.filter(a => a.type === 'SUCCESSOR');
  const coAgents = agents.filter(a => a.type === 'CO_AGENT');

  const renderAgentForm = (agent: Agent, localIndex: number, globalIndex: number) => {
    return (
      <div key={globalIndex} className="bg-white p-4 sm:p-6 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="font-medium capitalize">
              {agent.type === 'PRIMARY' ? 'Primary Agent' : 
               agent.type === 'SUCCESSOR' ? `Successor Agent ${localIndex + 1}` :
               `Co-Agent ${localIndex + 1}`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => removeAgent(globalIndex)}
            className="text-red-600 hover:text-red-800 p-2"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name and Relationship */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                value={agent.fullName}
                onChange={(e) => updateAgent(globalIndex, 'fullName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Agent's full legal name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship to You
              </label>
              <input
                type="text"
                value={agent.relationship}
                onChange={(e) => updateAgent(globalIndex, 'relationship', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Spouse, Child, Friend"
              />
            </div>
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={agent.email}
                onChange={(e) => updateAgent(globalIndex, 'email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="agent@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={agent.phone}
                onChange={(e) => updateAgent(globalIndex, 'phone', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="(555) 123-4567"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              type="text"
              value={agent.address.street}
              onChange={(e) => updateAgent(globalIndex, 'address.street', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Main Street"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                type="text"
                value={agent.address.city}
                onChange={(e) => updateAgent(globalIndex, 'address.city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="City"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State *
              </label>
              <select
                value={agent.address.state}
                onChange={(e) => updateAgent(globalIndex, 'address.state', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state.state} value={state.state}>
                    {state.stateName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code *
              </label>
              <input
                type="text"
                value={agent.address.zipCode}
                onChange={(e) => updateAgent(globalIndex, 'address.zipCode', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="12345"
                pattern="[0-9]{5}"
                maxLength={5}
                required
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Primary Agent Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900">Primary Agent</h4>
            <p className="text-sm text-gray-600 mt-1">
              This person will have the authority to act on your behalf
            </p>
          </div>
          {primaryAgents.length === 0 && (
            <button
              type="button"
              onClick={() => addAgent('PRIMARY')}
              className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Primary Agent
            </button>
          )}
        </div>

        {primaryAgents.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 mb-4">No primary agent added yet</p>
            <button
              type="button"
              onClick={() => addAgent('PRIMARY')}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Primary Agent
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {primaryAgents.map((agent, localIdx) => {
              const globalIdx = agents.findIndex(a => a === agent);
              return renderAgentForm(agent, localIdx, globalIdx);
            })}
          </div>
        )}
      </div>

      {/* Successor Agents Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900">Successor Agents</h4>
            <p className="text-sm text-gray-600 mt-1">
              Optional: These agents will step in if your primary agent cannot serve
            </p>
          </div>
          <button
            type="button"
            onClick={() => addAgent('SUCCESSOR')}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Successor
          </button>
        </div>

        {successorAgents.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500">No successor agents added (optional)</p>
          </div>
        ) : (
          <div className="space-y-4">
            {successorAgents.map((agent, localIdx) => {
              const globalIdx = agents.findIndex(a => a === agent);
              return renderAgentForm(agent, localIdx, globalIdx);
            })}
          </div>
        )}
      </div>

      {/* Co-Agents Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="text-lg font-medium text-gray-900">Co-Agents</h4>
            <p className="text-sm text-gray-600 mt-1">
              Optional: These agents serve alongside your primary agent
            </p>
          </div>
          <button
            type="button"
            onClick={() => addAgent('CO_AGENT')}
            className="flex items-center px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Co-Agent
          </button>
        </div>

        {coAgents.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500">No co-agents added (optional)</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coAgents.map((agent, localIdx) => {
              const globalIdx = agents.findIndex(a => a === agent);
              return renderAgentForm(agent, localIdx, globalIdx);
            })}
          </div>
        )}
      </div>

      {/* Co-Agent Settings */}
      {coAgents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <h5 className="font-medium text-blue-900 mb-2">Co-Agent Decision Making</h5>
              <div className="space-y-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.coAgentsMustActJointly || false}
                    onChange={(e) => updateFormData('coAgentsMustActJointly', e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-blue-900">
                    Require all co-agents to act jointly (they must agree on all decisions together)
                  </span>
                </label>
                <p className="text-xs text-blue-700 ml-7">
                  If unchecked, co-agents can act independently
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Warning if no primary agent */}
      {primaryAgents.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm text-yellow-800">
                <strong>Required:</strong> You must add at least one primary agent to continue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
