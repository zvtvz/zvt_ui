export const MARKET_STYLE_VISUAL: Record<
  string,
  { backgroundColor: string; color: string }
> = {
  trend: { backgroundColor: '#416df9', color: '#ffffff' },
  high_board: { backgroundColor: '#dc2626', color: '#ffffff' },
  positive_chaos: { backgroundColor: '#facc15', color: '#111827' },
  negative_chaos: { backgroundColor: '#000000', color: '#ffffff' },
};

export type MarketStyleSnapshot = {
  id: string;
  timestamp: string;
  market_style: string;
  market_style_label: string;
  is_close?: boolean;
  promotion_rate?: number | null;
  small_cap_dominance?: number | null;
  turnover_top_avg_change_pct?: number | null;
  change_top_large_cap_ratio?: number | null;
  limit_up_count?: number | null;
  limit_down_count?: number | null;
  max_height?: number | null;
  limit_up_success_rate?: number | null;
  change_pct?: number | null;
};

export type MarketStyleEvolutionResponse = {
  recent_days: MarketStyleSnapshot[];
  today: MarketStyleSnapshot[];
};

export type TradingModeItem = {
  mode: string;
  label: string;
};

export type ModeGuideResponse = {
  market_style: string;
  market_style_label: string;
  primary: TradingModeItem[];
  secondary: TradingModeItem[];
  forbidden: TradingModeItem[];
  cash: boolean;
  note: string;
};

export function formatModeLabels(items: TradingModeItem[]): string {
  return items.map((item) => item.label).join('、');
}

export const SENTIMENT_CARRIER_LABELS: Record<string, string> = {
  animal_stock: '动物股',
  recent_new_stock: '次新股',
  number_stock: '数字股',
  mahjong_stock: '麻将股',
  st_stock: 'ST股',
  low_price_stock: '低价股',
  restructuring_stock: '重组并购股',
  old_dragon_stock: '老妖股',
};

export const ALL_SENTIMENT_CARRIER_KINDS = [
  'animal_stock',
  'recent_new_stock',
  'number_stock',
  'mahjong_stock',
  'st_stock',
  'low_price_stock',
  'restructuring_stock',
  'old_dragon_stock',
] as const;

export type SentimentCarrierStat = {
  kind: string;
  label: string;
  hit_count: number;
  hit_ratio: number;
  is_active: boolean;
  entity_ids?: string[];
};

export type SentimentCarrierSnapshot = {
  id: string;
  timestamp: string;
  is_close?: boolean;
  top_change_count: number;
  min_hit_threshold: number;
  active_carrier_kinds: string[];
  carrier_stats: SentimentCarrierStat[];
  detection_reason?: string | null;
};

export type SentimentCarrierEvolutionResponse = {
  recent_days: SentimentCarrierSnapshot[];
  today: SentimentCarrierSnapshot[];
};

export function getActiveSentimentCarrierStats(
  snapshot: SentimentCarrierSnapshot
): SentimentCarrierStat[] {
  const stats = snapshot.carrier_stats ?? [];
  if (stats.length) {
    return stats.filter((stat) => stat.is_active);
  }
  return (snapshot.active_carrier_kinds ?? []).map((kind) => ({
    kind,
    label: SENTIMENT_CARRIER_LABELS[kind] ?? kind,
    hit_count: 0,
    hit_ratio: 0,
    is_active: true,
    entity_ids: [],
  }));
}

export function getAllSentimentCarrierStats(snapshot: SentimentCarrierSnapshot): SentimentCarrierStat[] {
  const stats = snapshot.carrier_stats ?? [];
  if (stats.length) {
    return stats;
  }
  return (snapshot.active_carrier_kinds ?? []).map((kind) => ({
    kind,
    label: SENTIMENT_CARRIER_LABELS[kind] ?? kind,
    hit_count: 0,
    hit_ratio: 0,
    is_active: true,
    entity_ids: [],
  }));
}

/** 情绪载体 tooltip：全量 8 类，按命中比例降序。 */
export function getSortedSentimentCarrierStatsForTooltip(
  snapshot: SentimentCarrierSnapshot
): SentimentCarrierStat[] {
  const statsByKind = new Map(
    getAllSentimentCarrierStats(snapshot).map((stat) => [stat.kind, stat])
  );
  const fullStats = ALL_SENTIMENT_CARRIER_KINDS.map((kind) => {
    const existing = statsByKind.get(kind);
    if (existing) {
      return existing;
    }
    return {
      kind,
      label: SENTIMENT_CARRIER_LABELS[kind] ?? kind,
      hit_count: 0,
      hit_ratio: 0,
      is_active: false,
      entity_ids: [],
    };
  });
  return [...fullStats].sort((left, right) => {
    if (right.hit_ratio !== left.hit_ratio) {
      return right.hit_ratio - left.hit_ratio;
    }
    return left.label.localeCompare(right.label, 'zh-CN');
  });
}

export const ABSTRACT_CARRIER_CHIP_STYLE = {
  backgroundColor: '#dc2626',
  color: '#ffffff',
};

export const NORMAL_CARRIER_CHIP_STYLE = {
  backgroundColor: '#416df9',
  color: '#ffffff',
};

export const ABSTRACT_CARRIER_LABEL = '抽象';
export const NORMAL_CARRIER_LABEL = '正常';

export const SENTIMENT_CARRIER_CHIP_LABEL_MAX_LENGTH = 2;

/** chip 上最多显示 2 个字；tooltip 仍用完整载体名。 */
export function formatSentimentCarrierChipLabel(label: string): string {
  const normalized = label.trim();
  if (!normalized) {
    return normalized;
  }
  return normalized.slice(0, SENTIMENT_CARRIER_CHIP_LABEL_MAX_LENGTH);
}

/** 有成立载体时取命中比例最高者作为 chip 文案；否则「正常」。 */
export function getTopActiveSentimentCarrierChipLabel(snapshot: SentimentCarrierSnapshot): string {
  const topActive = getSortedSentimentCarrierStatsForTooltip(snapshot).find((stat) => stat.is_active);
  return topActive?.label ?? NORMAL_CARRIER_LABEL;
}
