'use client';

import type { ReactNode } from 'react';
import { useRequest } from 'ahooks';
import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Tooltip,
  Typography,
} from '@mui/joy';

import services from '@/services';
import type { FutureEventItem, StockHotTopicItem } from '@/interfaces';
import { hotTopicTitleRowSx } from '@/utils/hotTopicTitleRowSx';
import {
  calendarDaysFromToday,
  formatFutureEventDayOnly,
} from '@/utils/futureEventDates';
import { RankCircleTitle } from '@/components/energy/RankCircleTitle';

const dueCountDaysSx = {
  fontSize: '1.2rem',
  fontWeight: 700,
  color: 'warning.700',
  mx: 0.35,
} as const;

type Props = {
  /** 与能量页一致；交易页选中的主标签名，未选时不传以展示全量热点 */
  mainTagName?: string | null;
  /** 当前选中的股票池名称；有值时在该池关联的跟踪事件置于列表最前 */
  stockPoolName?: string | null;
  /** 标题行右侧，例如交易页侧栏的收起按钮 */
  titleEndAction?: ReactNode;
};

/**
 * 交易页「相关热点」只读区：与能量页同一数据源，无编辑/关联操作。
 * 选中股票池时，将该池关联的跟踪事件排在列表最前，并展示兑现日倒计时。
 */
export default function TradeHotTopicsPanel({
  mainTagName,
  stockPoolName,
  titleEndAction,
}: Props) {
  const poolFilter = (stockPoolName ?? '').trim();

  const { data: hotTopicRows = [], loading: loadingHot } = useRequest(
    async () => {
      const params: Record<string, string> = {};
      if (mainTagName) {
        params.main_tag = mainTagName;
      }
      return services.listStockHotTopic(params) as Promise<StockHotTopicItem[]>;
    },
    { refreshDeps: [mainTagName] }
  );

  const { data: futureRaw = [], loading: loadingFuture } = useRequest(
    async () =>
      services.queryFutureEvent({
        related_stock_pool: poolFilter,
        limit: 50,
        order_by_field: 'rank',
        order_by_type: 'asc',
      }) as Promise<FutureEventItem[]>,
    {
      refreshDeps: [poolFilter],
      ready: poolFilter.length > 0,
    }
  );

  /** 切换股票池或初次请求未完成时不展示上一池的跟踪事件，避免串池 */
  const futureRows: FutureEventItem[] = poolFilter
    ? loadingFuture
      ? []
      : futureRaw
    : [];
  const loading = loadingHot || (poolFilter.length > 0 && loadingFuture);
  const hasAnyRow = futureRows.length > 0 || hotTopicRows.length > 0;

  return (
    <Box
      className="flex h-full min-h-0 flex-col"
      sx={{ minHeight: 0, maxHeight: 'min(1000px, calc(100vh - 200px))' }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          flexShrink: 0,
          px: 1,
          py: 0.5,
          minHeight: 40,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography level="title-sm" sx={{ fontWeight: 'lg' }}>
          相关热点
        </Typography>
        {titleEndAction}
      </Box>
      <Box
        className="flex-1 min-h-0 overflow-y-auto px-1 py-1"
        sx={{ scrollbarGutter: 'stable' }}
      >
        {loading && (
          <Typography level="body-sm" color="neutral" sx={{ p: 1 }}>
            加载中…
          </Typography>
        )}
        {!loading && !hasAnyRow && (
          <Typography level="body-sm" color="neutral" sx={{ p: 1 }}>
            暂无热点
          </Typography>
        )}
        <Stack spacing={1.5}>
          {futureRows.map((row) => {
              const dueDiffDays = row.due_date
                ? calendarDaysFromToday(row.due_date)
                : NaN;
              const body = row.content?.trim() ? row.content : '—';

              return (
                <Card key={`fe-${row.id}`} size="sm" variant="outlined">
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <RankCircleTitle
                      rank={row.rank}
                      title={row.name || '无标题'}
                      sx={hotTopicTitleRowSx(null)}
                    />
                    <Divider sx={{ my: 1 }} />
                    <Tooltip
                      variant="solid"
                      title={
                        <div className="w-[300px] whitespace-pre-wrap">
                          {body}
                        </div>
                      }
                    >
                      <Typography
                        component="div"
                        level="body-sm"
                        sx={{
                          color: 'text.secondary',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          cursor: 'default',
                        }}
                      >
                        {body}
                      </Typography>
                    </Tooltip>
                    {row.due_date ? (
                      <Typography
                        component="div"
                        level="body-xs"
                        sx={{ mt: 1, color: 'neutral.700' }}
                      >
                        距离兑现日{formatFutureEventDayOnly(row.due_date)}
                        {!Number.isNaN(dueDiffDays) && dueDiffDays >= 0 && (
                          <>
                            还有
                            <Box component="span" sx={dueCountDaysSx}>
                              {dueDiffDays}
                            </Box>
                            天
                          </>
                        )}
                        {!Number.isNaN(dueDiffDays) && dueDiffDays < 0 && (
                          <>
                            已超过
                            <Box component="span" sx={dueCountDaysSx}>
                              {-dueDiffDays}
                            </Box>
                            天
                          </>
                        )}
                      </Typography>
                    ) : null}
                  </CardContent>
                </Card>
              );
          })}
          {(hotTopicRows as StockHotTopicItem[]).map((topic) => (
            <Card key={topic.id} size="sm" variant="outlined">
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                <RankCircleTitle
                  rank={topic.rank}
                  title={topic.news_title || '无标题'}
                  mainTagPolarity={topic.main_tag_polarity ?? null}
                  sx={hotTopicTitleRowSx(topic.main_tag_polarity)}
                />
                <Divider sx={{ my: 1 }} />
                <Tooltip
                  variant="solid"
                  title={
                    <div className="w-[300px] whitespace-pre-wrap">
                      {topic.news_content || '—'}
                    </div>
                  }
                >
                  <Typography
                    component="div"
                    level="body-sm"
                    sx={{
                      color: 'text.secondary',
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitBoxOrient: 'vertical',
                      WebkitLineClamp: 3,
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      cursor: 'default',
                    }}
                  >
                    {topic.news_content || '—'}
                  </Typography>
                </Tooltip>
              </CardContent>
            </Card>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
