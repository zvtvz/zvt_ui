'use client';

import { usePathname } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/joy';
import Header from './Header';
import { useAuth } from '@/hooks/useAuth';

interface ConditionalLayoutProps {
  children: ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const { isAuthenticated, isLoading } = useAuth();

  // 不需要显示Header的页面路径
  const noHeaderPages = ['/login'];

  // 不需要认证的页面路径
  const publicRoutes = ['/login'];

  const shouldShowHeader = !noHeaderPages.includes(pathname);
  const needsAuth = !publicRoutes.includes(pathname);

  // 正在检查认证状态时显示加载
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography level="body-sm">验证登录状态...</Typography>
      </Box>
    );
  }

  // 如果需要认证但用户未登录，useAuth hook会自动处理跳转
  // 这里显示跳转提示
  if (needsAuth && !isAuthenticated) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <Typography level="body-sm">正在跳转到登录页面...</Typography>
      </Box>
    );
  }

  if (!shouldShowHeader) {
    // 对于登录等页面，返回全屏布局
    return <>{children}</>;
  }

  // 对于其他页面，使用带Header的布局
  return (
    <>
      <Header />
      <div className="my-4 w-container mx-auto mb-20">{children}</div>
    </>
  );
}
