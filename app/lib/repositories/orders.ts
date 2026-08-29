import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';

export async function findOrderForTenant(tenantId: string, orderId: string) {
  const { data, error } = await supabaseAdmin.from('orders').select('*, customers(*), agents(*), order_items(*), kyc_submissions(*, kyc_documents(*)), payment_intents(*, payment_attempts(*)), activations(*), commissions(*)').eq('tenant_id', tenantId).eq('id', orderId).single();
  if (error || !data) return null;
  return data;
}

export async function listOrdersForTenant(tenantId: string, limit: number) {
  const { data, error } = await supabaseAdmin.from('orders').select('*, customers(*), agents(id,full_name,email), order_items(*), payment_intents(*), kyc_submissions(*), activations(*)').eq('tenant_id', tenantId).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  return data ?? [];
}
