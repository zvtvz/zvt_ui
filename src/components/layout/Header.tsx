'use client';

import services from '@/services';
import { toMoney, toTradePercent } from '@/utils';
import { useRequest } from 'ahooks';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Header() {
  const pathname = usePathname();
  const { data } = useRequest(services.getTimeMessage);

  const activeCls = (name: string) =>
    pathname.startsWith(name) ? '!border-[#0d6efd]' : '';
  return (
    <header className="bg-white  header sticky top-0 z-[100]">
      <div className="w-container mx-auto h-14 flex flex-row justify-between font-bold">
        <div className="text-2xl leading-14">ZVT</div>
        <div className="flex flex-row justify-end items-center h-full ">
          <div className="text-sm font-normal mr-8">{data?.message}</div>
          <div
            className={`h-full flex items-center ml-8 hover:opacity-80 cursor-pointer border-b-4 border-transparent ${activeCls(
              '/trade'
            )}`}
          >
            <Link href="/trade">交易</Link>
          </div>
          <div
            className={`h-full flex items-center ml-8 hover:opacity-80 cursor-pointer border-b-4 border-transparent ${activeCls(
              '/workspace'
            )}`}
          >
            <Link href="/workspace">工作区</Link>
          </div>
          <div
            className={`h-full flex items-center ml-8 hover:opacity-80 cursor-pointer border-b-4 border-transparent ${activeCls(
              '/data'
            )}`}
          >
            <Link href="/data">数据预览</Link>
          </div>
          <div
            className={`h-full flex items-center ml-8 hover:opacity-80 cursor-pointer border-b-4 border-transparent ${activeCls(
              '/factor'
            )}`}
          >
            <Link href="/factor">数据因子</Link>
          </div>
        </div>
      </div>
    </header>
  );
}
