import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';

export async function findOpenPaymentIntent(tenantId: string, orderId: string) {
  const { data, error } = await supabaseAdmin.from('payment_intents').select('*').eq('tenant_id', tenantId).eq('order_id', orderId).in('status', ['pending', 'processing', 'submitted']).maybeSingle();
  if (error) throw error;
  return data;
}

export async function findMerchantAccount(tenantId: string, provider: string) {
  const { data, error } = await supabaseAdmin.from('merchant_accounts').select('*').eq('tenant_id', tenantId).eq('provider', provider).eq('is_active', true).order('is_default', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return data;
}
