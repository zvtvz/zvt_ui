'use client';

/** 交易页暂改为显示情绪载体，本组件暂未挂载。 */

import Tooltip from '@mui/joy/Tooltip';
import { useRequest } from 'ahooks';
import services from '@/services';
import { useTradingSession } from '@/hooks/useTradingSession';
import { formatModeLabels, ModeGuideResponse } from './marketStyleShared';

function ModeGuideSegment({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  if (!value) {
    return null;
  }
  return (
    <>
      <span className="text-neutral-500">{label}</span>
      <span className={className ?? 'text-neutral-800'}>{value}</span>
    </>
  );
}

export default function MarketModeGuide() {
  const isTradingSession = useTradingSession();
  const { data } = useRequest(services.getModeGuide, {
    pollingInterval: isTradingSession ? 1000 * 60 : undefined,
  });

  const guide = data as ModeGuideResponse | undefined | null;
  if (!guide) {
    return null;
  }

  const primaryLabel = guide.cash
    ? '空仓'
    : formatModeLabels(guide.primary);
  const secondaryLabel = formatModeLabels(guide.secondary);
  const forbiddenLabel = formatModeLabels(guide.forbidden);

  return (
    <Tooltip title={guide.note} variant="solid">
      <div className="text-sm border-b pb-2 flex flex-wrap items-center gap-x-1 gap-y-1 cursor-default">
        <span>今日战法：</span>
        <ModeGuideSegment label="主战 " value={primaryLabel} className="text-red-600 font-medium" />
        {secondaryLabel ? <span className="text-neutral-300 mx-1">|</span> : null}
        <ModeGuideSegment label="可做 " value={secondaryLabel} />
        {forbiddenLabel ? <span className="text-neutral-300 mx-1">|</span> : null}
        <ModeGuideSegment label="别碰 " value={forbiddenLabel} className="text-neutral-400" />
      </div>
    </Tooltip>
  );
}
