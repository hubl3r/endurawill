'use client';

import React, { useState } from 'react';
import { BookOpen, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const topics = [
  { title: 'What is a Last Will and Testament?', slug: 'what-is-a-last-will-and-testament', preview: 'Understand the basics of a will and why it\'s essential for distributing your assets.' },
  { title: 'Wills vs. Revocable Living Trusts', slug: 'wills-vs-revocable-living-trusts', preview: 'Compare the pros and cons of wills and trusts to decide what\'s right for your situation.' },
  { title: 'Advance Healthcare Directives (Living Wills)', slug: 'advance-healthcare-directives', preview: 'Learn how to document your medical wishes for end-of-life care.' },
  { title: 'Financial Power of Attorney', slug: 'financial-power-of-attorney', preview: 'Designate someone to manage your finances if you\'re unable to do so.' },
  { title: 'Beneficiary Designations', slug: 'beneficiary-designations', preview: 'How to ensure your assets pass directly to loved ones outside of probate.' },
  { title: 'Common Estate Planning Mistakes to Avoid', slug: 'common-estate-planning-mistakes', preview: 'Pitfalls like forgetting to update documents or ignoring taxes.' },
  { title: 'How to Get Started with Estate Planning', slug: 'how-to-get-started-with-estate-planning', preview: 'Step-by-step guide for beginners on assessing needs and gathering info.' },
  { title: 'Why Estate Planning Matters for Families', slug: 'why-estate-planning-matters-for-families', preview: 'Protecting spouses, children, and pets from uncertainty.' },
  { title: 'Debunking Probate Myths', slug: 'debunking-probate-myths', preview: 'Separate fact from fiction about the probate process.' },
  { title: 'Providing for Dependents and Pets', slug: 'providing-for-dependents-and-pets', preview: 'Options for guardianship and pet trusts to care for loved ones.' },
];

export default function LearningCenter() {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredTopics = topics.filter(topic =>
    topic.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <header className="border-b border-gray-200 py-4">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
    <Link href="/" className="text-blue-600 hover:text-blue-800 flex items-center font-semibold">
      <ChevronLeft className="h-5 w-5 mr-1" /> Back to Home
    </Link>
  </div>
  </header>
      <div className="min-h-screen bg-white">
        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 text-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BookOpen className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Learning Center</h1>
          <p className="text-xl text-gray-600 mb-8">Explore estate planning basics. Remember, this is for educational purposes only—not legal advice. Consult an attorney for your situation.</p>
          <div className="max-w-xl mx-auto relative">
            <input
              type="text"
              placeholder="Search topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10"
            />
            <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3.5" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar Categories */}
          <aside className="hidden md:block">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Categories</h2>
            <ul className="space-y-3">
              <li><a href="#" className="text-blue-600 hover:text-blue-800">Estate Planning Basics</a></li>
              <li><a href="#" className="text-blue-600 hover:text-blue-800">Documents Explained</a></li>
              <li><a href="#" className="text-blue-600 hover:text-blue-800">Common Questions</a></li>
              <li><a href="#" className="text-blue-600 hover:text-blue-800">Family Protection</a></li>
            </ul>
          </aside>

          {/* Article Grid */}
          <div className="md:col-span-3">
            <div className="grid md:grid-cols-2 gap-6">
              {filteredTopics.map((topic) => (
                <Link key={topic.slug} href={`/learn/${topic.slug}`} className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{topic.title}</h3>
                  <p className="text-gray-600 mb-4">{topic.preview}</p>
                  <span className="text-blue-600 font-semibold flex items-center">
                    Read More <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
                </Link>
              ))}
            </div>
            {filteredTopics.length === 0 && (
              <p className="text-center text-gray-600">No topics match your search. Try something else!</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
