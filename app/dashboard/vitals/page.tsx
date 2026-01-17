// app/dashboard/vitals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import CreateChildModal from '@/components/CreateChildModal';
import {
  User,
  Heart,
  Phone,
  Users,
  Baby,
  Dog,
  Plus,
  Edit,
  Trash2,
  Mail,
  MapPin,
  Calendar,
  Shield,
  Stethoscope,
  GraduationCap,
} from 'lucide-react';

interface Child {
  id: string;
  fullName: string;
  dob: string;
  ssn: string;
  relationship: string;
  isMinor: boolean;
  guardianPreference: string;
  schoolName: string;
  grade: string;
  schoolPhone: string;
  primaryPhysician: string;
  physicianPhone: string;
  allergies: string;
  medications: string;
  notes: string;
}

interface Pet {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string;
  specialNeeds: string;
  vetName: string;
  vetPhone: string;
  caretakerPreference: string;
  notes: string;
}

interface FamilyMember {
  id: string;
  fullName: string;
  relationship: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
}

interface EmergencyContact {
  id: string;
  contactName: string;
  relationship: string;
  phone: string;
  email: string;
}

export default function VitalsPage() {
  const [children, setChildren] = useState<Child[]>([]);
  const [pets, setPets] = useState<Pet[]>([]);
  const [family, setFamily] = useState<FamilyMember[]>([]);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>([]);
  const [activeTab, setActiveTab] = useState<'children' | 'pets' | 'family' | 'emergency'>('children');
  const [showChildModal, setShowChildModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);

  // Placeholder delete handlers
  const handleDeleteChild = (id: string) => {
    if (confirm('Delete this child?')) {
      setChildren(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDeletePet = (id: string) => {
    if (confirm('Delete this pet?')) {
      setPets(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleDeleteFamily = (id: string) => {
    if (confirm('Delete this family member?')) {
      setFamily(prev => prev.filter(f => f.id !== id));
    }
  };

  const handleDeleteEmergency = (id: string) => {
    if (confirm('Delete this emergency contact?')) {
      setEmergencyContacts(prev => prev.filter(e => e.id !== id));
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personal Vitals</h1>
            <p className="text-gray-600 mt-1">Manage your personal and family information</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'children', label: 'Children', icon: Baby, count: children.length },
              { id: 'pets', label: 'Pets', icon: Dog, count: pets.length },
              { id: 'family', label: 'Family', icon: Users, count: family.length },
              { id: 'emergency', label: 'Emergency Contacts', icon: Phone, count: emergencyContacts.length },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="ml-1 bg-gray-200 text-gray-700 rounded-full px-2 py-0.5 text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Children */}
        {activeTab === 'children' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Children & Dependents</h2>
              <button
                onClick={() => setShowChildModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Child
              </button>
            </div>

            {children.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Baby className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No children added yet</h3>
                <p className="text-gray-600 mb-4">Add your children or dependents to track important information</p>
                <button
                  onClick={() => setShowChildModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Add Your First Child
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child) => (
                  <div key={child.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Baby className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{child.fullName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{child.relationship}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingChild(child);
                            setShowChildModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(child.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Born: {new Date(child.dob).toLocaleDateString()}</span>
                      </div>
                      {child.isMinor && (
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Minor</span>
                        </div>
                      )}
                      {child.schoolName && (
                        <div className="flex items-center gap-2 text-sm">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{child.schoolName} - Grade {child.grade}</span>
                        </div>
                      )}
                      {child.primaryPhysician && (
                        <div className="flex items-center gap-2 text-sm">
                          <Stethoscope className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">Dr. {child.primaryPhysician}</span>
                        </div>
                      )}
                      {child.guardianPreference && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Guardian Preference:</p>
                          <p className="text-sm font-medium text-gray-900">{child.guardianPreference}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pets */}
        {activeTab === 'pets' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Pets & Animal Companions</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Pet
              </button>
            </div>

            {pets.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Dog className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No pets added yet</h3>
                <p className="text-gray-600 mb-4">Add your pets to track their care information</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Add Your First Pet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Dog className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{pet.name}</h3>
                          <p className="text-sm text-gray-500 capitalize">{pet.type}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePet(pet.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-gray-600">Breed:</span>
                        <span className="ml-2 text-gray-900">{pet.breed || 'N/A'}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-600">Age:</span>
                        <span className="ml-2 text-gray-900">{pet.age || 'N/A'}</span>
                      </div>
                      {pet.vetName && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Veterinarian:</p>
                          <p className="text-sm font-medium text-gray-900">{pet.vetName}</p>
                          {pet.vetPhone && <p className="text-xs text-gray-600">{pet.vetPhone}</p>}
                        </div>
                      )}
                      {pet.caretakerPreference && (
                        <div className="pt-3 border-t border-gray-200">
                          <p className="text-xs text-gray-500">Caretaker Preference:</p>
                          <p className="text-sm font-medium text-gray-900">{pet.caretakerPreference}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Family */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Family Members</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Family Member
              </button>
            </div>

            {family.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No family members added yet</h3>
                <p className="text-gray-600 mb-4">Add family members to keep track of important contacts</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Add Your First Family Member
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {family.map((member) => (
                  <div key={member.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <User className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{member.fullName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{member.relationship.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteFamily(member.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {member.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{member.phone}</span>
                        </div>
                      )}
                      {member.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{member.email}</span>
                        </div>
                      )}
                      {member.address && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                          <span className="text-gray-600">{member.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Emergency Contacts */}
        {activeTab === 'emergency' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                <Plus className="h-4 w-4" />
                Add Emergency Contact
              </button>
            </div>

            {emergencyContacts.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <Phone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No emergency contacts added yet</h3>
                <p className="text-gray-600 mb-4">Add emergency contacts for urgent situations</p>
                <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="h-4 w-4" />
                  Add Your First Emergency Contact
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {emergencyContacts.map((contact) => (
                  <div key={contact.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <Phone className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{contact.contactName}</h3>
                          <p className="text-sm text-gray-500 capitalize">{contact.relationship}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button className="p-1 text-gray-400 hover:text-blue-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteEmergency(contact.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{contact.phone}</span>
                      </div>
                      {contact.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{contact.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <CreateChildModal
        isOpen={showChildModal}
        onClose={() => {
          setShowChildModal(false);
          setEditingChild(null);
        }}
        onSuccess={(childData) => {
          if (editingChild) {
            // Update existing child
            setChildren(prev => prev.map(c => c.id === editingChild.id ? { ...childData, id: editingChild.id } : c));
          } else {
            // Add new child with temporary ID
            setChildren(prev => [...prev, { ...childData, id: `temp-${Date.now()}` }]);
          }
          setShowChildModal(false);
          setEditingChild(null);
        }}
        child={editingChild}
      />
    </DashboardLayout>
  );
}
