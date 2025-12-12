'use client';

import { useState } from 'react';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/nextjs';
import { ChevronRight, Shield } from 'lucide-react';

export default function Questionnaire() {
  const [step, setStep] = useState(1);

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-8">
              <Shield className="h-10 w-10 text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900">Create Your Estate Plan</h1>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-8">
                <div className="flex justify-between items-center">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold ${
                        step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {i}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Step {step} of 4
                </div>
              </div>

              {step === 1 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Tell us about yourself</h2>
                  <div className="space-y-4">
                    <input placeholder="Full legal name" className="w-full px-4 py-3 border rounded-lg" />
                    <input type="date" placeholder="Date of birth" className="w-full px-4 py-3 border rounded-lg" />
                    <select className="w-full px-4 py-3 border rounded-lg">
                      <option>State of residence</option>
                    </select>
                    <select className="w-full px-4 py-3 border rounded-lg">
                      <option>Marital status</option>
                      <option>Single</option>
                      <option>Married</option>
                      <option>Divorced</option>
                      <option>Widowed</option>
                    </select>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    Next <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {step === 2 && (
                <div>
                  <h2 className="text-2xl font-bold mb-6">Your family & assets</h2>
                  <p className="text-gray-600 mb-6">This helps us recommend the right plan</p>
                  {/* More steps coming — placeholder for now */}
                  <div className="space-y-4">
                    <div>Do you have children?</div>
                    <div className="flex gap-6">
                      <label><input type="radio" name="children" /> Yes</label>
                      <label><input type="radio" name="children" /> No</label>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="mt-8 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    Next <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              )}

              {step > 2 && (
                <div className="text-center py-12">
                  <h2 className="text-3xl font-bold mb-4">More steps coming soon!</h2>
                  <p className="text-gray-600">Your database is ready — the rest of the wizard is being built.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </SignedIn>

      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}
