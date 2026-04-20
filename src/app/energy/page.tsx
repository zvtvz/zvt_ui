'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useRequest } from 'ahooks';
import CloseRounded from '@mui/icons-material/CloseRounded';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  List,
  ListItem,
  ListItemButton,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy';

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

import services from '@/services';
import type { MainTagInfo, StockHotTopicItem, StockListItem, SubTagInfo } from '@/interfaces';

type RelKind = 'related' | 'main' | 'sub';

/** 含汉字时至少 2 字触发搜索，否则至少 4 个字符（如股票代码）。 */
function listStocksSearchMinLength(keyword: string): number {
  return /[\u4e00-\u9fff\u3400-\u4dbf]/.test(keyword) ? 2 : 4;
}

function sortMainTagsByPriorityThenName(tags: MainTagInfo[]) {
  return [...tags].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

function sortSubTagsByPriorityThenName(tags: SubTagInfo[]) {
  return [...tags].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

export default function EnergyPage() {
  const { data: mainTagList = [], loading: mainTagsLoading } = useRequest(
    services.getMainTagInfo
  );
  const { data: subTagList = [] } = useRequest(services.getSubTagInfo);
  const sortedMainTags = useMemo(
    () => sortMainTagsByPriorityThenName(mainTagList as MainTagInfo[]),
    [mainTagList]
  );
  const sortedSubTags = useMemo(
    () => sortSubTagsByPriorityThenName(subTagList as SubTagInfo[]),
    [subTagList]
  );

  const [selectedMainTagName, setSelectedMainTagName] = useState<
    string | undefined
  >();

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
  const [addKind, setAddKind] = useState<RelKind | null>(null);
  const [addTopicId, setAddTopicId] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const debouncedStockFilter = useDebounce(stockFilter, { wait: 300 });
  const trimmedStockKey = debouncedStockFilter.trim();
  const stockSearchMinLength = listStocksSearchMinLength(trimmedStockKey);
  const stockSearchReady =
    trimmedStockKey.length >= stockSearchMinLength;
  const shouldListStocksByKey =
    addModalOpen && addKind === 'related' && stockSearchReady;

  const { data: stocksByKey = [], loading: stocksKeyLoading } = useRequest(
    () =>
      services.listStocks({ key: trimmedStockKey }) as Promise<StockListItem[]>,
    {
      refreshDeps: [trimmedStockKey],
      ready: shouldListStocksByKey,
    }
  );

  const [stockLabelMap, setStockLabelMap] = useState(
    () => new Map<string, string>()
  );

  useEffect(() => {
    const rows = stocksByKey as StockListItem[];
    if (rows.length === 0) {
      return;
    }
    setStockLabelMap((previous) => {
      const next = new Map(previous);
      rows.forEach((row) => {
        const label = [row.name, row.code].filter(Boolean).join(' ');
        next.set(row.entity_id, label || row.entity_id);
      });
      return next;
    });
  }, [stocksByKey]);

  const relatedStockPickerRows = useMemo(() => {
    if (!addModalOpen || addKind !== 'related' || !stockSearchReady) {
      return [];
    }
    return stocksByKey as StockListItem[];
  }, [addModalOpen, addKind, stockSearchReady, stocksByKey]);

  const relatedStockPickerLoading =
    addModalOpen &&
    addKind === 'related' &&
    stockSearchReady &&
    stocksKeyLoading;

  const addTopic = useMemo(
    () =>
      (hotTopicRows as StockHotTopicItem[]).find((row) => row.id === addTopicId) ||
      null,
    [hotTopicRows, addTopicId]
  );

  const openAddModal = useCallback((topicId: string, kind: RelKind) => {
    setAddTopicId(topicId);
    setAddKind(kind);
    setStockFilter('');
    setAddModalOpen(true);
  }, []);

  const closeAddModal = useCallback(() => {
    setAddModalOpen(false);
    setAddKind(null);
    setAddTopicId(null);
    setStockFilter('');
  }, []);

  const runRefresh = useCallback(async () => {
    await refreshHotTopics();
  }, [refreshHotTopics]);

  const handleRemoveRelated = useCallback(
    async (topicId: string, entityId: string) => {
      setActionLoading(true);
      try {
        await services.removeStockHotTopicRelatedStock({
          id: topicId,
          entity_id: entityId,
        });
        await runRefresh();
      } finally {
        setActionLoading(false);
      }
    },
    [runRefresh]
  );

  const handleAddRelated = useCallback(
    async (topicId: string, entityId: string) => {
      setActionLoading(true);
      try {
        await services.addStockHotTopicRelatedStock({
          id: topicId,
          entity_id: entityId,
        });
        await runRefresh();
      } finally {
        setActionLoading(false);
      }
    },
    [runRefresh]
  );

  const handleRemoveMainTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.removeStockHotTopicMainTag({
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

  const handleAddMainTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.addStockHotTopicMainTag({
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

  const handleRemoveSubTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.removeStockHotTopicSubTag({
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

  const handleAddSubTag = useCallback(
    async (topicId: string, tagName: string) => {
      setActionLoading(true);
      try {
        await services.addStockHotTopicSubTag({
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
    addKind === 'related'
      ? '添加相关个股'
      : addKind === 'main'
        ? '添加主标签'
        : addKind === 'sub'
          ? '添加次标签'
          : '';

  const renderAddModalBody = () => {
    if (!addKind || !addTopicId || !addTopic) {
      return null;
    }
    if (addKind === 'related') {
      const current = new Set(addTopic.related_stocks || []);
      const candidates = relatedStockPickerRows.filter(
        (row) => !current.has(row.entity_id)
      );
      return (
        <>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>按代码 / 名称筛选</FormLabel>
            <Input
              value={stockFilter}
              onChange={(event) => setStockFilter(event.target.value)}
              placeholder="中文至少 2 字；代码等至少 4 位"
            />
          </FormControl>
          {!stockSearchReady ? (
            <Typography level="body-sm" color="neutral">
              含中文时至少输入 2 个字；不含中文时至少 4 个字符（如股票代码）后再搜索
            </Typography>
          ) : relatedStockPickerLoading ? (
            <Typography level="body-sm">加载中…</Typography>
          ) : candidates.length === 0 ? (
            <Typography level="body-sm" color="neutral">
              暂无可添加
            </Typography>
          ) : (
            <List
              variant="outlined"
              sx={{ maxHeight: 360, overflow: 'auto', borderRadius: 'sm' }}
            >
              {candidates.map((row) => (
                <ListItem key={row.entity_id}>
                  <ListItemButton
                    disabled={actionLoading}
                    onClick={() => void handleAddRelated(addTopicId, row.entity_id)}
                  >
                    <Typography level="body-sm">
                      {[row.name, row.code].filter(Boolean).join(' ')}
                    </Typography>
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </>
      );
    }
    if (addKind === 'main') {
      const current = new Set(addTopic.main_tags || []);
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
                onClick={() => void handleAddMainTag(addTopicId, tag.name)}
              >
                <Typography level="body-sm">{tag.name}</Typography>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      );
    }
    const current = new Set(addTopic.sub_tags || []);
    const candidates = sortedSubTags.filter((tag) => !current.has(tag.name));
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
              onClick={() => void handleAddSubTag(addTopicId, tag.name)}
            >
              <Typography level="body-sm">{tag.name}</Typography>
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    );
  };

  return (
    <div className="pl-2 pr-2">
      <Typography level="title-md" className="mb-3">
        能量
      </Typography>
      <Typography level="body-sm" color="neutral" className="mb-2">
        主标签筛选热点列表；不选为全部，最多 50 条，按 rank 排序
      </Typography>
      <div className="flex flex-row flex-wrap items-center gap-2 mb-6 min-h-[40px]">
        {mainTagsLoading && (
          <Typography level="body-sm" color="neutral">
            加载中…
          </Typography>
        )}
        {!mainTagsLoading &&
          sortedMainTags.map((tag) => {
            const isSelected = tag.name === selectedMainTagName;
            return (
              <Chip
                key={tag.id}
                color="primary"
                variant={isSelected ? 'solid' : 'soft'}
                className="cursor-pointer"
                size="md"
                onClick={() =>
                  setSelectedMainTagName(isSelected ? undefined : tag.name)
                }
              >
                {tag.name}
              </Chip>
            );
          })}
      </div>

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
              <Typography level="title-md" sx={{ mb: 1 }}>
                {topic.news_title || '无标题'}
              </Typography>
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
                    <Typography level="title-sm">相关个股</Typography>
                    <Button
                      size="sm"
                      variant="soft"
                      loading={actionLoading}
                      onClick={() => openAddModal(topic.id, 'related')}
                    >
                      添加
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(topic.related_stocks || []).length === 0 && (
                      <Typography level="body-sm" color="neutral">
                        暂无
                      </Typography>
                    )}
                    {(topic.related_stocks as string[] | undefined)?.map((entityId) => (
                      <RemovablePill
                        key={entityId}
                        label={stockLabelMap.get(entityId) || entityId}
                        disabled={actionLoading}
                        onRemove={() => void handleRemoveRelated(topic.id, entityId)}
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
                    <Typography level="title-sm">主标签</Typography>
                    <Button
                      size="sm"
                      variant="soft"
                      loading={actionLoading}
                      onClick={() => openAddModal(topic.id, 'main')}
                    >
                      添加
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(topic.main_tags || []).length === 0 && (
                      <Typography level="body-sm" color="neutral">
                        暂无
                      </Typography>
                    )}
                    {(topic.main_tags as string[] | undefined)?.map((tagName) => (
                      <RemovablePill
                        key={tagName}
                        label={tagName}
                        disabled={actionLoading}
                        onRemove={() => void handleRemoveMainTag(topic.id, tagName)}
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
                    <Typography level="title-sm">次标签</Typography>
                    <Button
                      size="sm"
                      variant="soft"
                      loading={actionLoading}
                      onClick={() => openAddModal(topic.id, 'sub')}
                    >
                      添加
                    </Button>
                  </Box>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {(topic.sub_tags || []).length === 0 && (
                      <Typography level="body-sm" color="neutral">
                        暂无
                      </Typography>
                    )}
                    {(topic.sub_tags as string[] | undefined)?.map((tagName) => (
                      <RemovablePill
                        key={tagName}
                        label={tagName}
                        disabled={actionLoading}
                        onRemove={() => void handleRemoveSubTag(topic.id, tagName)}
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
    </div>
  );
}
