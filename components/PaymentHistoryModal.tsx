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
  status: 'UPCOMING' | 'PAID' | 'PAST_DUE' | 'PARTIAL' | 'SKIPPED';
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
  companyWebsite: string | null;
  companyPhone: string | null;
  companyAddress: string | null;
  anticipatedAmount: number | null;
  paymentFrequency: string;
}

interface PaymentHistoryModalProps {
  account: Account;
  onClose: () => void;
  onPaymentUpdated?: () => void;
  onRefresh?: () => void;
}

export default function PaymentHistoryModal({
  account,
  onClose,
  onPaymentUpdated,
  onRefresh
}: PaymentHistoryModalProps) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);
  const [showPartialPaymentModal, setShowPartialPaymentModal] = useState(false);
  const [showPayoffPlanModal, setShowPayoffPlanModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
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

  const handleSkipPayment = async (payment: Payment) => {
    if (!confirm('Mark this payment as skipped? This means it will not need to be paid.')) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SKIPPED',
          notes: payment.notes ? `${payment.notes}\n[Skipped on ${new Date().toLocaleDateString()}]` : `Skipped on ${new Date().toLocaleDateString()}`,
        }),
      });

      if (response.ok) {
        fetchPayments();
        onRefresh?.();
      } else {
        alert('Failed to skip payment');
      }
    } catch (error) {
      console.error('Error skipping payment:', error);
      alert('Error skipping payment');
    }
  };

  const upcomingPayments = payments.filter(p => 
    p.status === 'UPCOMING' || p.status === 'PAST_DUE'
  ).sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());

  const paidPayments = payments.filter(p => 
    p.status === 'PAID' || p.status === 'PARTIAL' || p.status === 'SKIPPED'
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
      case 'SKIPPED': return 'text-gray-600 bg-gray-100 border-gray-300';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <Check className="h-4 w-4" />;
      case 'PAST_DUE': return <AlertCircle className="h-4 w-4" />;
      case 'SKIPPED': return <X className="h-4 w-4" />;
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
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900">{account.accountName}</h2>
              <p className="text-sm text-gray-500 mt-1">{account.companyName}</p>
              
              {/* Company Contact Info */}
              <div className="mt-3 flex flex-wrap gap-4 text-sm">
                {account.companyWebsite && (
                  <a
                    href={account.companyWebsite.startsWith('http') ? account.companyWebsite : `https://${account.companyWebsite}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    🌐 Website
                  </a>
                )}
                {account.companyPhone && (
                  <a
                    href={`tel:${account.companyPhone}`}
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    📞 {account.companyPhone}
                  </a>
                )}
                {account.companyAddress && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(account.companyAddress)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                  >
                    📍 {account.companyAddress}
                  </a>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors ml-4"
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

                      {payment.status !== 'PAID' && payment.status !== 'SKIPPED' && (
                        <div className="ml-4 flex gap-2">
                          <button
                            onClick={() => handleMarkPaid(payment)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Mark Paid
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowPartialPaymentModal(true);
                            }}
                            className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium"
                          >
                            Partial
                          </button>
                          <button
                            onClick={() => handleSkipPayment(payment)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium"
                          >
                            Skip
                          </button>
                        </div>
                      )}
                      
                      {/* Edit button for all statuses */}
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setShowEditPaymentModal(true);
                        }}
                        className="ml-4 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                      >
                        Edit
                      </button>
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

      {/* Partial Payment Modal */}
      {showPartialPaymentModal && selectedPayment && (
        <PartialPaymentModal
          payment={selectedPayment}
          accountName={account.accountName}
          onClose={() => {
            setShowPartialPaymentModal(false);
            setSelectedPayment(null);
          }}
          onSaved={() => {
            setShowPartialPaymentModal(false);
            setSelectedPayment(null);
            fetchPayments();
            onPaymentUpdated?.();
          }}
        />
      )}

      {/* Edit Payment Modal */}
      {showEditPaymentModal && selectedPayment && (
        <EditPaymentModal
          payment={selectedPayment}
          accountName={account.accountName}
          onClose={() => {
            setShowEditPaymentModal(false);
            setSelectedPayment(null);
          }}
          onSaved={() => {
            setShowEditPaymentModal(false);
            setSelectedPayment(null);
            fetchPayments();
            onRefresh?.();
          }}
        />
      )}

      {/* Payoff Plan Modal */}
      {showPayoffPlanModal && selectedPayment && (
        <PayoffPlanModal
          payment={selectedPayment}
          accountName={account.accountName}
          onClose={() => {
            setShowPayoffPlanModal(false);
            setSelectedPayment(null);
          }}
          onSaved={() => {
            setShowPayoffPlanModal(false);
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

// Sub-component: Partial Payment Modal
interface PartialPaymentModalProps {
  payment: Payment;
  accountName: string;
  onClose: () => void;
  onSaved: () => void;
}

function PartialPaymentModal({ payment, accountName, onClose, onSaved }: PartialPaymentModalProps) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!date || !amount) {
      setError('Date and amount are required');
      return;
    }

    const partialAmount = parseFloat(amount);
    if (partialAmount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/payments/${payment.id}/partial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          amount: partialAmount,
          method: method || null,
          note: note || null,
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add partial payment');
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
          <h3 className="text-lg font-bold text-gray-900">Make Partial Payment</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Account</div>
          <div className="font-medium text-gray-900">{accountName}</div>
          <div className="text-sm text-gray-600 mt-2">Total Due</div>
          <div className="font-medium text-gray-900">${payment.scheduledAmount.toFixed(2)}</div>
          {payment.remainingBalance && payment.remainingBalance > 0 && (
            <>
              <div className="text-sm text-gray-600 mt-2">Remaining Balance</div>
              <div className="font-medium text-red-600">${payment.remainingBalance.toFixed(2)}</div>
            </>
          )}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Amount <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Method (optional)
            </label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select method...</option>
              <option value="Checking Account">Checking Account</option>
              <option value="Savings Account">Savings Account</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Cash">Cash</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              placeholder="e.g., First installment"
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
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Saving...' : 'Add Partial Payment'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Sub-component: Payoff Plan Modal
interface PayoffPlanModalProps {
  payment: Payment;
  accountName: string;
  onClose: () => void;
  onSaved: () => void;
}

function PayoffPlanModal({ payment, accountName, onClose, onSaved }: PayoffPlanModalProps) {
  const [totalPastDue, setTotalPastDue] = useState(
    payment.remainingBalance?.toString() || payment.scheduledAmount.toString()
  );
  const [targetDate, setTargetDate] = useState('');
  const [numberOfPayments, setNumberOfPayments] = useState('3');
  const [plannedPayments, setPlannedPayments] = useState<Array<{
    plannedDate: string;
    plannedAmount: string;
  }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const generatePayments = () => {
    if (!targetDate || !totalPastDue || !numberOfPayments) {
      setError('Please fill in all fields to generate payment schedule');
      return;
    }

    const numPayments = parseInt(numberOfPayments);
    const total = parseFloat(totalPastDue);
    const amountPerPayment = total / numPayments;
    
    const today = new Date();
    const target = new Date(targetDate);
    const daysBetween = Math.floor((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const daysPerPayment = Math.floor(daysBetween / numPayments);

    const generated = [];
    for (let i = 0; i < numPayments; i++) {
      const paymentDate = new Date(today);
      paymentDate.setDate(today.getDate() + (daysPerPayment * (i + 1)));
      
      generated.push({
        plannedDate: paymentDate.toISOString().split('T')[0],
        plannedAmount: amountPerPayment.toFixed(2),
      });
    }

    setPlannedPayments(generated);
    setError('');
  };

  const handleSubmit = async () => {
    if (!totalPastDue || !targetDate || plannedPayments.length === 0) {
      setError('Please generate a payment schedule before saving');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/payments/${payment.id}/payoff-plan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalPastDue: parseFloat(totalPastDue),
          targetPayoffDate: targetDate,
          plannedPayments,
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create payoff plan');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Create Payoff Plan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600">Account</div>
          <div className="font-medium text-gray-900">{accountName}</div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-900 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Total Past Due Amount <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="number"
                step="0.01"
                value={totalPastDue}
                onChange={(e) => setTotalPastDue(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Payoff Date <span className="text-red-600">*</span>
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Payments <span className="text-red-600">*</span>
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={numberOfPayments}
              onChange={(e) => setNumberOfPayments(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            onClick={generatePayments}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Generate Payment Schedule
          </button>
        </div>

        {plannedPayments.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Payment Schedule</h4>
            <div className="space-y-2">
              {plannedPayments.map((p, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Payment {index + 1}</div>
                    <input
                      type="date"
                      value={p.plannedDate}
                      onChange={(e) => {
                        const updated = [...plannedPayments];
                        updated[index].plannedDate = e.target.value;
                        setPlannedPayments(updated);
                      }}
                      className="mt-1 w-full px-3 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Amount</div>
                    <div className="relative mt-1">
                      <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                      <input
                        type="number"
                        step="0.01"
                        value={p.plannedAmount}
                        onChange={(e) => {
                          const updated = [...plannedPayments];
                          updated[index].plannedAmount = e.target.value;
                          setPlannedPayments(updated);
                        }}
                        className="w-full pl-7 pr-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm text-blue-900">
                <strong>Total:</strong> $
                {plannedPayments.reduce((sum, p) => sum + parseFloat(p.plannedAmount || '0'), 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || plannedPayments.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-400"
          >
            {isSubmitting ? 'Creating...' : 'Create Payoff Plan'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit Payment Modal Component
interface EditPaymentModalProps {
  payment: Payment;
  accountName: string;
  onClose: () => void;
  onSaved: () => void;
}

function EditPaymentModal({ payment, accountName, onClose, onSaved }: EditPaymentModalProps) {
  const [scheduledDate, setScheduledDate] = useState(
    payment.scheduledDate.split('T')[0]
  );
  const [scheduledAmount, setScheduledAmount] = useState(
    (payment.scheduledAmount || 0).toString()
  );
  const [actualDate, setActualDate] = useState(
    payment.actualDate ? payment.actualDate.split('T')[0] : ''
  );
  const [actualAmount, setActualAmount] = useState(
    payment.actualAmount ? payment.actualAmount.toString() : ''
  );
  const [notes, setNotes] = useState(payment.notes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!scheduledDate || !scheduledAmount) {
      setError('Scheduled date and amount are required');
      return;
    }

    if (parseFloat(scheduledAmount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch(`/api/payments/${payment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledDate,
          scheduledAmount: parseFloat(scheduledAmount),
          ...(actualDate && { actualDate }),
          ...(actualAmount && { actualAmount: parseFloat(actualAmount) }),
          notes: notes || null,
        }),
      });

      if (response.ok) {
        onSaved();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update payment');
      }
    } catch (err) {
      setError('An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Edit Payment</h3>
          <p className="text-sm text-gray-600 mt-1">{accountName}</p>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Date *
            </label>
            <input
              type="date"
              value={scheduledDate}
              onChange={(e) => setScheduledDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Scheduled Amount *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={scheduledAmount}
                onChange={(e) => setScheduledAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {payment.status === 'PAID' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Date Paid
                </label>
                <input
                  type="date"
                  value={actualDate}
                  onChange={(e) => setActualDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Actual Amount Paid
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={actualAmount}
                    onChange={(e) => setActualAmount(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
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
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
