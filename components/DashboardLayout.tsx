'use client';

import { useState, ReactNode } from 'react';
import { UserButton } from '@clerk/nextjs';
import {
  Shield,
  Home,
  Settings,
  BookOpen,
  CheckSquare,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from './Sidebar';

interface DashboardLayoutProps {
  children: ReactNode;
  onChecklistClick?: () => void;
  selectedView?: string;
  onViewChange?: (view: string) => void;
  currentEstate?: {
    id: string;
    name: string;
    role: 'primary_owner' | 'co_owner' | 'delegate';
  };
  availableEstates?: {
    id: string;
    name: string;
    role: 'primary_owner' | 'co_owner' | 'delegate';
  }[];
  onEstateChange?: (estateId: string) => void;
}

export default function DashboardLayout({ 
  children, 
  onChecklistClick,
  selectedView = 'overview',
  onViewChange,
  currentEstate,
  availableEstates = [],
  onEstateChange
}: DashboardLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleViewClick = (view: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewChange) {
      onViewChange(view);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Mobile Menu Button + Logo */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
              
              <button
                onClick={(e) => handleViewClick('overview', e)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Shield className="h-8 w-8 text-blue-600" />
                <span className="text-2xl font-bold text-gray-900">Endurawill</span>
              </button>
            </div>

            {/* Header Navigation */}
            <div className="flex items-center gap-6">
              <button
                onClick={(e) => handleViewClick('overview', e)}
                className={`hidden md:flex items-center gap-2 transition-colors ${
                  selectedView === 'overview'
                    ? 'text-blue-600'
                    : 'text-gray-700 hover:text-blue-600'
                }`}
              >
                <Home className="h-5 w-5" />
                <span className="hidden md:inline">Dashboard</span>
              </button>
              
              <button
                onClick={onChecklistClick}
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <CheckSquare className="h-5 w-5" />
                <span className="hidden md:inline">Checklist</span>
              </button>

              <Link
                href="/dashboard/learning-center"
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                <span className="hidden md:inline">Learning Center</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="hidden md:flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="hidden md:inline">Settings</span>
              </Link>

              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-80 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
          <Sidebar
            selectedView={selectedView}
            onViewChange={onViewChange}
            currentEstate={currentEstate}
            availableEstates={availableEstates}
            onEstateChange={onEstateChange}
          />
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden shadow-xl">
              <Sidebar
                selectedView={selectedView}
                onViewChange={onViewChange}
                isMobile={true}
                onClose={() => setIsMobileMenuOpen(false)}
                currentEstate={currentEstate}
                availableEstates={availableEstates}
                onEstateChange={onEstateChange}
              />
            </aside>
          </>
        )}

        {/* Main Content */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
