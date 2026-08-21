'use client';

import { Fragment } from 'react';
import { Tooltip } from '@mui/joy';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import services from '@/services';
import { useTradingSession } from '@/hooks/useTradingSession';
import { getDate, toPercent, toTradePercent } from '@/utils';

const MARKET_STYLE_VISUAL: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  trend: { backgroundColor: '#416df9', color: '#ffffff' },
  high_board: { backgroundColor: '#dc2626', color: '#ffffff' },
  positive_chaos: { backgroundColor: '#facc15', color: '#111827' },
  negative_chaos: { backgroundColor: '#000000', color: '#ffffff' },
};

type MarketStyleSnapshot = {
  id: string;
  timestamp: string;
  market_style: string;
  market_style_label: string;
  is_close?: boolean;
  promotion_rate?: number | null;
  small_cap_dominance?: number | null;
  turnover_top_avg_change_pct?: number | null;
  change_top_large_cap_ratio?: number | null;
  limit_down_count?: number | null;
  max_height?: number | null;
};

type MarketStyleEvolutionResponse = {
  recent_days: MarketStyleSnapshot[];
  today: MarketStyleSnapshot[];
};

function MarketStyleTooltipContent({
  item,
  showTime,
}: {
  item: MarketStyleSnapshot;
  showTime: boolean;
}) {
  const timeLabel = showTime
    ? dayjs(item.timestamp).format('HH:mm')
    : getDate(item.timestamp);

  return (
    <div className="w-[220px]">
      <p>{showTime ? '时间' : '日期'}：{timeLabel}</p>
      <p>晋级率：{toPercent(item.promotion_rate ?? 0)}</p>
      <p>小市值占比：{toPercent(item.small_cap_dominance ?? 0)}</p>
      <p>大市值占比：{toPercent(item.change_top_large_cap_ratio ?? 0)}</p>
      <p>容量涨幅：{toTradePercent(item.turnover_top_avg_change_pct ?? 0)}</p>
      <p>跌停数：{item.limit_down_count ?? '-'}</p>
      <p>最高连板：{item.max_height ?? '-'}</p>
    </div>
  );
}

function StyleChipList({
  items,
  showTime,
}: {
  items: MarketStyleSnapshot[];
  showTime: boolean;
}) {
  if (!items.length) {
    return <span className="text-neutral-400">暂无</span>;
  }

  return (
    <>
      {items.map((item, index) => {
        const visual =
          MARKET_STYLE_VISUAL[item.market_style] ??
          MARKET_STYLE_VISUAL.positive_chaos;
        const label = showTime
          ? dayjs(item.timestamp).format('HH:mm')
          : item.market_style_label;

        return (
          <Fragment key={item.id}>
            {index > 0 ? <span className="text-neutral-400 mx-0.5">→</span> : null}
            <Tooltip
              title={<MarketStyleTooltipContent item={item} showTime={showTime} />}
              variant="solid"
            >
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs leading-none cursor-default"
                style={visual}
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

export default function MarketStyleEvolution() {
  const isTradingSession = useTradingSession();
  const { data } = useRequest(services.getMarketStyleEvolution, {
    defaultParams: [{ limit: 10 }],
    pollingInterval: isTradingSession ? 1000 * 60 : undefined,
  });

  const evolution = data as MarketStyleEvolutionResponse | undefined;
  const recentDays = evolution?.recent_days ?? [];
  const todayItems = evolution?.today ?? [];

  if (!recentDays.length && !todayItems.length) {
    return null;
  }

  return (
    <div className="text-sm border-b pb-2 flex flex-wrap items-center gap-x-1 gap-y-1">
      <span>风格演变：</span>
      <span className="text-neutral-500">最近10日</span>
      <StyleChipList items={recentDays} showTime={false} />
      <span className="text-neutral-300 mx-1">|</span>
      <span className="text-neutral-500">当日</span>
      <StyleChipList items={todayItems} showTime />
    </div>
  );
}
