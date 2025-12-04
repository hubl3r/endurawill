'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { Home, Users, FileText, Calendar, Crown, UserPlus, Edit2, CheckCircle, AlertCircle, X } from 'lucide-react';

interface EstateData {
  tenant: {
    id: string;
    name: string | null;
    type: string;
    maxOwners: number;
    ownerCount: number;
    createdAt: string;
  };
  owners: {
    id: string;
    fullName: string;
    email: string;
    isPrimary: boolean;
    role: string;
  }[];
  stats: {
    delegates: number;
    documents: number;
    assets: number;
    beneficiaries: number;
  };
}

export default function EstateOverviewPage() {
  const { user } = useUser();
  const [estateData, setEstateData] = useState<EstateData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  
  const [editForm, setEditForm] = useState({
    name: '',
    type: 'individual'
  });

  useEffect(() => {
    loadEstateData();
  }, []);

  const loadEstateData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile');
      if (response.ok) {
        const data = await response.json();
        
        // Build estate data from profile response
        const estate = {
          tenant: data.tenant || {
            id: '',
            name: null,
            type: 'individual',
            maxOwners: 1,
            ownerCount: 1,
            createdAt: new Date().toISOString()
          },
          owners: data.user ? [data.user] : [],
          stats: {
            delegates: 0,
            documents: 0,
            assets: 0,
            beneficiaries: 0
          }
        };
        
        setEstateData(estate);
        setEditForm({
          name: estate.tenant.name || '',
          type: estate.tenant.type
        });
      }
    } catch (error) {
      console.error('Error loading estate data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEstate = () => {
    if (estateData) {
      setEditForm({
        name: estateData.tenant.name || '',
        type: estateData.tenant.type
      });
      setShowEditModal(true);
    }
  };

  const handleSaveEstate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    console.log('Sending to API:', editForm); // Debug log

    try {
      const response = await fetch('/api/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });

      const result = await response.json();
      console.log('API response:', result); // Debug log

      if (response.ok) {
        setMessage({ type: 'success', text: 'Estate updated successfully' });
        setShowEditModal(false);
        await loadEstateData(); // Wait for reload
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update estate' });
      }
    } catch (error) {
      console.error('Error updating estate:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Unknown';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      return new Intl.DateTimeFormat('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(date);
    } catch {
      return 'Unknown';
    }
  };

  const getEstateTypeBadge = (type: string) => {
    if (type === 'joint') {
      return <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium">Joint Estate</span>;
    }
    return <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">Individual Estate</span>;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading estate information...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!estateData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <p className="text-gray-600">Unable to load estate information</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const estateName = estateData.tenant.name || `Estate of ${estateData.owners[0]?.fullName || 'Unknown'}`;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
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

        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{estateName}</h1>
            </div>
            <button 
              onClick={handleEditEstate}
              className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              Edit Estate
            </button>
          </div>
          <div className="flex items-center gap-3">
            {getEstateTypeBadge(estateData.tenant.type)}
            <span className="text-gray-600">
              Created {formatDate(estateData.tenant.createdAt)}
            </span>
          </div>
        </div>

        {/* Estate Owners */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Crown className="h-6 w-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">Estate Owners</h2>
            </div>
            <div className="flex items-center gap-2">
              {(estateData.tenant.type === 'individual' || 
                (estateData.tenant.type === 'joint' && estateData.tenant.ownerCount < estateData.tenant.maxOwners)) && (
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <UserPlus className="h-4 w-4" />
                  {estateData.tenant.type === 'individual' ? 'Add Co-Owner' : 'Invite Co-Owner'}
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {estateData.owners.map((owner) => (
              <div key={owner.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{owner.fullName}</h3>
                    {owner.isPrimary && (
                      <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-medium">
                        Primary Owner
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{owner.email}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {owner.role === 'primary_owner' ? 'Primary Owner' : 'Co-Owner'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Estate Statistics */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{estateData.stats.delegates}</p>
                <p className="text-gray-600">Delegates</p>
              </div>
            </div>
            <a href="/dashboard/profile/delegates" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Delegates →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{estateData.stats.documents}</p>
                <p className="text-gray-600">Documents</p>
              </div>
            </div>
            <a href="/dashboard/documents" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              View Documents →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{estateData.stats.assets}</p>
                <p className="text-gray-600">Assets</p>
              </div>
            </div>
            <a href="/dashboard/assets" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Assets →
            </a>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-100 rounded-lg">
                <Users className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{estateData.stats.beneficiaries}</p>
                <p className="text-gray-600">Beneficiaries</p>
              </div>
            </div>
            <a href="/dashboard/beneficiaries" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
              Manage Beneficiaries →
            </a>
          </div>
        </div>

        {/* Estate Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Estate Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Estate ID</span>
              <span className="font-mono text-sm text-gray-900">{estateData.tenant.id.substring(0, 8)}...</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Estate Type</span>
              <span className="font-medium text-gray-900">
                {estateData.tenant.type === 'joint' ? 'Joint Estate' : 'Individual Estate'}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-200">
              <span className="text-gray-600">Maximum Owners</span>
              <span className="font-medium text-gray-900">{estateData.tenant.maxOwners}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Current Owners</span>
              <span className="font-medium text-gray-900">{estateData.tenant.ownerCount}</span>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>About Your Estate:</strong> Your estate encompasses all your documents, assets, 
            beneficiaries, and delegates. You have complete control over who can access what and when.
          </p>
        </div>
      </div>

      {/* Edit Estate Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Edit Estate</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSaveEstate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estate Name
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Estate of John Doe"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Leave blank to use "Estate of [Your Name]"
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Estate Type
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="individual"
                        checked={editForm.type === 'individual'}
                        onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Individual Estate</p>
                        <p className="text-sm text-gray-600">
                          One owner manages the estate (you)
                        </p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        value="joint"
                        checked={editForm.type === 'joint'}
                        onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value }))}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">Joint Estate</p>
                        <p className="text-sm text-gray-600">
                          Up to two owners can manage together (e.g., spouses)
                        </p>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
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
