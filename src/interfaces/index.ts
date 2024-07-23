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
  tag: string;
  tag_reason: string;
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
