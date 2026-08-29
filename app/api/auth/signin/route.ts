import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabase } from '@/app/lib/supabase/server';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
  const supabase = await createServerSupabase();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  return NextResponse.json({ user: { id: data.user.id, email: data.user.email } });
}
