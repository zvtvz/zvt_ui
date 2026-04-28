/** 日期展示：年月日 */
export function formatFutureEventDayOnly(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/** 兑现日与「今天」相差的完整日历日数：未来为正，过去为负，同一天为 0 */
export function calendarDaysFromToday(iso: string | null | undefined): number {
  if (!iso) {
    return NaN;
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return NaN;
  }
  const dueDay = new Date(
    parsed.getFullYear(),
    parsed.getMonth(),
    parsed.getDate()
  );
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dueDay.getTime() - todayStart.getTime()) / 86400000);
}
