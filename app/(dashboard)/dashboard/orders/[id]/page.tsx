'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, FileCheck2, Package, Save, Truck } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, OrderStatus } from '@/app/lib/types';

type EditableOrderField = 'status' | 'delivery_status' | 'scheduled_delivery_date' | 'delivered_at' | 'notes';

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, { cache: 'no-store' });
        if (!response.ok) throw new Error('Order not found');
        const payload = await response.json() as { order?: Order };
        if (!cancelled) {
          setOrder(payload.order ?? null);
          setNotes(payload.order?.notes ?? '');
        }
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Failed to load order');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [id]);

  const update = async (field: EditableOrderField, value: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/orders/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ [field]: value }) });
      const payload = await response.json() as { error?: string; order?: Order };
      if (!response.ok || !payload.order) throw new Error(payload.error ?? 'Update failed');
      setOrder((current) => current ? { ...current, ...payload.order } : payload.order ?? null);
      toast.success('Order updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="grid min-h-[50vh] place-items-center text-sm text-slate-500">Loading order...</div>;
  if (!order) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">Order not found.</div>;

  const kyc = order.kyc_submissions?.[0];
  const payment = order.payment_intents?.[0];
  const activation = order.activations?.[0];
  const customer = order.customers ?? order.customer;

  return <div className="space-y-6"><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={() => router.back()} className="icon-button" aria-label="Go back"><ArrowLeft className="h-5 w-5" /></button><div className="min-w-0"><p className="eyebrow">Order</p><h2 className="truncate text-2xl font-bold text-midnight dark:text-white">{order.order_number}</h2><p className="text-sm text-slate-500">Created {new Date(order.created_at).toLocaleString()}</p></div><span className="ml-auto rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 dark:bg-white/10 dark:text-slate-300">{order.status.replaceAll('_',' ')}</span></div>

  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><StatusCard icon={Package} label="Order" value={order.status} /><StatusCard icon={FileCheck2} label="KYC" value={kyc?.status ?? 'not_started'} /><StatusCard icon={CreditCard} label="Payment" value={payment?.status ?? 'pending'} /><StatusCard icon={Truck} label="Activation" value={activation?.status ?? 'pending'} /></div>

  <div className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]"><div className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-ebony"><h3 className="font-semibold text-midnight dark:text-white">Customer</h3><div className="mt-5 grid gap-5 sm:grid-cols-2"><Info label="Name" value={customer?.full_name ?? 'Not provided'} /><Info label="Phone" value={customer?.phone ?? 'Not provided'} /><Info label="Email" value={customer?.email ?? 'Not provided'} /><Info label="Address" value={customer?.address ?? order.delivery_address ?? 'Not provided'} /></div></section>
  <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-ebony"><h3 className="font-semibold text-midnight dark:text-white">Order items</h3><div className="mt-4 divide-y divide-slate-100 dark:divide-white/10">{(order.order_items ?? []).map((item) => <div key={item.id} className="flex items-center justify-between gap-4 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-midnight dark:text-white">{item.product_name}</p><p className="text-xs text-slate-400">Qty {item.quantity}</p></div><p className="shrink-0 text-sm font-semibold text-midnight dark:text-white">{Number(item.line_total).toLocaleString()} {order.currency_code}</p></div>)}</div><div className="mt-4 border-t border-slate-100 pt-4 dark:border-white/10"><div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="text-midnight dark:text-white">{Number(order.subtotal).toLocaleString()} {order.currency_code}</span></div><div className="mt-2 flex justify-between text-lg font-bold"><span>Total</span><span className="text-solar-flare">{Number(order.total_amount).toLocaleString()} {order.currency_code}</span></div></div></section></div>

  <aside className="space-y-6"><section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-ebony"><h3 className="font-semibold text-midnight dark:text-white">Workflow</h3><label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">Order status<select value={order.status} onChange={(event) => void update('status', event.target.value)} disabled={saving} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm capitalize dark:border-white/10 dark:bg-midnight dark:text-white">{(['draft','awaiting_kyc','kyc_review','awaiting_payment','payment_review','ready_for_activation','activation_in_progress','completed','cancelled','failed'] as OrderStatus[]).map((status) => <option key={status} value={status}>{status.replaceAll('_',' ')}</option>)}</select></label><Info label="KYC" value={kyc?.status ?? 'not_started'} /><Info label="Payment" value={payment?.status ?? 'pending'} /><Info label="Activation" value={activation?.status ?? 'pending'} /></section>
  <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-white/10 dark:bg-ebony"><div className="flex items-center justify-between"><h3 className="font-semibold text-midnight dark:text-white">Internal notes</h3><button type="button" onClick={() => void update('notes', notes)} disabled={saving} className="inline-flex items-center gap-1 text-sm font-semibold text-solar-flare"><Save className="h-4 w-4" /> Save</button></div><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={5} className="mt-4 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-solar-flare dark:border-white/10 dark:bg-midnight dark:text-white" placeholder="Internal operational notes" /></section></aside></div></div>;
}

function StatusCard({ icon: Icon, label, value }: { icon: typeof Package; label: string; value: string }) { return <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-ebony"><div className="flex items-center justify-between"><span className="text-sm text-slate-500">{label}</span><Icon className="h-5 w-5 text-solar-flare" /></div><p className="mt-3 capitalize font-semibold text-midnight dark:text-white">{value.replaceAll('_',' ')}</p></div>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="mt-4"><p className="text-xs uppercase tracking-wider text-slate-400">{label}</p><p className="mt-1 break-words text-sm font-medium capitalize text-midnight dark:text-white">{value.replaceAll('_',' ')}</p></div>; }
