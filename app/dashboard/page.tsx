'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import ChecklistModal from '@/components/ChecklistModal';
import DocumentsView from '@/components/DocumentsView';
import OverviewView from '@/components/OverviewView';

export default function DashboardPage() {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [selectedView, setSelectedView] = useState('overview');
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

  const renderView = () => {
    if (selectedView === 'documents') {
      return <DocumentsView />;
    }
    
    // Handle category-specific document views
    if (selectedView.startsWith('documents-')) {
      const category = selectedView.replace('documents-', '');
      return <DocumentsView initialCategory={category} />;
    }
    
    // Default to overview
    return <OverviewView onChecklistClick={() => setIsChecklistOpen(true)} />;
  };

  return (
    <>
      <SignedIn>
        <DashboardLayout 
          onChecklistClick={() => setIsChecklistOpen(true)}
          selectedView={selectedView}
          onViewChange={setSelectedView}
        >
          {renderView()}
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
