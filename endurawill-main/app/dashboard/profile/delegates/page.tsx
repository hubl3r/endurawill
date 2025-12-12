'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { Users, Plus, Mail, Phone, Trash2, Edit2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface Delegate {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  relationship: string;
  status: string;
  hasAccount: boolean;
  invitedAt: string;
  acceptedAt: string | null;
  expiresAt: string | null;
  canAccessWhen: string;
  userId: string | null;
  userRole?: string; // Role from linked User record
}

export default function DelegatesPage() {
  const { user } = useUser();
  const [delegates, setDelegates] = useState<Delegate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const [inviteForm, setInviteForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    relationship: 'other',
    canAccessWhen: 'after_death'
  });

  useEffect(() => {
    loadDelegates();
  }, []);

  const loadDelegates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/delegates');
      if (response.ok) {
        const data = await response.json();
        setDelegates(data.delegates || []);
      }
    } catch (error) {
      console.error('Error loading delegates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsInviting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/delegates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(inviteForm),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Delegate invited successfully!' });
        setShowInviteModal(false);
        setInviteForm({
          fullName: '',
          email: '',
          phone: '',
          relationship: 'other',
          canAccessWhen: 'after_death'
        });
        loadDelegates();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to invite delegate' });
      }
    } catch (error) {
      console.error('Error inviting delegate:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevoke = async (delegateId: string, delegateName: string) => {
    if (!confirm(`Are you sure you want to revoke access for ${delegateName}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/delegates/${delegateId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Delegate access revoked' });
        loadDelegates();
      } else {
        setMessage({ type: 'error', text: 'Failed to revoke access' });
      }
    } catch (error) {
      console.error('Error revoking delegate:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const handlePromote = async (delegateId: string, delegateName: string) => {
    if (!confirm(`Promote ${delegateName} to co-owner? They will have full access to manage the estate.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/delegates/${delegateId}/promote`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `${delegateName} promoted to co-owner` });
        loadDelegates();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to promote delegate' });
      }
    } catch (error) {
      console.error('Error promoting delegate:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const handleDemote = async (delegateId: string, delegateName: string) => {
    if (!confirm(`Demote ${delegateName} to delegate? They will lose co-owner privileges.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/delegates/${delegateId}/demote`, {
        method: 'PATCH',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: `${delegateName} demoted to delegate` });
        loadDelegates();
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'Failed to demote co-owner' });
      }
    } catch (error) {
      console.error('Error demoting co-owner:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      invited: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      revoked: 'bg-red-100 text-red-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status as keyof typeof styles] || styles.pending}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRelationshipLabel = (relationship: string) => {
    const labels: Record<string, string> = {
      spouse: 'Spouse',
      child: 'Child',
      attorney: 'Attorney',
      friend: 'Friend',
      executor: 'Executor',
      other: 'Other'
    };
    return labels[relationship] || relationship;
  };

  const getAccessWhenLabel = (accessWhen: string) => {
    const labels: Record<string, string> = {
      immediately: 'Immediate Access',
      after_death: 'After Death',
      emergency_only: 'Emergency Only',
      custom: 'Custom Condition'
    };
    return labels[accessWhen] || accessWhen;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(dateString));
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Delegates</h1>
            <p className="text-gray-600">
              Manage who has access to your estate information and when they can access it.
            </p>
          </div>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            <Plus className="h-5 w-5" />
            Invite Delegate
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 border rounded-lg p-4 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <p className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Delegates List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm">Loading delegates...</p>
            </div>
          ) : delegates.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No delegates yet</h3>
              <p className="text-gray-600 mb-4">
                Invite trusted individuals to access your estate information.
              </p>
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                <Plus className="h-5 w-5" />
                Invite Your First Delegate
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {delegates.map((delegate) => (
                <div key={delegate.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{delegate.fullName}</h3>
                        {getStatusBadge(delegate.status)}
                        {delegate.userRole === 'co_owner' && (
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                            Co-Owner
                          </span>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span>{delegate.email}</span>
                        </div>
                        {delegate.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            <span>{delegate.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Relationship:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {getRelationshipLabel(delegate.relationship)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Access:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {getAccessWhenLabel(delegate.canAccessWhen)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Invited:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {formatDate(delegate.invitedAt)}
                          </span>
                        </div>
                        {delegate.acceptedAt && (
                          <div>
                            <span className="text-gray-500">Accepted:</span>
                            <span className="ml-2 font-medium text-gray-900">
                              {formatDate(delegate.acceptedAt)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {delegate.hasAccount && delegate.status === 'active' && (
                        <>
                          {delegate.userRole === 'delegate' ? (
                            <button
                              onClick={() => handlePromote(delegate.id, delegate.fullName)}
                              className="text-green-600 hover:text-green-700 px-3 py-2 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
                              title="Promote to co-owner"
                            >
                              Promote
                            </button>
                          ) : delegate.userRole === 'co_owner' ? (
                            <button
                              onClick={() => handleDemote(delegate.id, delegate.fullName)}
                              className="text-orange-600 hover:text-orange-700 px-3 py-2 hover:bg-orange-50 rounded-lg transition-colors text-sm font-medium"
                              title="Demote to delegate"
                            >
                              Demote
                            </button>
                          ) : null}
                        </>
                      )}
                      <button
                        onClick={() => handleRevoke(delegate.id, delegate.fullName)}
                        disabled={delegate.status === 'revoked'}
                        className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Revoke access"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>About Delegates:</strong> Delegates are trusted individuals who can view and manage 
            parts of your estate. You control exactly what they can access and when. They'll receive an 
            email invitation to create their account.
          </p>
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Invite Delegate</h2>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleInviteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={inviteForm.fullName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, fullName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jane Smith"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="jane@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={inviteForm.phone}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteForm.relationship}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, relationship: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="spouse">Spouse</option>
                    <option value="child">Child</option>
                    <option value="attorney">Attorney</option>
                    <option value="friend">Friend</option>
                    <option value="executor">Executor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When can they access? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={inviteForm.canAccessWhen}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, canAccessWhen: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="immediately">Immediately</option>
                    <option value="after_death">After My Death</option>
                    <option value="emergency_only">Emergency Only</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    This determines when they can view your estate information
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isInviting}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isInviting ? 'Inviting...' : 'Send Invitation'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
