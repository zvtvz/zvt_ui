'use client';

import { Fragment, useState } from 'react';
import Tooltip from '@mui/joy/Tooltip';
import Button from '@mui/joy/Button';
import { useRequest } from 'ahooks';
import services from '@/services';
import { useTradingSession } from '@/hooks/useTradingSession';
import {
  ABSTRACT_CARRIER_CHIP_STYLE,
  ABSTRACT_CARRIER_LABEL,
  getActiveSentimentCarrierStats,
  NORMAL_CARRIER_CHIP_STYLE,
  NORMAL_CARRIER_LABEL,
  SentimentCarrierEvolutionResponse,
  SentimentCarrierSnapshot,
} from './marketStyleShared';
import SentimentCarrierHistoryDialog from './SentimentCarrierHistoryDialog';
import SentimentCarrierTooltipContent from './SentimentCarrierTooltipContent';

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
        const hasActive = getActiveSentimentCarrierStats(item).length > 0;
        const label = hasActive ? ABSTRACT_CARRIER_LABEL : NORMAL_CARRIER_LABEL;
        const chipStyle = hasActive ? ABSTRACT_CARRIER_CHIP_STYLE : NORMAL_CARRIER_CHIP_STYLE;

        return (
          <Fragment key={item.id}>
            {index > 0 ? <span className="text-neutral-400 mx-0.5">→</span> : null}
            <Tooltip
              title={<SentimentCarrierTooltipContent snapshot={item} detail={detail} />}
              variant="solid"
            >
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded text-xs leading-none cursor-default"
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
  const [historyOpen, setHistoryOpen] = useState(false);
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
    <>
      <div className="text-sm border-b pb-2 flex flex-wrap items-center gap-x-1 gap-y-1">
        <span>情绪载体：</span>
        <CarrierChipList items={recentDays} detail="day" />
        <span className="text-neutral-300 mx-1">|</span>
        <span className="text-neutral-500">当日</span>
        <CarrierChipList items={todayItems} detail="intraday" />
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
      <SentimentCarrierHistoryDialog open={historyOpen} onClose={() => setHistoryOpen(false)} />
    </>
  );
}
