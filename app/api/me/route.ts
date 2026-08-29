import { NextResponse } from 'next/server';
import { getCurrentMembership, getCurrentUser } from '@/app/lib/auth/session';
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  const membership = await getCurrentMembership();
  return NextResponse.json({ user, membership });
}
