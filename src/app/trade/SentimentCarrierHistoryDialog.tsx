'use client';

import { useMemo, useState } from 'react';
import Button from '@mui/joy/Button';
import ButtonGroup from '@mui/joy/ButtonGroup';
import IconButton from '@mui/joy/IconButton';
import Modal from '@mui/joy/Modal';
import ModalClose from '@mui/joy/ModalClose';
import ModalDialog from '@mui/joy/ModalDialog';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import Tooltip from '@mui/joy/Tooltip';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import { useRequest } from 'ahooks';
import dayjs, { Dayjs } from 'dayjs';
import services from '@/services';
import { getDate } from '@/utils';
import {
  ABSTRACT_CARRIER_CHIP_STYLE,
  ABSTRACT_CARRIER_LABEL,
  getActiveSentimentCarrierStats,
  NORMAL_CARRIER_CHIP_STYLE,
  NORMAL_CARRIER_LABEL,
  SentimentCarrierSnapshot,
} from './marketStyleShared';
import SentimentCarrierTooltipContent from './SentimentCarrierTooltipContent';

type HistoryMode = 'month' | 'recent';

type Props = {
  open: boolean;
  onClose: () => void;
};

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

function buildCarriersByDate(items: SentimentCarrierSnapshot[] | undefined) {
  const map = new Map<string, SentimentCarrierSnapshot>();
  for (const item of items ?? []) {
    const dateKey = getDate(item.timestamp);
    const existing = map.get(dateKey);
    if (!existing || item.is_close) {
      map.set(dateKey, item);
    }
  }
  return map;
}

function buildMonthCells(month: Dayjs) {
  const monthStart = month.startOf('month');
  const offset = (monthStart.day() + 6) % 7;
  let cursor = monthStart.subtract(offset, 'day');
  const cells: Dayjs[] = [];
  for (let index = 0; index < 42; index += 1) {
    cells.push(cursor);
    cursor = cursor.add(1, 'day');
  }
  return cells;
}

function buildRecentDays() {
  const end = dayjs().startOf('day');
  const start = end.subtract(29, 'day');
  const days: Dayjs[] = [];
  let cursor = start;
  while (!cursor.isAfter(end)) {
    days.push(cursor);
    cursor = cursor.add(1, 'day');
  }
  return days;
}

function CarrierDayCell({
  day,
  item,
  muted,
}: {
  day: Dayjs;
  item?: SentimentCarrierSnapshot;
  muted?: boolean;
}) {
  const activeStats = item ? getActiveSentimentCarrierStats(item) : [];
  const hasActive = activeStats.length > 0;
  const label = item ? (hasActive ? ABSTRACT_CARRIER_LABEL : NORMAL_CARRIER_LABEL) : null;
  const chipStyle = hasActive ? ABSTRACT_CARRIER_CHIP_STYLE : NORMAL_CARRIER_CHIP_STYLE;

  const content = (
    <div
      className={`min-h-[72px] rounded border p-1 flex flex-col ${
        muted ? 'bg-neutral-50 text-neutral-400 border-neutral-100' : 'border-neutral-200'
      }`}
    >
      <div className="text-xs mb-1">{day.format('D')}</div>
      {item && label ? (
        <span
          className="inline-flex items-center justify-center px-1 py-0.5 rounded text-[11px] leading-none max-w-full truncate"
          style={chipStyle}
        >
          {label}
        </span>
      ) : (
        <span className="text-[11px] text-neutral-300">-</span>
      )}
    </div>
  );

  if (!item) {
    return content;
  }

  return (
    <Tooltip
      title={
        <SentimentCarrierTooltipContent
          snapshot={item}
          detail="day"
          showActiveOnly={hasActive}
        />
      }
      variant="solid"
    >
      {content}
    </Tooltip>
  );
}

export default function SentimentCarrierHistoryDialog({ open, onClose }: Props) {
  const [mode, setMode] = useState<HistoryMode>('recent');
  const [month, setMonth] = useState(() => dayjs().startOf('month'));

  const range = useMemo(() => {
    if (mode === 'recent') {
      const end = dayjs();
      return {
        start_date: end.subtract(29, 'day').format('YYYY-MM-DD'),
        end_date: end.format('YYYY-MM-DD'),
      };
    }
    return {
      start_date: month.startOf('month').format('YYYY-MM-DD'),
      end_date: month.endOf('month').format('YYYY-MM-DD'),
    };
  }, [mode, month]);

  const { data, loading } = useRequest(
    () =>
      services.listSentimentCarriers({
        start_date: range.start_date,
        end_date: range.end_date,
        is_close: true,
      }),
    {
      ready: open,
      refreshDeps: [range.start_date, range.end_date, open],
    }
  );

  const carriersByDate = useMemo(
    () => buildCarriersByDate(data as SentimentCarrierSnapshot[]),
    [data]
  );
  const monthCells = useMemo(() => buildMonthCells(month), [month]);
  const recentDays = useMemo(() => buildRecentDays(), []);

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog className="!max-w-[760px] !w-[92vw]" size="lg">
        <ModalClose />
        <DialogTitle>情绪载体历史</DialogTitle>
        <DialogContent>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <ButtonGroup size="sm" variant="outlined">
              <Button
                variant={mode === 'recent' ? 'solid' : 'outlined'}
                onClick={() => setMode('recent')}
              >
                最近一个月
              </Button>
              <Button
                variant={mode === 'month' ? 'solid' : 'outlined'}
                onClick={() => setMode('month')}
              >
                按月
              </Button>
            </ButtonGroup>
            {mode === 'month' ? (
              <div className="flex items-center gap-1">
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => setMonth((current) => current.subtract(1, 'month'))}
                >
                  <ChevronLeft fontSize="small" />
                </IconButton>
                <span className="text-sm min-w-[96px] text-center">{month.format('YYYY年M月')}</span>
                <IconButton
                  size="sm"
                  variant="plain"
                  onClick={() => setMonth((current) => current.add(1, 'month'))}
                >
                  <ChevronRight fontSize="small" />
                </IconButton>
              </div>
            ) : (
              <span className="text-sm text-neutral-500">
                {range.start_date} ~ {range.end_date}
              </span>
            )}
          </div>

          {loading ? <div className="text-sm text-neutral-500 py-8 text-center">加载中...</div> : null}

          {!loading && mode === 'month' ? (
            <>
              <div className="grid grid-cols-7 gap-1 mb-1">
                {WEEKDAY_LABELS.map((label) => (
                  <div key={label} className="text-center text-xs text-neutral-500 py-1">
                    {label}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthCells.map((day) => {
                  const dateKey = day.format('YYYY-MM-DD');
                  const inMonth = day.month() === month.month();
                  return (
                    <CarrierDayCell
                      key={dateKey}
                      day={day}
                      item={carriersByDate.get(dateKey)}
                      muted={!inMonth}
                    />
                  );
                })}
              </div>
            </>
          ) : null}

          {!loading && mode === 'recent' ? (
            <div className="grid grid-cols-7 gap-1">
              {recentDays.map((day) => {
                const dateKey = day.format('YYYY-MM-DD');
                return (
                  <CarrierDayCell
                    key={dateKey}
                    day={day}
                    item={carriersByDate.get(dateKey)}
                  />
                );
              })}
            </div>
          ) : null}
        </DialogContent>
      </ModalDialog>
    </Modal>
  );
}
