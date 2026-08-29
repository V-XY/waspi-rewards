import { NextResponse } from 'next/server';

export function jsonError(message: string, status = 400, code?: string) {
  return NextResponse.json({ error: message, ...(code ? { code } : {}) }, { status });
}

export function handleRouteError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Unexpected error';
  if (message === 'UNAUTHORIZED') return jsonError('Unauthorized', 401, message);
  if (message === 'FORBIDDEN') return jsonError('Forbidden', 403, message);
  if (message === 'TENANT_NOT_FOUND') return jsonError('Tenant not configured', 503, message);
  console.error(error);
  return jsonError('Internal server error', 500, 'INTERNAL_ERROR');
}
