/**
 * 与后端 CapitalStructureKind 一致；前端仅允许从这些项中选择。
 * 存库仍为自由字符串，无 DB 枚举校验。
 */
export const CAPITAL_STRUCTURE_OPTIONS = [
  '趋势 1 线',
  '趋势 2 线',
  '趋势 3 线',
  '情绪容量',
  '情绪高度',
  '情绪核心',
  '情绪跟风',
  '情绪补涨',
  '情绪弹性',
] as const;

export const TREND_PREFIX = '趋势';
export const SENTIMENT_PREFIX = '情绪';
