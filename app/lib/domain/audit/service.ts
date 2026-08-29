import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';

export async function audit(input: {
  tenantId?: string | null;
  actorUserId?: string | null;
  action: string;
  resourceType: string;
  resourceId?: string | null;
  before?: unknown;
  after?: unknown;
  requestId?: string | null;
  correlationId?: string | null;
}) {
  await supabaseAdmin.from('audit_logs').insert({
    tenant_id: input.tenantId || null,
    actor_user_id: input.actorUserId || null,
    action: input.action,
    resource_type: input.resourceType,
    resource_id: input.resourceId || null,
    before_data: input.before ?? null,
    after_data: input.after ?? null,
    request_id: input.requestId || null,
    correlation_id: input.correlationId || null,
  });
}

export async function recordError(input: {
  tenantId?: string | null;
  severity?: 'debug'|'info'|'warning'|'error'|'critical';
  domain: string;
  component?: string;
  code?: string;
  message: string;
  stack?: string;
  requestId?: string;
  correlationId?: string;
  context?: Record<string, unknown>;
}) {
  const fingerprint = [input.domain, input.component, input.code, input.message].filter(Boolean).join(':');
  const { data: existing } = await supabaseAdmin.from('system_errors').select('id, occurrence_count').eq('fingerprint', fingerprint).is('resolved_at', null).maybeSingle();
  if (existing) {
    await supabaseAdmin.from('system_errors').update({ occurrence_count: existing.occurrence_count + 1, last_seen_at: new Date().toISOString(), context: input.context || {} }).eq('id', existing.id);
  } else {
    await supabaseAdmin.from('system_errors').insert({ ...input, tenant_id: input.tenantId || null, fingerprint });
  }
}
