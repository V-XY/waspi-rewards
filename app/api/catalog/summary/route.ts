import { NextRequest, NextResponse } from 'next/server';
import { getPublicCatalog } from '@/app/lib/public/catalog';
import { handleRouteError } from '@/app/lib/http';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const tenant = new URL(request.url).searchParams.get('tenant') ?? undefined;
    return NextResponse.json(await getPublicCatalog(tenant));
  } catch (error) {
    return handleRouteError(error);
  }
}
