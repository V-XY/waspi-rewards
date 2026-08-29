import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';

export async function assignCustomer(tenantId: string, customerId: string, actorUserId?: string) {
  const { data: current } = await supabaseAdmin
    .from('agent_assignments')
    .select('agent_id')
    .eq('customer_id', customerId)
    .eq('is_current', true)
    .maybeSingle();
  if (current) return current.agent_id;

  const { data: agents, error } = await supabaseAdmin
    .from('agents')
    .select('id, assignment_weight')
    .eq('tenant_id', tenantId)
    .eq('status', 'active')
    .order('created_at');
  if (error) throw error;
  if (!agents?.length) return null;

  const { data: recent } = await supabaseAdmin
    .from('agent_assignments')
    .select('agent_id')
    .eq('tenant_id', tenantId)
    .eq('is_current', true);
  const counts = new Map<string, number>();
  for (const row of recent || []) counts.set(row.agent_id, (counts.get(row.agent_id) || 0) + 1);
  const chosen = [...agents].sort((a,b) => ((counts.get(a.id)||0) / a.assignment_weight) - ((counts.get(b.id)||0) / b.assignment_weight))[0];

  const { error: insertError } = await supabaseAdmin.from('agent_assignments').insert({
    tenant_id: tenantId, customer_id: customerId, agent_id: chosen.id, reason: 'balanced', assigned_by: actorUserId || null,
  });
  if (insertError) throw insertError;
  return chosen.id;
}
