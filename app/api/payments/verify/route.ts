import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMembership, getCurrentUser } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { audit } from '@/app/lib/domain/audit/service';
import { handleRouteError } from '@/app/lib/http';
import type { JsonObject } from '@/app/lib/types';

type Decision = 'verified' | 'failed';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('UNAUTHORIZED');

    const membership = await getCurrentMembership();
    if (!membership) throw new Error('FORBIDDEN');

    const permissions = (membership.permissions ?? {}) as JsonObject;
    if (membership.role === 'agent' && permissions['payments.verify'] !== true) throw new Error('FORBIDDEN');

    const tenant = await getDefaultTenant();
    const body = await request.json() as {
      payment_attempt_id?: unknown;
      decision?: unknown;
      received_amount?: unknown;
      evidence_path?: unknown;
    };

    const attemptId = String(body.payment_attempt_id ?? '');
    const decision = body.decision as Decision;
    if (!attemptId || !['verified', 'failed'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid payment decision' }, { status: 400 });
    }

    const { data: attempt, error } = await supabaseAdmin
      .from('payment_attempts')
      .select('*,payment_intents(*)')
      .eq('id', attemptId)
      .single();

    if (error || !attempt) return NextResponse.json({ error: 'Payment attempt not found' }, { status: 404 });

    const intent = Array.isArray(attempt.payment_intents) ? attempt.payment_intents[0] : attempt.payment_intents;
    if (!intent || intent.tenant_id !== tenant.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const receivedAmount = Number(body.received_amount ?? 0);
    if (decision === 'verified' && receivedAmount !== Number(attempt.requested_amount)) {
      return NextResponse.json({ error: 'Received amount does not match the payment intent' }, { status: 409 });
    }

    await supabaseAdmin
      .from('payment_attempts')
      .update({
        status: decision,
        received_amount: body.received_amount ? receivedAmount : null,
        evidence_path: body.evidence_path ? String(body.evidence_path) : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', attempt.id);

    await supabaseAdmin
      .from('payment_intents')
      .update({ status: decision, verified_at: decision === 'verified' ? new Date().toISOString() : null })
      .eq('id', intent.id)
      .eq('tenant_id', tenant.id);

    if (decision === 'verified') {
      await supabaseAdmin
        .from('orders')
        .update({ status: 'ready_for_activation' })
        .eq('id', intent.order_id)
        .eq('tenant_id', tenant.id);
    }

    await audit({
      tenantId: tenant.id,
      actorUserId: user.id,
      action: `payment.${decision}`,
      resourceType: 'payment_attempt',
      resourceId: attempt.id,
      after: { received_amount: receivedAmount, evidence_path: body.evidence_path ?? null },
    });

    return NextResponse.json({ ok: true, status: decision });
  } catch (error) {
    return handleRouteError(error);
  }
}
