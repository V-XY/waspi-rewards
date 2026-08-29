'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Clock3, Eye, FileCheck2 } from 'lucide-react';
import type { KycStatus, Order } from '@/app/lib/types';

type Filter = 'all' | 'submitted' | 'approved' | 'attention';

const attentionStatuses: KycStatus[] = ['draft', 'not_started', 'correction_required'];

export default function KYCReviewPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>('submitted');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/orders', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to load KYC queue');
        const payload = await response.json() as { orders?: Order[] };
        if (!cancelled) setOrders(payload.orders ?? []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => orders.filter((order) => {
    const status = order.kyc_submissions?.[0]?.status ?? 'not_started';
    if (filter === 'all') return true;
    if (filter === 'submitted') return ['submitted', 'validating', 'manual_review'].includes(status);
    if (filter === 'approved') return status === 'approved';
    return attentionStatuses.includes(status);
  }), [orders, filter]);

  const counts = useMemo(() => orders.reduce((result, order) => {
    const status = order.kyc_submissions?.[0]?.status ?? 'not_started';
    if (['submitted', 'validating', 'manual_review'].includes(status)) result.submitted += 1;
    if (status === 'approved') result.approved += 1;
    if (attentionStatuses.includes(status)) result.attention += 1;
    return result;
  }, { submitted: 0, approved: 0, attention: 0 }), [orders]);

  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-500">Loading KYC queue...</div>;

  return <div className="space-y-6"><div><p className="eyebrow">Operations</p><h2 className="mt-1 flex items-center gap-2 text-3xl font-bold text-midnight dark:text-white"><FileCheck2 className="h-7 w-7 text-solar-flare" /> KYC review</h2><p className="mt-2 text-sm text-slate-500">Review the verification state attached to each order.</p></div><div className="flex gap-2 overflow-x-auto">{([['submitted',`Needs review · ${counts.submitted}`],['attention',`Needs attention · ${counts.attention}`],['approved',`Approved · ${counts.approved}`],['all',`All · ${orders.length}`]] as Array<[Filter,string]>).map(([value,label]) => <button key={value} type="button" onClick={() => setFilter(value)} className={`whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold ${filter === value ? 'bg-solar-flare text-white' : 'border border-slate-200 bg-white text-slate-600 dark:border-white/10 dark:bg-ebony dark:text-slate-300'}`}>{label}</button>)}</div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filtered.map((order) => { const status = order.kyc_submissions?.[0]?.status ?? 'not_started'; const customer = order.customers?.full_name ?? 'Customer'; return <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-ebony"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><p className="text-sm font-semibold text-midnight dark:text-white">{order.order_number}</p><p className="mt-1 truncate text-sm text-slate-500">{customer}</p><p className="text-xs text-slate-400">{order.customers?.phone ?? ''}</p></div><Status status={status} /></div><div className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-xs text-slate-400">KYC</p><p className="mt-1 font-semibold capitalize text-midnight dark:text-white">{status.replaceAll('_',' ')}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-white/5"><p className="text-xs text-slate-400">Order</p><p className="mt-1 font-semibold capitalize text-midnight dark:text-white">{order.status.replaceAll('_',' ')}</p></div></div><Link href={`/dashboard/orders/${order.id}`} className="btn-primary mt-5 w-full justify-center"><Eye className="h-4 w-4" /> Open order</Link></article>; })}{filtered.length === 0 && <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-400">No KYC records in this queue.</div>}</div></div>;
}

function Status({ status }: { status: KycStatus }) { const approved = status === 'approved'; return <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${approved ? 'bg-emerald-50 text-emerald-700' : 'bg-orange-50 text-orange-700'}`}>{approved ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}{status.replaceAll('_',' ')}</span>; }
