import { createInstance } from './http';

const apis = {
  getProviders: 'GET /api/data/providers',
  getSchemas: 'GET /api/data/schemas',
  getQueryData: 'GET /api/data/query_data',

  getPools: 'GET /api/work/get_stock_pool_info',
  getPoolEntities: 'GET /api/work/get_stock_pools',
  getSimpleStockTags: '/api/work/query_simple_stock_tags',
  getHistoryStockTags: '/api/work/query_stock_tags',
  getStockStats: '/api/work/query_stock_tag_stats',

  createMainTagInfo: '/api/work/create_main_tag_info',
  createSubTagInfo: '/api/work/create_sub_tag_info',
  createHiddenTagInfo: '/api/work/create_hidden_tag_info',

  getMainTagInfo: 'GET /api/work/get_main_tag_info',
  getSubTagInfo: 'GET /api/work/get_sub_tag_info',
  getHiddenTagInfo: 'GET /api/work/get_hidden_tag_info',

  updateStockTags: '/api/work/set_stock_tags',
  getStockEvents: 'GET /api/event/get_stock_event',
  getTagsStats: '/api/trading/query_tag_quotes',

  getFactors: 'GET /api/factor/get_factors',
  getKData: '/api/factor/query_kdata',
  getFactorResult: '/api/factor/query_factor_result',

  getPoolSetting: 'GET /api/trading/get_query_stock_quote_setting',
  getPoolStocksByTag: '/api/trading/query_stock_quotes',
  savePoolSetting: '/api/trading/build_query_stock_quote_setting',

  getSuggestionStats: 'GET /api/event/get_tag_suggestions_stats',
  getNewsAnalysis: 'GET /api/event/get_stock_news_analysis',
  batchUpdateStockTags: '/api/work/batch_set_stock_tags',

  buyStocks: '/api/trading/buy',
  sellStocks: '/api/trading/sell',
} as const;

const instance = createInstance<keyof typeof apis>({
  domain: 'http://10.1.16.90:8090',
  apis,
});

export default instance;
