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
  Home
} from 'lucide-react';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
  onChecklistClick?: () => void;
}

interface SidebarSection {
  id: string;
  label: string;
  icon: any;
  items: {
    id: string;
    label: string;
    href: string;
    badge?: string;
  }[];
}

export default function DashboardLayout({ children, onChecklistClick }: DashboardLayoutProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['profile']);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const sidebarSections: SidebarSection[] = [
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
        { id: 'create-final', label: 'Create/Edit', href: '/dashboard/final-arrangements' }
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
    },
    {
      id: 'letters',
      label: 'Letters to Survivors',
      icon: Mail,
      items: [
        { id: 'create-letter', label: 'Create/Edit Letters', href: '/dashboard/letters' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">Endurawill</span>
            </Link>

            {/* Header Navigation */}
            <div className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <Home className="h-5 w-5" />
                <span className="hidden md:inline">Dashboard</span>
              </Link>
              
              <button
                onClick={onChecklistClick}
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <CheckSquare className="h-5 w-5" />
                <span className="hidden md:inline">Checklist</span>
              </button>

              <Link
                href="/dashboard/learning-center"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                <span className="hidden md:inline">Learning Center</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
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
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto">
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
                          <Link
                            key={item.id}
                            href={item.href}
                            className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
