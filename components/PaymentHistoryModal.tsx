// /components/PaymentHistoryModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Check, Plus, AlertCircle } from 'lucide-react';

interface Payment {
  id: string;
  scheduledDate: string;
  scheduledAmount: number;
  actualDate: string | null;
  actualAmount: number | null;
  status: 'UPCOMING' | 'PAID' | 'PAST_DUE' | 'PARTIAL' | 'CANCELLED';
  paymentMethod: string | null;
  notes: string | null;
  partialPayments: Array<{
    id: string;
    date: string;
    amount: number;
    method: string;
    note: string;
  }> | null;
  remainingBalance: number | null;
}

interface Account {
  id: string;
  accountName: string;
  companyName: string;
  anticipatedAmount: number | null;
  paymentFrequency: string;
}

interface PaymentHistoryModalProps {
  account: Account;
  onClose: () => void;
  onPaymentUpdated?: () => void;
}

export default function PaymentHistoryModal({
  account,
  onClose,
  onPaymentUpdated
}: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [activeTab, setActiveTab] = useState<'history' | 'upcoming'>('upcoming');

  useEffect(() => {
    fetchPayments();
  }, [account.id]);

  const fetchPayments = async () => {
    try {
      const response = await fetch(`/api/accounts/${account.id}/payments`);
      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowMarkPaidModal(true);
  };

  const upcomingPayments = payments.filter(p => 
    p.status === 'UPCOMING' || p.status === 'PAST_DUE'
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const paidPayments = payments.filter(p => 
    p.status === 'PAID' || p.status === 'PARTIAL'
  ).sort((a, b) => new Date(b.actualDate || b.scheduledDate).getTime() - new Date(a.actualDate || a.scheduledDate).getTime());

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'text-green-600 bg-green-50 border-green-200';
      case 'PAST_DUE': return 'text-red-600 bg-red-50 border-red-200';
      case 'PARTIAL': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'UPCOMING': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <Check className="h-4 w-4" />;
      case 'PAST_DUE': return <AlertCircle className="h-4 w-4" />;
      default: return <Calendar className="h-4 w-4" />;
    }
  };

  const displayPayments = activeTab === 'upcoming' ? upcomingPayments : paidPayments;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">{account.accountName}</h2>
              <p className="text-sm text-gray-500 mt-1">{account.companyName}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 px-6">
            <div className="flex gap-1 -mb-px">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'upcoming'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Upcoming & Past Due ({upcomingPayments.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'history'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Payment History ({paidPayments.length})
              </button>
            </div>
          </div>

          {/* Payment List */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-16">
                <div className="text-gray-500">Loading payment history...</div>
              </div>
            ) : displayPayments.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming payments' : 'No payment history'}
                </h3>
                <p className="text-gray-500">
                  {activeTab === 'upcoming' 
                    ? 'Payment schedules will appear here' 
                    : 'Paid payments will appear here'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {displayPayments.map(payment => (
                  <div
                    key={payment.id}
                    className={`p-4 border rounded-lg ${getStatusColor(payment.status)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getStatusIcon(payment.status)}
                          <span className="font-medium">
                            {payment.status === 'PAID' ? 'Paid' : payment.status === 'PAST_DUE' ? 'Past Due' : 'Scheduled'}
                          </span>
                          <span className="text-sm">
                            {formatDate(payment.actualDate || payment.scheduledDate)}
                          </span>
                        </div>

                        <div className="text-2xl font-bold mb-1">
                          {formatCurrency(payment.actualAmount || payment.scheduledAmount)}
                        </div>

                        {payment.status === 'PARTIAL' && payment.partialPayments && (
                          <div className="mt-2 text-sm space-y-1">
                            <div className="font-medium">Partial payments:</div>
                            {payment.partialPayments.map(partial => (
                              <div key={partial.id} className="ml-4 text-gray-700">
                                → {formatCurrency(partial.amount)} on {formatDate(partial.date)}
                                {partial.method && ` via ${partial.method}`}
                              </div>
                            ))}
                            {payment.remainingBalance && payment.remainingBalance > 0 && (
                              <div className="ml-4 font-medium text-red-600">
                                Remaining: {formatCurrency(payment.remainingBalance)}
                              </div>
                            )}
                          </div>
                        )}

                        {payment.paymentMethod && (
                          <div className="text-sm text-gray-600 mt-1">
                            via {payment.paymentMethod}
                          </div>
                        )}

                        {payment.notes && (
                          <div className="text-sm text-gray-600 mt-2 italic">
                            Note: {payment.notes}
                          </div>
                        )}
                      </div>

                      {payment.status !== 'PAID' && (
                        <button
                          onClick={() => handleMarkPaid(payment)}
                          className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                          Mark Paid
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {account.anticipatedAmount && (
                  <>Average payment: {formatCurrency(account.anticipatedAmount)}</>
                )}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mark as Paid Modal */}
      {showMarkPaidModal && selectedPayment && (
        <MarkPaidModal
          payment={selectedPayment}
          accountName={account.accountName}
          onClose={() => {
            setShowMarkPaidModal(false);
            setSelectedPayment(null);
          }}
          onSaved={() => {
            setShowMarkPaidModal(false);
            setSelectedPayment(null);
            fetchPayments();
            onPaymentUpdated?.();
          }}
        />
      )}
    </>
  );
}

// Sub-component: Mark as Paid Modal
interface MarkPaidModalProps {
  payment: Payment;
  accountName: string;
  onClose: () => void;
  onSaved: () => void;
}

function MarkPaidModal({ payment, accountName, onClose, onSaved }: MarkPaidModalProps) {
  const [actualDate, setActualDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [actualAmount, setActualAmount] = useState(
    payment.scheduledAmount.toString()
  );
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!actualDate || !actualAmount) {
      setError('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actualDate,
          actualAmount: parseFloat(actualAmount),
          paymentMethod: paymentMethod || null,
          notes: notes || null,
          status: 'PAID'
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to mark payment as paid');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Mark Payment as Paid</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Account</div>
          <div className="font-medium text-gray-900">{accountName}</div>
          <div className="text-sm text-gray-600 mt-2">Scheduled</div>
          <div className="font-medium text-gray-900">
            ${payment.scheduledAmount.toFixed(2)} on{' '}
            {new Date(payment.scheduledDate).toLocaleDateString()}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Date Paid <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={actualDate}
              onChange={(e) => setActualDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Actual Amount <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={actualAmount}
                onChange={(e) => setActualAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method (optional)
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select method...</option>
              <option value="Checking Account">Checking Account</option>
              <option value="Savings Account">Savings Account</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Auto-Pay">Auto-Pay</option>
              <option value="Check">Check</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="e.g., Included late fee of $25"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Mark as Paid'}
          </button>
        </div>
      </div>
    </div>
  );
}
