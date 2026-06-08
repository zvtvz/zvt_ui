'use client';

import services from '@/services';
import type { AuthUser, LoginRequest, RegisterRequest } from '@/interfaces/auth';
import {
  clearAuthTokens,
  getCachedAuthUser,
  getRefreshToken,
  setAuthTokens,
} from '@/utils/auth-storage';
import { AUTH_EXPIRED_EVENT } from '@/utils/auth-refresh';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isAdmin: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  register: (payload: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshSession: () => Promise<AuthUser | null>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearAuthTokens();
      setUser(null);
      return null;
    }

    const tokenResponse = await services.refreshToken({
      refresh_token: refreshToken,
    });
    setAuthTokens(tokenResponse.access_token, tokenResponse.refresh_token);
    setUser(tokenResponse.user);
    return tokenResponse.user;
  }, []);

  const logout = useCallback(() => {
    clearAuthTokens();
    setUser(null);
    router.replace('/login');
  }, [router]);

  const login = useCallback(async (payload: LoginRequest) => {
    const tokenResponse = await services.login(payload);
    setAuthTokens(tokenResponse.access_token, tokenResponse.refresh_token);
    setUser(tokenResponse.user);
  }, []);

  const register = useCallback(async (payload: RegisterRequest) => {
    await services.register(payload);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const cachedUser = getCachedAuthUser();
      if (cachedUser) {
        if (!cancelled) {
          setUser(cachedUser);
          setLoading(false);
        }
        return;
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        await refreshSession();
      } catch {
        clearAuthTokens();
        if (!cancelled) {
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrapSession();
    return () => {
      cancelled = true;
    };
  }, [refreshSession]);

  useEffect(() => {
    const handleAuthExpired = () => {
      setUser(null);
      router.replace('/login');
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => {
      window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    };
  }, [router]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'admin',
      login,
      register,
      logout,
      refreshSession,
    }),
    [user, loading, login, register, logout, refreshSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
