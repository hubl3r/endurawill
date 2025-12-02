```typescript
'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { Shield, Lock, Smartphone, Monitor, AlertCircle } from 'lucide-react';

export default function SecuritySettingsPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      loadSessions(); // Reload
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Security Settings</h1>

        {/* Password Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Lock className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Password & Authentication</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Your password and authentication are managed by our secure authentication provider.
          </p>
          
          <a
            href="/user"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium transition-colors"
          >
            Manage Password
          </a>
        </div>

        {/* 2FA Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Smartphone className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Two-Factor Authentication</h2>
          </div>
          
          <p className="text-gray-600 mb-4">
            Add an extra layer of security to your account with two-factor authentication.
          </p>
          
          <a
            href="/user"
            className="inline-block border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 font-medium transition-colors"
          >
            Set Up 2FA
          </a>
        </div>

        {/* Active Sessions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Monitor className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Active Sessions</h2>
          </div>
          
          {loading ? (
            <p className="text-gray-600">Loading sessions...</p>
          ) : sessions.length === 0 ? (
            <p className="text-gray-600">No active sessions found.</p>
          ) : (
            <div className="space-y-4">
              {sessions.map((session: any) => (
                <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {session.browser} on {session.os}
                        {session.isActive && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Current
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {session.location || 'Unknown location'}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Last active: {new Date(session.lastActivityAt).toLocaleString()}
                      </p>
                    </div>
                    {!session.isActive && (
                      <button
                        onClick={() => handleEndSession(session.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        End Session
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mt-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Danger Zone</h2>
          </div>
          
          <p className="text-red-800 mb-4">
            These actions are permanent and cannot be undone.
          </p>
          
          <div className="space-y-3">
            <button className="w-full border-2 border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 font-medium transition-colors">
              Download All My Data
            </button>
            <button className="w-full bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 font-medium transition-colors">
              Delete My Account
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
```
