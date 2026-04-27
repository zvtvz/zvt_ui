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
import type { StockHotTopicItem } from '@/interfaces';
import { hotTopicTitleRowSx } from '@/utils/hotTopicTitleRowSx';
import { RankCircleTitle } from '@/components/energy/RankCircleTitle';

type Props = {
  /** 与能量页一致；交易页选中的主标签名，未选时不传以展示全量热点 */
  mainTagName?: string | null;
  /** 标题行右侧，例如交易页侧栏的收起按钮 */
  titleEndAction?: ReactNode;
};

/**
 * 交易页「相关热点」只读区：与能量页同一数据源，无编辑/关联操作。
 */
export default function TradeHotTopicsPanel({
  mainTagName,
  titleEndAction,
}: Props) {
  const { data: hotTopicRows = [], loading } = useRequest(
    async () => {
      const params: Record<string, string> = {};
      if (mainTagName) {
        params.main_tag = mainTagName;
      }
      return services.listStockHotTopic(params) as Promise<StockHotTopicItem[]>;
    },
    { refreshDeps: [mainTagName] }
  );

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
            热点加载中…
          </Typography>
        )}
        {!loading && hotTopicRows.length === 0 && (
          <Typography level="body-sm" color="neutral" sx={{ p: 1 }}>
            暂无热点
          </Typography>
        )}
        <Stack spacing={1.5}>
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
