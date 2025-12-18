'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X, Globe, Phone, MapPin, ChevronRight, ChevronLeft,
  Calendar, Plus, Edit, Trash2, Check, SkipForward
} from 'lucide-react';

type PaymentStatus = 'UPCOMING' | 'PAID' | 'PAST_DUE' | 'PARTIAL' | 'SKIPPED';

interface Payment {
  id: string;
  scheduledDate: string | null;
  actualDate: string | null;
  scheduledAmount: number;
  actualAmount: number | null;
  status: PaymentStatus;
  notes?: string | null;
  paymentMethod?: string | null;
}

interface Account {
  id: string;
  accountName: string;
  companyName: string;
  companyWebsite?: string | null;
  companyPhone?: string | null;
  companyAddress?: string | null;
  accountNumber?: string | null;
  paymentFrequency: string;
  anticipatedAmount?: number | null;
}

interface Props {
  account: Account;
  onClose: () => void;
  onPaymentUpdated?: () => void;
}

interface MonthlyData {
  month: string;
  scheduled: number;
  actual: number;
}

interface FlyoutMenu {
  paymentId: string;
  x: number;
  y: number;
}

const formatCurrency = (amount: number | null): string => {
  if (!amount) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  });
};

const formatFrequency = (frequency: string): string => {
  return frequency.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
};

const getStatusColor = (status: PaymentStatus): string => {
  switch (status) {
    case 'PAID': return 'text-green-700 bg-green-50 border-green-200';
    case 'PAST_DUE': return 'text-red-700 bg-red-50 border-red-200';
    case 'UPCOMING': return 'text-orange-700 bg-orange-50 border-orange-200';
    case 'PARTIAL': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    case 'SKIPPED': return 'text-gray-700 bg-gray-100 border-gray-300';
    default: return 'text-gray-700 bg-gray-100 border-gray-300';
  }
};

const getStatusText = (status: PaymentStatus): string => {
  return status.replace('_', ' ');
};

