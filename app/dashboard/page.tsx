'use client';

import { useState, useEffect } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import ChecklistModal from '@/components/ChecklistModal';
import DocumentsView from '@/components/DocumentsView';
import OverviewView from '@/components/OverviewView';
import CreateEstateModal from '@/components/CreateEstateModal';

export default function DashboardPage() {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isCreateEstateOpen, setIsCreateEstateOpen] = useState(false);
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

  // Load all estates user has access to
  const loadEstates = async () => {
    try {
      const response = await fetch('/api/estates');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.estates.length > 0) {
          setAvailableEstates(data.estates);
          
          // Get current active tenant from server
          const activeResponse = await fetch('/api/session/tenant');
          if (activeResponse.ok) {
            const activeData = await activeResponse.json();
            const activeEstate = data.estates.find((e: any) => e.id === activeData.tenantId);
            if (activeEstate) {
              setCurrentEstate(activeEstate);
              return;
            }
          }
          
          // Default to first estate
          setCurrentEstate(data.estates[0]);
        }
      }
    } catch (error) {
      console.error('Error loading estates:', error);
    }
  };

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

          // Set current estate from profile
          if (data.tenant && data.user) {
            setCurrentEstate({
              id: data.tenant.id,
              name: data.tenant.name || `Estate of ${data.user.fullName || 'Unknown'}`,
              role: data.user.role as 'primary_owner' | 'co_owner' | 'delegate'
            });
          }
        }

        // Load all available estates
        await loadEstates();
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (user) {
      loadData();
    }
  }, [user]);

  const handleEstateChange = async (estateId: string) => {
    // Find the estate
    const estate = availableEstates.find(e => e.id === estateId);
    if (!estate) return;

    try {
      // Call API to switch tenant (server-side, secure)
      const response = await fetch('/api/session/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: estateId }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Failed to switch estate:', data.error);
        alert(data.error || 'Failed to switch estate');
        return;
      }

      // Success - reload page to get fresh data
      window.location.reload();
    } catch (error) {
      console.error('Error switching estate:', error);
      alert('Failed to switch estate. Please try again.');
    }
  };

  const handleEstateCreated = async (estate: { id: string; name: string; role: string }) => {
    try {
      // Set the new estate as active via API
      const response = await fetch('/api/session/tenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenantId: estate.id }),
      });

      if (!response.ok) {
        console.error('Failed to set new estate as active');
      }

      // Reload to show new estate
      window.location.reload();
    } catch (error) {
      console.error('Error setting new estate:', error);
      // Still reload - the estate was created
      window.location.reload();
    }
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

  // Calculate total estate count for the modal
  const totalEstateCount = availableEstates.filter(
    e => e.role === 'primary_owner' || e.role === 'co_owner'
  ).length;

  return (
    <>
      <SignedIn>
        <DashboardLayout 
          onChecklistClick={() => setIsChecklistOpen(true)}
          selectedView={selectedView}
          onViewChange={setSelectedView}
          currentEstate={currentEstate || undefined}
          availableEstates={availableEstates.filter(e => e.id !== currentEstate?.id)}
          onEstateChange={handleEstateChange}
          onCreateEstateClick={() => setIsCreateEstateOpen(true)}
        >
          {renderView()}
        </DashboardLayout>

        <ChecklistModal 
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
          completionStatus={completionStatus}
        />

        <CreateEstateModal
          isOpen={isCreateEstateOpen}
          onClose={() => setIsCreateEstateOpen(false)}
          onEstateCreated={handleEstateCreated}
          estateCount={totalEstateCount}
        />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
