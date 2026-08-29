import { NextRequest, NextResponse } from 'next/server';
import { getOrderByAccessToken } from '@/app/lib/domain/customers/access';
export async function GET(request:NextRequest){try{const token=new URL(request.url).searchParams.get('token');if(!token)return NextResponse.json({error:'Token required'},{status:400});const order=await getOrderByAccessToken(token);return NextResponse.json({order});}catch{return NextResponse.json({error:'Invalid or expired tracking link'},{status:404});}}
