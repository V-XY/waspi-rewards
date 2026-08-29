 'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import type { Order } from '@/app/lib/types';

export default function TrackOrderPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/track?token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) throw new Error('Order unavailable');
        return response.json() as Promise<{ order?: Order }>;
      })
      .then((payload) => {
        if (!cancelled) setOrder(payload.order ?? null);
      })
      .catch(() => {
        if (!cancelled) setOrder(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  if (loading) return <div className="site-container grid min-h-[60vh] place-items-center text-sm text-slate-500">Loading your order...</div>;

  if (!order) {
    return (
      <div className="site-container py-20">
        <h1 className="text-2xl font-bold text-midnight">Order unavailable</h1>
        <p className="mt-2 text-slate-500">This tracking link may have expired.</p>
      </div>
    );
  }

  const status = order.status.replaceAll('_', ' ');

  return (
    <div className="bg-slate-50 py-12 md:py-20">
      <div className="site-container max-w-3xl">
        <p className="eyebrow">Order tracking</p>
        <h1 className="mt-2 text-3xl font-bold capitalize tracking-tight text-midnight">Order {order.order_number}</h1>
        <p className="mt-2 text-slate-500">{order.customers?.full_name ?? order.customer?.full_name}</p>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Current status</p>
            <p className="mt-2 text-lg font-semibold capitalize text-midnight">{status}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Amount</p>
            <p className="mt-2 text-lg font-semibold text-midnight">{Number(order.total_amount).toLocaleString()} {order.currency_code}</p>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Created</p>
          <p className="mt-2 text-sm text-slate-600">{new Date(order.created_at).toLocaleString()}</p>
        </div>

        {order.status === 'awaiting_payment' && (
          <Link href={`/pay/${token}`} className="btn-primary mt-5">
            Continue to payment
          </Link>
        )}
      </div>
    </div>
  );
}
