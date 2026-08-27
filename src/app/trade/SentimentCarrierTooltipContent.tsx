'use client';

import dayjs from 'dayjs';
import { getDate, toPercent } from '@/utils';
import {
  getActiveSentimentCarrierStats,
  getAllSentimentCarrierStats,
  SentimentCarrierSnapshot,
} from './marketStyleShared';

type DetailMode = 'day' | 'intraday';

export default function SentimentCarrierTooltipContent({
  snapshot,
  detail = 'day',
  showActiveOnly = false,
}: {
  snapshot: SentimentCarrierSnapshot;
  detail?: DetailMode;
  showActiveOnly?: boolean;
}) {
  const stats = showActiveOnly
    ? getActiveSentimentCarrierStats(snapshot)
    : getAllSentimentCarrierStats(snapshot);

  return (
    <div className="w-[240px]">
      <p>日期：{getDate(snapshot.timestamp)}</p>
      {detail === 'intraday' ? (
        <p>时间：{snapshot.is_close ? '收盘' : dayjs(snapshot.timestamp).format('HH:mm')}</p>
      ) : null}
      {stats.length ? (
        stats.map((stat) => (
          <p key={stat.kind}>
            {stat.label}：{stat.hit_count} / {toPercent(stat.hit_ratio, 0)}
            {stat.is_active ? '（成立）' : '（未成立）'}
          </p>
        ))
      ) : (
        <p>暂无载体统计</p>
      )}
      {snapshot.detection_reason ? <p className="text-neutral-300">{snapshot.detection_reason}</p> : null}
    </div>
  );
}
