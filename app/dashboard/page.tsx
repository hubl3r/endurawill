'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn, useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import WelcomeScreen from '@/components/WelcomeScreen';
import ChecklistModal from '@/components/ChecklistModal';

export default function DashboardPage() {
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const { user } = useUser();
  
  // TODO: In a real implementation, this would come from your database
  // Check if user has completed onboarding
  const hasCompletedOnboarding = false;
  
  const userName = user?.firstName || undefined;

  return (
    <>
      <SignedIn>
        <DashboardLayout onChecklistClick={() => setIsChecklistOpen(true)}>
          {!hasCompletedOnboarding ? (
            <WelcomeScreen 
              userName={userName}
              onGetStarted={() => setIsChecklistOpen(true)}
            />
          ) : (
            <div>
              {/* This is where dashboard overview will go after onboarding */}
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard Overview</h1>
              <p className="text-gray-600">
                Your dashboard content will appear here after completing the welcome process.
              </p>
            </div>
          )}
        </DashboardLayout>

        <ChecklistModal 
          isOpen={isChecklistOpen}
          onClose={() => setIsChecklistOpen(false)}
        />
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
