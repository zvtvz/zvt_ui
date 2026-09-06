/**
 * 与后端 AbnormalStatusKind 一致；stock_tags.abnormal_status 存库为自由字符串，
 * 格式为 "{状态}:{详情}"，前端按前缀匹配着色。
 */
export const ABNORMAL_STATUS_MONITORING = '监管中';
export const ABNORMAL_STATUS_APPROACHING = '接近异动';
