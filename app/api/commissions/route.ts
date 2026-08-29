import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMembership } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { handleRouteError } from '@/app/lib/http';
export async function GET(request:NextRequest){try{const m=await getCurrentMembership();if(!m)throw new Error('FORBIDDEN');const t=await getDefaultTenant();const params=new URL(request.url).searchParams;let q=supabaseAdmin.from('commissions').select('*').eq('tenant_id',t.id).order('created_at',{ascending:false});const status=params.get('status');if(status)q=q.eq('status',status);const {data,error}=await q;if(error)throw error;return NextResponse.json({commissions:data||[]});}catch(e){return handleRouteError(e);}}
