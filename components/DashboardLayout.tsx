'use client';

import { useState, ReactNode } from 'react';
import { UserButton } from '@clerk/nextjs';
import {
  Shield,
  ChevronDown,
  ChevronRight,
  FileText,
  Heart,
  Building2,
  ClipboardList,
  FolderLock,
  Mail,
  User,
  Settings,
  BookOpen,
  CheckSquare,
  Home,
  FolderOpen,
  Menu,
  X as CloseIcon,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
  onChecklistClick?: () => void;
  selectedView?: string;
  onViewChange?: (view: string) => void;
}

interface SidebarSection {
  id: string;
  label: string;
  icon: any;
  items: {
    id: string;
    label: string;
    href?: string;
    view?: string;
    badge?: string;
  }[];
}

export default function DashboardLayout({ 
  children, 
  onChecklistClick,
  selectedView = 'overview',
  onViewChange 
}: DashboardLayoutProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'estate', 'documents', 'profile']);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleViewClick = (view: string, e: React.MouseEvent) => {
    e.preventDefault();
    if (onViewChange) {
      onViewChange(view);
    }
  };

  const sidebarSections: SidebarSection[] = [
    {
      id: 'main',
      label: 'Main',
      icon: Home,
      items: [
        { id: 'overview', label: 'Overview', view: 'overview' },
      ]
    },
    {
      id: 'estate',
      label: 'Estate',
      icon: Building2,
      items: [
        { id: 'estate-overview', label: 'Estate Overview', href: '/dashboard/estate/overview' },
        { id: 'assets', label: 'Assets', href: '/dashboard/assets' },
        { id: 'liabilities', label: 'Liabilities', href: '/dashboard/liabilities' },
        { id: 'beneficiaries', label: 'Beneficiaries', href: '/dashboard/beneficiaries' },
        { id: 'accounts', label: 'Accounts', href: '/dashboard/accounts' },
        { id: 'vitals', label: 'Vitals', href: '/dashboard/vitals' },
      ]
    },
    {
      id: 'documents',
      label: 'Documents',
      icon: FolderOpen,
      items: [
        { id: 'all-documents', label: 'All Documents', view: 'documents' },
        { id: 'wills-docs', label: 'Wills', view: 'documents-wills' },
        { id: 'vitals-docs', label: 'Vitals', view: 'documents-vitals' },
        { id: 'healthcare-docs', label: 'Healthcare Directives', view: 'documents-healthcare' },
        { id: 'poa-docs', label: 'Power of Attorney', view: 'documents-poa' },
        { id: 'trusts-docs', label: 'Trusts', view: 'documents-trusts' },
        { id: 'letters-docs', label: 'Letters', view: 'documents-letters' },
        { id: 'permissions', label: 'Permissions', href: '/dashboard/documents/permissions' },
      ]
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      items: [
        { id: 'personal-info', label: 'Personal Info', href: '/dashboard/profile/personal' },
        { id: 'security', label: 'Security Settings', href: '/dashboard/profile/security' },
        { id: 'delegates', label: 'Delegates & Contacts', href: '/dashboard/profile/delegates' }
      ]
    },
    {
      id: 'wills',
      label: 'Wills',
      icon: FileText,
      items: [
        { id: 'create-will', label: 'Create New Will', href: '/dashboard/wills/create' },
        { id: 'my-wills', label: 'My Wills', href: '/dashboard/wills', badge: '0' }
      ]
    },
    {
      id: 'trusts',
      label: 'Trusts',
      icon: Building2,
      items: [
        { id: 'create-trust', label: 'Create Living Trust', href: '/dashboard/trusts/create' },
        { id: 'my-trusts', label: 'My Trusts', href: '/dashboard/trusts', badge: '0' }
      ]
    },
    {
      id: 'healthcare',
      label: 'Healthcare Directives',
      icon: Heart,
      items: [
        { id: 'create-directive', label: 'Create New', href: '/dashboard/healthcare/create' },
        { id: 'my-directives', label: 'My Directives', href: '/dashboard/healthcare', badge: '0' }
      ]
    },
    {
      id: 'poa',
      label: 'Power of Attorney',
      icon: ClipboardList,
      items: [
        { id: 'create-poa', label: 'Create New', href: '/dashboard/poa/create' },
        { id: 'my-poas', label: 'My POAs', href: '/dashboard/poa', badge: '0' }
      ]
    },
    {
      id: 'final',
      label: 'Final Arrangements',
      icon: Mail,
      items: [
        { id: 'final-arrangements', label: 'Arrangements', href: '/dashboard/final-arrangements' },
        { id: 'final-letters', label: 'Letters to Survivors', href: '/dashboard/letters' }
      ]
    },
    {
      id: 'vault',
      label: 'Storage Vault',
      icon: FolderLock,
      items: [
        { id: 'my-documents', label: 'My Documents', href: '/dashboard/vault' },
        { id: 'upload', label: 'Upload New', href: '/dashboard/vault/upload' }
      ]
    }
  ];

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
          <nav className="p-4">
            <div className="space-y-1">
              {sidebarSections.map((section) => {
                const Icon = section.icon;
                const isExpanded = expandedSections.includes(section.id);

                return (
                  <div key={section.id}>
                    <button
                      onClick={() => toggleSection(section.id)}
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                        <span className="font-medium">{section.label}</span>
                      </div>
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-8 mt-1 space-y-1">
                        {section.items.map((item) => (
                          item.view ? (
                            <button
                              key={item.id}
                              onClick={(e) => handleViewClick(item.view!, e)}
                              className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                selectedView === item.view
                                  ? 'text-blue-600 bg-blue-50 font-medium'
                                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                              }`}
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </button>
                          ) : (
                            <Link
                              key={item.id}
                              href={item.href!}
                              className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <span>{item.label}</span>
                              {item.badge && (
                                <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                  {item.badge}
                                </span>
                              )}
                            </Link>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Mobile Sidebar Overlay */}
        {isMobileMenuOpen && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed top-0 left-0 bottom-0 w-80 bg-white z-50 overflow-y-auto lg:hidden shadow-xl">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <CloseIcon className="h-5 w-5 text-gray-700" />
                </button>
              </div>
              <nav className="p-4">
                <div className="space-y-1">
                  {sidebarSections.map((section) => {
                    const Icon = section.icon;
                    const isExpanded = expandedSections.includes(section.id);

                    return (
                      <div key={section.id}>
                        <button
                          onClick={() => toggleSection(section.id)}
                          className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-gray-600 group-hover:text-blue-600" />
                            <span className="font-medium">{section.label}</span>
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="ml-8 mt-1 space-y-1">
                            {section.items.map((item) => (
                              item.view ? (
                                <button
                                  key={item.id}
                                  onClick={(e) => {
                                    handleViewClick(item.view!, e);
                                    setIsMobileMenuOpen(false);
                                  }}
                                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors ${
                                    selectedView === item.view
                                      ? 'text-blue-600 bg-blue-50 font-medium'
                                      : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                  }`}
                                >
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </button>
                              ) : (
                                <Link
                                  key={item.id}
                                  href={item.href!}
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <span>{item.label}</span>
                                  {item.badge && (
                                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                      {item.badge}
                                    </span>
                                  )}
                                </Link>
                              )
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </nav>
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
