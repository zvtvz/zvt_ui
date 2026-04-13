import { createInstance } from './http';

const apis = {
  getPools: 'GET /api/stockpool/get_stock_pool_info',
  getPoolEntities: 'GET /api/stockpool/get_stock_pools',
  createStockPoolInfo: '/api/stockpool/create_stock_pool_info',

  // tag_info 目录管理
  createMainTagInfo: '/api/work/create_main_tag_info',
  createSubTagInfo: '/api/work/create_sub_tag_info',
  createHiddenTagInfo: '/api/work/create_hidden_tag_info',
  getMainTagInfo: 'GET /api/work/get_main_tag_info',
  getSubTagInfo: 'GET /api/work/get_sub_tag_info',
  getHiddenTagInfo: 'GET /api/work/get_hidden_tag_info',

  // 关系配置（从 tag_info 侧维护 industries/concepts/areas）
  updateTagInfoRelations: '/api/work/update_tag_info_relations',

  // 行业/概念/地域参考数据（前端管理界面搜索用）
  getIndustryInfo: 'GET /api/work/get_industry_info',
  getConceptInfo: 'GET /api/work/get_concept_info',
  getAreaInfo: 'GET /api/work/get_area_info',

  // 初始化后台任务
  initIndustryInfo: '/api/work/init_industry_info',
  initConceptInfo: '/api/work/init_concept_info',
  initAreaInfo: '/api/work/init_area_info',

  // 根据关系重建 stock_tags
  buildStockTagsFromRelations: '/api/work/build_stock_tags_from_relations',

  // 手动打标（保留）
  getStockTagOptions: 'GET /api/work/get_stock_tag_options',
  updateStockTags: '/api/work/set_stock_tags',
  batchUpdateStockTags: '/api/work/batch_set_stock_tags',

  getStockEvents: 'GET /api/event/get_stock_event',
  ignoreStockNews: '/api/event/ignore_stock_news',
  getSuggestionStats: 'GET /api/event/get_tag_suggestions_stats',
  getNewsAnalysis: 'GET /api/event/get_stock_news_analysis',
  buildTagSuggestions: '/api/event/build_tag_suggestions',

  getTimeMessage: 'GET /api/misc/time_message',

  getPoolSetting: 'GET /api/trading/get_query_stock_quote_setting',
  savePoolSetting: '/api/trading/build_query_stock_quote_setting',
  getPoolStocksByTag: '/api/trading/query_stock_quotes',
  getTagsStats: '/api/trading/query_tag_quotes',

  getDailyQuoteStats: 'GET /api/trading/get_quote_stats',
  getKData: '/api/trading/query_kdata',
  getTData: '/api/trading/query_ts',
  buyStocks: '/api/trading/buy',
  sellStocks: '/api/trading/sell',
} as const;

const instance = createInstance<keyof typeof apis>({
  apis,
});

export default instance;
