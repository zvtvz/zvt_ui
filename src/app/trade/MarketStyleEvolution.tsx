'use client';

import { Fragment, useState } from 'react';
import { Tooltip } from '@mui/joy';
import Button from '@mui/joy/Button';
import { useRequest } from 'ahooks';
import services from '@/services';
import { useTradingSession } from '@/hooks/useTradingSession';
import {
  MARKET_STYLE_VISUAL,
  MarketStyleEvolutionResponse,
  MarketStyleSnapshot,
} from './marketStyleShared';
import MarketStyleHistoryDialog from './MarketStyleHistoryDialog';
import MarketStyleTooltipContent from './MarketStyleTooltipContent';
import SentimentCarrierGuide from './SentimentCarrierGuide';

function StyleChipList({ items, detail }: { items: MarketStyleSnapshot[]; detail: 'day' | 'intraday' }) {
  if (!items.length) {
    return <span className="text-neutral-400">暂无</span>;
  }

  return (
    <>
      {items.map((item, index) => {
        const visual =
          MARKET_STYLE_VISUAL[item.market_style] ?? MARKET_STYLE_VISUAL.positive_chaos;

        return (
          <Fragment key={item.id}>
            {index > 0 ? <span className="text-neutral-400 mx-0.5">→</span> : null}
            <Tooltip
              title={<MarketStyleTooltipContent item={item} detail={detail} />}
              variant="solid"
            >
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs leading-none cursor-default"
                style={visual}
              >
                {item.market_style_label}
              </span>
            </Tooltip>
          </Fragment>
        );
      })}
    </>
  );
}

export default function MarketStyleEvolution() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const isTradingSession = useTradingSession();
  const { data } = useRequest(services.getMarketStyleEvolution, {
    defaultParams: [{ limit: 10 }],
    pollingInterval: isTradingSession ? 1000 * 60 : undefined,
  });

  const evolution = data as MarketStyleEvolutionResponse | undefined;
  const recentDays = evolution?.recent_days ?? [];
  const todayItems = evolution?.today ?? [];
  const hasStyleEvolution = recentDays.length > 0 || todayItems.length > 0;

  return (
    <>
      {hasStyleEvolution ? (
        <div className="text-sm border-b pb-2 flex flex-wrap items-center gap-x-1 gap-y-1">
          <span>风格演变：</span>
          <span className="text-neutral-500">最近10日</span>
          <StyleChipList items={recentDays} detail="day" />
          <span className="text-neutral-300 mx-1">|</span>
          <span className="text-neutral-500">当日</span>
          <StyleChipList items={todayItems} detail="intraday" />
          <Button
            size="sm"
            variant="plain"
            color="neutral"
            className="!min-h-0 !px-1.5 !py-0.5 !text-xs"
            onClick={() => setHistoryOpen(true)}
          >
            历史
          </Button>
        </div>
      ) : null}
      <SentimentCarrierGuide />
      <MarketStyleHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
