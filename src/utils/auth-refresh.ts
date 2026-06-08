import type { TokenResponse } from '@/interfaces/auth';
import {
  clearAuthTokens,
  getRefreshToken,
  setAuthTokens,
} from '@/utils/auth-storage';

export const AUTH_EXPIRED_EVENT = 'zvt:auth-expired';

let refreshInFlight: Promise<boolean> | null = null;

export function resolveServerDomain(): string {
  let domain = process.env.NEXT_PUBLIC_SERVER as string;
  if (typeof window !== 'undefined') {
    domain = (window as any)?.SERVER_HOST || domain;
  }
  return domain;
}

export function isSsoAuthPath(url: string): boolean {
  return (
    url.startsWith('/api/sso/login') ||
    url.startsWith('/api/sso/register') ||
    url.startsWith('/api/sso/refresh_token')
  );
}

function notifyAuthExpired() {
  clearAuthTokens();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT));
  }
}

export async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      notifyAuthExpired();
      return false;
    }

    try {
      const response = await fetch(
        `${resolveServerDomain()}/api/sso/refresh_token`,
        {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        }
      );
      const payload = await response.json();
      if (!response.ok) {
        notifyAuthExpired();
        return false;
      }

      const tokenResponse = payload as TokenResponse;
      setAuthTokens(tokenResponse.access_token, tokenResponse.refresh_token);
      return true;
    } catch {
      notifyAuthExpired();
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}
