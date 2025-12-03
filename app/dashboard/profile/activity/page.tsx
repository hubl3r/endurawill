'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { FileText, Shield, User, File, DollarSign, Heart, Settings, ChevronLeft, ChevronRight } from 'lucide-react';

interface AuditLog {
  id: string;
  action: string;
  category: string;
  actorName: string;
  resourceType: string | null;
  resourceId: string | null;
  result: string;
  timestamp: string;
  user: {
    fullName: string;
    email: string;
  } | null;
}

interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export default function AuditLogsPage() {
  const { user } = useUser();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    limit: 50,
    offset: 0,
    hasMore: false
  });

  const categories = [
    { value: 'all', label: 'All Activity', icon: FileText },
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'delegate', label: 'Delegates', icon: User },
    { value: 'document', label: 'Documents', icon: File },
    { value: 'asset', label: 'Assets', icon: DollarSign },
    { value: 'beneficiary', label: 'Beneficiaries', icon: Heart },
    { value: 'permission', label: 'Permissions', icon: Settings },
  ];

  useEffect(() => {
    loadLogs();
  }, [selectedCategory, pagination.offset]);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
      });
      
      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/audit-logs?${params}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleNextPage = () => {
    if (pagination.hasMore) {
      setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    }
  };

  const handlePrevPage = () => {
    if (pagination.offset > 0) {
      setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }));
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      profile_created: 'Profile Created',
      profile_updated: 'Profile Updated',
      delegate_invited: 'Delegate Invited',
      delegate_updated: 'Delegate Updated',
      delegate_revoked: 'Delegate Revoked',
      session_ended: 'Session Ended',
      login: 'Logged In',
      logout: 'Logged Out',
      document_created: 'Document Created',
      document_updated: 'Document Updated',
      document_viewed: 'Document Viewed',
      permission_granted: 'Permission Granted',
      permission_revoked: 'Permission Revoked',
    };
    return labels[action] || action.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  const getResultBadge = (result: string) => {
    if (result === 'success') {
      return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Success</span>;
    }
    if (result === 'failure') {
      return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">Failed</span>;
    }
    if (result === 'blocked') {
      return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">Blocked</span>;
    }
    return <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-medium">{result}</span>;
  };

  const getCategoryIcon = (category: string) => {
    const cat = categories.find(c => c.value === category);
    if (!cat) return <FileText className="h-4 w-4" />;
    const Icon = cat.icon;
    return <Icon className="h-4 w-4" />;
  };

  const currentPage = Math.floor(pagination.offset / pagination.limit) + 1;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Activity Log</h1>
          <p className="text-gray-600">
            View all actions taken on your account for security and compliance purposes.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.value;
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryChange(category.value)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Logs List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm">Loading activity...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No activity found</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'Start using the platform to see your activity here.'
                  : 'No activity in this category yet.'}
              </p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <div key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-gray-500 mt-1">
                        {getCategoryIcon(log.category)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium text-gray-900">
                            {getActionLabel(log.action)}
                          </h3>
                          {getResultBadge(log.result)}
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">{log.actorName}</span>
                            {log.user && log.user.email && ` (${log.user.email})`}
                          </p>
                          {log.resourceType && (
                            <p className="text-xs">
                              Resource: {log.resourceType}
                              {log.resourceId && ` • ID: ${log.resourceId.substring(0, 8)}...`}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="text-right text-sm text-gray-500 whitespace-nowrap">
                        {formatTimestamp(log.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} activities
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={pagination.offset === 0}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    
                    <span className="text-sm text-gray-700 px-3">
                      Page {currentPage} of {totalPages}
                    </span>
                    
                    <button
                      onClick={handleNextPage}
                      disabled={!pagination.hasMore}
                      className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>About Activity Logs:</strong> All actions on your account are logged for security 
            and compliance. Logs are retained for 7 years and can be exported upon request.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
