'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, Clock3, Package, ShieldCheck, TrendingUp, WalletCards } from 'lucide-react';
import type { DashboardStats, Order } from '@/app/lib/types';

function orderKyc(order: Order) { return order.kyc_submissions?.[0]?.status ?? 'not_started'; }
function orderPayment(order: Order) { return order.payment_intents?.[0]?.status ?? 'pending'; }

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/dashboard/stats', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Failed to load dashboard');
        return response.json() as Promise<{ stats: DashboardStats }>;
      })
      .then((payload) => { if (!cancelled) setStats(payload.stats); })
      .catch(() => { if (!cancelled) setStats(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-500">Loading command center...</div>;
  if (!stats) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Dashboard data is unavailable.</div>;

  const cards = [
    { label: 'Today', value: stats.today_activations, note: `Goal ${stats.daily_goal}`, icon: TrendingUp },
    { label: 'Last 7 days', value: stats.weekly_activations, note: 'Activations', icon: Package },
    { label: 'Commissions', value: `${stats.monthly_commissions.toLocaleString()} FCFA`, note: 'Last 30 days', icon: WalletCards },
    { label: 'Needs attention', value: stats.pending_kyc + stats.pending_payments, note: `${stats.pending_kyc} KYC · ${stats.pending_payments} payments`, icon: Clock3 },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="eyebrow">Operations overview</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight text-midnight dark:text-white sm:text-3xl">Command center</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-ebony">
            <div className="flex items-start justify-between"><p className="text-sm text-slate-500">{label}</p><Icon className="h-5 w-5 text-solar-flare" /></div>
            <p className="mt-4 text-2xl font-bold text-midnight dark:text-white">{value}</p>
            <p className="mt-1 text-xs text-slate-400">{note}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <section className="min-w-0 rounded-2xl border border-slate-200 bg-white dark:border-white/10 dark:bg-ebony">
          <div className="flex items-center justify-between border-b border-slate-100 p-5 dark:border-white/10"><div><h3 className="font-semibold text-midnight dark:text-white">Recent orders</h3><p className="mt-1 text-xs text-slate-400">Latest customer journeys</p></div><Link href="/dashboard/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-solar-flare">View all <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="divide-y divide-slate-100 dark:divide-white/10">
            {stats.recent_orders.length === 0 ? <p className="p-8 text-center text-sm text-slate-400">No orders yet.</p> : stats.recent_orders.map((order) => (
              <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="grid gap-3 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_auto] dark:hover:bg-white/5">
                <div className="min-w-0"><p className="font-medium text-midnight dark:text-white">{order.order_number}</p><p className="mt-1 truncate text-sm text-slate-500">{order.customers?.full_name ?? order.customer?.full_name ?? 'Customer'}</p></div>
                <div className="flex flex-wrap items-center gap-2 md:justify-end"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">{order.status.replaceAll('_', ' ')}</span><span className="text-sm font-semibold text-midnight dark:text-white">{Number(order.total_amount).toLocaleString()} {order.currency_code}</span></div>
              </Link>
            ))}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-ebony">
          <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-solar-flare" /><h3 className="font-semibold text-midnight dark:text-white">Queue health</h3></div>
          <div className="mt-5 grid gap-3"><Link href="/dashboard/kyc" className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-white/5"><span className="text-sm text-slate-500">KYC review</span><span className="font-semibold text-midnight dark:text-white">{stats.pending_kyc}</span></Link><Link href="/dashboard/orders" className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-white/5"><span className="text-sm text-slate-500">Payment review</span><span className="font-semibold text-midnight dark:text-white">{stats.pending_payments}</span></Link><div className="flex items-center justify-between rounded-xl bg-slate-50 p-4 dark:bg-white/5"><span className="text-sm text-slate-500">Conversion</span><span className="font-semibold text-midnight dark:text-white">{stats.conversion_rate}%</span></div></div>
          <div className="mt-5 border-t border-slate-100 pt-5 text-xs text-slate-400 dark:border-white/10">KYC: {stats.recent_orders.filter((order) => orderKyc(order) !== 'approved').length} recent not approved. Payments: {stats.recent_orders.filter((order) => orderPayment(order) !== 'verified').length} recent not verified.</div>
        </aside>
      </div>
    </div>
  );
}
