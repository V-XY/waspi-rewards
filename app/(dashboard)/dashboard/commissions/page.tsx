'use client';

import { useEffect, useMemo, useState } from 'react';
import { WalletCards } from 'lucide-react';
import type { CommissionStatus } from '@/app/lib/types';

type Commission = {
  id: string;
  agent_id: string;
  order_id: string;
  amount: number;
  status: CommissionStatus;
  currency_code: string;
  payout_date?: string | null;
  created_at: string;
};
type DateRange = 'all' | 'this_month' | 'last_month' | 'this_quarter';

export default function CommissionsPage() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [range, setRange] = useState<DateRange>('this_month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/commissions', { cache: 'no-store' })
      .then(async (response) => { if (!response.ok) throw new Error('Failed to load commissions'); return response.json() as Promise<{ commissions?: Commission[] }>; })
      .then((payload) => { if (!cancelled) setCommissions(payload.commissions ?? []); })
      .catch(() => { if (!cancelled) setCommissions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(() => commissions.filter((item) => {
    if (range === 'all') return true;
    const date = new Date(item.created_at);
    const now = new Date();
    if (range === 'this_month') return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
    if (range === 'last_month') { const month = new Date(now.getFullYear(), now.getMonth() - 1, 1); const next = new Date(now.getFullYear(), now.getMonth(), 1); return date >= month && date < next; }
    const quarter = Math.floor(now.getMonth() / 3) * 3;
    const start = new Date(now.getFullYear(), quarter, 1);
    return date >= start;
  }), [commissions, range]);

  const total = visible.reduce((sum, item) => sum + Number(item.amount), 0);
  const paid = visible.filter((item) => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0);
  const pending = visible.filter((item) => item.status === 'pending').reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-500">Loading revenue...</div>;

  return <div className="space-y-6"><div><p className="eyebrow">Finance</p><h2 className="mt-1 flex items-center gap-2 text-3xl font-bold text-midnight dark:text-white"><WalletCards className="h-7 w-7 text-solar-flare" /> Revenue</h2><p className="mt-2 text-sm text-slate-500">Commission records from the tenant ledger.</p></div><div className="grid gap-4 sm:grid-cols-3"><Metric label="Total" value={`${total.toLocaleString()} XAF`} /><Metric label="Paid" value={`${paid.toLocaleString()} XAF`} /><Metric label="Pending" value={`${pending.toLocaleString()} XAF`} /></div><div className="flex gap-2 overflow-x-auto">{(['this_month','last_month','this_quarter','all'] as DateRange[]).map((value) => <button key={value} type="button" onClick={() => setRange(value)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${range === value ? 'bg-solar-flare text-white' : 'border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-ebony dark:text-slate-300'}`}>{value.replaceAll('_',' ')}</button>)}</div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-ebony"><table className="min-w-[650px] w-full text-left"><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 dark:border-white/10"><tr><th className="px-5 py-4">Date</th><th className="px-5 py-4">Order</th><th className="px-5 py-4">Amount</th><th className="px-5 py-4">Status</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-white/10">{visible.map((item) => <tr key={item.id}><td className="px-5 py-4 text-sm text-slate-500">{new Date(item.created_at).toLocaleDateString()}</td><td className="px-5 py-4 text-sm font-medium text-midnight dark:text-white">{item.order_id.slice(0, 8)}</td><td className="px-5 py-4 text-sm font-semibold text-midnight dark:text-white">{Number(item.amount).toLocaleString()} {item.currency_code}</td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">{item.status}</span></td></tr>)}{visible.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-400">No commission records.</td></tr>}</tbody></table></div></div>;
}

function Metric({ label, value }: { label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-ebony"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-midnight dark:text-white">{value}</p></div>; }
