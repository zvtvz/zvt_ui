/** 解析 ``预期:…; 预告:…`` 格式的业绩摘要。 */
export function parseProfitSummary(profitSummary?: string | null): {
  profitAnnounce: string;
  profitExpect: string;
} {
  const text = (profitSummary || '').trim();
  let profitAnnounce = '';
  let profitExpect = '';
  for (const part of text.split(';')) {
    const segment = part.trim();
    if (segment.startsWith('预期:')) {
      profitExpect = segment.slice('预期:'.length).trim();
    } else if (segment.startsWith('预告:')) {
      profitAnnounce = segment.slice('预告:'.length).trim();
    }
  }
  return { profitAnnounce, profitExpect };
}

/** 列表展示：预告优先，无则显示预期。 */
export function formatProfitSummaryDisplay(profitSummary?: string | null): string {
  const { profitAnnounce, profitExpect } = parseProfitSummary(profitSummary);
  if (profitAnnounce && profitExpect) {
    return `${profitAnnounce} / ${profitExpect}`;
  }
  return profitAnnounce || profitExpect || '';
}
