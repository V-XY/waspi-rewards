import { NextResponse } from 'next/server';
import { getCurrentMembership } from '@/app/lib/auth/session';
import { getDefaultTenant } from '@/app/lib/tenancy';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
import { handleRouteError } from '@/app/lib/http';
export async function GET(){try{const membership=await getCurrentMembership();if(!membership)throw new Error('FORBIDDEN');const tenant=await getDefaultTenant();const today=new Date();today.setHours(0,0,0,0);const week=new Date(Date.now()-7*86400000);const month=new Date(Date.now()-30*86400000);const [{count:todayActivations},{count:weeklyActivations},{count:pendingKyc},{count:pendingPayments},{data:commissions},{data:recentOrders}]=await Promise.all([
 supabaseAdmin.from('activations').select('*',{count:'exact',head:true}).eq('tenant_id',tenant.id).eq('status','active').gte('completed_at',today.toISOString()),
 supabaseAdmin.from('activations').select('*',{count:'exact',head:true}).eq('tenant_id',tenant.id).eq('status','active').gte('completed_at',week.toISOString()),
 supabaseAdmin.from('kyc_submissions').select('*',{count:'exact',head:true}).eq('tenant_id',tenant.id).in('status',['submitted','manual_review','correction_required']),
 supabaseAdmin.from('payment_intents').select('*',{count:'exact',head:true}).eq('tenant_id',tenant.id).in('status',['pending','processing','submitted']),
 supabaseAdmin.from('commissions').select('amount').eq('tenant_id',tenant.id).eq('status','paid').gte('payout_date',month.toISOString()),
 supabaseAdmin.from('orders').select('*,customers(*),order_items(*)').eq('tenant_id',tenant.id).order('created_at',{ascending:false}).limit(5)
 ]);const monthly=(commissions||[]).reduce((s,c)=>s+Number(c.amount||0),0);return NextResponse.json({stats:{today_activations:todayActivations||0,daily_goal:5,weekly_activations:weeklyActivations||0,monthly_commissions:monthly,pending_kyc:pendingKyc||0,pending_payments:pendingPayments||0,active_leads:(pendingKyc||0)+(pendingPayments||0),conversion_rate:0,recent_orders:recentOrders||[]}});}catch(e){return handleRouteError(e);}}
