import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, getCurrentMembership } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { audit } from '@/app/lib/domain/audit/service';
import { handleRouteError } from '@/app/lib/http';
import type { JsonObject, KycStatus } from '@/app/lib/types';

type ReviewDecision = 'approved' | 'correction_required' | 'rejected';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error('UNAUTHORIZED');

    const membership = await getCurrentMembership();
    if (!membership) throw new Error('FORBIDDEN');

    const tenant = await getDefaultTenant();
    const body = await request.json() as {
      order_id?: unknown;
      decision?: unknown;
      rejection_step?: unknown;
      rejection_reason?: unknown;
    };

    const orderId = String(body.order_id ?? '');
    const decision = body.decision as ReviewDecision;
    if (!orderId) throw new Error('ORDER_ID_REQUIRED');
    if (!['approved', 'correction_required', 'rejected'].includes(decision)) {
      return NextResponse.json({ error: 'Invalid decision' }, { status: 400 });
    }

    const permissions = (membership.permissions ?? {}) as JsonObject;
    if (membership.role === 'agent' && permissions['kyc.review'] !== true) throw new Error('FORBIDDEN');

    const status: KycStatus = decision;
    const { data: kyc, error } = await supabaseAdmin
      .from('kyc_submissions')
      .update({
        status,
        rejection_step: body.rejection_step ? String(body.rejection_step) : null,
        rejection_reason: body.rejection_reason ? String(body.rejection_reason) : null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user.id,
        approved_at: status === 'approved' ? new Date().toISOString() : null,
      })
      .eq('tenant_id', tenant.id)
      .eq('order_id', orderId)
      .select()
      .single();

    if (error) throw error;

    await supabaseAdmin
      .from('orders')
      .update({ status: status === 'approved' ? 'awaiting_payment' : 'kyc_review' })
      .eq('tenant_id', tenant.id)
      .eq('id', orderId);

    await audit({ tenantId: tenant.id, actorUserId: user.id, action: `kyc.${decision}`, resourceType: 'kyc_submission', resourceId: kyc.id, after: kyc });
    return NextResponse.json({ kyc });
  } catch (error) {
    return handleRouteError(error);
  }
}
