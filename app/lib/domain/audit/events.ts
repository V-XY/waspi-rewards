import 'server-only';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
export async function enqueueEvent(input:{tenantId?:string;eventType:string;aggregateType:string;aggregateId?:string;payload?:Record<string,unknown>}){const {error}=await supabaseAdmin.from('outbox_events').insert({tenant_id:input.tenantId||null,event_type:input.eventType,aggregate_type:input.aggregateType,aggregate_id:input.aggregateId||null,payload:input.payload||{}});if(error)throw error;}
