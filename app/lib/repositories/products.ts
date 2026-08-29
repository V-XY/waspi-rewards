import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';

export async function findActiveProductsByIds(tenantId: string, ids: string[]) {
  const { data, error } = await supabaseAdmin.from('products').select('*').eq('tenant_id', tenantId).eq('is_active', true).in('id', ids);
  if (error) throw error;
  return data ?? [];
}

export async function listActiveProducts(tenantId: string, category?: string | null) {
  let query = supabaseAdmin.from('products').select('*').eq('tenant_id', tenantId).eq('is_active', true).order('category').order('name');
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}
