'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import DashboardLayout from '@/components/DashboardLayout';
import { Monitor, Smartphone, Tablet, Trash2, Shield, AlertCircle, CheckCircle } from 'lucide-react';

interface Session {
  id: string;
  browser: string | null;
  os: string | null;
  device: string | null;
  ipAddress: string;
  location: string | null;
  loginAt: string;
  lastActivityAt: string;
  isActive: boolean;
}

export default function SecurityPage() {
  const { user } = useUser();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [endingSession, setEndingSession] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEndSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to end this session? The user will be signed out.')) {
      return;
    }

    setEndingSession(sessionId);
    setMessage(null);

    try {
      const response = await fetch(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Session ended successfully' });
        setSessions(prev => prev.filter(s => s.id !== sessionId));
      } else {
        setMessage({ type: 'error', text: 'Failed to end session' });
      }
    } catch (error) {
      console.error('Error ending session:', error);
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setEndingSession(null);
    }
  };

  const getDeviceIcon = (device: string | null) => {
    if (!device) return <Monitor className="h-5 w-5" />;
    if (device === 'mobile') return <Smartphone className="h-5 w-5" />;
    if (device === 'tablet') return <Tablet className="h-5 w-5" />;
    return <Monitor className="h-5 w-5" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeSince = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const isCurrentSession = (index: number) => index === 0; // First session is current

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Security Settings</h1>
          <p className="text-gray-600">
            Manage your account security, active sessions, and authentication methods.
          </p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 border rounded-lg p-4 flex items-center gap-3 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            )}
            <p className={message.type === 'success' ? 'text-green-900' : 'text-red-900'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Account Security Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Account Security</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Password</h3>
                <p className="text-sm text-gray-600">Manage your password securely</p>
              </div>
              <a 
                href="https://accounts.clerk.com/user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Change Password
              </a>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="font-medium text-gray-900">Two-Factor Authentication</h3>
                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
              </div>
              <a 
                href="https://accounts.clerk.com/user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Configure 2FA
              </a>
            </div>

            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="font-medium text-gray-900">Email Address</h3>
                <p className="text-sm text-gray-600">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <a 
                href="https://accounts.clerk.com/user"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Update Email
              </a>
            </div>
          </div>
        </div>

        {/* Active Sessions Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Active Sessions</h2>
          <p className="text-gray-600 mb-6">
            These devices are currently signed into your account. End any sessions that you don't recognize.
          </p>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 text-sm">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Monitor className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {sessions.map((session, index) => (
                <div 
                  key={session.id}
                  className="flex items-start gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="text-gray-600 mt-1">
                    {getDeviceIcon(session.device)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">
                        {session.browser || 'Unknown Browser'} on {session.os || 'Unknown OS'}
                      </h3>
                      {isCurrentSession(index) && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                          Current Session
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>{session.location || 'Unknown location'} • {session.ipAddress}</p>
                      <p>
                        Last active: {getTimeSince(session.lastActivityAt)} • 
                        Signed in: {formatDate(session.loginAt)}
                      </p>
                    </div>
                  </div>

                  {!isCurrentSession(index) && (
                    <button
                      onClick={() => handleEndSession(session.id)}
                      disabled={endingSession === session.id}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="End session"
                    >
                      {endingSession === session.id ? (
                        <div className="animate-spin h-5 w-5 border-2 border-red-600 border-t-transparent rounded-full"></div>
                      ) : (
                        <Trash2 className="h-5 w-5" />
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Security Tips */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Security Tip:</strong> If you see any sessions you don't recognize, end them immediately 
            and change your password. Always sign out when using shared or public computers.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}
