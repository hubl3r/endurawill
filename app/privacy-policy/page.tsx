'use client';

import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-10 w-10 text-blue-600" />
          <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-6 text-gray-700">
          <p className="text-red-600 font-bold">We prioritize your privacy. This policy explains data handling for CCPA compliance.</p>

          <h2 className="text-2xl font-bold">Information We Collect</h2>
          <p>Identifiers (name, email, IP), sensitive data (DOB, financial info for services), usage data, geolocation (state-based).</p>

          <h2 className="text-2xl font-bold">How We Use It</h2>
          <p>Provide services, improve site, marketing (with opt-out), analytics, legal compliance.</p>

          <h2 className="text-2xl font-bold">Sharing</h2>
          <p>With service providers (encrypted), partners for integrations, law enforcement if required. No sales without consent.</p>

          <h2 className="text-2xl font-bold">Security</h2>
          <p>Bank-level encryption, MFA, anomaly detection. No guarantee of absolute security.</p>

          <h2 className="text-2xl font-bold">Your Rights (CCPA)</h2>
          <p>Access, delete, correct data; opt-out of sharing. Submit requests to privacy@endurawill.com. No discrimination.</p>

          <h2 className="text-2xl font-bold">Retention</h2>
          <p>As needed for services/legal obligations.</p>

          <h2 className="text-2xl font-bold">Changes</h2>
          <p>We may update; check periodically.</p>

          <p>Last updated: [Date]. Contact: privacy@endurawill.com</p>
        </div>
      </div>
    </div>
  );
}
