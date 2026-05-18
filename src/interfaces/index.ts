/** 主标签：题材/主线，含关联的次标签名称列表 */
export type MainTagInfo = {
  id: string;
  entity_id: string;
  timestamp: string;
  name: string;
  desc: string | null;
  priority: number;
  industries: string[] | null;
  concepts: string[] | null;
  areas: string[] | null;
  sub_tags: string[];
  /** 与 ``industry_chain.name`` 对应的主标签目录 */
  is_industry_chain?: boolean;
};

/** 次标签：细分方向，归属由 MainTagInfo.sub_tags 管理 */
export type SubTagInfo = {
  id: string;
  entity_id: string;
  timestamp: string;
  name: string;
  desc: string | null;
  priority: number;
  industries: string[] | null;
  concepts: string[] | null;
  areas: string[] | null;
  /** 与 ``industry_chain.segments`` 中某一环节名对应 */
  is_industry_chain_segment?: boolean;
};

/** 隐藏标签：暗线特征，与主/次标签共同起作用 */
export type HiddenTagInfo = {
  id: string;
  entity_id: string;
  timestamp: string;
  name: string;
  desc: string | null;
  priority: number;
  industries: string[] | null;
  concepts: string[] | null;
  areas: string[] | null;
};

/** 标签补偿接口返回（与后端 SanitizeStockTagReferencesResultModel 一致） */
export type SanitizeStockTagReferencesResult = {
  stocks_scanned: number;
  stocks_updated: number;
  orphan_main_tag_keys_removed: number;
  orphan_sub_tag_keys_removed: number;
  orphan_hidden_tag_keys_removed: number;
  tag_catalog_rows_updated: number;
  catalog_sub_tag_links_removed: number;
  catalog_industry_links_removed: number;
  catalog_concept_links_removed: number;
  catalog_area_links_removed: number;
};

/** 创建主标签请求体（含直接关联的次标签名称列表） */
export type CreateMainTagInfo = {
  name: string;
  desc?: string | null;
  priority?: number;
  sub_tags?: string[] | null;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
  is_industry_chain?: boolean;
};

/** 创建次标签请求体（独立创建，不指定所属主标签；归属由主标签侧管理） */
export type CreateSubTagInfo = {
  name: string;
  desc?: string | null;
  priority?: number;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
  is_industry_chain_segment?: boolean;
};

/** 创建隐藏标签请求体 */
export type CreateHiddenTagInfo = {
  name: string;
  desc?: string | null;
  priority?: number;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
};

/** 更新主标签请求体（全量更新，调用方须传入所有字段的期望值）*/
export type UpdateMainTagInfo = {
  tag_name: string;
  desc?: string | null;
  priority: number;
  sub_tags?: string[] | null;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
  is_industry_chain?: boolean;
};

/** 更新次标签请求体（全量更新，归属由主标签侧管理）*/
export type UpdateSubTagInfo = {
  tag_name: string;
  desc?: string | null;
  priority: number;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
  is_industry_chain_segment?: boolean;
};

/** 更新隐藏标签请求体（全量更新）*/
export type UpdateHiddenTagInfo = {
  tag_name: string;
  desc?: string | null;
  priority: number;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
};

export type BlockInfo = {
  id?: string;
  name: string;
  desc: string | null;
  level?: number;
  active?: boolean;
  parents?: unknown;
  entity_count?: number;
};

/** 产业链目录（与后端 ``IndustryChainModel`` 一致；``segments`` = 环节名 → 环节描述） */
export type IndustryChainInfo = {
  id: string;
  entity_id: string;
  timestamp: string;
  name: string;
  segments: Record<string, string>;
  desc: string | null;
  active: boolean;
};

export type CreateIndustryChain = {
  name: string;
  segments?: Record<string, string>;
  desc?: string | null;
};

export type UpdateIndustryChain = {
  id: string;
  name: string;
  segments: Record<string, string>;
  desc?: string | null;
  active: boolean;
};

/** ``GET /api/work/list_stock_industry_chain`` 单行（不含 ``chain_apply_payload``） */
export type StockIndustryChainListItem = {
  id: string;
  entity_id: string;
  entity_type?: string | null;
  code?: string | null;
  name?: string | null;
  industry_chain?: string | null;
  industry_segment?: string | null;
  position?: string | null;
  core_business_and_market_position?: string | null;
  pre_industry_chain?: string | null;
  pre_industry_segment?: string | null;
  pre_position?: string | null;
  pre_core_business_and_market_position?: string | null;
};

/** ``POST /api/work/build_stock_industry_chain`` 成功体 */
export type BuildStockIndustryChainResult = {
  industry_chain_id: string;
  industry_chain_name: string;
  industry_chain_active: boolean;
  segments: Record<string, string>;
  agent_exit_code: number;
  agent_standard_output_preview: string;
  agent_standard_error_preview: string;
  applied_entity_count: number;
  skipped_stock_not_in_dataset: number;
  skipped_invalid_entries: number;
  skipped_messages: string[];
};

