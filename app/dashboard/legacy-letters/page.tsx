// app/dashboard/legacy-letters/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  Plus,
  Mail,
  Video,
  Mic,
  FileText,
  Calendar,
  Users,
  Edit,
  Trash2,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
} from 'lucide-react';

interface LegacyLetter {
  id: string;
  title: string;
  letterType: string;
  contentType: string;
  deliveryTiming: string;
  deliveryDate: string | null;
  deliveryStatus: string;
  recipientCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function LegacyLettersPage() {
  const [letters, setLetters] = useState<LegacyLetter[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'written' | 'video' | 'audio' | 'document'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'scheduled' | 'delivered'>('all');

  useEffect(() => {
    loadLetters();
  }, []);

  const loadLetters = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/legacy-letters');
      const data = await response.json();
      if (data.success) {
        setLetters(data.letters);
      }
    } catch (error) {
      console.error('Error loading letters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this letter? This action cannot be undone.')) return;

    try {
      const response = await fetch(`/api/legacy-letters/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setLetters(prev => prev.filter(l => l.id !== id));
      }
    } catch (error) {
      console.error('Error deleting letter:', error);
    }
  };

  const getContentIcon = (contentType: string) => {
    switch (contentType) {
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Mic className="h-5 w-5" />;
      case 'document':
        return <FileText className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <CheckCircle className="h-3 w-3" />
            Delivered
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            <Clock className="h-3 w-3" />
            Scheduled
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">
            <XCircle className="h-3 w-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  const getDeliveryText = (letter: LegacyLetter) => {
    switch (letter.deliveryTiming) {
      case 'on_death':
        return 'Upon passing';
      case 'specific_date':
        return letter.deliveryDate ? new Date(letter.deliveryDate).toLocaleDateString() : 'Date not set';
      case 'recurring':
        return 'Recurring delivery';
      case 'milestone':
        return 'On milestone';
      case 'conditional':
        return 'When condition met';
      default:
        return 'Not scheduled';
    }
  };

  const filteredLetters = letters.filter(letter => {
    const typeMatch = filterType === 'all' || letter.contentType === filterType;
    const statusMatch = filterStatus === 'all' || letter.deliveryStatus === filterStatus;
    return typeMatch && statusMatch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Legacy Letters</h1>
            <p className="text-gray-600 mt-1">Messages for life's important moments</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Plus className="h-5 w-5" />
            Create Letter
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Letters</p>
                <p className="text-2xl font-bold text-gray-900">{letters.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">
                  {letters.filter(l => l.deliveryStatus === 'delivered').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {letters.filter(l => l.deliveryStatus === 'scheduled').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Recipients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {letters.reduce((sum, l) => sum + l.recipientCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Types</option>
                <option value="written">Written</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="document">Document</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className="ml-auto flex items-end gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Letters */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading letters...</p>
          </div>
        ) : filteredLetters.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No letters yet</h3>
            <p className="text-gray-600 mb-4">Create your first legacy letter to preserve your stories and messages</p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="h-4 w-4" />
              Create Your First Letter
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLetters.map((letter) => (
              <div key={letter.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {getContentIcon(letter.contentType)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{letter.title}</h3>
                      <p className="text-xs text-gray-500 capitalize">{letter.letterType.replace('_', ' ')}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(letter.id)}
                      className="p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Delivery:</span>
                    <span className="text-gray-900">{getDeliveryText(letter)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Recipients:</span>
                    <span className="text-gray-900">{letter.recipientCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    {getStatusBadge(letter.deliveryStatus)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Delivery</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recipients</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLetters.map((letter) => (
                  <tr key={letter.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getContentIcon(letter.contentType)}
                        <div>
                          <p className="font-medium text-gray-900">{letter.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{letter.letterType.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 capitalize">{letter.contentType}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{getDeliveryText(letter)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{letter.recipientCount}</td>
                    <td className="px-6 py-4">{getStatusBadge(letter.deliveryStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(letter.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
