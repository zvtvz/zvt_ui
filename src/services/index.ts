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
  setStockPoolPriority: '/api/stockpool/set_stock_pool_priority',

  // 主标签 CRUD
  createMainTagInfo: '/api/tag/create_main_tag_info',
  getMainTagInfo: 'GET /api/tag/get_main_tag_info',
  updateMainTagInfo: '/api/tag/update_main_tag_info',
  addActiveSubTagsToMainTag: '/api/tag/add_active_sub_tags_to_main_tag',
  setActiveSubTagsOnMainTag: '/api/tag/set_active_sub_tags_on_main_tag',
  deleteMainTagInfo: 'DELETE /api/tag/delete_main_tag_info',

  // 次标签 CRUD
  createSubTagInfo: '/api/tag/create_sub_tag_info',
  getSubTagInfo: 'GET /api/tag/get_sub_tag_info',
  updateSubTagInfo: '/api/tag/update_sub_tag_info',
  deleteSubTagInfo: 'DELETE /api/tag/delete_sub_tag_info',

  // 隐藏标签 CRUD
  createHiddenTagInfo: '/api/tag/create_hidden_tag_info',
  getHiddenTagInfo: 'GET /api/tag/get_hidden_tag_info',
  updateHiddenTagInfo: '/api/tag/update_hidden_tag_info',
  deleteHiddenTagInfo: 'DELETE /api/tag/delete_hidden_tag_info',

  // 行业/概念/地域参考数据（前端管理界面搜索用）
  getIndustryInfo: 'GET /api/tag/get_industry_info',
  getConceptInfo: 'GET /api/tag/get_concept_info',
  getAreaInfo: 'GET /api/tag/get_area_info',
  setIndustryInfoActive: '/api/tag/set_industry_info_active',
  setConceptInfoActive: '/api/tag/set_concept_info_active',
  batchSetIndustryInfoActive: '/api/tag/batch_set_industry_info_active',
  batchSetConceptInfoActive: '/api/tag/batch_set_concept_info_active',

  // 产业链目录（industry_chain）
  createIndustryChain: '/api/tag/create_industry_chain',
  getIndustryChain: 'GET /api/tag/get_industry_chain',
  updateIndustryChain: '/api/tag/update_industry_chain',
  addIndustryChainSegment: '/api/tag/add_industry_chain_segment',
  deleteIndustryChain: 'DELETE /api/tag/delete_industry_chain',
  setIndustryChainActive: '/api/tag/set_industry_chain_active',
  batchSetIndustryChainActive: '/api/tag/batch_set_industry_chain_active',

  // 初始化后台任务
  initIndustryInfo: '/api/tag/init_industry_info',
  initConceptInfo: '/api/tag/init_concept_info',
  initAreaInfo: '/api/tag/init_area_info',
  initSubTagInfoFromConcepts: '/api/tag/init_sub_tag_info_from_concepts',
  buildMainTagSubTagInfoFromIndustryChain:
    '/api/tag/build_main_tag_sub_tag_info_from_industry_chain',

  // 根据关系重建 stock_tags
  buildStockMainTagByIndustry: '/api/tag/build_stock_main_tag_by_industry',
  buildStockMainTagByConcept: '/api/tag/build_stock_main_tag_by_concept',
  buildStockMainTagBySubTag: '/api/tag/build_stock_main_tag_by_sub_tag',
  buildStockSubTagByIndustry: '/api/tag/build_stock_sub_tag_by_industry',
  buildStockSubTagByConcept: '/api/tag/build_stock_sub_tag_by_concept',
  buildStockSubTagByArea: '/api/tag/build_stock_sub_tag_by_area',
  buildStockHiddenTagByIndustry: '/api/tag/build_stock_hidden_tag_by_industry',
  buildStockHiddenTagByConcept: '/api/tag/build_stock_hidden_tag_by_concept',
  buildStockHiddenTagByArea: '/api/tag/build_stock_hidden_tag_by_area',
  buildStockIndustryChain: '/api/tag/build_stock_industry_chain',
  buildStockTagsFromIndustryChain: '/api/tag/build_stock_tags_from_industry_chain',
  listStockIndustryChain: 'GET /api/tag/list_stock_industry_chain',
  getStockIndustryChain: 'GET /api/tag/get_stock_industry_chain',
  updateStockIndustryChain: '/api/tag/update_stock_industry_chain',
  deleteStockIndustryChain: '/api/tag/delete_stock_industry_chain',
  listEntityIdsFromMainTag: '/api/tag/list_entity_ids_from_main_tag',
  sanitizeStockTagReferences: '/api/tag/sanitize_stock_tag_references',
  changeStockMainTag: '/api/tag/change_stock_main_tag',

  // 手动打标
  getStockTags: 'GET /api/tag/get_stock_tags',
  listStocks: 'GET /api/tag/list_stocks',
  getStockTagCatalogOptions: 'GET /api/tag/get_stock_tag_catalog_options',
  removeStockTag: '/api/tag/remove_stock_tag',
  updateStockTagReason: '/api/tag/update_stock_tag_reason',
  updateStockRiseReason: '/api/tag/update_stock_rise_reason',
  updateStockTags: '/api/tag/set_stock_tags',
  batchUpdateStockTags: '/api/tag/batch_set_stock_tags',

  getStockEvents: 'GET /api/event/get_stock_event',
  queryFutureEvent: 'GET /api/event/query_future_event',
  createFutureEvent: '/api/event/create_future_event',
  updateFutureEvent: '/api/event/update_future_event',
  deleteFutureEvent: '/api/event/delete_future_event',
  setFutureEventActive: '/api/event/set_future_event_active',
  discoverAndTrackFutureEvents: '/api/event/discover_and_track_future_events',
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

  // 智能体 — LLM 提供商（只读，来自 llm_providers.json）
  listLlmProviders: 'GET /api/agent/list_llm_providers',

  // 智能体 — 智能体定义 (AgentDefinition)
  initPresetAgents: '/api/agent/init_preset_agents',
  listAgents: 'GET /api/agent/list_agents',
  createAgent: '/api/agent/create_agent',
  updateAgent: '/api/agent/update_agent',
  deleteAgent: 'DELETE /api/agent/delete_agent',

  // 智能体 — 智能体活动 (AgentRunLog)
  listAgentRunLogs: 'GET /api/agent/list_run_logs',

  getTimeMessage: 'GET /api/misc/time_message',

  getPoolSetting: 'GET /api/quote/get_query_stock_quote_setting',
  savePoolSetting: '/api/quote/build_query_stock_quote_setting',
  getPoolStocksByTag: '/api/quote/query_stock_quotes',
  getTagsStats: '/api/quote/query_tag_quotes',

  getDailyQuoteStats: 'GET /api/quote/get_quote_stats',
  getMarketStyleEvolution: 'GET /api/factor/get_market_style_evolution',
  getKData: '/api/quote/query_kdata',
  getTData: '/api/quote/query_ts',
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