export default function PaymentHistoryModal({ account, onClose, onPaymentUpdated }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [flyoutMenu, setFlyoutMenu] = useState<FlyoutMenu | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);

  // Calculate 6-month window centered on current date
  const getMonthWindow = (centerDate: Date) => {
    const start = new Date(centerDate);
    start.setMonth(start.getMonth() - 2); // 2 months before
    start.setDate(1); // First day of month
    
    const end = new Date(centerDate);
    end.setMonth(end.getMonth() + 3, 0); // Last day of 3rd month after
    
    return { start, end };
  };

  const { start: windowStart, end: windowEnd } = getMonthWindow(currentDate);

  // Load payments data
  const loadPayments = async () => {
    try {
      setLoading(true);
      const startParam = windowStart.toISOString().split('T')[0];
      const endParam = windowEnd.toISOString().split('T')[0];
      
      const response = await fetch(
        `/api/accounts/${account.id}/payments?startDate=${startParam}&endDate=${endParam}`
      );
      const data = await response.json();
      
      if (data.success) {
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, [account.id, windowStart, windowEnd]);

  // Close flyout on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (flyoutRef.current && !flyoutRef.current.contains(event.target as Node)) {
        setFlyoutMenu(null);
      }
    };
    
    if (flyoutMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [flyoutMenu]);

  // Navigate months
  const navigateMonths = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 6 : -6));
    setCurrentDate(newDate);
  };

  // Generate monthly chart data
  const generateMonthlyData = (): MonthlyData[] => {
    const months: MonthlyData[] = [];
    const current = new Date(windowStart);
    
    while (current <= windowEnd) {
      const monthKey = `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`;
      
      const monthPayments = payments.filter(payment => {
        const date = new Date(payment.scheduledDate || payment.actualDate || '');
        return date.getFullYear() === current.getFullYear() && 
               date.getMonth() === current.getMonth();
      });
      
      const scheduled = monthPayments.reduce((sum, p) => sum + p.scheduledAmount, 0);
      const actual = monthPayments.reduce((sum, p) => sum + (p.actualAmount || 0), 0);
      
      months.push({
        month: monthKey,
        scheduled,
        actual,
      });
      
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  const monthlyData = generateMonthlyData();

  // Chart rendering
  const renderChart = () => {
    const chartWidth = 300;
    const chartHeight = 120;
    const padding = 20;
    
    const maxValue = Math.max(...monthlyData.flatMap(d => [d.scheduled, d.actual]), 100);
    const stepWidth = monthlyData.length > 1 ? (chartWidth - 2 * padding) / (monthlyData.length - 1) : 0;
    
    const yScale = (value: number) => chartHeight - padding - ((value / maxValue) * (chartHeight - 2 * padding));
    
    return (
      <svg width={chartWidth} height={chartHeight} className="bg-gray-50 rounded-lg">
        {/* Grid lines */}
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} 
              stroke="#e5e7eb" strokeWidth="1" />
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} 
              stroke="#e5e7eb" strokeWidth="1" />
        
        {/* Data lines and points */}
        {monthlyData.map((data, i) => {
          const x = padding + i * stepWidth;
          const scheduledY = yScale(data.scheduled);
          const actualY = yScale(data.actual);
          const nextData = monthlyData[i + 1];
          
          return (
            <g key={data.month}>
              {/* Lines to next point */}
              {nextData && (
                <>
                  <line x1={x} y1={scheduledY} x2={padding + (i + 1) * stepWidth} y2={yScale(nextData.scheduled)} 
                        stroke="#3b82f6" strokeWidth="2" />
                  <line x1={x} y1={actualY} x2={padding + (i + 1) * stepWidth} y2={yScale(nextData.actual)} 
                        stroke="#10b981" strokeWidth="2" />
                </>
              )}
              
              {/* Data points */}
              <circle cx={x} cy={scheduledY} r="3" fill="#3b82f6" />
              <circle cx={x} cy={actualY} r="3" fill="#10b981" />
              
              {/* Month labels */}
              <text x={x} y={chartHeight - 5} fontSize="10" fill="#6b7280" textAnchor="middle">
                {data.month.split('-')[1]}/{data.month.split('-')[0].slice(2)}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  // Handle payment actions
  const handlePaymentAction = async (paymentId: string, action: string) => {
    try {
      let response;
      
      switch (action) {
        case 'paid':
          response = await fetch(`/api/payments/${paymentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'PAID',
              actualDate: new Date().toISOString().split('T')[0],
              actualAmount: payments.find(p => p.id === paymentId)?.scheduledAmount || 0,
            }),
          });
          break;
          
        case 'skip':
          response = await fetch(`/api/payments/${paymentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              status: 'SKIPPED',
              notes: `Skipped on ${new Date().toLocaleDateString()}`,
            }),
          });
          break;
          
        case 'delete':
          if (!confirm('Are you sure you want to delete this payment?')) return;
          response = await fetch(`/api/payments/${paymentId}`, {
            method: 'DELETE',
          });
          break;
      }
      
      if (response && response.ok) {
        await loadPayments();
        onPaymentUpdated?.();
        setFlyoutMenu(null);
      }
    } catch (error) {
      console.error('Error updating payment:', error);
    }
  };

  const handleRowClick = (payment: Payment, event: React.MouseEvent) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setFlyoutMenu({
      paymentId: payment.id,
      x: rect.right - 200,
      y: rect.top,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Payment History</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500">
            {new Date().toLocaleDateString()}
          </div>
          <button className="w-full text-right text-sm text-blue-600 hover:text-blue-800">
            Edit
          </button>
        </div>

        {/* Account Info */}
        <div className="border-b border-gray-200 p-4 text-sm">
          <div className="space-y-1">
            <div className="font-semibold">{account.accountName}</div>
            <div className="text-gray-600">{account.companyName}</div>
            {account.accountNumber && (
              <div className="text-gray-500">#{account.accountNumber}</div>
            )}
            <div className="text-gray-500">
              {formatFrequency(account.paymentFrequency)} • {formatCurrency(account.anticipatedAmount)}
            </div>
          </div>

          {/* Contact Links */}
          <div className="flex items-center gap-4 mt-3 text-sm text-blue-600">
            <span>Comment</span>
            {account.companyWebsite && (
              <a href={account.companyWebsite} target="_blank" rel="noopener noreferrer" 
                 className="hover:text-blue-800">
                <Globe className="h-4 w-4 inline" /> Web
              </a>
            )}
            <span>Email</span>
            {account.companyPhone && (
              <a href={`tel:${account.companyPhone}`} className="hover:text-blue-800">
                <Phone className="h-4 w-4 inline" /> Phone
              </a>
            )}
            {account.companyAddress && (
              <span title={account.companyAddress} className="hover:text-blue-800">
                <MapPin className="h-4 w-4 inline" /> Address
              </span>
            )}
          </div>
        </div>

        {/* Status Filters */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex gap-2 text-sm">
            <button className="px-3 py-1 bg-blue-600 text-white rounded-full">ALL</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">PAID</button>
            <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">PAST DUE</button>
          </div>
        </div>

        {/* Payment List */}
        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-blue-800 text-white text-sm">
            <div className="grid grid-cols-2 px-4 py-2">
              <div className="font-medium">Activity Name</div>
              <div className="font-medium text-right">Balance</div>
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : (
            <div className="space-y-1">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  onClick={(e) => handleRowClick(payment, e)}
                  className="grid grid-cols-2 px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div>
                    <div className="text-sm font-medium">
                      {formatDate(payment.scheduledDate)} {getStatusText(payment.status)}
                    </div>
                    <div className={`inline-block px-2 py-0.5 rounded-full text-xs border ${getStatusColor(payment.status)}`}>
                      {getStatusText(payment.status)}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm">
                      Est Amt: {formatCurrency(payment.scheduledAmount)}
                    </div>
                    {payment.actualAmount && (
                      <div className="text-sm text-gray-600">
                        Act Amt: {formatCurrency(payment.actualAmount)}
                      </div>
                    )}
                    <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                  </div>
                </div>
              ))}
              
              {payments.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No transactions in this window.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chart */}
        <div className="border-t border-gray-200 p-4">
          <div className="text-sm text-gray-600 mb-2">
            Chart of data. Paginated at 6 months Over transactions.
          </div>
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => navigateMonths('prev')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="text-xs text-gray-500">
              {windowStart.toLocaleDateString()} - {windowEnd.toLocaleDateString()}
            </div>
            <button 
              onClick={() => navigateMonths('next')}
              className="p-1 hover:bg-gray-100 rounded"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {renderChart()}
        </div>

        {/* Add Transaction Button */}
        <div className="border-t border-gray-200 p-4">
          <button 
            onClick={() => {/* Handle add transaction */}}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            Add Transaction
          </button>
        </div>
      </div>

      {/* Flyout Menu */}
      {flyoutMenu && (
        <div
          ref={flyoutRef}
          className="fixed bg-blue-800 text-white rounded-lg shadow-lg z-60 min-w-[120px]"
          style={{ 
            left: Math.max(10, Math.min(flyoutMenu.x, window.innerWidth - 140)), 
            top: Math.max(10, Math.min(flyoutMenu.y, window.innerHeight - 200))
          }}
        >
          <div className="p-2 space-y-1">
            <button
              onClick={() => handlePaymentAction(flyoutMenu.paymentId, 'paid')}
              className="w-full text-left px-3 py-2 hover:bg-blue-700 rounded text-sm"
            >
              Paid
            </button>
            <button
              onClick={() => handlePaymentAction(flyoutMenu.paymentId, 'delete')}
              className="w-full text-left px-3 py-2 hover:bg-blue-700 rounded text-sm"
            >
              Delete
            </button>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <div>
                <div className="text-xs text-blue-200">Act Date</div>
                <div className="text-sm">9/23</div>
              </div>
              <div>
                <div className="text-xs text-blue-200">Est Date</div>
                <div className="text-sm">9/25</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <div>
                <div className="text-xs text-blue-200">Act Amt</div>
                <input className="w-full text-xs bg-blue-700 border border-blue-600 rounded px-1" />
              </div>
              <div>
                <div className="text-xs text-blue-200">Est Amt</div>
                <input className="w-full text-xs bg-blue-700 border border-blue-600 rounded px-1" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-1 mt-2">
              <button
                onClick={() => handlePaymentAction(flyoutMenu.paymentId, 'skip')}
                className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs"
              >
                Skip
              </button>
              <button className="px-2 py-1 bg-blue-700 hover:bg-blue-600 rounded text-xs">
                Update
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
