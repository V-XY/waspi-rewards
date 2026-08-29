import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMembership } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import type { JsonObject } from '@/app/lib/types';

export async function GET(request: NextRequest) {
  const membership = await getCurrentMembership();
  if (!membership) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const permissions = (membership.permissions ?? {}) as JsonObject;
  if (membership.role === 'agent' && permissions['audit.read'] !== true) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tenant = await getDefaultTenant();
  const value = Number(new URL(request.url).searchParams.get('limit') ?? 100);
  const limit = Number.isFinite(value) ? Math.min(Math.max(Math.floor(value), 1), 500) : 100;

  const { data, error } = await supabaseAdmin.from('audit_logs').select('*').eq('tenant_id', tenant.id).order('created_at', { ascending: false }).limit(limit);
  if (error) return NextResponse.json({ error: 'Failed to load audit ledger' }, { status: 500 });
  return NextResponse.json({ entries: data ?? [] });
}
