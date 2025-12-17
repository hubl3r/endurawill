
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
};

// Format helpers
const fmtDate = (d?: string | null) => (d ? new Date(d).toLocaleDateString() : '');
const fmtMoney = (n?: number | null) =>
  n != null ? n.toLocaleString(undefined, { style: 'currency', currency: 'USD' }) : '';

function sixMonthWindowFrom(end = new Date()) {
  // end = end of last month to feel like a "past window"
  const endDate = new Date(end.getFullYear(), end.getMonth() + 1, 0);
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth() - 5, 1);
  return { startDate, endDate };
}

export default function PaymentHistoryModalV2({ account, open, onClose }: Props) {
  const [{ startDate, endDate }, setWindow] = React.useState(sixMonthWindowFrom());
  const [status, setStatus] = React.useState<'ALL' | PaymentStatus>('ALL');
  const [q, setQ] = React.useState('');
  const [rows, setRows] = React.useState<PaymentRow[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(50);
  const [total, setTotal] = React.useState(0);
  const totalPages = Math.ceil(Math.max(total, 1) / limit);

  // Flyout visibility
  const [menuOpen, setMenuOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    if (!open) return;
    setLoading(true);
    // Uses your existing endpoint that returns { payments: PaymentRow[] }
    // Filters are handled client-side here; if you add query params support server-side, wire them below.
    const res = await fetch(`/api/accounts/${account.id}/payments`);
    const json = await res.json();
    const items: PaymentRow[] = json.payments ?? [];
    // Client-side filter + window
    const filtered = items
      .filter(p => {
        // status
        const okStatus = status === 'ALL' ? true : p.status === status;
        // text search (notes + method)
        const text = q.trim().toLowerCase();
        const okText =
          !text ||
          (p.notes && p.notes.toLowerCase().includes(text)) ||
          (p.paymentMethod && p.paymentMethod.toLowerCase().includes(text));
        // window check (scheduled or actual date falls within)
        const s = p.scheduledDate ? new Date(p.scheduledDate) : null;
        const a = p.actualDate ? new Date(p.actualDate) : null;
        const inWindow =
          (!!s && s >= startDate && s <= endDate) ||
          (!!a && a >= startDate && a <= endDate);
        return okStatus && okText && inWindow;
      })
      .sort((a, b) => {
        // chronological by scheduledDate, then actualDate
        const ad = new Date(a.scheduledDate ?? a.actualDate ?? 0).getTime();
        const bd = new Date(b.scheduledDate ?? b.actualDate ?? 0).getTime();
        return ad - bd;
      });

    setTotal(filtered.length);
    // Simple paging
    const startIdx = (page - 1) * limit;
    setRows(filtered.slice(startIdx, startIdx + limit));
    setLoading(false);
  }, [open, account.id, status, q, startDate, endDate, page, limit]);

  React.useEffect(() => { load(); }, [load]);

  const prev6 = () => {
    setWindow(({ startDate, endDate }) => ({
      startDate: new Date(startDate.getFullYear(), startDate.getMonth() - 6, 1),
      endDate: new Date(endDate.getFullYear(), endDate.getMonth() - 6, 0),
    }));
    setPage(1);
  };
  const next6 = () => {
    setWindow(({ startDate, endDate }) => ({
      startDate: new Date(startDate.getFullYear(), startDate.getMonth() + 6, 1),
      endDate: new Date(endDate.getFullYear(), endDate.getMonth() + 6, 0),
    }));
    setPage(1);
  };

  async function markPaid(row: PaymentRow) {
    const body = {
      status: 'PAID',
      actualDate: new Date().toISOString().slice(0, 10),
      actualAmount: row.actualAmount ?? row.scheduledAmount,
    };
    await fetch(`/api/payments/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await load();
  }

  async function skip(row: PaymentRow) {
    const body = {
      status: 'SKIPPED',
      notes: [
        row.notes ?? '',
        `[Skipped on ${new Date().toLocaleDateString()}]`,
      ].filter(Boolean).join('\n'),
    };
    await fetch(`/api/payments/${row.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await load();
  }

  async function remove(row: PaymentRow) {
    // If you expose DELETE by id, you can switch to DELETE /api/payments/:id
    await fetch(`/api/payments/${row.id}`, { method: 'DELETE' });
    await load();
  }

  async function addTransaction() {
    // If you have POST /api/accounts/:id/payments, use it; else we can wire one.
    const body = {
      scheduledDate: new Date().toISOString().slice(0, 10),
      scheduledAmount: account.anticipatedAmount ?? 0,
      status: 'UPCOMING' as PaymentStatus,
      notes: 'Manually added transaction',
    };
    await fetch(`/api/accounts/${account.id}/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    await load();
  }

  // Inline mini chart (SVG) showing totals per month in window
  const monthlyBuckets = React.useMemo(() => {
    const buckets = new Map<string, { scheduled: number; actual: number }>();
    rows.forEach(r => {
      const key = new Date(r.scheduledDate ?? r.actualDate ?? Date.now());
      const k = `${key.getFullYear()}-${String(key.getMonth() + 1).padStart(2, '0')}`;
      if (!buckets.has(k)) buckets.set(k, { scheduled: 0, actual: 0 });
      const b = buckets.get(k)!;
      b.scheduled += r.scheduledAmount ?? 0;
      b.actual += r.actualAmount ?? 0;
    });
    // Sort by y-m
    return Array.from(buckets.entries())
      .sort((a, b) => (a[0] < b[0] ? -1 : 1))
      .map(([key, val]) => ({ key, ...val }));
  }, [rows]);

  // Chart dimensions
  const maxVal = Math.max(...monthlyBuckets.map(b => Math.max(b.scheduled, b.actual)), 1);
  const w = 560, h = 120, pad = 20;
  const step = monthlyBuckets.length > 1 ? (w - pad * 2) / (monthlyBuckets.length - 1) : 0;
  const yScale = (v: number) => h - pad - (v / maxVal) * (h - pad * 2);

  if (!open) return null;

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header: Payment History + account meta */}
        <div className="p-5 border-b border-gray-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Payment History</h2>
              <div className="text-sm text-gray-700">
                <span className="font-medium">{account.accountName}</span> • {account.companyName}
                {account.accountNumber && <> • #{account.accountNumber}</>}
                {' '}
                • <span className="uppercase">{account.paymentFrequency}</span>
                {account.anticipatedAmount != null && (
                  <> • Anticipated: {fmtMoney(account.anticipatedAmount)}</>
                )}
              </div>

              {/* Hyperlinks (Website, Phone, Address) */}
              <div className="flex flex-wrap gap-3 text-sm">
                {account.companyWebsite && (
                  <a href={account.companyWebsite.startsWith('http') ? account.companyWebsite : `https://${account.companyWebsite}`}
                     target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
                {account.companyPhone && (
                  <a href={`tel:${account.companyPhone}`} className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                    <Phone className="h-4 w-4" /> {account.companyPhone}
                  </a>
                )}
                {account.companyAddress && (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(account.companyAddress)}`}
                     target="_blank" rel="noopener noreferrer"
                     className="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4" /> {account.companyAddress}
                  </a>
                )}
              </div>
            </div>

            {/* Flyout menu */}
            <div className="relative">
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setMenuOpen(v => !v)} aria-label="Menu">
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-44 rounded-lg border bg-white shadow-lg z-10">
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Export CSV</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Open Account</button>
                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Close Menu</button>
                </div>
              )}
            </div>

            {/* Close */}
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Filters row: chips + search + 6-month pager */}
        <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2 flex-wrap">
          {(['ALL','PAID','PAST_DUE','UPCOMING','SKIPPED','PARTIAL'] as const).map(s => (
            <button key={s}
              onClick={() => { setStatus(s); setPage(1); }}
              className={[
                'px-3 py-1.5 rounded-full text-sm border',
                status === s ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              ].join(' ')}
            >
              {s.replace('_',' ')}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => { setQ(e.target.value); setPage(1); }}
                placeholder="Comment, method, amount"
                className="pl-7 pr-3 py-1.5 border rounded-lg text-sm w-64"
              />
            </div>
            <div className="flex items-center gap-2 text-sm">
              <button onClick={prev6} className="px-2.5 py-1.5 border rounded-lg inline-flex items-center gap-1 hover:bg-gray-50">
                <ChevronLeft className="h-4 w-4" /> Prev 6 mo
              </button>
              <button onClick={next6} className="px-2.5 py-1.5 border rounded-lg inline-flex items-center gap-1 hover:bg-gray-50">
                Next 6 mo <ChevronRight className="h-4 w-4" />
              </button>
              <span className="text-gray-600">
                <Calendar className="inline h-4 w-4 mr-1" />
                {fmtDate(startDate.toISOString())} – {fmtDate(endDate.toISOString())}
              </span>
            </div>
          </div>
        </div>

        {/* Mini Chart of data: totals by month (Scheduled vs Actual) – matches “Chart of data” note */}
        <div className="px-5 py-3 border-b border-gray-200">
          <div className="text-sm text-gray-600 mb-2">Monthly totals (Scheduled vs Actual)</div>
          <svg width={w} height={h} className="bg-white rounded-md">
            {/* axes */}
            <line x1={pad} y1={h-pad} x2={w-pad} y2={h-pad} stroke="#e5e7eb" />
            <line x1={pad} y1={pad} x2={pad} y2={h-pad} stroke="#e5e7eb" />
            {/* scheduled line */}
            {monthlyBuckets.map((b, i) => {
              const x = pad + i * step;
              const y = yScale(b.scheduled);
              const nx = pad + (i+1) * step;
              const ny = yScale(monthlyBuckets[i+1]?.scheduled ?? b.scheduled);
              return i < monthlyBuckets.length - 1 ? (
                <line key={`s-${i}`} x1={x} y1={y} x2={nx} y2={ny} stroke="#3b82f6" strokeWidth={2} />
              ) : null;
            })}
            {/* actual line */}
            {monthlyBuckets.map((b, i) => {
              const x = pad + i * step;
              const y = yScale(b.actual);
              const nx = pad + (i+1) * step;
              const ny = yScale(monthlyBuckets[i+1]?.actual ?? b.actual);
              return i < monthlyBuckets.length - 1 ? (
                <line key={`a-${i}`} x1={x} y1={y} x2={nx} y2={ny} stroke="#10b981" strokeWidth={2} />
              ) : null;
            })}
            {/* points */}
            {monthlyBuckets.map((b, i) => {
              const x = pad + i * step;
              return (
                <g key={`p-${i}`}>
                  <circle cx={x} cy={yScale(b.scheduled)} r={3} fill="#3b82f6" />
                  <circle cx={x} cy={yScale(b.actual)} r={3} fill="#10b981" />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Table of transactions (Est/Act/Status/Comment + actions) */}
        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Loading…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr className="text-left">
                    <th className="px-3 py-2">Est Date</th>
                    <th className="px-3 py-2">Act Date</th>
                    <th className="px-3 py-2">Est Amt</th>
                    <th className="px-3 py-2">Act Amt</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Comment</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map(row => (
                    <tr key={row.id} className="border-b">
                      <td className="px-3 py-2">{fmtDate(row.scheduledDate)}</td>
                      <td className="px-3 py-2">{fmtDate(row.actualDate)}</td>
                      <td className="px-3 py-2">{fmtMoney(row.scheduledAmount)}</td>
                      <td className="px-3 py-2">{fmtMoney(row.actualAmount)}</td>
                      <td className="px-3 py-2">
                        <span className={[
                          'px-2 py-1 rounded-full border',
                          row.status === 'PAID' ? 'text-green-700 bg-green-50 border-green-200' :
                          row.status === 'PAST_DUE' ? 'text-red-700 bg-red-50 border-red-200' :
                          row.status === 'UPCOMING' ? 'text-blue-700 bg-blue-50 border-blue-200' :
                          row.status === 'SKIPPED' ? 'text-gray-700 bg-gray-100 border-gray-300' :
                          'text-orange-700 bg-orange-50 border-orange-200'
                        ].join(' ')}>
                          {row.status.replace('_',' ')}
                        </span>
                      </td>
                      <td className="px-3 py-2">{row.notes ?? ''}</td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        {row.status !== 'PAID' && row.status !== 'SKIPPED' && (
                          <button onClick={() => markPaid(row)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700 mr-2">
                            <Check className="h-4 w-4" /> Paid
                          </button>
                        )}
                        <button onClick={() => skip(row)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-600 text-white hover:bg-gray-700 mr-2">
                          Skip
                        </button>
                        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border hover:bg-gray-50 mr-2">
                          <PencilLine className="h-4 w-4" /> Edit
                        </button>
                        <button onClick={() => remove(row)}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border hover:bg-red-50 text-red-700">
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={7} className="px-3 py-10 text-center text-gray-500">No transactions in this window.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer: pagination + Add Transaction + Close */}
        <div className="px-5 py-3 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page {page} of {totalPages} • Showing {rows.length} / {total} in window
          </div>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                    className="px-2.5 py-1.5 border rounded-lg disabled:opacity-50">
              Prev
            </button>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
                    className="px-2.5 py-1.5 border rounded-lg disabled:opacity-50">
              Next
            </button>
            <button onClick={addTransaction}
                    className="ml-2 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700">
              <Plus className="h-4 w-4" /> Add Transaction
            </button>
            <button onClick={onClose} className="ml-2 px-3 py-1.5 border rounded-lg">Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
