// app/dashboard/vitals/page.tsx
'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import {
  User,
  Heart,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  FileText,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Baby,
  Dog,
} from 'lucide-react';

interface VitalsData {
  personal: {
    fullName: string;
    dateOfBirth: string;
    ssn: string;
    driversLicense: string;
    bloodType: string;
    organDonor: boolean;
  };
  contact: {
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zip: string;
    };
  };
  medical: {
    primaryPhysician: string;
    physicianPhone: string;
    hospital: string;
    allergies: string;
    medications: string;
    conditions: string;
    insuranceCarrier: string;
    policyNumber: string;
  };
  emergency: {
    contactName: string;
    relationship: string;
    phone: string;
    email: string;
  }[];
  children: {
    id: string;
    fullName: string;
    dob: string;
    relationship: string;
    guardianPreference: string;
  }[];
  pets: {
    id: string;
    name: string;
    type: string;
    breed: string;
    age: number;
    vetInfo: string;
    caretakerPreference: string;
  }[];
}

export default function VitalsPage() {
  const [vitals, setVitals] = useState<VitalsData>({
    personal: {
      fullName: '',
      dateOfBirth: '',
      ssn: '',
      driversLicense: '',
      bloodType: '',
      organDonor: false,
    },
    contact: {
      email: '',
      phone: '',
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
      },
    },
    medical: {
      primaryPhysician: '',
      physicianPhone: '',
      hospital: '',
      allergies: '',
      medications: '',
      conditions: '',
      insuranceCarrier: '',
      policyNumber: '',
    },
    emergency: [],
    children: [],
    pets: [],
  });

  const [editMode, setEditMode] = useState(false);
  const [activeSection, setActiveSection] = useState<'personal' | 'contact' | 'medical' | 'emergency' | 'children' | 'pets'>('personal');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // TODO: Implement save to API
    await new Promise(resolve => setTimeout(resolve, 1000));
    setEditMode(false);
    setLoading(false);
  };

  const addEmergencyContact = () => {
    setVitals(prev => ({
      ...prev,
      emergency: [...prev.emergency, {
        contactName: '',
        relationship: '',
        phone: '',
        email: '',
      }],
    }));
  };

  const removeEmergencyContact = (index: number) => {
    setVitals(prev => ({
      ...prev,
      emergency: prev.emergency.filter((_, i) => i !== index),
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Personal Vitals</h1>
            <p className="text-gray-600 mt-1">Essential personal and medical information</p>
          </div>
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit className="h-5 w-5" />
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(false)}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
              >
                <X className="h-5 w-5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-5 w-5" />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        {/* Section Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'contact', label: 'Contact', icon: Phone },
              { id: 'medical', label: 'Medical', icon: Heart },
              { id: 'emergency', label: 'Emergency Contacts', icon: Users },
              { id: 'children', label: 'Children', icon: Baby },
              { id: 'pets', label: 'Pets', icon: Dog },
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSection(tab.id as any)}
                  className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <TabIcon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow p-6">
          {/* Personal Info */}
          {activeSection === 'personal' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Legal Name</label>
                  <input
                    type="text"
                    value={vitals.personal.fullName}
                    onChange={(e) => setVitals(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={vitals.personal.dateOfBirth}
                    onChange={(e) => setVitals(prev => ({ ...prev, personal: { ...prev.personal, dateOfBirth: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Social Security Number</label>
                  <input
                    type="text"
                    value={vitals.personal.ssn}
                    onChange={(e) => setVitals(prev => ({ ...prev, personal: { ...prev.personal, ssn: e.target.value } }))}
                    disabled={!editMode}
                    placeholder="###-##-####"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver's License</label>
                  <input
                    type="text"
                    value={vitals.personal.driversLicense}
                    onChange={(e) => setVitals(prev => ({ ...prev, personal: { ...prev.personal, driversLicense: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                  <select
                    value={vitals.personal.bloodType}
                    onChange={(e) => setVitals(prev => ({ ...prev, personal: { ...prev.personal, bloodType: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  >
                    <option value="">Select...</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="organDonor"
                    checked={vitals.personal.organDonor}
                    onChange={(e) => setVitals(prev => ({ ...prev, personal: { ...prev.personal, organDonor: e.target.checked } }))}
                    disabled={!editMode}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-600 disabled:opacity-50"
                  />
                  <label htmlFor="organDonor" className="ml-2 text-sm font-medium text-gray-700">
                    Registered Organ Donor
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Contact Info */}
          {activeSection === 'contact' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={vitals.contact.email}
                    onChange={(e) => setVitals(prev => ({ ...prev, contact: { ...prev.contact, email: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={vitals.contact.phone}
                    onChange={(e) => setVitals(prev => ({ ...prev, contact: { ...prev.contact, phone: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                  <input
                    type="text"
                    value={vitals.contact.address.street}
                    onChange={(e) => setVitals(prev => ({ ...prev, contact: { ...prev.contact, address: { ...prev.contact.address, street: e.target.value } } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    value={vitals.contact.address.city}
                    onChange={(e) => setVitals(prev => ({ ...prev, contact: { ...prev.contact, address: { ...prev.contact.address, city: e.target.value } } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    value={vitals.contact.address.state}
                    onChange={(e) => setVitals(prev => ({ ...prev, contact: { ...prev.contact, address: { ...prev.contact.address, state: e.target.value } } }))}
                    disabled={!editMode}
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                  <input
                    type="text"
                    value={vitals.contact.address.zip}
                    onChange={(e) => setVitals(prev => ({ ...prev, contact: { ...prev.contact, address: { ...prev.contact.address, zip: e.target.value } } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical Info */}
          {activeSection === 'medical' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Medical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Physician</label>
                  <input
                    type="text"
                    value={vitals.medical.primaryPhysician}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, primaryPhysician: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Physician Phone</label>
                  <input
                    type="tel"
                    value={vitals.medical.physicianPhone}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, physicianPhone: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Hospital</label>
                  <input
                    type="text"
                    value={vitals.medical.hospital}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, hospital: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Carrier</label>
                  <input
                    type="text"
                    value={vitals.medical.insuranceCarrier}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, insuranceCarrier: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                  <input
                    type="text"
                    value={vitals.medical.policyNumber}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, policyNumber: e.target.value } }))}
                    disabled={!editMode}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
                  <textarea
                    value={vitals.medical.allergies}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, allergies: e.target.value } }))}
                    disabled={!editMode}
                    rows={2}
                    placeholder="List all known allergies..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
                  <textarea
                    value={vitals.medical.medications}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, medications: e.target.value } }))}
                    disabled={!editMode}
                    rows={3}
                    placeholder="List all current medications and dosages..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Medical Conditions</label>
                  <textarea
                    value={vitals.medical.conditions}
                    onChange={(e) => setVitals(prev => ({ ...prev, medical: { ...prev.medical, conditions: e.target.value } }))}
                    disabled={!editMode}
                    rows={3}
                    placeholder="List any chronic conditions or important medical history..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Emergency Contacts */}
          {activeSection === 'emergency' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Emergency Contacts</h2>
                {editMode && (
                  <button
                    onClick={addEmergencyContact}
                    className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contact
                  </button>
                )}
              </div>

              {vitals.emergency.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No emergency contacts added</p>
                  {editMode && <p className="text-sm text-gray-500 mt-1">Click "Add Contact" to get started</p>}
                </div>
              ) : (
                <div className="space-y-4">
                  {vitals.emergency.map((contact, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-semibold text-gray-900">Contact #{index + 1}</h3>
                        {editMode && (
                          <button
                            onClick={() => removeEmergencyContact(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                          <input
                            type="text"
                            value={contact.contactName}
                            onChange={(e) => {
                              const newEmergency = [...vitals.emergency];
                              newEmergency[index].contactName = e.target.value;
                              setVitals(prev => ({ ...prev, emergency: newEmergency }));
                            }}
                            disabled={!editMode}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                          <input
                            type="text"
                            value={contact.relationship}
                            onChange={(e) => {
                              const newEmergency = [...vitals.emergency];
                              newEmergency[index].relationship = e.target.value;
                              setVitals(prev => ({ ...prev, emergency: newEmergency }));
                            }}
                            disabled={!editMode}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="tel"
                            value={contact.phone}
                            onChange={(e) => {
                              const newEmergency = [...vitals.emergency];
                              newEmergency[index].phone = e.target.value;
                              setVitals(prev => ({ ...prev, emergency: newEmergency }));
                            }}
                            disabled={!editMode}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={contact.email}
                            onChange={(e) => {
                              const newEmergency = [...vitals.emergency];
                              newEmergency[index].email = e.target.value;
                              setVitals(prev => ({ ...prev, emergency: newEmergency }));
                            }}
                            disabled={!editMode}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Children - Placeholder */}
          {activeSection === 'children' && (
            <div className="text-center py-12">
              <Baby className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Children management coming soon</p>
              <p className="text-sm text-gray-500 mt-1">Track your children and guardian preferences</p>
            </div>
          )}

          {/* Pets - Placeholder */}
          {activeSection === 'pets' && (
            <div className="text-center py-12">
              <Dog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Pet management coming soon</p>
              <p className="text-sm text-gray-500 mt-1">Track your pets and caretaker preferences</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