/** ``POST /api/work/build_stock_tags_from_industry_chain`` 成功体 */
export type BuildStockTagsFromIndustryChainResult = {
  industry_chain_name: string;
  applied_entity_count: number;
  skipped_stock_not_in_dataset: number;
  skipped_invalid_entries: number;
  skipped_messages: string[];
};

export type TagType = 'main_tag' | 'sub_tag' | 'hidden_tag';

export type StockHistoryTag = {
  id: string;
  entity_id: string;
  main_tag: string;
  sub_tag: string;
  main_tag_reason: string;
  sub_tag_reason: string;
  main_tags: Record<string, string>;
  sub_tags: Record<string, string>;
  hidden_tags: Record<string, string>;
  active_hidden_tags: Record<string, string>;
};

export type GlobalTag = {
  id: string;
  name: string;
  desc: string;
};

export type TagState = {
  id: string;
  tag: string;
  reason: string;
};

export type Pool = {
  id: string;
  entity_id: string;
  stock_pool_type: string;
  stock_pool_name: string;
  active?: boolean;
  /** 关联概念名（与 concept_info / 板块概念同名）；未配置时为 null/undefined */
  related_concept?: string | null;
};

export type Stock = {
  entity_id: string;
  name: string;
  main_tag: string;
  main_tag_reason: string;
  sub_tag: string;
  sub_tag_reason: string;
  active_hidden_tags: {
    additionalProp1: string;
    additionalProp2: string;
    additionalProp3: string;
  }[];
};

/** ``GET /api/work/list_stocks`` 单行；可选 ``key``：含中文至少 2 字、否则至少 4 字符，按 code/name 子串匹配 */
export type StockListItem = {
  entity_id: string;
  code: string;
  name: string;
};

/** 热点题材 / 能量侧列表（与后端 ``StockHotTopic`` 一致） */
export type StockHotTopicItem = {
  id: string;
  entity_id: string;
  timestamp: string;
  created_timestamp?: string | null;
  rank?: number | null;
  entity_ids?: string[] | null;
  news_code?: string | null;
  news_title?: string | null;
  news_content?: string | null;
  news_analysis?: Record<string, unknown> | null;
  /** 利好主标签名称列表 */
  positive_main_tags?: string[] | null;
  /** 利空主标签名称列表 */
  negative_main_tags?: string[] | null;
  /** 利好侧股票池名称（与 `stock_pool_name` 一致） */
  positive_stock_pools?: string[] | null;
  /** 利空侧股票池名称 */
  negative_stock_pools?: string[] | null;
  /**
   * 仅列表接口带 `main_tag` 查询时由后端填写：该标签在利多/利空侧命中情况，便于分色
   *（未带参数或非列表响应时通常为空）
   */
  main_tag_polarity?: 'positive' | 'negative' | 'both' | null;
};

/** 热点 / 跟踪事件 主标签增删请求体 */
export type TagNameMutationPayload = { id: string; tag_name: string };

/** 热点 / 跟踪事件 股票池增删请求体 */
export type PoolNameMutationPayload = { id: string; pool_name: string };

/** 跟踪事件（与后端 ``FutureEvent`` 一致） */
export type FutureEventItem = {
  id: string;
  entity_id: string;
  timestamp: string;
  name: string;
  content?: string | null;
  created_timestamp?: string | null;
  trigger_date?: string | null;
  due_date?: string | null;
  rank?: number | null;
  /** 关联的唯一股票池名称 */
  related_stock_pool?: string | null;
  /** 关联的主标签名称（与主标签 name 一致） */
  related_main_tag?: string | null;
};

export type CreateFutureEventPayload = {
  name: string;
  content?: string | null;
  created_timestamp?: string | null;
  trigger_date?: string | null;
  due_date?: string | null;
  rank?: number | null;
  related_stock_pool?: string | null;
  related_main_tag?: string | null;
};

/** 创建后 ``created_timestamp`` / ``due_date`` 不可改，不在此载荷中提供 */
export type UpdateFutureEventPayload = {
  id: string;
  name?: string | null;
  content?: string | null;
  trigger_date?: string | null;
  rank?: number | null;
  /** 传 ``null`` 可清空关联股票池 */
  related_stock_pool?: string | null;
  /** 传 ``null`` 可清空关联主标签 */
  related_main_tag?: string | null;
};

export type StockItemStats = {
  id: string;
  entity_id: string;
  timestamp: number;
  main_tag: string;
  turnover: number;
  entity_count: number;
  position: number;
  is_main_line: true;
  main_line_continuous_days: number;
  entity_ids: string[];
  stock_details: {
    entity_id: string;
    name: string;
    main_tag: string;
    sub_tag: string;
    hidden_tags: string[];
    recent_reduction: true;
    recent_unlock: true;
    recent_additional_or_rights_issue: true;
  }[];
};

export type ScheduledJobInfo = {
  job_id: string;
  description: string | null;
  cron_expr: string | null;
  func_name: string | null;
  registered_at: string | null;
};

export type RecorderJobRunInfo = {
  run_id: string;
  recorder_name: string;
  status: 'running' | 'success' | 'failed' | string;
  started_at: string | null;
  finished_at: string | null;
  entities_processed: number;
  records_processed: number;
  error_message: string | null;
  duration_seconds: number | null;
};
