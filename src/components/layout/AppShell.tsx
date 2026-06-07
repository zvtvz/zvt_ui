'use client';

import Header from '@/components/layout/Header';
import { CircularProgress } from '@mui/joy';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AUTH_PAGES = ['/login', '/register'];
const ADMIN_ONLY_PREFIXES = ['/manage', '/monitor'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, isAdmin } = useAuth();
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isAdminOnlyPage = ADMIN_ONLY_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  useEffect(() => {
    if (loading) {
      return;
    }
    if (isAuthPage && user) {
      router.replace('/trade');
      return;
    }
    if (!isAuthPage && !user) {
      const redirect = encodeURIComponent(pathname || '/trade');
      router.replace(`/login?redirect=${redirect}`);
      return;
    }
    if (user && !isAdmin && isAdminOnlyPage) {
      router.replace('/trade');
    }
  }, [loading, user, isAdmin, isAuthPage, isAdminOnlyPage, pathname, router]);

  if (isAuthPage) {
    if (loading || user) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <CircularProgress color="primary" size="md" variant="soft" />
        </div>
      );
    }
    return <>{children}</>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CircularProgress color="primary" size="md" variant="soft" />
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="my-4 w-container mx-auto mb-20">{children}</div>
    </>
  );
}
