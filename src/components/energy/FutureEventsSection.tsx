'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Option,
  Select,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';

import services from '@/services';
import type {
  DiscoverAndTrackFutureEventsResult,
  FutureEventItem,
  MainTagInfo,
  Pool,
} from '@/interfaces';

import { RankCircleTitle } from '@/components/energy/RankCircleTitle';
import { poolNamesFromPools } from '@/components/energy/TagAndPoolFourBlocks';
import {
  calendarDaysFromToday,
  formatFutureEventDayOnly,
} from '@/utils/futureEventDates';
import { tradeInnerTabClass, tradePoolTabActiveClass } from '@/app/manage/tradeStyleClasses';

/** `<input type="date">` 用的本地日历日 `YYYY-MM-DD` */
function toDateInputValue(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** 日历日转 UTC ISO（当日本地正午，避免仅日期串的时区歧义） */
function fromDateInputValue(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const parts = trimmed.split('-').map((segment) => Number.parseInt(segment, 10));
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
    return undefined;
  }
  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day, 12, 0, 0);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

type EditorMode = 'create' | 'edit';

export function FutureEventsSection() {
  const [listTab, setListTab] = useState<'active' | 'archived'>('active');

  const { data: poolList = [] } = useRequest(services.getPools);
  const { data: mainTagList = [] } = useRequest(services.getMainTagInfo);
  const poolNameCandidates = useMemo(
    () => poolNamesFromPools(poolList as Pool[]),
    [poolList]
  );
  const mainTagNameCandidates = useMemo(
    () =>
      (mainTagList as MainTagInfo[])
        .map((tag) => tag.name)
        .filter((name): name is string => Boolean(name)),
    [mainTagList]
  );

  const isActiveTab = listTab === 'active';

  const {
    data: eventRows = [],
    loading,
    refresh,
  } = useRequest(
    () =>
      services.queryFutureEvent({
        limit: 200,
        order_by_field: 'rank',
        order_by_type: 'asc',
        active: isActiveTab,
      }) as Promise<FutureEventItem[]>,
    { refreshDeps: [isActiveTab] }
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [saving, setSaving] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [createdLocal, setCreatedLocal] = useState('');
  const [triggerLocal, setTriggerLocal] = useState('');
  const [dueLocal, setDueLocal] = useState('');
  const [rankInput, setRankInput] = useState('');
  const [relatedStockPool, setRelatedStockPool] = useState<string>('');
  const [relatedMainTag, setRelatedMainTag] = useState<string>('');

  const handleAiDiscover = useCallback(async () => {
    if (
      !window.confirm(
        '将调用事件跟踪大师 Agent 搜索近期重大事件并写入跟踪列表，可能耗时数分钟，是否继续？'
      )
    ) {
      return;
    }
    setAiSearching(true);
    try {
      const result = (await services.discoverAndTrackFutureEvents()) as DiscoverAndTrackFutureEventsResult;
      await refresh();
      window.alert(
        `AI搜索完成：新建 ${result.created}，更新 ${result.updated}，跳过 ${result.skipped}`
      );
    } finally {
      setAiSearching(false);
    }
  }, [refresh]);

  const openCreate = useCallback(() => {
    setEditorMode('create');
    setEditingId(null);
    setNameInput('');
    setContentInput('');
    setCreatedLocal('');
    setTriggerLocal('');
    setDueLocal('');
    setRankInput('');
    setRelatedStockPool('');
    setRelatedMainTag('');
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row: FutureEventItem) => {
    setEditorMode('edit');
    setEditingId(row.id);
    setNameInput(row.name);
    setContentInput(row.content || '');
    setCreatedLocal(toDateInputValue(row.created_timestamp));
    setTriggerLocal(toDateInputValue(row.trigger_date));
    setDueLocal(toDateInputValue(row.due_date));
    setRankInput(
      row.rank !== null && row.rank !== undefined ? String(row.rank) : ''
    );
    setRelatedStockPool(row.related_stock_pool?.trim() ?? '');
    setRelatedMainTag(row.related_main_tag?.trim() ?? '');
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
  }, []);

  const handleSave = useCallback(async () => {
    if (editorMode === 'create' && !nameInput.trim()) {
      return;
    }
    const createdTimestamp = fromDateInputValue(createdLocal);
    const triggerDate = fromDateInputValue(triggerLocal);
    const dueDate = fromDateInputValue(dueLocal);
    const rankTrimmed = rankInput.trim();
    const rankParsed =
      rankTrimmed === '' ? undefined : Number.parseInt(rankTrimmed, 10);
    const rankPayload =
      rankParsed !== undefined && !Number.isNaN(rankParsed)
        ? rankParsed
        : undefined;

    const poolForCreate =
      relatedStockPool.trim() !== '' ? relatedStockPool.trim() : undefined;
    const tagForCreate =
      relatedMainTag.trim() !== '' ? relatedMainTag.trim() : undefined;

    setSaving(true);
    try {
      if (editorMode === 'create') {
        const trimmedName = nameInput.trim();
        await services.createFutureEvent({
          name: trimmedName,
          content: contentInput.trim() || undefined,
          created_timestamp: createdTimestamp,
          trigger_date: triggerDate,
          due_date: dueDate,
          rank: rankPayload,
          related_stock_pool: poolForCreate,
          related_main_tag: tagForCreate,
        });
      } else if (editingId) {
        await services.updateFutureEvent({
          id: editingId,
          content: contentInput.trim() || undefined,
          trigger_date: triggerDate,
          rank: rankPayload,
          related_stock_pool:
            relatedStockPool.trim() === '' ? null : relatedStockPool.trim(),
          related_main_tag:
            relatedMainTag.trim() === '' ? null : relatedMainTag.trim(),
        });
      }
      await refresh();
      closeModal();
    } finally {
      setSaving(false);
    }
  }, [
    closeModal,
    contentInput,
    createdLocal,
    dueLocal,
    editorMode,
    editingId,
    nameInput,
    rankInput,
    refresh,
    relatedMainTag,
    relatedStockPool,
    triggerLocal,
  ]);

  const handleDelete = useCallback(
    async (row: FutureEventItem) => {
      if (!window.confirm(`确定删除跟踪事件「${row.name}」？`)) {
        return;
      }
      setSaving(true);
      try {
        await services.deleteFutureEvent({ id: row.id });
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  const handleSetActive = useCallback(
    async (row: FutureEventItem, active: boolean) => {
      setSaving(true);
      try {
        await services.setFutureEventActive({ id: row.id, active });
        await refresh();
      } finally {
        setSaving(false);
      }
    },
    [refresh]
  );

  return (
    <>
      {/* 活跃 / 归档 切换 */}
      <div className="flex flex-row items-center flex-wrap gap-y-1 mb-3">
        <div
          role="button"
          tabIndex={0}
          className={`${tradeInnerTabClass} ${listTab === 'active' ? tradePoolTabActiveClass : ''}`}
          onClick={() => setListTab('active')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setListTab('active');
            }
          }}
        >
          活跃
        </div>
        <div
          role="button"
          tabIndex={0}
          className={`${tradeInnerTabClass} ${listTab === 'archived' ? tradePoolTabActiveClass : ''}`}
          onClick={() => setListTab('archived')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setListTab('archived');
            }
          }}
        >
          归档
        </div>
      </div>

      <div className="flex flex-row justify-between items-center mb-2">
        <span className="opacity-85 text-sm">
          共 {(eventRows as FutureEventItem[]).length} 个
        </span>
        {isActiveTab && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="sm"
              variant="soft"
              color="primary"
              className="!text-[12px] !py-1"
              loading={aiSearching}
              disabled={aiSearching || saving}
              onClick={handleAiDiscover}
            >
              AI搜索跟踪
            </Button>
            <Button
              size="sm"
              variant="soft"
              className="!text-[12px] !py-1"
              disabled={aiSearching || saving}
              onClick={openCreate}
            >
              新建跟踪事件
            </Button>
          </Box>
        )}
      </div>

      {loading && (
        <Typography level="body-sm" sx={{ mb: 2 }}>
          加载中…
        </Typography>
      )}
      {!loading && (eventRows as FutureEventItem[]).length === 0 && (
        <Typography level="body-sm" color="neutral">
          {isActiveTab ? '暂无活跃跟踪事件' : '暂无归档跟踪事件'}
        </Typography>
      )}

      <Stack spacing={2}>
        {(eventRows as FutureEventItem[]).map((row) => {
          const dueDiffDays = row.due_date
            ? calendarDaysFromToday(row.due_date)
            : NaN;
          const countDaysSx = {
            fontSize: '1.35rem',
            fontWeight: 700,
            color: 'warning.700',
            mx: 0.35,
          } as const;

          return (
          <Card key={row.id} variant="outlined">
            <CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 1,
                }}
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <RankCircleTitle rank={row.rank} title={row.name} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
                  {isActiveTab ? (
                    <>
                      <Button
                        size="sm"
                        variant="soft"
                        disabled={saving}
                        onClick={() => openEdit(row)}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        color="neutral"
                        disabled={saving}
                        onClick={() => void handleSetActive(row, false)}
                      >
                        归档
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="soft"
                        color="primary"
                        disabled={saving}
                        onClick={() => void handleSetActive(row, true)}
                      >
                        恢复
                      </Button>
                      <Button
                        size="sm"
                        variant="soft"
                        color="danger"
                        disabled={saving}
                        onClick={() => void handleDelete(row)}
                      >
                        删除
                      </Button>
                    </>
                  )}
                </Box>
              </Box>
              <Typography
                level="body-sm"
                sx={{ whiteSpace: 'pre-wrap', mb: 1, color: 'text.secondary' }}
              >
                {row.content?.trim() ? row.content : '—'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography level="body-sm" color="neutral" sx={{ mb: 1 }}>
                公布 {formatFutureEventDayOnly(row.created_timestamp)} · 触发{' '}
                {formatFutureEventDayOnly(row.trigger_date)}
              </Typography>
              <Box
                sx={{
                  p: 1.25,
                  borderRadius: 'md',
                  border: '1px solid rgba(65, 109, 249, 0.28)',
                  bgcolor: 'rgba(65, 109, 249, 0.06)',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'baseline',
                    columnGap: 3,
                    rowGap: 0.75,
                  }}
                >
                  <Typography component="div" level="body-md" sx={{ m: 0 }}>
                    <Box component="span" sx={{ color: 'neutral.600' }}>
                      关联股票池：
                    </Box>
                    <Box
                      component="span"
                      sx={{ color: 'primary.600', fontWeight: 'lg' }}
                    >
                      {row.related_stock_pool?.trim() ? row.related_stock_pool.trim() : '—'}
                    </Box>
                  </Typography>
                  <Typography component="div" level="body-md" sx={{ m: 0 }}>
                    <Box component="span" sx={{ color: 'neutral.600' }}>
                      关联主标签：
                    </Box>
                    <Box
                      component="span"
                      sx={{ color: 'primary.600', fontWeight: 'lg' }}
                    >
                      {row.related_main_tag?.trim() ? row.related_main_tag.trim() : '—'}
                    </Box>
                  </Typography>
                  {row.due_date && (
                    <Typography
                      component="div"
                      level="body-md"
                      sx={{ m: 0, color: 'neutral.700' }}
                    >
                      距离兑现日{formatFutureEventDayOnly(row.due_date)}
                      {!Number.isNaN(dueDiffDays) && dueDiffDays >= 0 && (
                        <>
                          还有
                          <Box component="span" sx={countDaysSx}>
                            {dueDiffDays}
                          </Box>
                          天
                        </>
                      )}
                      {!Number.isNaN(dueDiffDays) && dueDiffDays < 0 && (
                        <>
                          已超过
                          <Box component="span" sx={countDaysSx}>
                            {-dueDiffDays}
                          </Box>
                          天
                        </>
                      )}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
          );
        })}
      </Stack>

      <Modal open={modalOpen} onClose={closeModal}>
        <ModalDialog
          className="w-[min(96vw,560px)]"
          size="lg"
          sx={{ maxHeight: '92vh', overflow: 'auto' }}
        >
          <ModalClose />
          <Typography level="title-lg" sx={{ mb: 2 }}>
            {editorMode === 'create' ? '新建跟踪事件' : '编辑跟踪事件'}
          </Typography>

          <Stack spacing={2}>
            <FormControl>
              <FormLabel>名称（唯一）</FormLabel>
              <Input
                value={nameInput}
                onChange={(event) => setNameInput(event.target.value)}
                disabled={editorMode === 'edit'}
                placeholder="用于区分事件"
              />
            </FormControl>
            <FormControl>
              <FormLabel>事件内容</FormLabel>
              <Textarea
                minRows={4}
                value={contentInput}
                onChange={(event) => setContentInput(event.target.value)}
                placeholder="事件说明"
              />
            </FormControl>
            <FormControl>
              <FormLabel>公布日</FormLabel>
              <Input
                type="date"
                value={createdLocal}
                onChange={(event) => setCreatedLocal(event.target.value)}
                disabled={editorMode === 'edit'}
                readOnly={editorMode === 'edit'}
                slotProps={{
                  input: {
                    sx: editorMode === 'edit' ? { color: 'text.secondary' } : undefined,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>触发日</FormLabel>
              <Input
                type="date"
                value={triggerLocal}
                onChange={(event) => setTriggerLocal(event.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>兑现日</FormLabel>
              <Input
                type="date"
                value={dueLocal}
                onChange={(event) => setDueLocal(event.target.value)}
                disabled={editorMode === 'edit'}
                readOnly={editorMode === 'edit'}
                slotProps={{
                  input: {
                    sx: editorMode === 'edit' ? { color: 'text.secondary' } : undefined,
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <FormLabel>热度排行 rank（整数，可选）</FormLabel>
              <Input
                type="number"
                value={rankInput}
                onChange={(event) => setRankInput(event.target.value)}
                placeholder="可选"
              />
            </FormControl>
            <FormControl>
              <FormLabel sx={{ fontWeight: 'lg' }}>关联股票池（可选）</FormLabel>
              <Select
                size="md"
                placeholder="选择股票池"
                value={relatedStockPool}
                onChange={(_, value) =>
                  setRelatedStockPool(
                    value === null || value === undefined ? '' : String(value)
                  )
                }
                sx={{
                  minWidth: '100%',
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(65, 109, 249, 0.06)',
                  border: '1px solid rgba(65, 109, 249, 0.35)',
                }}
              >
                <Option value="">（无）</Option>
                {poolNameCandidates.map((poolName) => (
                  <Option key={poolName} value={poolName}>
                    {poolName}
                  </Option>
                ))}
              </Select>
            </FormControl>
            <FormControl>
              <FormLabel sx={{ fontWeight: 'lg' }}>关联主标签（可选）</FormLabel>
              <Select
                size="md"
                placeholder="选择主标签"
                value={relatedMainTag}
                onChange={(_, value) =>
                  setRelatedMainTag(
                    value === null || value === undefined ? '' : String(value)
                  )
                }
                sx={{
                  minWidth: '100%',
                  fontSize: '1rem',
                  fontWeight: 600,
                  bgcolor: 'rgba(65, 109, 249, 0.06)',
                  border: '1px solid rgba(65, 109, 249, 0.35)',
                }}
              >
                <Option value="">（无）</Option>
                {mainTagNameCandidates.map((tagName) => (
                  <Option key={tagName} value={tagName}>
                    {tagName}
                  </Option>
                ))}
              </Select>
            </FormControl>
          </Stack>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
            <Button variant="plain" color="neutral" onClick={closeModal}>
              取消
            </Button>
            <Button loading={saving} onClick={() => void handleSave()}>
              保存
            </Button>
          </Box>
        </ModalDialog>
      </Modal>
    </>
  );
}
