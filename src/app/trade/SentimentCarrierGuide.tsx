'use client';

import Tooltip from '@mui/joy/Tooltip';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import services from '@/services';
import { useTradingSession } from '@/hooks/useTradingSession';
import { getDate, toPercent } from '@/utils';
import {
  getActiveSentimentCarrierStats,
  SentimentCarrierSnapshot,
} from './marketStyleShared';

function SentimentCarrierTooltip({ snapshot }: { snapshot: SentimentCarrierSnapshot }) {
  const activeStats = getActiveSentimentCarrierStats(snapshot);
  return (
    <div className="w-[220px]">
      <p>日期：{getDate(snapshot.timestamp)}</p>
      <p>时间：{snapshot.is_close ? '收盘' : dayjs(snapshot.timestamp).format('HH:mm')}</p>
      {activeStats.length ? (
        activeStats.map((stat) => (
          <p key={stat.kind}>
            {stat.label}：{stat.hit_count} / {toPercent(stat.hit_ratio, 0)}
          </p>
        ))
      ) : (
        <p>暂无成立的情绪载体</p>
      )}
      {snapshot.detection_reason ? <p>{snapshot.detection_reason}</p> : null}
    </div>
  );
}

export default function SentimentCarrierGuide() {
  const isTradingSession = useTradingSession();
  const { data } = useRequest(services.listSentimentCarriers, {
    defaultParams: [{ limit: 1 }],
    pollingInterval: isTradingSession ? 1000 * 60 : undefined,
  });

  const snapshots = (data as SentimentCarrierSnapshot[] | undefined) ?? [];
  const latest = snapshots.length ? snapshots[snapshots.length - 1] : undefined;
  if (!latest) {
    return null;
  }

  const activeStats = getActiveSentimentCarrierStats(latest);
  const activeLabel = activeStats.length
    ? activeStats.map((stat) => stat.label).join('、')
    : '暂无';

  return (
    <Tooltip title={<SentimentCarrierTooltip snapshot={latest} />} variant="solid">
      <div className="text-sm border-b pb-2 flex flex-wrap items-center gap-x-1 gap-y-1 cursor-default">
        <span>情绪载体：</span>
        <span className={activeStats.length ? 'text-red-600 font-medium' : 'text-neutral-400'}>
          {activeLabel}
        </span>
      </div>
    </Tooltip>
  );
}
