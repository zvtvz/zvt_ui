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
  limit_down_count?: number | null;
  max_height?: number | null;
  limit_up_success_rate?: number | null;
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
