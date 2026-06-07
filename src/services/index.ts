import { createInstance } from './http';

const apis = {
  getPools: 'GET /api/stockpool/get_stock_pool_info',
  getPoolEntities: 'GET /api/stockpool/get_stock_pools',
  createStockPoolInfo: '/api/stockpool/create_stock_pool_info',
  buildStockPool: '/api/stockpool/build_stock_pool',
  removeStockPoolEntities: '/api/stockpool/remove_stock_pool_entities',
  resolveStockPoolEntities: '/api/stockpool/resolve_stock_pool_entities',
  listEntityIdsFromConcept: '/api/stockpool/list_entity_ids_from_concept',
  archiveStockPool: '/api/stockpool/archive_stock_pool',
  restoreStockPool: '/api/stockpool/restore_stock_pool',
  deleteStockPool: '/api/stockpool/delete_stock_pool',
  setStockPoolRelatedConcept: '/api/stockpool/set_stock_pool_related_concept',

  // 主标签 CRUD
  createMainTagInfo: '/api/work/create_main_tag_info',
  getMainTagInfo: 'GET /api/work/get_main_tag_info',
  updateMainTagInfo: '/api/work/update_main_tag_info',
  deleteMainTagInfo: 'DELETE /api/work/delete_main_tag_info',

  // 次标签 CRUD
  createSubTagInfo: '/api/work/create_sub_tag_info',
  getSubTagInfo: 'GET /api/work/get_sub_tag_info',
  updateSubTagInfo: '/api/work/update_sub_tag_info',
  deleteSubTagInfo: 'DELETE /api/work/delete_sub_tag_info',

  // 隐藏标签 CRUD
  createHiddenTagInfo: '/api/work/create_hidden_tag_info',
  getHiddenTagInfo: 'GET /api/work/get_hidden_tag_info',
  updateHiddenTagInfo: '/api/work/update_hidden_tag_info',
  deleteHiddenTagInfo: 'DELETE /api/work/delete_hidden_tag_info',

  // 行业/概念/地域参考数据（前端管理界面搜索用）
  getIndustryInfo: 'GET /api/work/get_industry_info',
  getConceptInfo: 'GET /api/work/get_concept_info',
  getAreaInfo: 'GET /api/work/get_area_info',
  setIndustryInfoActive: '/api/work/set_industry_info_active',
  setConceptInfoActive: '/api/work/set_concept_info_active',
  batchSetIndustryInfoActive: '/api/work/batch_set_industry_info_active',
  batchSetConceptInfoActive: '/api/work/batch_set_concept_info_active',

  // 产业链目录（industry_chain）
  createIndustryChain: '/api/work/create_industry_chain',
  getIndustryChain: 'GET /api/work/get_industry_chain',
  updateIndustryChain: '/api/work/update_industry_chain',
  addIndustryChainSegment: '/api/work/add_industry_chain_segment',
  deleteIndustryChain: 'DELETE /api/work/delete_industry_chain',
  setIndustryChainActive: '/api/work/set_industry_chain_active',
  batchSetIndustryChainActive: '/api/work/batch_set_industry_chain_active',

  // 初始化后台任务
  initIndustryInfo: '/api/work/init_industry_info',
  initConceptInfo: '/api/work/init_concept_info',
  initAreaInfo: '/api/work/init_area_info',
  initSubTagInfoFromConcepts: '/api/work/init_sub_tag_info_from_concepts',
  buildMainTagSubTagInfoFromIndustryChain:
    '/api/work/build_main_tag_sub_tag_info_from_industry_chain',

  // 根据关系重建 stock_tags
  buildStockMainTagByIndustry: '/api/work/build_stock_main_tag_by_industry',
  buildStockMainTagByConcept: '/api/work/build_stock_main_tag_by_concept',
  buildStockMainTagBySubTag: '/api/work/build_stock_main_tag_by_sub_tag',
  buildStockSubTagByIndustry: '/api/work/build_stock_sub_tag_by_industry',
  buildStockSubTagByConcept: '/api/work/build_stock_sub_tag_by_concept',
  buildStockSubTagByArea: '/api/work/build_stock_sub_tag_by_area',
  buildStockHiddenTagByIndustry: '/api/work/build_stock_hidden_tag_by_industry',
  buildStockHiddenTagByConcept: '/api/work/build_stock_hidden_tag_by_concept',
  buildStockHiddenTagByArea: '/api/work/build_stock_hidden_tag_by_area',
  buildStockIndustryChain: '/api/work/build_stock_industry_chain',
  buildStockTagsFromIndustryChain: '/api/work/build_stock_tags_from_industry_chain',
  listStockIndustryChain: 'GET /api/work/list_stock_industry_chain',
  getStockIndustryChain: 'GET /api/work/get_stock_industry_chain',
  updateStockIndustryChain: '/api/work/update_stock_industry_chain',
  deleteStockIndustryChain: '/api/work/delete_stock_industry_chain',
  listEntityIdsFromMainTag: '/api/work/list_entity_ids_from_main_tag',
  sanitizeStockTagReferences: '/api/work/sanitize_stock_tag_references',
  changeStockMainTag: '/api/work/change_stock_main_tag',

  // 手动打标
  getStockTags: 'GET /api/work/get_stock_tags',
  listStocks: 'GET /api/work/list_stocks',
  getStockTagCatalogOptions: 'GET /api/work/get_stock_tag_catalog_options',
  removeStockTag: '/api/work/remove_stock_tag',
  updateStockTagReason: '/api/work/update_stock_tag_reason',
  updateStockTags: '/api/work/set_stock_tags',
  batchUpdateStockTags: '/api/work/batch_set_stock_tags',

  getStockEvents: 'GET /api/event/get_stock_event',
  queryFutureEvent: 'GET /api/event/query_future_event',
  createFutureEvent: '/api/event/create_future_event',
  updateFutureEvent: '/api/event/update_future_event',
  deleteFutureEvent: '/api/event/delete_future_event',
  setFutureEventActive: '/api/event/set_future_event_active',
  listStockHotTopic: 'GET /api/event/list_stock_hot_topic',
  updateStockHotTopic: '/api/event/update_stock_hot_topic',
  addStockHotTopicPositiveMainTag: '/api/event/stock_hot_topic/add_positive_main_tag',
  removeStockHotTopicPositiveMainTag: '/api/event/stock_hot_topic/remove_positive_main_tag',
  addStockHotTopicNegativeMainTag: '/api/event/stock_hot_topic/add_negative_main_tag',
  removeStockHotTopicNegativeMainTag: '/api/event/stock_hot_topic/remove_negative_main_tag',
  addStockHotTopicPositiveStockPool: '/api/event/stock_hot_topic/add_positive_stock_pool',
  removeStockHotTopicPositiveStockPool: '/api/event/stock_hot_topic/remove_positive_stock_pool',
  addStockHotTopicNegativeStockPool: '/api/event/stock_hot_topic/add_negative_stock_pool',
  removeStockHotTopicNegativeStockPool: '/api/event/stock_hot_topic/remove_negative_stock_pool',
  ignoreStockNews: '/api/event/ignore_stock_news',
  getSuggestionStats: 'GET /api/event/get_tag_suggestions_stats',
  getNewsAnalysis: 'GET /api/event/get_stock_news_analysis',
  buildTagSuggestions: '/api/event/build_tag_suggestions',

  // 智能体 — 模型配置 (ModelProvider)
  listModelProviders: 'GET /api/agent/list_model_providers',
  createModelProvider: '/api/agent/create_model_provider',
  updateModelProvider: '/api/agent/update_model_provider',
  deleteModelProvider: 'DELETE /api/agent/delete_model_provider',

  // 智能体 — 智能体定义 (AgentDefinition)
  initPresetAgents: '/api/agent/init_preset_agents',
  listAgents: 'GET /api/agent/list_agents',
  createAgent: '/api/agent/create_agent',
  updateAgent: '/api/agent/update_agent',
  deleteAgent: 'DELETE /api/agent/delete_agent',

  // 智能体 — 智能体活动 (AgentRunLog)
  listAgentRunLogs: 'GET /api/agent/list_run_logs',

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

  // monitor
  listMonitorJobs: 'GET /api/monitor/jobs',
  listMonitorRuns: 'GET /api/monitor/runs',

  // sso
  login: '/api/sso/login',
  register: '/api/sso/register',
  refreshToken: '/api/sso/refresh_token',
  getMe: 'GET /api/sso/me',
  listUsers: 'GET /api/sso/list_users',
  extendUserValidity: '/api/sso/extend_user_validity',
  disableUser: '/api/sso/disable_user',
  enableUser: '/api/sso/enable_user',
  createInviteCode: '/api/sso/create_invite_code',
  listInviteCodes: 'GET /api/sso/list_invite_codes',
} as const;

const instance = createInstance<keyof typeof apis>({
  apis,
});

export default instance;
