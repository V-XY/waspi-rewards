import 'server-only';
import { getCurrentMembership, getCurrentUser } from './session';

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  return user;
}

export async function requireTenantAccess(permission?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error('UNAUTHORIZED');
  const membership = await getCurrentMembership();
  if (!membership) throw new Error('FORBIDDEN');
  if (permission && membership.role === 'agent') {
    const permissions = (membership.permissions || {}) as Record<string, boolean>;
    if (!permissions[permission]) throw new Error('FORBIDDEN');
  }
  return { user, membership };
}
