'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import CloseRounded from '@mui/icons-material/CloseRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy';

import services from '@/services';
import type { MainTagInfo, StockHotTopicItem } from '@/interfaces';

import { useEnergyMainTagContext } from './EnergyShell';
import { RankCircleTitle } from './RankCircleTitle';

/** Joy ``Chip`` 的 ``endDecorator`` 里嵌 ``IconButton`` 时，点击常被父级吞掉；用 flex 条保证可点。 */
function RemovablePill(props: {
  label: string;
  disabled?: boolean;
  onRemove: () => void;
}) {
  const { label, disabled, onRemove } = props;
  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        maxWidth: '100%',
        gap: 0.25,
        pl: 1,
        pr: 0.25,
        py: 0.25,
        borderRadius: 'sm',
        bgcolor: 'neutral.softBg',
        color: 'neutral.softColor',
      }}
    >
      <Typography
        level="body-sm"
        sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
      >
        {label}
      </Typography>
      <IconButton
        size="sm"
        variant="plain"
        color="danger"
        aria-label="移除"
        disabled={disabled}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          onRemove();
        }}
      >
        <CloseRounded sx={{ fontSize: 16 }} />
      </IconButton>
    </Box>
  );
}

type HotMainTagKind = 'positive_main' | 'negative_main';

function sortMainTagsByPriorityThenName(tags: MainTagInfo[]) {
  return [...tags].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

export default function EnergyHotPage() {
  const { selectedMainTagName } = useEnergyMainTagContext();

  const { data: mainTagList = [] } = useRequest(services.getMainTagInfo);
  const sortedMainTags = useMemo(
    () => sortMainTagsByPriorityThenName(mainTagList as MainTagInfo[]),
    [mainTagList]
  );

  const {
    data: hotTopicRows = [],
    loading: hotTopicsLoading,
    refresh: refreshHotTopics,
  } = useRequest(
    async () => {
      const params: Record<string, string> = {};
      if (selectedMainTagName) {
        params.main_tag = selectedMainTagName;
      }
      return services.listStockHotTopic(params) as Promise<StockHotTopicItem[]>;
    },
    { refreshDeps: [selectedMainTagName] }
  );

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addKind, setAddKind] = useState<HotMainTagKind | null>(null);
  const [addTopicId, setAddTopicId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const addTopic = useMemo(
    () =>
      (hotTopicRows as StockHotTopicItem[]).find((row) => row.id === addTopicId) ||
      null,
    [hotTopicRows, addTopicId]
  );

  const openAddModal = useCallback((topicId: string, kind: HotMainTagKind) => {
    setAddTopicId(topicId);
    setAddKind(kind);
    setAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false);
    setAddKind(null);
    setAddTopicId(null);
  }, []);

  const runRefresh = useCallback(async () => {
    await refreshHotTopics();
  }, [refreshHotTopics]);

  const handleRemovePositiveMainTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.removeStockHotTopicPositiveMainTag({
          id: topicId,
          tag_name: tagName,
        });
        await runRefresh();
      } finally {
        setActionLoading(false);
      }
    },
    [runRefresh]
  );

  const handleAddPositiveMainTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.addStockHotTopicPositiveMainTag({
          id: topicId,
          tag_name: tagName,
        });
        await runRefresh();
        closeAddModal();
      } finally {
        setActionLoading(false);
      }
    },
    [runRefresh, closeAddModal]
  );

  const handleRemoveNegativeMainTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.removeStockHotTopicNegativeMainTag({
          id: topicId,
          tag_name: tagName,
        });
        await runRefresh();
      } finally {
        setActionLoading(false);
      }
    },
    [runRefresh]
  );

  const handleAddNegativeMainTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.addStockHotTopicNegativeMainTag({
          id: topicId,
          tag_name: tagName,
        });
        await runRefresh();
        closeAddModal();
      } finally {
        setActionLoading(false);
      }
    },
    [runRefresh, closeAddModal]
  );

  const addModalTitle =
    addKind === 'positive_main'
      ? '添加利好主标签'
      : addKind === 'negative_main'
        ? '添加利空主标签'
        : '';

  const renderAddModalBody = () => {
    if (!addKind || !addTopicId || !addTopic) {
      return null;
    }
    const currentPositive = new Set(addTopic.positive_main_tags || []);
    const currentNegative = new Set(addTopic.negative_main_tags || []);
    const current =
      addKind === 'positive_main' ? currentPositive : currentNegative;
    const candidates = sortedMainTags.filter((tag) => !current.has(tag.name));
    if (candidates.length === 0) {
      return (
        <Typography level="body-sm" color="neutral">
          暂无可添加
        </Typography>
      );
    }
    return (
      <List
        variant="outlined"
        sx={{ maxHeight: 360, overflow: 'auto', borderRadius: 'sm' }}
      >
        {candidates.map((tag) => (
          <ListItem key={tag.id}>
            <ListItemButton
              disabled={actionLoading}
              onClick={() =>
                void (addKind === 'positive_main'
                  ? handleAddPositiveMainTag(addTopicId, tag.name)
                  : handleAddNegativeMainTag(addTopicId, tag.name))
              }
            >
              <Typography level="body-sm">{tag.name}</Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

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
              />
              <Divider sx={{ my: 1 }} />
              <Typography
                level="body-sm"
                sx={{ whiteSpace: 'pre-wrap', mb: 2, color: 'text.secondary' }}
              >
                {topic.news_content || '—'}
              </Typography>

              <Stack divider={<Divider />} spacing={2}>
                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography level="title-sm">利好主标签</Typography>
                    <Button
                      size="sm"
                      variant="soft"
                      loading={actionLoading}
                      onClick={() => openAddModal(topic.id, 'positive_main')}
                    >
                      添加
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(topic.positive_main_tags || []).length === 0 && (
                      <Typography level="body-sm" color="neutral">
                        暂无
                      </Typography>
                    )}
                    {(topic.positive_main_tags as string[] | undefined)?.map((tagName) => (
                      <RemovablePill
                        key={tagName}
                        label={tagName}
                        disabled={actionLoading}
                        onRemove={() =>
                          void handleRemovePositiveMainTag(topic.id, tagName)
                        }
                      />
                    ))}
                  </Box>
                </Box>

                <Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography level="title-sm">利空主标签</Typography>
                    <Button
                      size="sm"
                      variant="soft"
                      loading={actionLoading}
                      onClick={() => openAddModal(topic.id, 'negative_main')}
                    >
                      添加
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(topic.negative_main_tags || []).length === 0 && (
                      <Typography level="body-sm" color="neutral">
                        暂无
                      </Typography>
                    )}
                    {(topic.negative_main_tags as string[] | undefined)?.map((tagName) => (
                      <RemovablePill
                        key={tagName}
                        label={tagName}
                        disabled={actionLoading}
                        onRemove={() =>
                          void handleRemoveNegativeMainTag(topic.id, tagName)
                        }
                      />
                    ))}
                  </Box>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Modal open={addModalOpen} onClose={closeAddModal}>
        <ModalDialog
          className="w-[min(96vw,520px)]"
          size="lg"
          sx={{ maxHeight: '90vh', overflow: 'auto' }}
        >
          <ModalClose />
          <Typography level="title-lg" sx={{ mb: 1 }}>
            {addModalTitle}
          </Typography>
          {renderAddModalBody()}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={closeAddModal}>
              关闭
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}
