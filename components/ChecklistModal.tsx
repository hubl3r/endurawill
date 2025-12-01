'use client';

import { X, CheckCircle, Circle, Upload, UserCheck, Shield, FileText, Lock, Users, Mail } from 'lucide-react';

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: any;
  href: string;
  category: 'setup' | 'documents' | 'security' | 'advanced';
}

export default function ChecklistModal({ isOpen, onClose }: ChecklistModalProps) {
  if (!isOpen) return null;

  const checklistItems: ChecklistItem[] = [
    // Setup Items
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add personal information, date of birth, and state of residence',
      completed: false,
      icon: UserCheck,
      href: '/dashboard/profile/personal',
      category: 'setup'
    },
    {
      id: 'security',
      title: 'Configure Security Settings',
      description: 'Set up two-factor authentication and recovery options',
      completed: false,
      icon: Shield,
      href: '/dashboard/profile/security',
      category: 'setup'
    },
    {
      id: 'delegates',
      title: 'Add Trusted Delegates',
      description: 'Designate people who can access your documents in emergencies',
      completed: false,
      icon: Users,
      href: '/dashboard/profile/delegates',
      category: 'setup'
    },

    // Document Items
    {
      id: 'will',
      title: 'Create Your Will',
      description: 'Essential document specifying beneficiaries and guardians',
      completed: false,
      icon: FileText,
      href: '/dashboard/wills/create',
      category: 'documents'
    },
    {
      id: 'healthcare',
      title: 'Healthcare Directive',
      description: 'Outline medical preferences and appoint healthcare agent',
      completed: false,
      icon: FileText,
      href: '/dashboard/healthcare/create',
      category: 'documents'
    },
    {
      id: 'poa',
      title: 'Power of Attorney',
      description: 'Designate someone to handle financial matters if needed',
      completed: false,
      icon: FileText,
      href: '/dashboard/poa/create',
      category: 'documents'
    },
    {
      id: 'final-arrangements',
      title: 'Final Arrangements',
      description: 'Document your preferences for burial, cremation, and memorials',
      completed: false,
      icon: Mail,
      href: '/dashboard/final-arrangements',
      category: 'documents'
    },

    // Security & Storage
    {
      id: 'vault-upload',
      title: 'Upload Important Documents',
      description: 'Store existing documents, deeds, insurance policies in your vault',
      completed: false,
      icon: Upload,
      href: '/dashboard/vault/upload',
      category: 'security'
    },
    {
      id: 'passwords',
      title: 'Document Important Passwords',
      description: 'Create a secure record of critical account information',
      completed: false,
      icon: Lock,
      href: '/dashboard/letters',
      category: 'security'
    },

    // Advanced Items
    {
      id: 'trust',
      title: 'Consider a Living Trust',
      description: 'Avoid probate and maintain privacy (recommended for estates >$100k)',
      completed: false,
      icon: FileText,
      href: '/dashboard/trusts/create',
      category: 'advanced'
    },
    {
      id: 'beneficiaries',
      title: 'Review Asset Beneficiaries',
      description: 'Ensure bank accounts, investments, and insurance have up-to-date beneficiaries',
      completed: false,
      icon: UserCheck,
      href: '/dashboard/profile/personal',
      category: 'advanced'
    }
  ];

  const categories = [
    { id: 'setup', title: 'Account Setup', color: 'blue' },
    { id: 'documents', title: 'Essential Documents', color: 'green' },
    { id: 'security', title: 'Security & Storage', color: 'amber' },
    { id: 'advanced', title: 'Advanced Planning', color: 'purple' }
  ];

  const getProgress = (category: string) => {
    const items = checklistItems.filter(item => item.category === category);
    const completed = items.filter(item => item.completed).length;
    return { completed, total: items.length, percentage: (completed / items.length) * 100 };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Getting Started Checklist</h2>
              <p className="text-sm text-gray-600 mt-1">
                Track your progress as you secure your legacy
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 overflow-y-auto max-h-[calc(90vh-100px)]">
            {categories.map((category) => {
              const items = checklistItems.filter(item => item.category === category.id);
              const progress = getProgress(category.id);
              
              return (
                <div key={category.id} className="mb-8 last:mb-0">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {progress.completed} of {progress.total} completed
                      </span>
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full bg-${category.color}-500 transition-all duration-300`}
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {items.map((item) => {
                      const Icon = item.icon;
                      
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          onClick={onClose}
                          className="flex items-start gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
                        >
                          <div className="flex-shrink-0 mt-1">
                            {item.completed ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <Circle className="h-6 w-6 text-gray-300 group-hover:text-blue-500" />
                            )}
                          </div>

                          <div className="flex-shrink-0">
                            <div className={`p-2 rounded-lg ${item.completed ? 'bg-green-100' : 'bg-gray-100 group-hover:bg-blue-100'}`}>
                              <Icon className={`h-5 w-5 ${item.completed ? 'text-green-600' : 'text-gray-600 group-hover:text-blue-600'}`} />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 mb-1">
                              {item.title}
                            </h4>
                            <p className="text-sm text-gray-600">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex-shrink-0">
                            <span className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                              Start →
                            </span>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <p className="text-sm text-gray-600 text-center">
              You can access this checklist anytime from the header menu
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
