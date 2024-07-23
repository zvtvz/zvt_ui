import dayjs from 'dayjs';

let currentIndex = 1;
export const getSimpleId = () => {
  return currentIndex++;
};

export function getDate(date?: any) {
  return dayjs(date).format('YYYY-MM-DD');
}

export function toMoney(value: number) {
  value = value || 0;
  if (value >= 10000 * 10000) {
    return (value / (10000 * 10000)).toFixed(2) + '亿';
  }

  if (value >= 10000) {
    return (value / 10000).toFixed(2) + '万';
  }

  return value;
}

export function toPercent(value: number, nx = 2) {
  return ((value || 0) * 100).toFixed(nx) + '%';
}

export function toTradePercent(value: number, nx = 2) {
  const percentText = toPercent(value, nx);
  return value > 0 ? '+' + percentText : percentText;
}
