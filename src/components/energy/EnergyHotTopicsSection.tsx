'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { Card, CardContent, Divider, Stack, Typography } from '@mui/joy';

import services from '@/services';
import type { MainTagInfo, Pool, StockHotTopicItem } from '@/interfaces';
import { hotTopicTitleRowSx } from '@/utils/hotTopicTitleRowSx';
import { RankCircleTitle } from '@/components/energy/RankCircleTitle';
import {
  buildMainTagDescriptionMap,
  poolNamesFromPools,
  TagAndPoolFourBlocks,
  type TagPoolBlockKind,
  titleForAddModal,
} from '@/components/energy/TagAndPoolFourBlocks';
import TagPoolRelationAddDialog from '@/components/energy/TagPoolRelationAddDialog';

export function EnergyHotTopicsSection() {
  const { data: mainTagList = [] } = useRequest(services.getMainTagInfo);
  const { data: poolList = [] } = useRequest(services.getPools);
  const mainTagsInApiOrder = useMemo(
    () => (Array.isArray(mainTagList) ? mainTagList : []) as MainTagInfo[],
    [mainTagList]
  );
  const mainTagDescriptionByName = useMemo(
    () => buildMainTagDescriptionMap(mainTagList as MainTagInfo[]),
    [mainTagList]
  );
  const poolNameCandidates = useMemo(
    () => poolNamesFromPools(poolList as Pool[]),
    [poolList]
  );

  const {
    data: hotTopicRows = [],
    loading: hotTopicsLoading,
    refresh: refreshHotTopics,
  } = useRequest(async () =>
    services.listStockHotTopic({}) as Promise<StockHotTopicItem[]>
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addKind, setAddKind] = useState<TagPoolBlockKind | null>(null);
  const [addTopicId, setAddTopicId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const addTopic = useMemo(
    () =>
      (hotTopicRows as StockHotTopicItem[]).find((row) => row.id === addTopicId) ||
      null,
    [hotTopicRows, addTopicId]
  );

  const addTagCandidates = useMemo(() => {
    if (!addKind || !addTopic) {
      return [];
    }
    if (addKind !== 'positive_main' && addKind !== 'negative_main') {
      return [];
    }
    const current =
      addKind === 'positive_main'
        ? new Set(addTopic.positive_main_tags || [])
        : new Set(addTopic.negative_main_tags || []);
    return mainTagsInApiOrder.filter((tag) => !current.has(tag.name));
  }, [addKind, addTopic, mainTagsInApiOrder]);

  const addPoolNameCandidates = useMemo(() => {
    if (!addKind || !addTopic) {
      return [];
    }
    if (addKind !== 'positive_pool' && addKind !== 'negative_pool') {
      return [];
    }
    const current =
      addKind === 'positive_pool'
        ? new Set(addTopic.positive_stock_pools || [])
        : new Set(addTopic.negative_stock_pools || []);
    return poolNameCandidates.filter((poolName) => !current.has(poolName));
  }, [addKind, addTopic, poolNameCandidates]);

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false);
    setAddKind(null);
    setAddTopicId(null);
  }, []);

  const runRefresh = useCallback(async () => {
    await refreshHotTopics();
  }, [refreshHotTopics]);

  const handleAddBatch = useCallback(
    async (names: string[]) => {
      if (!addKind || !addTopicId || names.length === 0) {
        return;
      }
      setActionLoading(true);
      try {
        const id = addTopicId;
        for (const name of names) {
          if (addKind === 'positive_main') {
            await services.addStockHotTopicPositiveMainTag({ id, tag_name: name });
          } else if (addKind === 'negative_main') {
            await services.addStockHotTopicNegativeMainTag({ id, tag_name: name });
          } else if (addKind === 'positive_pool') {
            await services.addStockHotTopicPositiveStockPool({ id, pool_name: name });
          } else {
            await services.addStockHotTopicNegativeStockPool({ id, pool_name: name });
          }
        }
        await runRefresh();
        closeAddModal();
      } finally {
        setActionLoading(false);
      }
    },
    [addKind, addTopicId, runRefresh, closeAddModal]
  );

  return (
    <>
      {hotTopicsLoading && (
        <Typography level="body-sm" sx={{ mb: 2 }}>
          热点加载中…
        </Typography>
      )}
      {!hotTopicsLoading && hotTopicRows.length === 0 && (
        <Typography level="body-sm" color="neutral">
          暂无热点
        </Typography>
      )}
      <Stack spacing={2}>
        {(hotTopicRows as StockHotTopicItem[]).map((topic) => (
          <Card key={topic.id} variant="outlined">
            <CardContent>
              <RankCircleTitle
                rank={topic.rank}
                title={topic.news_title || '无标题'}
                mainTagPolarity={topic.main_tag_polarity ?? null}
                sx={hotTopicTitleRowSx(topic.main_tag_polarity)}
              />
              <Divider sx={{ my: 1 }} />
              <Typography
                level="body-sm"
                sx={{ whiteSpace: 'pre-wrap', mb: 2, color: 'text.secondary' }}
              >
                {topic.news_content || '—'}
              </Typography>

              <TagAndPoolFourBlocks
                actionLoading={actionLoading}
                positiveMainTags={topic.positive_main_tags ?? []}
                negativeMainTags={topic.negative_main_tags ?? []}
                positiveStockPools={topic.positive_stock_pools ?? []}
                negativeStockPools={topic.negative_stock_pools ?? []}
                mainTagDescriptionByName={mainTagDescriptionByName}
                onOpenAdd={(kind) => {
                  setAddTopicId(topic.id);
                  setAddKind(kind);
                  setAddModalOpen(true);
                }}
                onRemove={async (kind, name) => {
                  setActionLoading(true);
                  try {
                    if (kind === 'positive_main') {
                      await services.removeStockHotTopicPositiveMainTag({
                        id: topic.id,
                        tag_name: name,
                      });
                    } else if (kind === 'negative_main') {
                      await services.removeStockHotTopicNegativeMainTag({
                        id: topic.id,
                        tag_name: name,
                      });
                    } else if (kind === 'positive_pool') {
                      await services.removeStockHotTopicPositiveStockPool({
                        id: topic.id,
                        pool_name: name,
                      });
                    } else {
                      await services.removeStockHotTopicNegativeStockPool({
                        id: topic.id,
                        pool_name: name,
                      });
                    }
                    await runRefresh();
                  } finally {
                    setActionLoading(false);
                  }
                }}
              />
            </CardContent>
          </Card>
        ))}
      </Stack>

      <TagPoolRelationAddDialog
        open={addModalOpen}
        title={titleForAddModal(addKind)}
        kind={addKind}
        tagCandidates={addTagCandidates}
        poolNameCandidates={addPoolNameCandidates}
        actionLoading={actionLoading}
        onClose={closeAddModal}
        onConfirmBatch={(names) => void handleAddBatch(names)}
      />
    </>
  );
}
