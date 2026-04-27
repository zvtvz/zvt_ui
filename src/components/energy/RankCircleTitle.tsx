'use client';

import TrendingDown from '@mui/icons-material/TrendingDown';
import TrendingUp from '@mui/icons-material/TrendingUp';
import type { SxProps } from '@mui/joy/styles/types';
import { Box, Typography } from '@mui/joy';

function formatRankLabel(rank: number | null | undefined): string {
  if (rank === null || rank === undefined || Number.isNaN(rank)) {
    return '—';
  }
  return String(rank);
}

type MainTagPolarity = 'positive' | 'negative' | 'both' | null;

type RankCircleTitleProps = {
  rank: number | null | undefined;
  title: string;
  /** 包在排名+标题外层的补充样式（如仅标题条背景） */
  sx?: SxProps;
  /** 带 main_tag 的热点列表由后端填；利好/利空 在标题栏展示小图标 */
  mainTagPolarity?: MainTagPolarity;
};

/**
 * 标题前展示圆圈内 rank（热点 / 跟踪事件共用）。
 */
function PolarityIcon({ polarity }: { polarity: MainTagPolarity }) {
  if (!polarity) {
    return null;
  }
  const size = { fontSize: '1.05em' };
  if (polarity === 'both') {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
          gap: 0.125,
        }}
      >
        <TrendingUp sx={{ ...size, color: 'success.500' }} aria-hidden />
        <TrendingDown sx={{ ...size, color: 'warning.700' }} aria-hidden />
      </Box>
    );
  }
  if (polarity === 'positive') {
    return <TrendingUp sx={{ ...size, flexShrink: 0, color: 'success.500' }} aria-hidden />;
  }
  if (polarity === 'negative') {
    return <TrendingDown sx={{ ...size, flexShrink: 0, color: 'warning.700' }} aria-hidden />;
  }
  return null;
}

export function RankCircleTitle(props: RankCircleTitleProps) {
  const { rank, title, sx: sxProp, mainTagPolarity } = props;
  const label = formatRankLabel(rank);
  const compactDigits = label.length > 2;

  return (
    <Box
      sx={[
        {
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          mb: 1,
          minWidth: 0,
          /** 与 `title-md` 常见字阶对齐，圆直径 = 1em，不大于标题字号 */
          fontSize: 'var(--joy-fontSize-xl, 1.125rem)',
          lineHeight: 1.33,
        },
        ...(Array.isArray(sxProp) ? sxProp : sxProp ? [sxProp] : []),
      ]}
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
      {mainTagPolarity ? <PolarityIcon polarity={mainTagPolarity} /> : null}
      <Typography
        level="title-md"
        sx={{ flex: 1, minWidth: 0, lineHeight: 'var(--joy-lineHeight-md, 1.5)' }}
      >
        {title}
      </Typography>
    </Box>
  );
}
