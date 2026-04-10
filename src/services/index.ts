import { createInstance } from './http';

const apis = {
  getPools: 'GET /api/stockpool/get_stock_pool_info',
  getPoolEntities: 'GET /api/stockpool/get_stock_pools',
  createStockPoolInfo: '/api/stockpool/create_stock_pool_info',

  createMainTagInfo: '/api/work/create_main_tag_info',
  createSubTagInfo: '/api/work/create_sub_tag_info',
  createHiddenTagInfo: '/api/work/create_hidden_tag_info',

  getMainTagInfo: 'GET /api/work/get_main_tag_info',
  getSubTagInfo: 'GET /api/work/get_sub_tag_info',
  getHiddenTagInfo: 'GET /api/work/get_hidden_tag_info',

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
