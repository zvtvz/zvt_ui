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

/** 创建主标签请求体（含直接关联的次标签名称列表） */
export type CreateMainTagInfo = {
  name: string;
  desc?: string | null;
  priority?: number;
  sub_tags?: string[] | null;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
};

/** 创建次标签请求体（独立创建，不指定所属主标签；归属由主标签侧管理） */
export type CreateSubTagInfo = {
  name: string;
  desc?: string | null;
  priority?: number;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
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

/** 更新主标签请求体（含次标签列表替换；None 字段不修改，[] 清空）*/
export type UpdateMainTagInfo = {
  tag_name: string;
  desc?: string | null;
  priority?: number | null;
  sub_tags?: string[] | null;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
};

/** 更新次标签请求体（不含所属主标签，归属由主标签侧管理）*/
export type UpdateSubTagInfo = {
  tag_name: string;
  desc?: string | null;
  priority?: number | null;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
};

/** 更新隐藏标签请求体 */
export type UpdateHiddenTagInfo = {
  tag_name: string;
  desc?: string | null;
  priority?: number | null;
  industries?: string[] | null;
  concepts?: string[] | null;
  areas?: string[] | null;
};

export type BlockInfo = {
  name: string;
  desc: string | null;
  level?: number;
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
