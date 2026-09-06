'use client';

import Tooltip from '@mui/joy/Tooltip';
import { useRequest } from 'ahooks';
import services from '@/services';

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

const MONITORING_CHIP_STYLE = { backgroundColor: '#FEE2E2', color: '#991B1B' };
const APPROACHING_CHIP_STYLE = { backgroundColor: '#FEF3C7', color: '#92400E' };

function formatPct(value?: number | null): string {
  return value == null ? '-' : `${(value * 100).toFixed(2)}%`;
}

function formatDate(value?: string | null): string {
  return value ? value.slice(0, 10) : '-';
}

function MonitoredStockTooltipContent({ item }: { item: MonitoredStockInfo }) {
  return (
    <div className="max-w-[320px] text-xs leading-relaxed">
      <div className="font-bold">
        {item.name}|{item.code}
      </div>
      <div>
        监管区间：{formatDate(item.monitor_start_date)} 到 {formatDate(item.monitor_end_date)}
      </div>
      {item.market_type ? <div>交易所：{item.market_type}</div> : null}
      {item.unusual_reason ? <div>监管原因：{item.unusual_reason}</div> : null}
    </div>
  );
}

function AbnormalStockWatchingTooltipContent({ item }: { item: AbnormalStockWatchingInfo }) {
  return (
    <div className="max-w-[320px] text-xs leading-relaxed">
      <div className="font-bold">
        {item.name}|{item.code}
      </div>
      <div>
        {item.days ?? '-'}天 偏离值:{formatPct(item.deviation_pct)} 触发涨幅:
        {formatPct(item.trigger_change_pct)} 最新涨幅:{formatPct(item.latest_change_pct)}
      </div>
      <div>
        {item.is_predict
          ? '收盘后预测下一交易日可能触发'
          : item.is_triggered
            ? '当日已触发'
            : '接近触发'}
        {item.timestamp ? `（${formatDate(item.timestamp)}）` : ''}
      </div>
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
      <span>异动监控：</span>
      {monitoredItems.map((item) => (
        <StockChip
          key={item.entity_id}
          label={item.name || item.code || item.entity_id}
          style={MONITORING_CHIP_STYLE}
          tooltip={<MonitoredStockTooltipContent item={item} />}
        />
      ))}
      {monitoredItems.length > 0 && watchingItems.length > 0 ? (
        <span className="text-neutral-300 mx-1">|</span>
      ) : null}
      {watchingItems.map((item) => (
        <StockChip
          key={item.entity_id}
          label={item.name || item.code || item.entity_id}
          style={APPROACHING_CHIP_STYLE}
          tooltip={<AbnormalStockWatchingTooltipContent item={item} />}
        />
      ))}
    </div>
  );
}
