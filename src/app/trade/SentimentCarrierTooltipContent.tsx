'use client';

import dayjs from 'dayjs';
import { getDate, toPercent } from '@/utils';
import {
  getActiveSentimentCarrierStats,
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
  const activeStats = getActiveSentimentCarrierStats(snapshot);

  return (
    <div className="w-[220px]">
      <p>日期：{getDate(snapshot.timestamp)}</p>
      {detail === 'intraday' ? (
        <p>时间：{snapshot.is_close ? '收盘' : dayjs(snapshot.timestamp).format('HH:mm')}</p>
      ) : null}
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
