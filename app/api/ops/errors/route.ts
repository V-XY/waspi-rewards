import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMembership } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import type { JsonObject } from '@/app/lib/types';

export async function GET(request: NextRequest) {
  const membership = await getCurrentMembership();
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const permissions = (membership.permissions ?? {}) as JsonObject;
  if (membership.role === 'agent' && permissions['observability.read'] !== true) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tenant = await getDefaultTenant();
  const status = new URL(request.url).searchParams.get('status');
  let query = supabaseAdmin.from('system_errors').select('*').eq('tenant_id', tenant.id).order('last_seen_at', { ascending: false }).limit(200);
  if (status === 'open') query = query.is('resolved_at', null);
  if (status === 'resolved') query = query.not('resolved_at', 'is', null);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: 'Failed to load error ledger' }, { status: 500 });
  return NextResponse.json({ errors: data ?? [] });
}
