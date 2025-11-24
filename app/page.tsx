'use client';

import React, { useState } from 'react';
import { ChevronRight, Shield, FileText, Lock, CheckCircle, Menu, X } from 'lucide-react';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-2xl font-bold text-gray-900">Endurawill</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</a>
              <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-gray-700 hover:text-blue-600">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col space-y-4">
                <a href="#features" className="text-gray-700 hover:text-blue-600">Features</a>
                <a href="#how-it-works" className="text-gray-700 hover:text-blue-600">How It Works</a>
                <a href="#pricing" className="text-gray-700 hover:text-blue-600">Pricing</a>
                <SignedIn>
                  <UserButton afterSignOutUrl="/" />
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="text-left text-gray-700 hover:text-blue-600">
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="text-left bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
                      Get Started
                    </button>
                  </SignUpButton>
                </SignedOut>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6">
              Create Your Will and Trust with Confidence
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Protect your loved ones and secure your legacy with our easy-to-use estate planning platform. Legally valid documents in minutes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center text-lg font-semibold">
                    Start Your Will <ChevronRight className="ml-2" />
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 flex items-center justify-center text-lg font-semibold">
                  Go to Dashboard <ChevronRight className="ml-2" />
                </button>
              </SignedIn>
              <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-blue-600 hover:text-blue-600 text-lg font-semibold">
                Watch Demo
              </button>
            </div>
            <p className="mt-6 text-sm text-gray-500">
              ✓ No credit card required • ✓ 30-day money-back guarantee
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl">
            <img
              src="https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&h=400&fit=crop"
              alt="Estate planning"
              className="rounded-lg shadow-lg w-full"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Everything You Need for Estate Planning
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <FileText className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Easy Will Creation</h3>
              <p className="text-gray-600">
                Step-by-step guidance to create a legally valid will in all 50 states. No legal jargon, just simple questions.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <Lock className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Storage</h3>
              <p className="text-gray-600">
                Bank-level encryption keeps your documents safe. Access them anytime, anywhere, from any device.
              </p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <CheckCircle className="h-12 w-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-3">Trust Documents</h3>
              <p className="text-gray-600">
                Create living trusts, healthcare directives, and power of attorney documents to complete your estate plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Three Simple Steps
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { num: '1', title: 'Answer Questions', desc: 'Tell us about your family, assets, and wishes in a simple interview format.' },
              { num: '2', title: 'Review & Customize', desc: 'Review your documents and make any changes. Our platform ensures everything is legally valid.' },
              { num: '3', title: 'Sign & Store', desc: 'Sign your documents and store them securely. Update anytime as your life changes.' }
            ].map((step) => (
              <div key={step.num} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                <p className="text-gray-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Simple, Transparent Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic Will</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$89</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">Last will and testament</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">Secure cloud storage</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">Unlimited updates for 1 year</span>
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold">
                  Upgrade
                </button>
              </SignedIn>
            </div>

            <div className="bg-blue-600 p-8 rounded-xl shadow-lg border-2 border-blue-600 transform scale-105">
              <div className="bg-white text-blue-600 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2">
                MOST POPULAR
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Complete Estate Plan</h3>
              <div className="text-4xl font-bold text-white mb-4">$199</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Everything in Basic</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Living trust</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Healthcare directive</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-white mr-2 mt-0.5" />
                  <span className="text-white">Power of attorney</span>
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button className="w-full bg-white text-blue-600 px-6 py-3 rounded-lg hover:bg-gray-100 font-semibold">
                  Upgrade
                </button>
              </SignedIn>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border-2 border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
              <div className="text-4xl font-bold text-gray-900 mb-4">$299</div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">Everything in Complete</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">Attorney review</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">Priority support</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                  <span className="text-gray-600">Lifetime updates</span>
                </li>
              </ul>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold">
                    Get Started
                  </button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <button className="w-full border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 font-semibold">
                  Upgrade
                </button>
              </SignedIn>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Shield className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">Endurawill</span>
              </div>
              <p className="text-gray-400 text-sm">
                Secure, affordable estate planning for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 text-sm">
            © 2024 Endurawill. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
