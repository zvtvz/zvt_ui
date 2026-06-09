import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

const CHINA_UTC_OFFSET_MINUTES = 8 * 60;

/** A 股连续竞价：工作日 9:25–11:30、13:00–15:00（北京时间） */
export function isAshareTradingSession(now: Date = new Date()): boolean {
  const chinaTime = dayjs.utc(now).utcOffset(CHINA_UTC_OFFSET_MINUTES);
  const weekday = chinaTime.day();
  if (weekday === 0 || weekday === 6) {
    return false;
  }

  const totalMinutes = chinaTime.hour() * 60 + chinaTime.minute();
  const morningStart = 9 * 60 + 25;
  const morningEnd = 11 * 60 + 30;
  const afternoonStart = 13 * 60;
  const afternoonEnd = 15 * 60;

  return (
    (totalMinutes >= morningStart && totalMinutes <= morningEnd) ||
    (totalMinutes >= afternoonStart && totalMinutes <= afternoonEnd)
  );
}
