import { NextResponse, type NextRequest } from 'next/server';
import crypto from 'node:crypto';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  const response = NextResponse.next({ request });
  response.headers.set('x-request-id', requestId);
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '',
    { cookies: { getAll: () => request.cookies.getAll(), setAll(cookies) { cookies.forEach(({ name, value, options }) => { request.cookies.set(name, value); response.cookies.set(name, value, options); }); } } }
  );
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if (path.startsWith('/dashboard') && !user) {
    const url = request.nextUrl.clone(); url.pathname='/auth/signin'; url.searchParams.set('callbackUrl', path); return NextResponse.redirect(url);
  }
  if (path.startsWith('/api/dashboard') && !user) return NextResponse.json({ error:'Unauthorized' },{status:401});
  return response;
}

export const config = { matcher: ['/dashboard/:path*','/api/dashboard/:path*'] };
