import { NextResponse } from 'next/server';
import { getCurrentMembership } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import type { JsonObject } from '@/app/lib/types';

export async function GET() {
  const membership = await getCurrentMembership();
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const permissions = (membership.permissions ?? {}) as JsonObject;
  if (membership.role === 'agent' && permissions['observability.read'] !== true) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tenant = await getDefaultTenant();
  const { data, error } = await supabaseAdmin.from('outbox_events').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }).limit(200);
  if (error) return NextResponse.json({ error: 'Failed to load event ledger' }, { status: 500 });
  return NextResponse.json({ events: data ?? [] });
}
