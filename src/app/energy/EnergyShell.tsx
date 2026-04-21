'use client';

import { createContext, useCallback, useContext, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useRequest } from 'ahooks';
import { Chip, Typography } from '@mui/joy';

import services from '@/services';
import type { MainTagInfo } from '@/interfaces';

function sortMainTagsByPriorityThenName(tags: MainTagInfo[]) {
  return [...tags].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

type EnergyMainTagContextValue = {
  selectedMainTagName: string | undefined;
  setSelectedMainTagName: (name?: string) => void;
};

const EnergyMainTagContext = createContext<EnergyMainTagContextValue | null>(
  null
);

export function useEnergyMainTagContext() {
  const value = useContext(EnergyMainTagContext);
  if (!value) {
    throw new Error('useEnergyMainTagContext must be used under EnergyShell');
  }
  return value;
}

export default function EnergyShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedMainTagName = searchParams.get('main_tag') || undefined;

  const setSelectedMainTagName = useCallback(
    (name?: string) => {
      const next = new URLSearchParams(searchParams.toString());
      if (name) {
        next.set('main_tag', name);
      } else {
        next.delete('main_tag');
      }
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [router, pathname, searchParams]
  );

  const mainTagContext = useMemo(
    () => ({ selectedMainTagName, setSelectedMainTagName }),
    [selectedMainTagName, setSelectedMainTagName]
  );

  const { data: mainTagList = [], loading: mainTagsLoading } = useRequest(
    services.getMainTagInfo
  );
  const sortedMainTags = useMemo(
    () => sortMainTagsByPriorityThenName(mainTagList as MainTagInfo[]),
    [mainTagList]
  );

  const hotHref =
    selectedMainTagName != null && selectedMainTagName !== ''
      ? `/energy?main_tag=${encodeURIComponent(selectedMainTagName)}`
      : '/energy';
  const futureHref =
    selectedMainTagName != null && selectedMainTagName !== ''
      ? `/energy/future-events?main_tag=${encodeURIComponent(selectedMainTagName)}`
      : '/energy/future-events';
  const isHotTab = pathname === '/energy' || pathname === '/energy/';
  const isFutureTab = pathname.startsWith('/energy/future-events');

  return (
    <EnergyMainTagContext.Provider value={mainTagContext}>
      <div className="pl-2 pr-2">
        <Typography level="title-md" className="mb-3">
          能量
        </Typography>
        <div className="flex flex-row justify-between my-2 mt-2 mb-3">
          <div className="flex flex-row flex-nowrap flex-grow overflow-x-auto pt-2 py-3 h-[60px] ">
            {mainTagsLoading && (
              <span className="inline-flex items-center text-[14px] text-neutral-500 pl-1">
                加载中…
              </span>
            )}
            {!mainTagsLoading &&
              sortedMainTags.map((tag) => {
                const isSelected = tag.name === selectedMainTagName;
                return (
                  <Chip
                    key={tag.id}
                    color="primary"
                    variant={isSelected ? 'solid' : 'soft'}
                    className="cursor-pointer mr-2 my-0 !px-4 flex-shrink-0"
                    size="sm"
                    sx={{
                      borderRadius: 8,
                    }}
                    onClick={() =>
                      setSelectedMainTagName(isSelected ? undefined : tag.name)
                    }
                  >
                    <div className="flex items-center py-2">
                      <div className="text-center text-[14px]">{tag.name}</div>
                    </div>
                  </Chip>
                );
              })}
          </div>
        </div>

        <div className="flex flex-row gap-1 mb-4 border-b border-neutral-200 pb-2">
          <Link
            href={hotHref}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-[14px] no-underline ${
              isHotTab
                ? 'bg-[rgba(65,109,249,.12)] font-medium text-[#416df9]'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            当前热点
          </Link>
          <Link
            href={futureHref}
            className={`inline-flex items-center rounded-md px-3 py-1.5 text-[14px] no-underline ${
              isFutureTab
                ? 'bg-[rgba(65,109,249,.12)] font-medium text-[#416df9]'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            跟踪事件
          </Link>
        </div>

        {children}
      </div>
    </EnergyMainTagContext.Provider>
  );
}
