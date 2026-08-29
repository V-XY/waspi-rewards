import 'server-only';
import { createServerSupabase } from '@/app/lib/supabase/server';
import { supabaseAdmin } from '@/app/lib/supabase/admin';

export async function getCurrentUser() {
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

export async function getCurrentMembership() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabaseAdmin
    .from('tenant_memberships')
    .select('*, tenants(*)')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .limit(1)
    .maybeSingle();

  return data;
}

export async function requireOperator() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  const membership = await getCurrentMembership();
  if (!membership) throw new Error('FORBIDDEN');
  return { user, membership };
}
