'use client';

import { Box, Typography } from '@mui/joy';

function formatRankLabel(rank: number | null | undefined): string {
  if (rank === null || rank === undefined || Number.isNaN(rank)) {
    return '—';
  }
  return String(rank);
}

type RankCircleTitleProps = {
  rank: number | null | undefined;
  title: string;
};

/**
 * 标题前展示圆圈内 rank（热点 / 跟踪事件共用）。
 */
export function RankCircleTitle(props: RankCircleTitleProps) {
  const { rank, title } = props;
  const label = formatRankLabel(rank);
  const compactDigits = label.length > 2;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        mb: 1,
        minWidth: 0,
        /** 与 `title-md` 常见字阶对齐，圆直径 = 1em，不大于标题字号 */
        fontSize: 'var(--joy-fontSize-xl, 1.125rem)',
        lineHeight: 1.33,
      }}
    >
      <Box
        aria-hidden
        sx={{
          flexShrink: 0,
          width: '1em',
          height: '1em',
          minWidth: '1em',
          minHeight: '1em',
          borderRadius: '50%',
          border: '1px solid',
          borderColor: 'primary.500',
          bgcolor: 'primary.softBg',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxSizing: 'border-box',
        }}
      >
        <Typography
          component="span"
          sx={{
            fontWeight: 'lg',
            lineHeight: 1,
            color: 'primary.700',
            /** 数字略小于外圈，保证不抢过标题字重 */
            fontSize: compactDigits ? '0.55em' : '0.62em',
          }}
        >
          {label}
        </Typography>
      </Box>
      <Typography
        level="title-md"
        sx={{ flex: 1, minWidth: 0, lineHeight: 'var(--joy-lineHeight-md, 1.5)' }}
      >
        {title}
      </Typography>
    </Box>
  );
}
