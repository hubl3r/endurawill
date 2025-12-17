
'use client';

import * as React from 'react';
import {
  X, Globe, Phone, MapPin, MoreVertical, Calendar, Search,
  Check, Trash2, PencilLine, Plus, ChevronLeft, ChevronRight
} from 'lucide-react';

type PaymentStatus = 'UPCOMING' | 'PAID' | 'PAST_DUE' | 'PARTIAL' | 'SKIPPED';

type PaymentRow = {
  id: string;
  scheduledDate: string | null;
  actualDate: string | null;
  scheduledAmount: number;
  actualAmount: number | null;
  status: PaymentStatus;
  notes?: string | null;
  paymentMethod?: string | null;
};

type AccountMeta = {
  id: string;
  accountName: string;
  companyName: string;
  companyWebsite?: string | null;
  companyPhone?: string | null;
  companyAddress?: string | null;
  accountNumber?: string | null;
  anticipatedAmount?: number | null;
  paymentFrequency: string;
};

type Props = {
  account: AccountMeta;
  open: boolean;
  onClose: () => void;
  /** Parent receives a signal after any mutation so it can refresh totals without closing this modal */
  onPaymentUpdated?: () => void;
};

// Helpers
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : '');
const fmtMoney = (n?: number | null) =>
  n != null ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '';


