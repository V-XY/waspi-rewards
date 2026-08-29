import { NextRequest, NextResponse } from 'next/server';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { createKycAccessSession, getKycSession } from '@/app/lib/domain/kyc/service';
import { handleRouteError } from '@/app/lib/http';

export async function POST(request: NextRequest) {
  try { const tenant=await getDefaultTenant(); const {order_id}=await request.json(); const token=await createKycAccessSession(tenant.id,order_id); return NextResponse.json({token,expires_in:86400}); } catch(e){return handleRouteError(e);}
}
export async function GET(request: NextRequest) {
  try { const token=new URL(request.url).searchParams.get('token'); if(!token)return NextResponse.json({error:'Token required'},{status:400}); const session=await getKycSession(token); return NextResponse.json({session}); } catch(e){return handleRouteError(e);}
}
