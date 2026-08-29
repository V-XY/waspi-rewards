import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';

export function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('237')) return digits;
  if (digits.length === 9 && digits.startsWith('6')) return `237${digits}`;
  return digits;
}

export async function resolveCustomer(input: { tenantId: string; name: string; phone: string; email?: string; address?: string; landmark?: string }) {
  const phone_normalized = normalizePhone(input.phone);
  if (!phone_normalized) throw new Error('INVALID_PHONE');

  const { data: existing } = await supabaseAdmin
    .from('customers')
    .select('*')
    .eq('tenant_id', input.tenantId)
    .eq('phone_normalized', phone_normalized)
    .maybeSingle();

  if (existing) {
    const { data } = await supabaseAdmin.from('customers').update({
      full_name: input.name.trim() || existing.full_name,
      email: input.email || existing.email,
      address: input.address || existing.address,
      landmark: input.landmark || existing.landmark,
      last_seen_at: new Date().toISOString(),
    }).eq('id', existing.id).select().single();
    return data || existing;
  }

  const { data, error } = await supabaseAdmin.from('customers').insert({
    tenant_id: input.tenantId,
    full_name: input.name.trim(),
    phone: input.phone.trim(),
    phone_normalized,
    email: input.email || null,
    address: input.address || null,
    landmark: input.landmark || null,
  }).select().single();
  if (error) throw error;
  return data;
}
