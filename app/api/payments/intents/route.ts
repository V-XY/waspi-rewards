import { NextRequest, NextResponse } from 'next/server';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { getCurrentUser } from '@/app/lib/auth/session';
import { createPaymentIntent, initiateManualPayment } from '@/app/lib/domain/payments/service';
import type { PaymentProviderId } from '@/app/lib/providers/payments/types';
import { handleRouteError } from '@/app/lib/http';

export async function POST(request: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    const user = await getCurrentUser();
    const body = await request.json() as { order_id?: string; provider?: PaymentProviderId };

    if (!body.order_id) throw new Error('ORDER_ID_REQUIRED');

    const intent = await createPaymentIntent(tenant.id, body.order_id, user?.id);

    if (body.provider) {
      const result = await initiateManualPayment(tenant.id, intent.id, body.provider, user?.id);
      return NextResponse.json(result, { status: 201 });
    }

    return NextResponse.json({ intent }, { status: 201 });
  } catch (error) {
    return handleRouteError(error);
  }
}
