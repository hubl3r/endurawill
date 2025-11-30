'use client';
import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Printer } from 'lucide-react';

export default function TermsOfService() {
  const [expandedSections, setExpandedSections] = useState(new Set(['disclaimer']));
  const lastUpdated = 'November 29, 2025';
  const effectiveDate = 'December 1, 2025';
  const companyEmail = 'legal@endurawill.com';
  const supportEmail = 'support@endurawill.com';
  const arbitrationState = 'Delaware';
  const governingLaw = 'Delaware';

  const toggleSection = (id) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const handlePrint = () => {
    window.print();
  };

  const sections = [
    {
      id: 'disclaimer',
      title: 'IMPORTANT LEGAL DISCLAIMER',
      content: (
        <div className="space-y-3">
          <p className="text-red-600 font-bold text-lg">
            READ THIS CAREFULLY: Endurawill provides self-service templates and general information only. This is NOT legal advice, and no attorney-client relationship is created by using our services.
          </p>
          <p className="font-semibold">
            We strongly recommend consulting with a licensed attorney in your jurisdiction for:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Complex estates or family situations</li>
            <li>Assets exceeding $500,000</li>
            <li>Business ownership interests</li>
            <li>International assets or beneficiaries</li>
            <li>Special needs planning</li>
            <li>Estate tax concerns</li>
          </ul>
        </div>
      )
    },
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <div className="space-y-3">
          <p>
            By accessing or using Endurawill's services, website, or applications (collectively, the "Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all terms, you may not use the Service.
          </p>
          <p>
            <strong>Eligibility:</strong> You must be at least 18 years old and have the legal capacity to enter into binding contracts. By using the Service, you represent that you meet these requirements.
          </p>
          <p>
            <strong>Updates:</strong> We reserve the right to modify these Terms at any time. We will notify you of material changes via email or prominent notice on our website at least 30 days before the effective date. Your continued use after changes take effect constitutes acceptance of the revised Terms.
          </p>
        </div>
      )
    },
    {
      id: 'services',
      title: '2. Description of Services',
      content: (
        <div className="space-y-3">
          <p>
            Endurawill provides online tools and templates for creating estate planning documents including wills, living trusts, powers of attorney, healthcare directives, and related documents.
          </p>
          <p>
            <strong>What We Do NOT Provide:</strong>
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Legal advice or representation</li>
            <li>Review of your documents for legal sufficiency</li>
            <li>Guarantee that documents will be valid in your jurisdiction</li>
            <li>Tax or financial planning advice</li>
            <li>Document filing or registration services (unless explicitly stated)</li>
          </ul>
          <p>
            <strong>Template Limitations:</strong> Our templates are designed for common situations and may not address your specific circumstances. State laws vary significantly. Documents created may require witnesses, notarization, or other formalities to be legally valid.
          </p>
        </div>
      )
    },
    {
      id: 'accounts',
      title: '3. User Accounts and Security',
      content: (
        <div className="space-y-3">
          <p>
            <strong>Account Creation:</strong> You must create an account to use certain features. You agree to provide accurate, current, and complete information and to update it as necessary.
          </p>
          <p>
            <strong>Security:</strong> You are responsible for maintaining the confidentiality of your account credentials. You agree to immediately notify us of any unauthorized access or security breach at {supportEmail}.
          </p>
          <p>
            <strong>Account Termination:</strong> We reserve the right to suspend or terminate your account for violations of these Terms, fraudulent activity, or non-payment. You may terminate your account at any time through account settings or by contacting us.
          </p>
        </div>
      )
    },
    {
      id: 'responsibilities',
      title: '4. User Responsibilities',
      content: (
        <div className="space-y-3">
          <p>You agree to:</p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Provide accurate and truthful information when creating documents</li>
            <li>Use the Service only for lawful purposes and in compliance with all applicable laws</li>
            <li>Not use the Service to create fraudulent or illegal documents</li>
            <li>Not attempt to reverse engineer, decompile, or access our source code</li>
            <li>Not upload viruses, malware, or harmful code</li>
            <li>Not use automated systems (bots, scrapers) without written permission</li>
            <li>Not impersonate others or misrepresent your affiliation</li>
          </ul>
          <p>
            <strong>Content License:</strong> You grant Endurawill a limited, non-exclusive license to use, store, and process information you submit solely to provide the Service and improve our offerings. We will not share your personal estate planning information with third parties except as described in our Privacy Policy.
          </p>
        </div>
      )
    },
    {
      id: 'payment',
      title: '5. Payment Terms',
      content: (
        <div className="space-y-3">
          <p>
            <strong>Fees:</strong> Certain services require payment. All fees are displayed before purchase and are non-refundable except as required by law or as stated in our refund policy.
          </p>
          <p>
            <strong>Subscriptions:</strong> Subscription services automatically renew unless canceled at least 24 hours before the renewal date. You can cancel anytime through account settings.
          </p>
          <p>
            <strong>Refund Policy:</strong> We offer a 30-day money-back guarantee for first-time purchases if you are unsatisfied with the Service. To request a refund, contact {supportEmail} within 30 days of purchase. Refunds are not available for subscription renewals.
          </p>
          <p>
            <strong>Price Changes:</strong> We may change fees with 30 days' notice. Changes won't affect existing subscription periods.
          </p>
        </div>
      )
    },
    {
      id: 'data',
      title: '6. Data Ownership and Retention',
      content: (
        <div className="space-y-3">
          <p>
            <strong>Your Ownership:</strong> You retain all rights to the documents you create using our Service. We claim no ownership of your content.
          </p>
          <p>
            <strong>Data Retention:</strong> We retain your account data and documents while your account is active and for 90 days after termination, unless you request earlier deletion. After this period, data is permanently deleted from our servers.
          </p>
          <p>
            <strong>Data Deletion:</strong> You may request deletion of your data at any time by contacting {supportEmail}. We will delete your data within 30 days, subject to legal retention requirements.
          </p>
          <p>
            <strong>Backup Responsibility:</strong> You are responsible for maintaining backup copies of your documents. We are not liable for data loss.
          </p>
        </div>
      )
    },
    {
      id: 'disclaimers',
      title: '7. Disclaimers and Warranties',
      content: (
        <div className="space-y-3">
          <p className="font-semibold uppercase">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
          </p>
          <p>
            We disclaim all warranties, including but not limited to:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Implied warranties of merchantability and fitness for a particular purpose</li>
            <li>That the Service will be uninterrupted, secure, or error-free</li>
            <li>That documents created will be legally valid or enforceable</li>
            <li>That information provided is accurate, current, or complete</li>
            <li>That the Service will meet your specific needs or circumstances</li>
          </ul>
          <p>
            Some jurisdictions do not allow exclusion of implied warranties, so some limitations may not apply to you.
          </p>
        </div>
      )
    },
    {
      id: 'liability',
      title: '8. Limitation of Liability',
      content: (
        <div className="space-y-3">
          <p className="font-semibold uppercase">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ENDURAWILL SHALL NOT BE LIABLE FOR:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Any indirect, incidental, special, consequential, or punitive damages</li>
            <li>Loss of profits, revenue, data, or use</li>
            <li>Legal fees or costs related to invalid or unenforceable documents</li>
            <li>Damages resulting from reliance on information provided</li>
            <li>Third-party claims arising from your use of the Service</li>
          </ul>
          <p>
            <strong>Maximum Liability:</strong> Our total liability to you for all claims shall not exceed the amount you paid us in the 12 months preceding the claim, or $100, whichever is greater.
          </p>
          <p>
            This limitation applies even if we've been advised of the possibility of damages and regardless of the legal theory.
          </p>
        </div>
      )
    },
    {
      id: 'indemnification',
      title: '9. Indemnification',
      content: (
        <div className="space-y-3">
          <p>
            You agree to indemnify, defend, and hold harmless Endurawill, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including reasonable attorneys' fees) arising from:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Your use or misuse of the Service</li>
            <li>Violation of these Terms</li>
            <li>Violation of any law or third-party rights</li>
            <li>Information you provide being inaccurate or fraudulent</li>
            <li>Documents you create using the Service</li>
          </ul>
        </div>
      )
    },
    {
      id: 'disputes',
      title: '10. Dispute Resolution and Arbitration',
      content: (
        <div className="space-y-3">
          <p>
            <strong>Informal Resolution:</strong> Before filing a claim, you agree to contact us at {companyEmail} to attempt to resolve the dispute informally for at least 30 days.
          </p>
          <p>
            <strong>Binding Arbitration:</strong> If informal resolution fails, any dispute shall be resolved by binding arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules in {arbitrationState}.
          </p>
          <p>
            <strong>Arbitration Process:</strong>
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Arbitration shall be conducted via videoconference unless both parties agree otherwise</li>
            <li>The arbitrator's decision is final and binding</li>
            <li>Judgment may be entered in any court of competent jurisdiction</li>
            <li>Each party bears their own costs unless the arbitrator awards fees</li>
          </ul>
          <p>
            <strong>Class Action Waiver:</strong> You agree to bring claims only in your individual capacity and not as part of any class, consolidated, or representative action. This waiver does not apply where prohibited by law.
          </p>
          <p>
            <strong>Opt-Out:</strong> You may opt out of arbitration by sending written notice to {companyEmail} within 30 days of account creation.
          </p>
          <p>
            <strong>Exceptions:</strong> Either party may seek injunctive relief in court for intellectual property infringement or unauthorized access.
          </p>
        </div>
      )
    },
    {
      id: 'governing',
      title: '11. Governing Law and Venue',
      content: (
        <div className="space-y-3">
          <p>
            These Terms are governed by the laws of the State of {governingLaw}, without regard to conflict of law principles. Any disputes not subject to arbitration shall be brought exclusively in state or federal courts located in {arbitrationState}.
          </p>
        </div>
      )
    },
    {
      id: 'ip',
      title: '12. Intellectual Property',
      content: (
        <div className="space-y-3">
          <p>
            The Service, including all content, features, functionality, trademarks, logos, and design, is owned by Endurawill and protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            <strong>Limited License:</strong> We grant you a limited, non-exclusive, non-transferable license to access and use the Service for personal, non-commercial purposes only. This license does not include:
          </p>
          <ul className="list-disc ml-6 space-y-1">
            <li>Reselling or commercial use of the Service</li>
            <li>Copying, modifying, or creating derivative works</li>
            <li>Using our trademarks without permission</li>
            <li>Removing copyright or proprietary notices</li>
          </ul>
        </div>
      )
    },
    {
      id: 'privacy',
      title: '13. Privacy',
      content: (
        <div className="space-y-3">
          <p>
            Your privacy is important to us. Our collection and use of personal information is described in our Privacy Policy, which is incorporated into these Terms by reference.
          </p>
          <p>
            By using the Service, you consent to our data practices as described in the Privacy Policy.
          </p>
        </div>
      )
    },
    {
      id: 'misc',
      title: '14. Miscellaneous',
      content: (
        <div className="space-y-3">
          <p>
            <strong>Entire Agreement:</strong> These Terms, together with our Privacy Policy, constitute the entire agreement between you and Endurawill.
          </p>
          <p>
            <strong>Severability:</strong> If any provision is found unenforceable, the remaining provisions continue in full effect.
          </p>
          <p>
            <strong>Waiver:</strong> Our failure to enforce any right or provision does not constitute a waiver of that right.
          </p>
          <p>
            <strong>Assignment:</strong> You may not assign these Terms without our consent. We may assign our rights and obligations without restriction.
          </p>
          <p>
            <strong>Force Majeure:</strong> We are not liable for delays or failures due to circumstances beyond our reasonable control, including natural disasters, war, terrorism, labor disputes, or technical failures.
          </p>
          <p>
            <strong>No Third-Party Beneficiaries:</strong> These Terms do not create any third-party beneficiary rights.
          </p>
        </div>
      )
    },
    {
      id: 'contact',
      title: '15. Contact Information',
      content: (
        <div className="space-y-3">
          <p>For questions about these Terms, please contact us:</p>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p><strong>Endurawill Legal Department</strong></p>
            <p>Email: <a href={`mailto:${companyEmail}`} className="text-blue-600 hover:underline">{companyEmail}</a></p>
            <p>Support: <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">{supportEmail}</a></p>
            <p className="mt-2 text-sm text-gray-600">
              Mailing Address: [Your Physical Address - Required in many states]
            </p>
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-blue-600" />
            <div>
              <h1 className="text-4xl font-bold text-gray-900">Terms of Service</h1>
              <p className="text-sm text-gray-600 mt-1">
                Last Updated: {lastUpdated} | Effective: {effectiveDate}
              </p>
            </div>
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden"
            aria-label="Print terms of service"
          >
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        <nav className="bg-white rounded-2xl shadow-lg p-6 mb-6 print:hidden" aria-label="Table of contents">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <main className="bg-white rounded-2xl shadow-lg print:shadow-none" role="main">
          {sections.map((section, index) => (
            <section
              key={section.id}
              id={section.id}
              className={`${index !== 0 ? 'border-t border-gray-200' : ''}`}
            >
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left print:pointer-events-none"
                aria-expanded={expandedSections.has(section.id)}
                aria-controls={`content-${section.id}`}
              >
                <h2 className={`text-xl font-bold ${section.id === 'disclaimer' ? 'text-red-600' : 'text-gray-900'}`}>
                  {section.title}
                </h2>
                <span className="print:hidden">
                  {expandedSections.has(section.id) ? (
                    <ChevronUp className="h-5 w-5 text-gray-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-500" />
                  )}
                </span>
              </button>
              {expandedSections.has(section.id) && (
                <div
                  id={`content-${section.id}`}
                  className="px-8 pb-6 text-gray-700 leading-relaxed print:block"
                >
                  {section.content}
                </div>
              )}
            </section>
          ))}
        </main>

        <div className="mt-6 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-600">
          <p className="text-sm text-gray-700">
            <strong>Need Help?</strong> If you have questions about these Terms of Service or need assistance with our platform, please contact our support team at{' '}
            <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">
              {supportEmail}
            </a>
            . We're here to help!
          </p>
        </div>
      </div>
    </div>
  );
}
