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
  const [currentEstate, setCurrentEstate] = useState<{
    id: string;
    name: string;
    role: 'primary_owner' | 'co_owner' | 'delegate';
  } | null>(null);
  const [availableEstates, setAvailableEstates] = useState<{
    id: string;
    name: string;
    role: 'primary_owner' | 'co_owner' | 'delegate';
  }[]>([]);
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

  // Load profile and estate data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const data = await response.json();
          
          // Set profile completion
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

          // Set current estate
          if (data.tenant && data.user) {
            setCurrentEstate({
              id: data.tenant.id,
              name: data.tenant.name || `Estate of ${data.user.fullName || 'Unknown'}`,
              role: data.user.role as 'primary_owner' | 'co_owner' | 'delegate'
            });
          }

          // TODO: Fetch available estates where user is delegate
          // This would come from a new API endpoint like /api/estates
          // For now, leaving empty
          setAvailableEstates([]);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleEstateChange = async (estateId: string) => {
    // TODO: Implement estate switching
    // This would:
    // 1. Call an API to switch context to the new estate
    // 2. Reload all data for the new estate
    // 3. Update currentEstate state
    console.log('Switching to estate:', estateId);
  };

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
          currentEstate={currentEstate || undefined}
          availableEstates={availableEstates}
          onEstateChange={handleEstateChange}
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
