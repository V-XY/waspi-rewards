import 'server-only';
import crypto from 'node:crypto';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { audit } from '@/app/lib/domain/audit/service';
import { ManualMoneyProvider } from '@/app/lib/providers/payments/manual-money';
import { findOpenPaymentIntent, findMerchantAccount } from '@/app/lib/repositories/payments';
import type { PaymentProviderId } from '@/app/lib/providers/payments/types';

export async function createPaymentIntent(tenantId: string, orderId: string, actorUserId?: string) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('id, tenant_id, total_amount, currency_code, status')
    .eq('id', orderId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !order) throw new Error('ORDER_NOT_FOUND');
  if (order.status !== 'awaiting_payment' && order.status !== 'payment_review') {
    throw new Error('ORDER_NOT_READY_FOR_PAYMENT');
  }

  const existing = await findOpenPaymentIntent(tenantId, orderId);

  if (existing) return existing;

  const { data, error: insertError } = await supabaseAdmin
    .from('payment_intents')
    .insert({
      tenant_id: tenantId,
      order_id: orderId,
      amount: order.total_amount,
      currency_code: order.currency_code,
    })
    .select()
    .single();

  if (insertError) throw insertError;

  await audit({
    tenantId,
    actorUserId,
    action: 'payment.intent_created',
    resourceType: 'payment_intent',
    resourceId: data.id,
    after: data,
  });

  return data;
}

export async function getManualPaymentMethods(tenantId: string) {
  const { data, error } = await supabaseAdmin
    .from('merchant_accounts')
    .select('id, provider, display_name, merchant_code, account_number, currency_code, ussd_template, is_default')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .order('is_default', { ascending: false })
    .order('provider');

  if (error) throw error;
  return data ?? [];
}

export async function initiateManualPayment(
  tenantId: string,
  paymentIntentId: string,
  provider: PaymentProviderId,
  actorUserId?: string,
) {
  const { data: intent, error } = await supabaseAdmin
    .from('payment_intents')
    .select('*')
    .eq('id', paymentIntentId)
    .eq('tenant_id', tenantId)
    .single();

  if (error || !intent) throw new Error('PAYMENT_INTENT_NOT_FOUND');
  if (new Date(intent.expires_at) <= new Date()) throw new Error('PAYMENT_EXPIRED');

  const merchant = await findMerchantAccount(tenantId, provider);
  if (!merchant) throw new Error('MERCHANT_NOT_CONFIGURED');

  const paymentProvider = new ManualMoneyProvider({
    provider,
    displayName: merchant.display_name,
    merchantCode: merchant.merchant_code,
    accountNumber: merchant.account_number,
    ussdTemplate: merchant.ussd_template,
  });

  const idempotencyKey = crypto.randomUUID();
  const result = await paymentProvider.initiate({
    amount: intent.amount,
    currency: intent.currency_code,
    reference: paymentIntentId,
  });

  const { data: attempt, error: attemptError } = await supabaseAdmin
    .from('payment_attempts')
    .insert({
      payment_intent_id: intent.id,
      provider: paymentProvider.name,
      merchant_account_id: merchant.id,
      status: 'pending',
      requested_amount: intent.amount,
      currency_code: intent.currency_code,
      idempotency_key: idempotencyKey,
      initiated_at: new Date().toISOString(),
      external_reference: result.externalReference,
    })
    .select()
    .single();

  if (attemptError) throw attemptError;

  await supabaseAdmin
    .from('payment_intents')
    .update({ status: 'processing' })
    .eq('id', intent.id)
    .eq('tenant_id', tenantId);

  await audit({
    tenantId,
    actorUserId,
    action: 'payment.attempt_created',
    resourceType: 'payment_attempt',
    resourceId: attempt.id,
    after: attempt,
  });

  return { intent: { ...intent, status: 'processing' }, attempt, instructions: result.instructions };
}

export async function initiateManualUSSD(tenantId: string, paymentIntentId: string, actorUserId?: string) {
  return initiateManualPayment(tenantId, paymentIntentId, 'mtn_momo', actorUserId);
}
