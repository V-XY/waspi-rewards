import { NextRequest, NextResponse } from 'next/server';
import { getCurrentMembership, getCurrentUser } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { audit } from '@/app/lib/domain/audit/service';
import { handleRouteError } from '@/app/lib/http';
export async function GET(){try{const membership=await getCurrentMembership();if(!membership)throw new Error('FORBIDDEN');const tenant=await getDefaultTenant();const {data,error}=await supabaseAdmin.from('settings').select('*').eq('tenant_id',tenant.id);if(error)throw error;return NextResponse.json({settings:data||[]});}catch(e){return handleRouteError(e);}}
export async function PUT(request:NextRequest){try{const user=await getCurrentUser();if(!user)throw new Error('UNAUTHORIZED');const membership=await getCurrentMembership();if(!membership || membership.role==='agent')throw new Error('FORBIDDEN');const tenant=await getDefaultTenant();const body=await request.json();for(const [key,value] of Object.entries(body)){await supabaseAdmin.from('settings').upsert({tenant_id:tenant.id,key,value,updated_by:user.id},{onConflict:'tenant_id,key'});}await audit({tenantId:tenant.id,actorUserId:user.id,action:'settings.updated',resourceType:'tenant',resourceId:tenant.id,after:body});return NextResponse.json({ok:true});}catch(e){return handleRouteError(e);}}
