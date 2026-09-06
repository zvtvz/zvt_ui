'use client';

import Tooltip from '@mui/joy/Tooltip';
import { useRequest } from 'ahooks';
import services from '@/services';
import { getDate, toPercent } from '@/utils';

/** 与后端 MonitoredStockInfoModel 一致（监管中个股，详情来自 MonitoredStock，无需盘中刷新） */
interface MonitoredStockInfo {
  entity_id: string;
  code?: string | null;
  name?: string | null;
  monitor_start_date?: string | null;
  monitor_end_date?: string | null;
  unusual_reason?: string | null;
  market_type?: string | null;
}

/** 与后端 AbnormalStockWatchingInfoModel 一致（接近异动个股，详情来自最新 AbnormalStockWatching） */
interface AbnormalStockWatchingInfo {
  entity_id: string;
  code?: string | null;
  name?: string | null;
  days?: number | null;
  deviation_pct?: number | null;
  trigger_change_pct?: number | null;
  latest_change_pct?: number | null;
  is_triggered: boolean;
  is_predict: boolean;
  timestamp?: string | null;
}

/** 个股 chip: 与情绪载体 chip 同款实心样式(监管中 红 / 接近异动 黄) */
const MONITORING_CHIP_STYLE = { backgroundColor: '#dc2626', color: '#ffffff' };
const APPROACHING_CHIP_STYLE = { backgroundColor: '#facc15', color: '#111827' };

function MonitoredStockTooltipContent({ item }: { item: MonitoredStockInfo }) {
  return (
    <div className="w-[260px]">
      <p>
        {item.name}|{item.code}
      </p>
      <p>
        监管区间：{getDate(item.monitor_start_date)} 到 {getDate(item.monitor_end_date)}
      </p>
      {item.market_type ? <p>交易所：{item.market_type}</p> : null}
      {item.unusual_reason ? <p>监管原因：{item.unusual_reason}</p> : null}
    </div>
  );
}

function AbnormalStockWatchingTooltipContent({ item }: { item: AbnormalStockWatchingInfo }) {
  return (
    <div className="w-[260px]">
      <p>
        {item.name}|{item.code}
      </p>
      <p>交易日：{getDate(item.timestamp)}</p>
      <p>异动天数：{item.days ?? '-'}</p>
      <p>偏离值：{item.deviation_pct == null ? '-' : toPercent(item.deviation_pct)}</p>
      <p>触发涨幅：{item.trigger_change_pct == null ? '-' : toPercent(item.trigger_change_pct)}</p>
      <p>最新涨幅：{item.latest_change_pct == null ? '-' : toPercent(item.latest_change_pct)}</p>
      <p>
        状态：
        {item.is_predict ? '收盘后预测下一交易日可能触发' : item.is_triggered ? '当日已触发' : '接近触发'}
      </p>
    </div>
  );
}

function StockChip({
  label,
  style,
  tooltip,
}: {
  label: string;
  style: React.CSSProperties;
  tooltip: React.ReactNode;
}) {
  return (
    <Tooltip title={tooltip} variant="solid">
      <span
        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs leading-none cursor-default"
        style={style}
      >
        {label}
      </span>
    </Tooltip>
  );
}

export default function AbnormalMonitoringGuide() {
  // 监管中: 盘后刷新一次即可, 无需盘中轮询
  const { data: monitoredStocks } = useRequest(services.getMonitoredStocks);
  // 接近异动: 盘中 30s 刷新一次
  const { data: watchingStocks } = useRequest(services.getAbnormalStockWatching, {
    pollingInterval: 1000 * 30,
  });

  const monitoredItems = (monitoredStocks as MonitoredStockInfo[] | undefined) ?? [];
  const watchingItems = (watchingStocks as AbnormalStockWatchingInfo[] | undefined) ?? [];

  if (!monitoredItems.length && !watchingItems.length) {
    return null;
  }

  return (
    <div className="text-sm border-b pb-2 flex flex-wrap items-center gap-x-1 gap-y-1">
      {monitoredItems.length > 0 ? (
        <>
          <span>监管中：</span>
          {monitoredItems.map((item) => (
            <StockChip
              key={item.entity_id}
              label={item.name || item.code || item.entity_id}
              style={MONITORING_CHIP_STYLE}
              tooltip={<MonitoredStockTooltipContent item={item} />}
            />
          ))}
        </>
      ) : null}
      {monitoredItems.length > 0 && watchingItems.length > 0 ? (
        <span className="text-neutral-300 mx-1">|</span>
      ) : null}
      {watchingItems.length > 0 ? (
        <>
          <span>接近异动：</span>
          {watchingItems.map((item) => (
            <StockChip
              key={item.entity_id}
              label={item.name || item.code || item.entity_id}
              style={APPROACHING_CHIP_STYLE}
              tooltip={<AbnormalStockWatchingTooltipContent item={item} />}
            />
          ))}
        </>
      ) : null}
    </div>
  );
}
