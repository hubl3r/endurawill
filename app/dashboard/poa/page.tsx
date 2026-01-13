// app/dashboard/poa/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import {
  FileText,
  Plus,
  Download,
  Edit,
  Trash2,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Search,
  Share2,
  ExternalLink,
  History,
} from 'lucide-react';

interface POA {
  id: string;
  poaType: 'DURABLE' | 'SPRINGING' | 'LIMITED';
  principalName: string;
  state: string;
  status: 'DRAFT' | 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  generatedDocument: string | null;
  signedDocument: string | null;
  createdAt: string;
  updatedAt: string;
  versionNumber: number;
  parentPoaId: string | null;
  isLatestVersion: boolean;
  agents: {
    id: string;
    agentType: string;
    fullName: string;
    hasAccepted: boolean;
  }[];
  grantedPowers: {
    id: string;
    category: {
      categoryName: string;
    };
  }[];
  revisions?: POA[];
}

export default function POAPage() {
  const router = useRouter();
  const [poas, setPoas] = useState<POA[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'DRAFT' | 'ACTIVE' | 'REVOKED'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadingNotarized, setUploadingNotarized] = useState<string | null>(null);
  const [showRevisions, setShowRevisions] = useState<string | null>(null);

  useEffect(() => {
    loadPOAs();
  }, []);

  const loadPOAs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/poa/list');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setPoas(data.poas);
        }
      }
    } catch (error) {
      console.error('Error loading POAs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (poaId: string) => {
    if (!confirm('Are you sure you want to delete this POA? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/poa/${poaId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPoas(poas.filter(p => p.id !== poaId));
      } else {
        alert('Failed to delete POA');
      }
    } catch (error) {
      console.error('Error deleting POA:', error);
      alert('Failed to delete POA');
    }
  };

  const handleUploadNotarized = async (poaId: string, file: File) => {
    try {
      setUploadingNotarized(poaId);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('poaId', poaId);
      
      const response = await fetch('/api/poa/upload-notarized', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPoas(poas.map(p => 
          p.id === poaId 
            ? { ...p, signedDocument: data.url, status: 'ACTIVE' as const }
            : p
        ));
        alert('Notarized document uploaded successfully!');
      } else {
        alert('Failed to upload document');
      }
    } catch (error) {
      console.error('Error uploading notarized document:', error);
      alert('Failed to upload document');
    } finally {
      setUploadingNotarized(null);
    }
  };

  const handleShare = async (poa: POA) => {
    const url = poa.signedDocument || poa.generatedDocument;
    if (!url) return;

    // Try native Web Share API first
    if (navigator.share) {
      try {
        // Fetch the file
        const response = await fetch(url);
        const blob = await response.blob();
        const file = new File([blob], `${poa.principalName}-POA-v${poa.versionNumber}.pdf`, { type: 'application/pdf' });

        await navigator.share({
          title: `Power of Attorney - ${poa.principalName}`,
          text: `${poa.poaType} POA (Version ${poa.versionNumber})`,
          files: [file],
        });
      } catch (error) {
        console.error('Share failed:', error);
        // Fallback to download
        handleDownload(poa);
      }
    } else {
      // Fallback: trigger download with suggested filename
      handleDownload(poa);
    }
  };

  const handleDownload = (poa: POA) => {
    const url = poa.signedDocument || poa.generatedDocument;
    if (!url) return;

    const link = document.createElement('a');
    link.href = url;
    link.download = `${poa.principalName.replace(/\s+/g, '_')}-POA-v${poa.versionNumber}.pdf`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewNotarized = (url: string) => {
    window.open(url, '_blank');
  };

  const handleEdit = async (poa: POA) => {
    if (!confirm(`This will create a new revision (v${poa.versionNumber + 1}) of this POA. The current version will be preserved. Continue?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/poa/${poa.id}/create-revision`, {
        method: 'POST',
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to wizard with pre-filled data
        router.push(`/poa/edit/${data.newPoaId}`);
      } else {
        alert('Failed to create revision');
      }
    } catch (error) {
      console.error('Error creating revision:', error);
      alert('Failed to create revision');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Draft' },
      ACTIVE: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Active' },
      REVOKED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Revoked' },
      EXPIRED: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Expired' },
    };
    
    const badge = badges[status as keyof typeof badges] || badges.DRAFT;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {badge.label}
      </span>
    );
  };

  const filteredPOAs = poas.filter(poa => {
    const matchesFilter = filter === 'all' || poa.status === filter;
    const matchesSearch = searchQuery === '' || 
      poa.principalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      poa.agents.some(a => a.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your Powers of Attorney...</p>
          </div>
        </div>
      );
    }

    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Power of Attorney</h1>
              <p className="text-gray-600 mt-1">Manage your financial and healthcare powers of attorney</p>
            </div>
            <button
              onClick={() => router.push('/poa/create/financial')}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              <Plus className="h-5 w-5 mr-2" />
              Create New POA
            </button>
          </div>

          {/* Filters and Search */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by principal or agent name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({poas.length})
              </button>
              <button
                onClick={() => setFilter('DRAFT')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'DRAFT'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Drafts ({poas.filter(p => p.status === 'DRAFT').length})
              </button>
              <button
                onClick={() => setFilter('ACTIVE')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  filter === 'ACTIVE'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Active ({poas.filter(p => p.status === 'ACTIVE').length})
              </button>
            </div>
          </div>
        </div>

        {/* POA List */}
        {filteredPOAs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Powers of Attorney</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filter !== 'all'
                ? 'No POAs match your search criteria'
                : 'Get started by creating your first Power of Attorney'}
            </p>
            {!searchQuery && filter === 'all' && (
              <button
                onClick={() => router.push('/poa/create/financial')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your First POA
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredPOAs.map((poa) => {
              const primaryAgent = poa.agents.find(a => a.agentType === 'PRIMARY');
              
              return (
                <div
                  key={poa.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {poa.poaType} Financial POA
                        </h3>
                        {getStatusBadge(poa.status)}
                        {poa.versionNumber > 1 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            v{poa.versionNumber}
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-gray-600">Principal:</span>
                          <span className="ml-2 font-medium text-gray-900">{poa.principalName}</span>
                        </div>
                        {primaryAgent && (
                          <div>
                            <span className="text-gray-600">Primary Agent:</span>
                            <span className="ml-2 font-medium text-gray-900">{primaryAgent.fullName}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">State:</span>
                          <span className="ml-2 font-medium text-gray-900">{poa.state}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {new Date(poa.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{poa.grantedPowers.length} powers granted</span>
                        <span>•</span>
                        <span>{poa.agents.length} agent(s)</span>
                        {poa.signedDocument && (
                          <>
                            <span>•</span>
                            <span className="text-green-600 font-medium">Notarized copy attached</span>
                          </>
                        )}
                        {poa.parentPoaId && (
                          <>
                            <span>•</span>
                            <span className="text-purple-600 font-medium">Revision of previous POA</span>
                          </>
                        )}
                      </div>

                      {/* Revision history */}
                      {poa.revisions && poa.revisions.length > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => setShowRevisions(showRevisions === poa.id ? null : poa.id)}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <History className="h-4 w-4" />
                            {poa.revisions.length} revision(s)
                            {showRevisions === poa.id ? ' (hide)' : ' (show)'}
                          </button>
                          
                          {showRevisions === poa.id && (
                            <div className="mt-2 ml-4 space-y-2">
                              {poa.revisions.map((revision) => (
                                <div key={revision.id} className="text-xs text-gray-600 flex items-center gap-2">
                                  <span className="font-medium">v{revision.versionNumber}</span>
                                  <span>•</span>
                                  <span>{new Date(revision.createdAt).toLocaleDateString()}</span>
                                  <span>•</span>
                                  {getStatusBadge(revision.status)}
                                  {revision.generatedDocument && (
                                    <button
                                      onClick={() => window.open(revision.generatedDocument!, '_blank')}
                                      className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                      View
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      {/* Share/Download */}
                      {poa.generatedDocument && (
                        <button
                          onClick={() => handleShare(poa)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Share or download POA"
                        >
                          <Share2 className="h-5 w-5" />
                        </button>
                      )}

                      {/* View Notarized Document */}
                      {poa.signedDocument && (
                        <button
                          onClick={() => handleViewNotarized(poa.signedDocument!)}
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg"
                          title="View notarized document"
                        >
                          <ExternalLink className="h-5 w-5" />
                        </button>
                      )}

                      {/* View Details */}
                      <button
                        onClick={() => router.push(`/poa/${poa.id}`)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                        title="View details"
                      >
                        <Eye className="h-5 w-5" />
                      </button>

                      {/* Edit (creates revision) */}
                      {poa.isLatestVersion && poa.status !== 'REVOKED' && (
                        <button
                          onClick={() => handleEdit(poa)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Create new revision"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                      )}

                      {/* Upload Notarized Copy */}
                      <label className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg cursor-pointer">
                        <Upload className="h-5 w-5" />
                        <input
                          type="file"
                          accept="application/pdf"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadNotarized(poa.id, file);
                            }
                          }}
                        />
                      </label>

                      {/* Delete (always available) */}
                      {poa.status === 'DRAFT' && (
                        <button
                          onClick={() => handleDelete(poa.id)}
                          className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                          title="Delete POA"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <SignedIn>
        <DashboardLayout 
          onChecklistClick={() => {}}
          selectedView="poa"
          onViewChange={() => {}}
        >
          {renderContent()}
        </DashboardLayout>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
