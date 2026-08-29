 'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Copy, ExternalLink, Loader2, Smartphone } from 'lucide-react';
import { toast } from 'sonner';
import type { Order, PaymentInstruction } from '@/app/lib/types';

type PaymentMethod = {
  id: string;
  provider: string;
  displayName: string;
  currencyCode: string;
  hasUssd: boolean;
  hasAccount: boolean;
};

export default function PayPage() {
  const { token } = useParams<{ token: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [instruction, setInstruction] = useState<PaymentInstruction | null>(null);
  const [selectedProvider, setSelectedProvider] = useState('mtn_momo');
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [orderResponse, methodsResponse] = await Promise.all([
          fetch(`/api/track?token=${encodeURIComponent(token)}`, { cache: 'no-store' }),
          fetch(`/api/payments/methods?token=${encodeURIComponent(token)}`, { cache: 'no-store' }),
        ]);

        const orderPayload = await orderResponse.json() as { order?: Order };
        const methodsPayload = await methodsResponse.json() as { methods?: PaymentMethod[] };

        if (!orderResponse.ok || !orderPayload.order) throw new Error('Payment session unavailable');
        if (cancelled) return;

        const available = methodsPayload.methods ?? [];
        setOrder(orderPayload.order);
        setMethods(available);
        setSelectedProvider(available[0]?.provider ?? 'mtn_momo');
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'Unable to load payment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();
    return () => { cancelled = true; };
  }, [token]);

  const startPayment = async () => {
    setStarting(true);
    try {
      const response = await fetch('/api/payments/ussd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, provider: selectedProvider }),
      });
      const payload = await response.json() as { error?: string; instructions?: PaymentInstruction };
      if (!response.ok || !payload.instructions) throw new Error(payload.error ?? 'Payment could not be started');
      setInstruction(payload.instructions);
      toast.success('Payment instructions ready');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setStarting(false);
    }
  };

  const openDialer = () => {
    if (instruction?.type !== 'ussd') return;
    window.location.href = `tel:${instruction.code}`;
  };

  const copyInstruction = async () => {
    if (!instruction) return;
    const text = instruction.type === 'ussd' ? instruction.code : instruction.accountNumber;
    await navigator.clipboard.writeText(text);
    toast.success('Copied');
  };

  if (loading) {
    return <div className="site-container grid min-h-[60vh] place-items-center text-sm text-slate-500">Loading payment...</div>;
  }

  if (!order) {
    return <div className="site-container py-20"><h1 className="text-2xl font-bold">Payment session unavailable</h1></div>;
  }

  return (
    <div className="bg-slate-50 py-10 md:py-16">
      <div className="site-container">
        <div className="mx-auto max-w-3xl">
          <p className="eyebrow">Secure payment</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-midnight sm:text-4xl">Complete your payment</h1>
          <p className="mt-2 text-sm text-slate-500">Order {order.order_number}</p>

          <div className="mt-8 grid gap-5 lg:grid-cols-[1fr_320px]">
            <section className="rounded-2xl border border-slate-200 bg-white p-6">
              <h2 className="font-semibold text-midnight">Choose a payment method</h2>

              <div className="mt-4 grid gap-3">
                {methods.map((method) => (
                  <label key={method.id} className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 ${selectedProvider === method.provider ? 'border-solar-flare bg-orange-50/50' : 'border-slate-200'}`}>
                    <span>
                      <span className="block text-sm font-semibold text-midnight">{method.provider === 'mtn_momo' ? 'MTN Mobile Money' : method.provider === 'orange_money' ? 'Orange Money' : method.displayName}</span>
                      <span className="mt-1 block text-xs text-slate-500">
                        {method.hasUssd ? 'USSD payment' : method.hasAccount ? 'Manual account payment' : 'Manual payment'}
                      </span>
                    </span>
                    <input
                      type="radio"
                      name="provider"
                      value={method.provider}
                      checked={selectedProvider === method.provider}
                      onChange={() => setSelectedProvider(method.provider)}
                      className="h-4 w-4 accent-orange-500"
                    />
                  </label>
                ))}
              </div>

              {instruction ? (
                <div className="mt-5 rounded-2xl border border-orange-200 bg-orange-50 p-5">
                  <p className="text-sm font-semibold text-midnight">Payment destination</p>
                  <p className="mt-3 break-all text-xl font-bold text-midnight">
                    {instruction.type === 'ussd' ? instruction.display : instruction.accountNumber}
                  </p>
                  {instruction.type === 'account' && (
                    <p className="mt-1 text-sm text-slate-600">Account name: {instruction.accountName}</p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {instruction.type === 'ussd' && (
                      <button type="button" onClick={openDialer} className="btn-primary">
                        <Smartphone className="h-4 w-4" /> Open dialer
                      </button>
                    )}
                    <button type="button" onClick={() => void copyInstruction()} className="btn-secondary">
                      <Copy className="h-4 w-4" /> Copy
                    </button>
                  </div>
                  <p className="mt-4 text-xs leading-5 text-slate-500">
                    After completing the payment, keep the transaction reference. Verification is recorded separately from the payment initiation.
                  </p>
                </div>
              ) : (
                <button type="button" onClick={() => void startPayment()} disabled={starting || !selectedProvider} className="btn-primary mt-5 w-full justify-center">
                  {starting ? <><Loader2 className="h-4 w-4 animate-spin" /> Preparing...</> : 'Continue with selected method'}
                </button>
              )}
            </section>

            <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 lg:sticky lg:top-24">
              <p className="text-sm text-slate-500">Amount due</p>
              <p className="mt-1 text-3xl font-bold tracking-tight text-midnight">
                {Number(order.total_amount).toLocaleString()} {order.currency_code}
              </p>
              <div className="mt-5 border-t border-slate-100 pt-5">
                <a href={`/track/${token}`} className="inline-flex items-center gap-1 text-sm font-semibold text-solar-flare">
                  View order status <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}
