'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePOACount } from '@/hooks/usePOACount';
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
  Home,
  Plus,
  X as CloseIcon,
} from 'lucide-react';

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

interface SidebarProps {
  selectedView?: string;
  onViewChange?: (view: string) => void;
  isMobile?: boolean;
  onClose?: () => void;
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
  onCreateEstateClick?: () => void;
}

export default function Sidebar({
  selectedView = 'overview',
  onViewChange,
  isMobile = false,
  onClose,
  currentEstate,
  availableEstates = [],
  onEstateChange,
  onCreateEstateClick,
}: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['main', 'estate', 'vault', 'profile']);
  const [showEstateSwitcher, setShowEstateSwitcher] = useState(false);
  const { count: poaCount } = usePOACount();

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
    if (isMobile && onClose) {
      onClose();
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary_owner':
        return 'bg-blue-500';
      case 'co_owner':
        return 'bg-purple-500';
      case 'delegate':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'primary_owner':
        return 'Primary Owner';
      case 'co_owner':
        return 'Co-Owner';
      case 'delegate':
        return 'Delegate';
      default:
        return 'Member';
    }
  };

  const sidebarSections: SidebarSection[] = [
    {
      id: 'main',
      label: 'Main',
      icon: Home,
      items: [
        { id: 'overview', label: 'Overview', href: '/dashboard' },
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
      id: 'vault',
      label: 'Storage Vault',
      icon: FolderLock,
      items: [
        { id: 'all-documents', label: 'All Documents', href: '/dashboard/documents' },
        { id: 'wills-docs', label: 'Wills', href: '/dashboard/documents/wills' },
        { id: 'vitals-docs', label: 'Vitals', href: '/dashboard/documents/vitals' },
        { id: 'healthcare-docs', label: 'Healthcare Directives', href: '/dashboard/documents/healthcare' },
        { id: 'poa-docs', label: 'Power of Attorney', href: '/dashboard/documents/poa' },
        { id: 'trusts-docs', label: 'Trusts', href: '/dashboard/documents/trusts' },
        { id: 'letters-docs', label: 'Letters', href: '/dashboard/documents/letters' },
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
        { id: 'create-poa', label: 'Create New', href: '/poa/create/financial' },
        { id: 'my-poas', label: 'My POAs', href: '/dashboard/poa', badge: String(poaCount) }
      ]
    },
    {
      id: 'final',
      label: 'Final Arrangements',
      icon: Mail,
      items: [
        { id: 'final-arrangements', label: 'Arrangements', href: '/dashboard/final-arrangements' },
        { id: 'legacy-letters', label: 'Legacy Letters', href: '/dashboard/legacy-letters' },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Header (only shown on mobile) */}
      {isMobile && (
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Menu</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <CloseIcon className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      )}

      {/* Account Switcher */}
      {currentEstate && (
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowEstateSwitcher(!showEstateSwitcher)}
            className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className={`w-1 h-12 rounded-full ${getRoleColor(currentEstate.role)}`} />
            <div className="flex-1 text-left">
              <div className="font-semibold text-gray-900 text-sm truncate">
                {currentEstate.name}
              </div>
              <div className="text-xs text-gray-500">
                {getRoleLabel(currentEstate.role)}
              </div>
            </div>
            {availableEstates.length > 0 && (
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showEstateSwitcher ? 'rotate-180' : ''}`} />
            )}
          </button>

          {/* Estate Switcher Dropdown */}
          {showEstateSwitcher && availableEstates.length > 0 && (
            <div className="mt-2 space-y-1">
              {availableEstates.map((estate) => (
                <button
                  key={estate.id}
                  onClick={() => {
                    onEstateChange?.(estate.id);
                    setShowEstateSwitcher(false);
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-1 h-10 rounded-full ${getRoleColor(estate.role)}`} />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-900 text-sm truncate">
                      {estate.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {getRoleLabel(estate.role)}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Create/Join Estate Button - Always Visible */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <button
              onClick={() => {
                onCreateEstateClick?.();
                if (isMobile && onClose) {
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg font-medium transition-colors"
            >
              <Plus className="h-4 w-4" />
              Create or Join Estate
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
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
                          onClick={() => {
                            if (isMobile && onClose) {
                              onClose();
                            }
                          }}
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
    </>
  );
}
