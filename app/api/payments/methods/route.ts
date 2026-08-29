import { NextRequest, NextResponse } from 'next/server';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { getOrderByAccessToken } from '@/app/lib/domain/customers/access';
import { getManualPaymentMethods } from '@/app/lib/domain/payments/service';
import { handleRouteError } from '@/app/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = new URL(request.url).searchParams.get('token');
    const tenant = token
      ? { id: (await getOrderByAccessToken(token)).tenant_id }
      : await getDefaultTenant();
    const methods = await getManualPaymentMethods(tenant.id);
    return NextResponse.json({
      methods: methods.map((method) => ({
        id: method.id,
        provider: method.provider,
        displayName: method.display_name,
        currencyCode: method.currency_code,
        hasUssd: Boolean(method.ussd_template),
        hasAccount: Boolean(method.account_number),
      })),
    });
  } catch (error) {
    return handleRouteError(error);
  }
}
