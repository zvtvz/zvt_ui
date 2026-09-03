'use client';

import dayjs from 'dayjs';
import { getDate, toPercent, toTradePercent } from '@/utils';
import { MarketStyleSnapshot } from './marketStyleShared';

type DetailMode = 'day' | 'intraday';

function formatLimitUpDownCount(item: MarketStyleSnapshot): string {
  const limitUpCount = item.limit_up_count;
  const limitDownCount = item.limit_down_count;
  if (limitUpCount == null && limitDownCount == null) {
    return '-';
  }
  return `${limitUpCount ?? '-'}/${limitDownCount ?? '-'}`;
}

export default function MarketStyleTooltipContent({
  item,
  detail = 'day',
}: {
  item: MarketStyleSnapshot;
  detail?: DetailMode;
}) {
  return (
    <div className="w-[220px]">
      <p>日期：{getDate(item.timestamp)}</p>
      {detail === 'intraday' ? (
        <p>时间：{item.is_close ? '收盘' : dayjs(item.timestamp).format('HH:mm')}</p>
      ) : null}
      <p>晋级率：{toPercent(item.promotion_rate ?? 0)}</p>
      <p>小市值占比：{toPercent(item.small_cap_dominance ?? 0)}</p>
      <p>大市值占比：{toPercent(item.change_top_large_cap_ratio ?? 0)}</p>
      <p>平均涨幅：{item.change_pct == null ? '-' : toTradePercent(item.change_pct)}</p>
      <p>容量涨幅：{toTradePercent(item.turnover_top_avg_change_pct ?? 0)}</p>
      <p>涨跌停：{formatLimitUpDownCount(item)}</p>
      <p>封板率：{item.limit_up_success_rate == null ? '-' : toPercent(item.limit_up_success_rate)}</p>
      <p>最高连板：{item.max_height ?? '-'}</p>
    </div>
  );
}
