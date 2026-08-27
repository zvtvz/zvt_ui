'use client';

import dayjs from 'dayjs';
import { getDate, toPercent } from '@/utils';
import {
  getSortedSentimentCarrierStatsForTooltip,
  SentimentCarrierSnapshot,
} from './marketStyleShared';

type DetailMode = 'day' | 'intraday';

export default function SentimentCarrierTooltipContent({
  snapshot,
  detail = 'day',
}: {
  snapshot: SentimentCarrierSnapshot;
  detail?: DetailMode;
}) {
  const stats = getSortedSentimentCarrierStatsForTooltip(snapshot);

  return (
    <div className="w-[260px]">
      <p>日期：{getDate(snapshot.timestamp)}</p>
      {detail === 'intraday' ? (
        <p>时间：{snapshot.is_close ? '收盘' : dayjs(snapshot.timestamp).format('HH:mm')}</p>
      ) : null}
      {stats.map((stat) => (
        <p key={stat.kind}>
          {stat.label}：{stat.hit_count} / {toPercent(stat.hit_ratio, 0)}
          {stat.is_active ? '（成立）' : '（未成立）'}
        </p>
      ))}
    </div>
  );
}
