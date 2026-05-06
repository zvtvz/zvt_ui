'use client';

import type { ReactNode } from 'react';
import CloseRounded from '@mui/icons-material/CloseRounded';
import { Box, Button, Chip, IconButton, Stack, Typography } from '@mui/joy';

import type { MainTagInfo, Pool } from '@/interfaces';

export type TagPoolBlockKind =
  | 'positive_main'
  | 'negative_main'
  | 'positive_pool'
  | 'negative_pool';

type ChipRowProps = {
  items: string[];
  kind: TagPoolBlockKind;
  actionLoading: boolean;
  mainTagDescriptionByName?: Record<string, string | null | undefined>;
  isPoolBlock: boolean;
  onAdd: (kind: TagPoolBlockKind) => void;
  onRemove: (kind: TagPoolBlockKind, name: string) => void;
};

/**
 * 同一列内：名称 Chip + 小叉，末位「添加」。
 */
function ChipRow({
  items,
  kind,
  actionLoading,
  mainTagDescriptionByName,
  isPoolBlock,
  onAdd,
  onRemove,
}: ChipRowProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.75,
      }}
    >
      {items.map((name) => {
        const desc = !isPoolBlock
          ? mainTagDescriptionByName?.[name]?.trim()
          : null;
        const tip = desc || (isPoolBlock ? `股票池：${name}` : name);
        return (
          <Box
            key={name}
            title={tip}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.125,
              maxWidth: '100%',
              flexWrap: 'nowrap',
              verticalAlign: 'middle',
            }}
          >
            <Chip
              component="div"
              size="sm"
              variant="soft"
              color="neutral"
              sx={{
                maxWidth: 220,
                flexShrink: 1,
                minWidth: 0,
                pointerEvents: 'none',
                '& .MuiChip-label': {
                  maxWidth: 200,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }}
            >
              {name}
            </Chip>
            <IconButton
              type="button"
              size="sm"
              variant="plain"
              color="neutral"
              disabled={actionLoading}
              aria-label={`移除 ${name}`}
              sx={{
                flexShrink: 0,
                minWidth: 28,
                minHeight: 28,
                p: 0,
              }}
              onClick={(event) => {
                event.stopPropagation();
                event.preventDefault();
                onRemove(kind, name);
              }}
            >
              <CloseRounded sx={{ fontSize: 16, opacity: 0.7 }} />
            </IconButton>
          </Box>
        );
      })}
      <Button
        size="sm"
        variant="outlined"
        loading={actionLoading}
        onClick={() => onAdd(kind)}
      >
        添加
      </Button>
    </Box>
  );
}

type PolarityBlockProps = {
  polarity: '利好' | '利空';
  mainKind: 'positive_main' | 'negative_main';
  poolKind: 'positive_pool' | 'negative_pool';
  mainItems: string[];
  poolItems: string[];
} & Pick<
  ChipRowProps,
  'actionLoading' | 'mainTagDescriptionByName' | 'onAdd' | 'onRemove'
>;

function TagPoolSubBlock({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        height: '100%',
        p: 1.5,
        borderRadius: 'md',
        bgcolor: 'neutral.softBg',
        border: '1px solid',
        borderColor: 'neutral.outlinedBorder',
      }}
    >
      <Typography
        level="body-sm"
        fontWeight="lg"
        sx={{ mb: 1, color: 'text.secondary' }}
      >
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function PolarityBlock({
  polarity,
  mainKind,
  poolKind,
  mainItems,
  poolItems,
  actionLoading,
  mainTagDescriptionByName,
  onAdd,
  onRemove,
}: PolarityBlockProps) {
  return (
    <Box>
      <Typography
        level="title-md"
        component="h3"
        sx={{ mb: 1.25, fontWeight: 'lg' }}
      >
        {polarity}
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 1.5, sm: 2 },
          alignItems: 'stretch',
        }}
      >
        <TagPoolSubBlock title="主标签">
          <ChipRow
            kind={mainKind}
            items={mainItems}
            actionLoading={actionLoading}
            mainTagDescriptionByName={mainTagDescriptionByName}
            isPoolBlock={false}
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </TagPoolSubBlock>
        <TagPoolSubBlock title="股票池">
          <ChipRow
            kind={poolKind}
            items={poolItems}
            actionLoading={actionLoading}
            isPoolBlock
            onAdd={onAdd}
            onRemove={onRemove}
          />
        </TagPoolSubBlock>
      </Box>
    </Box>
  );
}

type Props = {
  actionLoading: boolean;
  positiveMainTags: string[];
  negativeMainTags: string[];
  positiveStockPools: string[];
  negativeStockPools: string[];
  mainTagDescriptionByName?: Record<string, string | null | undefined>;
  onOpenAdd: (kind: TagPoolBlockKind) => void;
  onRemove: (kind: TagPoolBlockKind, name: string) => void;
};

/**
 * 布局：利好 / 利空 两大块，每块内两列，主标签与股票池为独立浅底面板块。
 */
export function TagAndPoolFourBlocks(props: Props) {
  const {
    actionLoading,
    positiveMainTags,
    negativeMainTags,
    positiveStockPools,
    negativeStockPools,
    mainTagDescriptionByName,
    onOpenAdd,
    onRemove,
  } = props;
  return (
    <Stack spacing={0}>
      <PolarityBlock
        polarity="利好"
        mainKind="positive_main"
        poolKind="positive_pool"
        mainItems={positiveMainTags}
        poolItems={positiveStockPools}
        actionLoading={actionLoading}
        mainTagDescriptionByName={mainTagDescriptionByName}
        onAdd={onOpenAdd}
        onRemove={onRemove}
      />
      <Box className="mt-4 border-t border-neutral-200 pt-5 sm:mt-5 sm:pt-6">
        <PolarityBlock
          polarity="利空"
          mainKind="negative_main"
          poolKind="negative_pool"
          mainItems={negativeMainTags}
          poolItems={negativeStockPools}
          actionLoading={actionLoading}
          mainTagDescriptionByName={mainTagDescriptionByName}
          onAdd={onOpenAdd}
          onRemove={onRemove}
        />
      </Box>
    </Stack>
  );
}

export function titleForAddModal(kind: TagPoolBlockKind | null): string {
  if (kind === 'positive_main') {
    return '关联利好主标签';
  }
  if (kind === 'negative_main') {
    return '关联利空主标签';
  }
  if (kind === 'positive_pool') {
    return '关联利好股票池';
  }
  if (kind === 'negative_pool') {
    return '关联利空股票池';
  }
  return '';
}

export function sortMainTagsByPriorityThenName(tags: MainTagInfo[]) {
  return [...tags].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

export function poolNamesFromPools(pools: Pool[]) {
  const names = pools
    .map((pool) => pool.stock_pool_name)
    .filter((name): name is string => Boolean(name && name.trim()));
  return [...new Set(names)];
}

export function buildMainTagDescriptionMap(tags: MainTagInfo[]) {
  const map: Record<string, string | null | undefined> = {};
  for (const tag of tags) {
    map[tag.name] = tag.desc;
  }
  return map;
}
