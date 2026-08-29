'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import type { Order } from '@/app/lib/types';

type LeadStage = 'all' | 'awaiting_kyc' | 'kyc_review' | 'awaiting_payment' | 'completed';

export default function LeadsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [stage, setStage] = useState<LeadStage>('all');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/orders', { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('Failed to load leads');
      return response.json() as Promise<{ orders?: Order[] }>;
    }).then((payload) => { if (!cancelled) setOrders(payload.orders ?? []); }).catch(() => { if (!cancelled) setOrders([]); });
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => orders.filter((order) => {
    const customer = order.customers?.full_name ?? '';
    const phone = order.customers?.phone ?? '';
    const query = search.toLowerCase().trim();
    return (!query || customer.toLowerCase().includes(query) || phone.includes(query) || order.order_number.toLowerCase().includes(query)) && (stage === 'all' || order.status === stage);
  }), [orders, search, stage]);

  return <div className="space-y-6"><div><p className="eyebrow">Pipeline</p><h2 className="mt-1 text-3xl font-bold text-midnight dark:text-white">Leads</h2><p className="mt-2 text-sm text-slate-500">Every lead is an order journey, not a duplicate data model.</p></div><div className="flex flex-col gap-3 lg:flex-row"><label className="relative flex-1"><span className="sr-only">Search leads</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer or order" className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-solar-flare dark:border-white/10 dark:bg-ebony dark:text-white"/></label><div className="flex gap-2 overflow-x-auto">{(['all','awaiting_kyc','kyc_review','awaiting_payment','completed'] as LeadStage[]).map((value) => <button key={value} type="button" onClick={() => setStage(value)} className={`whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold ${stage === value ? 'bg-solar-flare text-white' : 'border border-slate-200 bg-white text-slate-500 dark:border-white/10 dark:bg-ebony'}`}>{value.replaceAll('_',' ')}</button>)}</div></div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-ebony"><table className="min-w-[720px] text-left"><thead className="border-b border-slate-100 text-xs uppercase tracking-wider text-slate-400 dark:border-white/10"><tr><th className="px-5 py-4">Order</th><th className="px-5 py-4">Customer</th><th className="px-5 py-4">Stage</th><th className="px-5 py-4">Value</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-white/10">{filtered.map((order) => <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-white/5"><td className="px-5 py-4"><Link href={`/dashboard/orders/${order.id}`} className="font-semibold text-solar-flare">{order.order_number}</Link></td><td className="px-5 py-4"><p className="text-sm font-medium text-midnight dark:text-white">{order.customers?.full_name ?? 'Customer'}</p><p className="text-xs text-slate-400">{order.customers?.phone ?? ''}</p></td><td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">{order.status.replaceAll('_',' ')}</span></td><td className="px-5 py-4 text-sm font-semibold text-midnight dark:text-white">{Number(order.total_amount).toLocaleString()} {order.currency_code}</td></tr>)}{filtered.length === 0 && <tr><td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-400">No matching leads.</td></tr>}</tbody></table></div></div>;
}
