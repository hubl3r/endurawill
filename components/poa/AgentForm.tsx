// components/poa/AgentForm.tsx
'use client';

import { Plus, Trash2, User } from 'lucide-react';

interface Agent {
  type: 'primary' | 'successor' | 'co-agent';
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface AgentFormProps {
  agents: Agent[];
  onChange: (agents: Agent[]) => void;
  states: Array<{ state: string; stateName: string }>;
}

export function AgentForm({ agents, onChange, states }: AgentFormProps) {
  const addAgent = (type: Agent['type']) => {
    const newAgent: Agent = {
      type,
      fullName: '',
      email: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    };
    onChange([...agents, newAgent]);
  };

  const updateAgent = (index: number, field: keyof Agent, value: string) => {
    const updated = agents.map((agent, i) => 
      i === index ? { ...agent, [field]: value } : agent
    );
    onChange(updated);
  };

  const removeAgent = (index: number) => {
    onChange(agents.filter((_, i) => i !== index));
  };

  const primaryAgents = agents.filter(a => a.type === 'primary');
  const successorAgents = agents.filter(a => a.type === 'successor');
  const coAgents = agents.filter(a => a.type === 'co-agent');

  const renderAgentForm = (agent: Agent, localIndex: number, agentType: string) => {
    const globalIndex = agents.findIndex((a, i) => 
      a.type === agent.type && 
      a.fullName === agent.fullName && 
      a.email === agent.email &&
      agents.filter(ag => ag.type === agent.type).indexOf(agent) === localIndex
    );
    
    return (
      <div key={`${agentType}-${localIndex}`} className="bg-white p-4 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-gray-500" />
            <span className="font-medium capitalize">{agent.type} Agent</span>
          </div>
          <button
            type="button"
            onClick={() => removeAgent(globalIndex)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              value={agent.fullName}
              onChange={(e) => updateAgent(globalIndex, 'fullName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Agent's full legal name"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={agent.email}
              onChange={(e) => updateAgent(globalIndex, 'email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="agent@email.com"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
            <input
              type="text"
              value={agent.address}
              onChange={(e) => updateAgent(globalIndex, 'address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="123 Main Street"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={agent.city}
              onChange={(e) => updateAgent(globalIndex, 'city', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="City"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <select
              value={agent.state}
              onChange={(e) => updateAgent(globalIndex, 'state', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select State</option>
              {states.map((state) => (
                <option key={state.state} value={state.state}>{state.stateName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
            <input
              type="text"
              value={agent.zipCode}
              onChange={(e) => updateAgent(globalIndex, 'zipCode', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="12345"
            />
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
          <h4 className="text-lg font-medium text-gray-900">Primary Agent</h4>
          {primaryAgents.length === 0 && (
            <button
              type="button"
              onClick={() => addAgent('primary')}
              className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Primary
            </button>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">Your primary agent will have the authority to act on your behalf.</p>
        
        {primaryAgents.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500">No primary agent added yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {primaryAgents.map((agent, index) => renderAgentForm(agent, index, 'primary'))}
          </div>
        )}
      </div>

      {/* Successor Agents Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Successor Agents</h4>
          <button
            type="button"
            onClick={() => addAgent('successor')}
            className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Successor
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Successor agents will step in if your primary agent cannot serve.</p>
        
        {successorAgents.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500">No successor agents added (optional)</p>
          </div>
        ) : (
          <div className="space-y-4">
            {successorAgents.map((agent, index) => renderAgentForm(agent, index, 'successor'))}
          </div>
        )}
      </div>

      {/* Co-Agents Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">Co-Agents</h4>
          <button
            type="button"
            onClick={() => addAgent('co-agent')}
            className="flex items-center px-3 py-1 text-sm text-blue-600 border border-blue-300 rounded-md hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Co-Agent
          </button>
        </div>
        <p className="text-sm text-gray-600 mb-4">Co-agents serve alongside your primary agent.</p>
        
        {coAgents.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <p className="text-gray-500">No co-agents added (optional)</p>
          </div>
        ) : (
          <div className="space-y-4">
            {coAgents.map((agent, index) => renderAgentForm(agent, index, 'co-agent'))}
          </div>
        )}
      </div>

      {agents.length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-sm text-yellow-800">
            <strong>Required:</strong> You must add at least one primary agent to continue.
          </p>
        </div>
      )}
    </div>
  );
}
