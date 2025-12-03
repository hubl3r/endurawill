'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { Home, Users, FileText, Calendar, Crown, UserPlus, Edit2 } from 'lucide-react';

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
        setEstateData({
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
            delegates: 0, // TODO: Load from API
            documents: 0,
            assets: 0,
            beneficiaries: 0
          }
        });
      }
    } catch (error) {
      console.error('Error loading estate data:', error);
    } finally {
      setIsLoading(false);
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
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Home className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{estateName}</h1>
            </div>
            <button className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium text-sm px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
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
              {estateData.tenant.type === 'individual' && (
                <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm px-3 py-2 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors">
                  <UserPlus className="h-4 w-4" />
                  Add Co-Owner
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
    </DashboardLayout>
  );
}
