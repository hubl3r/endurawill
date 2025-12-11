'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';

interface OverviewViewProps {
  onChecklistClick?: () => void;
}

export default function OverviewView({ onChecklistClick }: OverviewViewProps) {
  const [completionStatus, setCompletionStatus] = useState({
    profile: false,
  });
  const { user } = useUser();

  // Load profile data and check completion
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            const profileComplete = !!(
              data.profile.fullName &&
              data.profile.dob &&
              data.profile.stateResidence &&
              data.profile.maritalStatus
            );
            
            setCompletionStatus(prev => ({
              ...prev,
              profile: profileComplete
            }));
          }
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    if (user) {
      loadProfile();
    }
  }, [user]);

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
        <p className="text-gray-600 mb-8">
          Welcome back! Here's a summary of your estate planning progress.
        </p>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Documents</h2>
            <p className="text-gray-600 mb-4">You haven't created any documents yet.</p>
            <button 
              onClick={onChecklistClick}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Get Started →
            </button>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/dashboard/wills/create" className="block text-blue-600 hover:text-blue-700 font-medium">
                → Create a Will
              </Link>
              <Link href="/dashboard/healthcare/create" className="block text-blue-600 hover:text-blue-700 font-medium">
                → Healthcare Directive
              </Link>
              <Link href="/dashboard/profile/personal" className="block text-blue-600 hover:text-blue-700 font-medium">
                → Complete Profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
