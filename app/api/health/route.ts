import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/app/lib/supabase/admin';
export async function GET(){const started=Date.now();try{const {error}=await supabaseAdmin.from('tenants').select('id').limit(1);if(error)throw error;return NextResponse.json({status:'ok',database:'ok',latency_ms:Date.now()-started,timestamp:new Date().toISOString()});}catch(e){return NextResponse.json({status:'degraded',database:'error',latency_ms:Date.now()-started,error:e instanceof Error?e.message:'unknown'},{status:503});}}
