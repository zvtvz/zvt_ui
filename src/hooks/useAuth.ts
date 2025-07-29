'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { TokenManager } from '@/services/http';

export const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // 不需要认证的页面
  const publicRoutes = ['/login'];

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = TokenManager.hasValidToken();
      setIsAuthenticated(authenticated);
      setIsLoading(false);

      // 如果当前页面需要认证但用户未登录，跳转到登录页
      if (!authenticated && !publicRoutes.includes(pathname)) {
        router.push('/login');
        return;
      }

      // 如果用户已登录且在登录页面，跳转到交易页面
      if (authenticated && pathname === '/login') {
        router.push('/trade');
        return;
      }
    };

    checkAuth();
  }, [pathname, router]);

  return {
    isAuthenticated,
    isLoading,
  };
};

export const useAuthRequired = () => {
  const { isAuthenticated, isLoading } = useAuth();

  return {
    isAuthenticated: isAuthenticated === true,
    isLoading,
  };
};
