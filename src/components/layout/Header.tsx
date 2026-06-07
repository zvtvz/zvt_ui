'use client';

import { useAuth } from '@/contexts/AuthContext';
import services from '@/services';
import { Button } from '@mui/joy';
import { useRequest } from 'ahooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { data } = useRequest(services.getTimeMessage, {
    ready: isAdmin,
  });

  const activeCls = (name: string) =>
    pathname.startsWith(name) ? '!border-[#0d6efd]' : '';

  const navItemClass = (name: string) =>
    `h-full flex items-center ml-8 hover:opacity-80 cursor-pointer border-b-4 border-transparent ${activeCls(name)}`;

  return (
    <header className="bg-white header sticky top-0 z-[100]">
      <div className="w-container mx-auto h-14 flex flex-row justify-between font-bold">
        <div className="text-2xl leading-14">ZVT</div>
        <div className="flex flex-row justify-end items-center h-full">
          {isAdmin ? (
            <div className="text-sm font-normal mr-8">{data?.message}</div>
          ) : null}

          <div className={navItemClass('/trade')}>
            <Link href="/trade">交易</Link>
          </div>

          {isAdmin ? (
            <>
              <div className={navItemClass('/manage')}>
                <Link href="/manage">管理</Link>
              </div>
              <div className={navItemClass('/monitor')}>
                <Link href="/monitor">监控</Link>
              </div>
            </>
          ) : null}

          {user ? (
            <div className="ml-8 flex items-center gap-3 text-sm font-normal">
              <span className="text-gray-600">{user.email}</span>
              <Button size="sm" variant="outlined" onClick={logout}>
                退出
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
