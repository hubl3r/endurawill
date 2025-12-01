'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import WelcomeScreen from '@/components/WelcomeScreen';
import ChecklistModal from '@/components/ChecklistModal';

export default function DashboardPage() {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [completionStatus, setCompletionStatus] = useState({
    profile: false,
    security: false,
    delegates: false,
    will: false,
    healthcare: false,
    poa: false,
    finalArrangements: false,
    vaultUpload: false,
    passwords: false,
    trust: false,
    beneficiaries: false,
  });
  const { user } = useUser();
  
  // TODO: In a real implementation, this would come from your database
  // Check if user has completed onboarding
  const hasCompletedOnboarding = false;
  
  const userName = user?.firstName || undefined;

  // Load profile data and check completion
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          if (data.profile) {
            // Mark profile as complete if user has all required fields
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

  const handleCloseWelcome = () => {
    setShowWelcome(false);
    // TODO: Save preference to database that user dismissed welcome screen
  };

  return (
    <>
      <SignedIn>
        <DashboardLayout onChecklistClick={() => setIsChecklistOpen(true)}>
          {!hasCompletedOnboarding && showWelcome ? (
            <WelcomeScreen 
              userName={userName}
              onGetStarted={() => setIsChecklistOpen(true)}
              onClose={handleCloseWelcome}
            />
          ) : (
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
                    onClick={() => setIsChecklistOpen(true)}
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
          )}
        </DashboardLayout>

        <ChecklistModal 
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          completionStatus={completionStatus}
        />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
