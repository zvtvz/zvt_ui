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

/** 次标签：归属某个主标签的细分方向 */
export type SubTagInfo = {
  id: string;
  entity_id: string;
  timestamp: string;
  name: string;
  desc: string | null;
  main_tag: string | null;
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
