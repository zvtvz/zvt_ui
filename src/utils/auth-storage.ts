import type { AuthUser } from '@/interfaces/auth';

import { getUserFromAccessToken } from '@/utils/jwt';

const ACCESS_TOKEN_KEY = 'zvt_access_token';
const REFRESH_TOKEN_KEY = 'zvt_refresh_token';

let cachedAccessToken: string | null | undefined;

function readStoredAccessToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  if (cachedAccessToken !== undefined) {
    return cachedAccessToken;
  }
  cachedAccessToken = readStoredAccessToken();
  return cachedAccessToken;
}

export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setAuthTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  cachedAccessToken = accessToken;
}

export function clearAuthTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  cachedAccessToken = null;
}

export function getCachedAuthUser(): AuthUser | null {
  return getUserFromAccessToken(getAccessToken());
}
