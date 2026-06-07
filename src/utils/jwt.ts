import type { AuthUser, UserRole } from '@/interfaces/auth';

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '='));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getUserFromAccessToken(token: string | null | undefined): AuthUser | null {
  if (!token) {
    return null;
  }
  const payload = decodeJwtPayload(token);
  if (!payload || payload.type !== 'access') {
    return null;
  }

  const expiresAt = payload.exp;
  if (typeof expiresAt === 'number' && Date.now() >= expiresAt * 1000) {
    return null;
  }

  const id = payload.sub;
  const email = payload.email;
  const role = payload.role;
  if (typeof id !== 'string' || typeof email !== 'string' || typeof role !== 'string') {
    return null;
  }
  if (role !== 'normal' && role !== 'admin') {
    return null;
  }

  return {
    id,
    email,
    role: role as UserRole,
  };
}
