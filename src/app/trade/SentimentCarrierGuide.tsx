'use client';

import { Fragment } from 'react';
import Tooltip from '@mui/joy/Tooltip';
import { useRequest } from 'ahooks';
import services from '@/services';
import { useTradingSession } from '@/hooks/useTradingSession';
import {
  formatActiveSentimentCarrierLabel,
  getActiveSentimentCarrierStats,
  SentimentCarrierEvolutionResponse,
  SentimentCarrierSnapshot,
} from './marketStyleShared';
import SentimentCarrierTooltipContent from './SentimentCarrierTooltipContent';

const ACTIVE_CARRIER_CHIP_STYLE = {
  backgroundColor: '#fef2f2',
  color: '#dc2626',
};

const EMPTY_CARRIER_CHIP_STYLE = {
  backgroundColor: '#f5f5f5',
  color: '#a3a3a3',
};

function CarrierChipList({
  items,
  detail,
}: {
  items: SentimentCarrierSnapshot[];
  detail: 'day' | 'intraday';
}) {
  if (!items.length) {
    return <span className="text-neutral-400">暂无</span>;
  }

  return (
    <>
      {items.map((item, index) => {
        const activeStats = getActiveSentimentCarrierStats(item);
        const label = formatActiveSentimentCarrierLabel(item);
        const chipStyle = activeStats.length ? ACTIVE_CARRIER_CHIP_STYLE : EMPTY_CARRIER_CHIP_STYLE;

        return (
          <Fragment key={item.id}>
            {index > 0 ? <span className="text-neutral-400 mx-0.5">→</span> : null}
            <Tooltip
              title={<SentimentCarrierTooltipContent snapshot={item} detail={detail} />}
              variant="solid"
            >
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs leading-none cursor-default max-w-[180px] truncate"
                style={chipStyle}
              >
                {label}
              </span>
            </Tooltip>
          </Fragment>
        );
      })}
    </>
  );
}

export default function SentimentCarrierGuide() {
  const isTradingSession = useTradingSession();
  const { data } = useRequest(services.getSentimentCarrierEvolution, {
    defaultParams: [{ limit: 10 }],
    pollingInterval: isTradingSession ? 1000 * 60 : undefined,
  });

  const evolution = data as SentimentCarrierEvolutionResponse | undefined;
  const recentDays = evolution?.recent_days ?? [];
  const todayItems = evolution?.today ?? [];
  const hasCarrierEvolution = recentDays.length > 0 || todayItems.length > 0;

  if (!hasCarrierEvolution) {
    return null;
  }

  return (
    <div className="text-sm border-b pb-2 flex flex-wrap items-center gap-x-1 gap-y-1">
      <span>情绪载体：</span>
      <span className="text-neutral-500">最近10日</span>
      <CarrierChipList items={recentDays} detail="day" />
      <span className="text-neutral-300 mx-1">|</span>
      <span className="text-neutral-500">当日</span>
      <CarrierChipList items={todayItems} detail="intraday" />
    </div>
  );
}
