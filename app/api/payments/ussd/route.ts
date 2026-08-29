import { NextRequest, NextResponse } from 'next/server';
import { getOrderByAccessToken } from '@/app/lib/domain/customers/access';
import { createPaymentIntent, initiateManualPayment } from '@/app/lib/domain/payments/service';
import type { PaymentProviderId } from '@/app/lib/providers/payments/types';

export async function POST(request: NextRequest) {
  try {
    const { token, provider = 'mtn_momo' } = await request.json() as {
      token?: string;
      provider?: PaymentProviderId;
    };

    if (!token) return NextResponse.json({ error: 'Payment session required' }, { status: 400 });

    const order = await getOrderByAccessToken(token);
    const tenant = { id: order.tenant_id };

    if (order.status !== 'awaiting_payment') {
      return NextResponse.json({ error: 'Payment is not available yet', status: order.status }, { status: 409 });
    }

    const intent = await createPaymentIntent(tenant.id, order.id);
    const result = await initiateManualPayment(tenant.id, intent.id, provider);

    return NextResponse.json({ intent: result.intent, attempt: result.attempt, instructions: result.instructions });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment failed' },
      { status: 400 },
    );
  }
}
