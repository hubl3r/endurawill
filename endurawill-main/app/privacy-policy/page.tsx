'use client';
import { useState } from 'react';
import { Shield, ChevronDown, ChevronUp, Printer } from 'lucide-react';

export default function PrivacyPolicy() {
  const [expandedSections, setExpandedSections] = useState(new Set(['overview']));
  const lastUpdated = 'November 29, 2025';
  const effectiveDate = 'June 1, 2026';
  const privacyEmail = 'privacy@endurawill.com';
  const supportEmail = 'support@endurawill.com';

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const sections = [
    {
      id: 'overview',
      title: 'Overview',
      content: (
        <div className="space-y-3">
          <p className="font-semibold text-lg">Your privacy and security are our highest priorities. This Privacy Policy explains how Endurawill LLC collects, uses, stores, and protects your information.</p>
          <p>Estate planning involves highly sensitive information. We maintain confidentiality through encryption, strict access controls, and transparent practices.</p>
          <p className="text-red-600 font-semibold">IMPORTANT: We NEVER sell your personal information. Your data is used solely to provide services and is only shared with affiliates you explicitly approve.</p>
        </div>
      )
    },
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: (
        <div className="space-y-3">
          <p><strong>You Provide:</strong> Name, email, phone, estate details, beneficiaries, financial info (via Plaid if you choose), uploaded documents, payment info (via processors), communications.</p>
          <p><strong>Automatic:</strong> Usage data, device info, IP, browser type, authentication logs, document access metadata (who, when, where for security).</p>
          <p><strong>Third Parties:</strong> Plaid (account names/types/balances, NO transaction history), Clerk (auth), crypto wallets (if connected), affiliate service confirmations.</p>
        </div>
      )
    },
    {
      id: 'use',
      title: '2. How We Use Information',
      content: (
        <div className="space-y-2">
          <p><strong>Service:</strong> Create/store documents, facilitate affiliates, process payments. <strong>Security:</strong> Authentication, fraud prevention, access logging. <strong>Support:</strong> Answer questions, troubleshoot. <strong>Improvement:</strong> Analyze usage, fix bugs. <strong>Legal:</strong> Comply with laws, enforce Terms. <strong>Communications:</strong> Transactional emails, optional marketing (opt-out anytime).</p>
          <p className="font-semibold">NOT used for: Selling data, advertising, unrelated marketing.</p>
        </div>
      )
    },
    {
      id: 'sharing',
      title: '3. Information Sharing',
      content: (
        <div className="space-y-3">
          <div className="bg-blue-50 p-3 border-l-4 border-blue-600">
            <p className="font-semibold">KEY: Only necessary info shared with affiliates YOU choose.</p>
          </div>
          <p><strong>Opt-In Affiliates:</strong> Attorneys (docs, contact), advisors (contact, asset summaries if opted), executors (full docs after death cert), funeral (contact, preferences, NO financials), notaries (docs needing notarization), lenders (contact, relevant financial if opted). Revocable anytime.</p>
          <p><strong>Service Providers:</strong> Vercel (hosting), Clerk (auth), Plaid (bank verification), payment processors, crypto wallets, email, Google Analytics (when added). All contractually bound.</p>
          <p><strong>Legal:</strong> Valid subpoenas, court orders, fraud prevention. <strong>Business Transfers:</strong> You'll be notified. <strong>NEVER:</strong> Sell data, share with unapproved affiliates, give full financials to non-financial services, use for advertising.</p>
        </div>
      )
    },
    {
      id: 'security',
      title: '4. Data Security',
      content: (
        <div className="space-y-2">
          <p><strong>Encryption:</strong> TLS/SSL in transit, at-rest encryption in databases/Blob Storage, hashed passwords. <strong>Access:</strong> Only YOU via authenticated account; post-death only pre-approved members after death cert; minimal employee access; MFA available. <strong>Monitoring:</strong> Document metadata tracks access, activity logging, suspicious activity alerts, regular audits. <strong>Breach Response:</strong> Prompt email notification with details and guidance.</p>
          <p className="font-semibold">No system is 100% secure. You're responsible for account credential security.</p>
        </div>
      )
    },
    {
      id: 'retention',
      title: '5. Data Retention',
      content: (
        <div className="space-y-2">
          <p><strong>Active:</strong> Retained while account active. <strong>After Cancellation:</strong> 1 year retention, then permanent deletion. <strong>After Death:</strong> Accessible to approved members after death cert; retained 1 year post-settlement. <strong>User Deletion:</strong> 30 days to delete, 90 days for backups. <strong>Legal Holds:</strong> May retain longer if required by law.</p>
        </div>
      )
    },
    {
      id: 'rights',
      title: '6. Your Rights',
      content: (
        <div className="space-y-2">
          <p><strong>Access/Export:</strong> Download all data in portable formats. <strong>Correction:</strong> Update info anytime. <strong>Deletion:</strong> Delete account or specific documents (permanent). <strong>Revoke Affiliates:</strong> Remove access anytime. <strong>Marketing:</strong> Opt out (can't opt out of transactional emails). <strong>Storage Opt-Out:</strong> Don't store documents (limits features).</p>
          <p>Exercise via account settings or email {privacyEmail}. Most requests completed within 30 days.</p>
        </div>
      )
    },
    {
      id: 'cookies',
      title: '7. Cookies',
      content: (
        <div className="space-y-2">
          <p><strong>Current:</strong> NO cookies/tracking for marketing/advertising. <strong>Future Essential:</strong> Login sessions, security (required). <strong>Analytics:</strong> Google Analytics planned (opt-out available). <strong>NEVER:</strong> Advertising cookies, retargeting, social tracking, cross-site tracking.</p>
        </div>
      )
    },
    {
      id: 'children',
      title: '8. Children',
      content: (
        <p>Must be 18+ to use. Don't knowingly collect from minors. Minors can be beneficiaries but can't create accounts. Report any minor data to {privacyEmail}.</p>
      )
    },
    {
      id: 'thirdparty',
      title: '9. Third Parties',
      content: (
        <div className="space-y-2">
          <p><strong>Services:</strong> Vercel, Clerk, Plaid, Google Analytics, crypto wallets - each has own privacy policy. <strong>Affiliates:</strong> Their privacy policies apply to shared data. <strong>External Links:</strong> Not responsible for third-party sites.</p>
        </div>
      )
    },
    {
      id: 'international',
      title: '10. International',
      content: (
        <p><strong>US Only</strong> (excluding CA currently). Data stored in US servers, governed by US laws. No GDPR compliance (not serving EU). May expand to CA/international with proper compliance updates.</p>
      )
    },
    {
      id: 'changes',
      title: '11. Policy Changes',
      content: (
        <p><strong>Material Changes:</strong> 30-day email notice. <strong>Minor Updates:</strong> Posted here with new date. Continued use = acceptance. Review periodically.</p>
      )
    },
    {
      id: 'contact',
      title: '12. Contact',
      content: (
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">Endurawill LLC</p>
            <p>Privacy: <a href={`mailto:${privacyEmail}`} className="text-blue-600 hover:underline">{privacyEmail}</a></p>
            <p>Support: <a href={`mailto:${supportEmail}`} className="text-blue-600 hover:underline">{supportEmail}</a></p>
            <p className="text-sm text-gray-600 mt-2">Address: [Virtual Address - TBA]</p>
          </div>
          <p className="text-sm"><strong>Response:</strong> Access/export/deletion: 30 days; General: 3-5 days; Security: 24-48 hrs.</p>
        </div>
      )
    },
    {
      id: 'acknowledgment',
      title: '13. Acknowledgment',
      content: (
        <div className="space-y-2">
          <p className="font-semibold">By using Endurawill, you acknowledge understanding:</p>
          <ul className="list-disc ml-6 space-y-1 text-sm">
            <li>You're providing sensitive information used solely for services</li>
            <li>Strong security but no absolute guarantee</li>
            <li>You control credentials and affiliate access</li>
            <li>Rights to access, export, delete data anytime</li>
          </ul>
          <p className="font-semibold">Don't agree? Don't use our services.</p>
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
              <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
              <p className="text-sm text-gray-600 mt-1">Last Updated: {lastUpdated} | Effective: {effectiveDate}</p>
            </div>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors print:hidden">
            <Printer className="h-4 w-4" />
            Print
          </button>
        </div>

        <nav className="bg-white rounded-2xl shadow-lg p-6 mb-6 print:hidden">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Quick Navigation</h2>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-blue-600 hover:underline">{s.title}</a>
            ))}
          </div>
        </nav>

        <main className="bg-white rounded-2xl shadow-lg print:shadow-none">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className={i !== 0 ? 'border-t border-gray-200' : ''}>
              <button onClick={() => toggleSection(section.id)} className="w-full px-8 py-6 flex items-center justify-between hover:bg-gray-50 transition-colors text-left print:pointer-events-none">
                <h2 className="text-xl font-bold text-gray-900">{section.title}</h2>
                <span className="print:hidden">
                  {expandedSections.has(section.id) ? <ChevronUp className="h-5 w-5 text-gray-500" /> : <ChevronDown className="h-5 w-5 text-gray-500" />}
                </span>
              </button>
              {expandedSections.has(section.id) && (
                <div className="px-8 pb-6 text-gray-700 leading-relaxed print:block">{section.content}</div>
              )}
            </section>
          ))}
        </main>

        <div className="mt-6 p-6 bg-blue-50 rounded-xl border-l-4 border-blue-600">
          <p className="text-sm text-gray-700">
            <strong>Questions?</strong> Contact <a href={`mailto:${privacyEmail}`} className="text-blue-600 hover:underline">{privacyEmail}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
