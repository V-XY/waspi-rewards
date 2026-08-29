import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { publicConfig } from '@/app/lib/config/env';

export async function getTenantBySlug(slug: string) {
  const { data, error } = await supabaseAdmin
    .from('tenants')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  if (error || !data) throw new Error('TENANT_NOT_FOUND');
  return data;
}

export async function getDefaultTenant() {
  return getTenantBySlug(publicConfig.tenantSlug);
}
