'use client';

import { Shield, CheckCircle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface WelcomeScreenProps {
  userName?: string;
  onGetStarted?: () => void;
}

export default function WelcomeScreen({ userName, onGetStarted }: WelcomeScreenProps) {
  const completionSteps = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your personal information to get started',
      completed: false,
      href: '/dashboard/profile/personal'
    },
    {
      id: 'security',
      title: 'Set Security Preferences',
      description: 'Configure your account security settings',
      completed: false,
      href: '/dashboard/profile/security'
    },
    {
      id: 'delegates',
      title: 'Add Delegates (Optional)',
      description: 'Designate trusted contacts who can access your documents',
      completed: false,
      href: '/dashboard/profile/delegates'
    },
    {
      id: 'document',
      title: 'Create Your First Document',
      description: 'Start with a basic will or explore other options',
      completed: false,
      href: '/dashboard/wills/create'
    }
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Welcome Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-8 md:p-12 text-white mb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="bg-white/20 p-3 rounded-xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Welcome{userName ? `, ${userName}` : ' to Endurawill'}!
            </h1>
            <p className="text-blue-100 mt-1">Let's secure your legacy together</p>
          </div>
        </div>

        <p className="text-lg text-blue-50 mb-6">
          You've taken an important step in protecting your loved ones and ensuring your wishes are honored. 
          We'll guide you through creating legally-recognized estate planning documents in just a few simple steps.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onGetStarted}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </button>
          <Link
            href="/dashboard/learning-center"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-400 transition-colors flex items-center justify-center"
          >
            Learn More About Estate Planning
          </Link>
        </div>
      </div>

      {/* Getting Started Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Getting Started</h2>
        <p className="text-gray-600 mb-6">
          Complete these steps to set up your account and create your estate plan
        </p>

        <div className="space-y-4">
          {completionSteps.map((step, index) => (
            <Link
              key={step.id}
              href={step.href}
              className="flex items-start gap-4 p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex-shrink-0 mt-1">
                {step.completed ? (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                    <span className="text-sm font-semibold text-gray-600 group-hover:text-white">
                      {index + 1}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600">{step.description}</p>
              </div>

              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>
      </div>

      {/* What You Can Create */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">What You Can Create</h2>
        <p className="text-gray-600 mb-6">
          Explore all the documents and features available to you
        </p>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <h3 className="font-semibold text-gray-900 mb-2">Last Will & Testament</h3>
            <p className="text-sm text-gray-600">
              Specify who inherits your property, appoint guardians, and name an executor
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <h3 className="font-semibold text-gray-900 mb-2">Living Trust</h3>
            <p className="text-sm text-gray-600">
              Avoid probate and maintain privacy while transferring assets to beneficiaries
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <h3 className="font-semibold text-gray-900 mb-2">Healthcare Directive</h3>
            <p className="text-sm text-gray-600">
              Outline medical preferences and designate someone to make healthcare decisions
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <h3 className="font-semibold text-gray-900 mb-2">Power of Attorney</h3>
            <p className="text-sm text-gray-600">
              Appoint someone to handle your financial affairs if you become incapacitated
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <h3 className="font-semibold text-gray-900 mb-2">Final Arrangements</h3>
            <p className="text-sm text-gray-600">
              Detail preferences for burial, cremation, memorials, and automatic notifications
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all">
            <h3 className="font-semibold text-gray-900 mb-2">Storage Vault</h3>
            <p className="text-sm text-gray-600">
              Securely store vital documents and make them accessible to trusted contacts
            </p>
          </div>
        </div>
      </div>

      {/* Legal Disclaimer */}
      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-sm text-amber-900">
          <strong>Important:</strong> Endurawill is not a law firm and does not provide legal advice. 
          Our platform helps you create legally-recognized documents, but we recommend consulting with 
          an attorney for complex situations or if you have questions about your specific circumstances.
        </p>
      </div>
    </div>
  );
}
