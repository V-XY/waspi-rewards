import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { getDefaultTenant } from '@/app/lib/tenancy';
export async function GET(){const tenant=await getDefaultTenant();const {data,error}=await supabaseAdmin.from('pain_points').select('*').eq('tenant_id',tenant.id).eq('is_active',true).order('name');if(error)return NextResponse.json({error:'Failed to load solutions'},{status:500});return NextResponse.json({painPoints:data||[]});}
