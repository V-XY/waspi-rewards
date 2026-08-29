import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/app/lib/domain/orders/service';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { getCurrentUser, getCurrentMembership } from '@/app/lib/auth/session';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { handleRouteError } from '@/app/lib/http';
import { createKycAccessSession } from '@/app/lib/domain/kyc/service';

type OrderItemInput = { productId?: unknown; product_id?: unknown; quantity?: unknown };

export async function GET(request: NextRequest) {
  try {
    const { membership } = await requireOperatorContext();
    const tenant = await getDefaultTenant();
    const limitParam = Number(new URL(request.url).searchParams.get('limit') ?? 50);
    const limit = Number.isFinite(limitParam) ? Math.min(Math.max(Math.floor(limitParam), 1), 100) : 50;

    const { data, error } = await supabaseAdmin
      .from('orders')
      .select('*, customers(*), agents(id,full_name,email), order_items(*), payment_intents(*), kyc_submissions(*), activations(*)')
      .eq('tenant_id', tenant.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return NextResponse.json({ orders: data ?? [], membership });
  } catch (error) {
    return handleRouteError(error);
  }
}

async function requireOperatorContext() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  const membership = await getCurrentMembership();
  if (!membership) throw new Error('FORBIDDEN');
  return { user, membership };
}

export async function POST(request: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    const user = await getCurrentUser();
    const idempotencyKey = request.headers.get('idempotency-key');

    if (idempotencyKey) {
      const { data: previous } = await supabaseAdmin
        .from('idempotency_keys')
        .select('response')
        .eq('tenant_id', tenant.id)
        .eq('key', idempotencyKey)
        .eq('operation', 'create_order')
        .maybeSingle();

      if (previous?.response) return NextResponse.json(previous.response);
    }

    const body = await request.json() as {
      customer?: { name?: unknown; phone?: unknown; email?: unknown; address?: unknown; landmark?: unknown };
      items?: OrderItemInput[];
      products?: OrderItemInput[];
      source?: unknown;
    };

    const rawItems = body.items ?? body.products ?? [];
    const items = rawItems.map((item) => ({
      productId: String(item.productId ?? item.product_id ?? ''),
      quantity: Number(item.quantity ?? 1),
    }));

    const result = await createOrder({
      tenantId: tenant.id,
      actorUserId: user?.id,
      customer: {
        name: String(body.customer?.name ?? ''),
        phone: String(body.customer?.phone ?? ''),
        email: body.customer?.email ? String(body.customer.email) : undefined,
        address: body.customer?.address ? String(body.customer.address) : undefined,
        landmark: body.customer?.landmark ? String(body.customer.landmark) : undefined,
      },
      items,
      source: body.source ? String(body.source) : 'website',
    });

    const kycToken = await createKycAccessSession(tenant.id, result.order.id);
    const response = {
      order: result.order,
      customer: result.customer,
      kyc_url: `/kyc/${kycToken}`,
      tracking_url: `/track/${result.trackingToken}`,
    };

    if (idempotencyKey) {
      await supabaseAdmin.from('idempotency_keys').insert({
        tenant_id: tenant.id,
        key: idempotencyKey,
        operation: 'create_order',
        response,
      });
    }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
