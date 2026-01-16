// app/dashboard/beneficiaries/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateBeneficiaryModal from '@/components/CreateBeneficiaryModal';
import { Plus, Search, Users, Heart, UserCheck, Edit, Trash2, Mail, Phone } from 'lucide-react';

interface Beneficiary {
  id: string;
  fullName: string;
  relationship: string;
  email: string | null;
  phone: string | null;
  isPrimary: boolean;
  isCharity: boolean;
  assetAllocations: any[];
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null);

  useEffect(() => {
    loadBeneficiaries();
  }, []);

  const loadBeneficiaries = async () => {
    try {
      const response = await fetch('/api/beneficiaries');
      const data = await response.json();
      if (data.success) setBeneficiaries(data.beneficiaries);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string, allocations: number) => {
    if (allocations > 0) {
      alert(`Cannot delete ${name}. Remove ${allocations} allocation(s) first.`);
      return;
    }
    if (!confirm(`Delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/beneficiaries/${id}`, { method: 'DELETE' });
      if (res.ok) await loadBeneficiaries();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (b: Beneficiary) => {
    setEditingBeneficiary(b);
    setShowCreateModal(true);
  };

  const handleModalClose = () => {
    setShowCreateModal(false);
    setEditingBeneficiary(null);
  };

  const filtered = beneficiaries.filter(b =>
    b.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Beneficiaries</h1>
            <p className="text-gray-600 mt-1">Manage who will inherit your estate</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5" />
            Add Beneficiary
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Beneficiaries</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{beneficiaries.length}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Primary</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{beneficiaries.filter(b => b.isPrimary).length}</p>
              </div>
              <UserCheck className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Charities</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{beneficiaries.filter(b => b.isCharity).length}</p>
              </div>
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search beneficiaries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No beneficiaries found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((b) => (
              <div key={b.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                <div className="flex justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{b.fullName}</h3>
                    <p className="text-sm text-gray-500 capitalize">{b.relationship.replace('_', ' ')}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(b)} className="p-1 text-gray-400 hover:text-blue-600">
                      <Edit className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(b.id, b.fullName, b.assetAllocations.length)} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {b.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{b.email}</span>
                    </div>
                  )}
                  {b.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4" />
                      <span>{b.phone}</span>
                    </div>
                  )}
                </div>
                <div className="pt-4 mt-4 border-t border-gray-200 flex items-center justify-between">
                  <div className="flex gap-2">
                    {b.isPrimary && <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Primary</span>}
                    {b.isCharity && <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded">Charity</span>}
                  </div>
                  <span className="text-sm text-gray-500">{b.assetAllocations.length} allocation{b.assetAllocations.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CreateBeneficiaryModal
        isOpen={showCreateModal}
        onClose={handleModalClose}
        onSuccess={loadBeneficiaries}
        editBeneficiary={editingBeneficiary}
      />
    </DashboardLayout>
  );
}
