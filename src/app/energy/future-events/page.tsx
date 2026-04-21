'use client';

import { useCallback, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';

import services from '@/services';
import type { FutureEventItem, MainTagInfo } from '@/interfaces';

import { useEnergyMainTagContext } from '../EnergyShell';
import { RankCircleTitle } from '../RankCircleTitle';

function sortMainTagsByPriorityThenName(tags: MainTagInfo[]) {
  return [...tags].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date.toISOString();
}

function parseRelatedStockLines(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function formatShortDate(value: string | null | undefined): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type EditorMode = 'create' | 'edit';

export default function FutureEventsPage() {
  const { selectedMainTagName } = useEnergyMainTagContext();

  const { data: mainTagList = [] } = useRequest(services.getMainTagInfo);
  const sortedMainTags = useMemo(
    () => sortMainTagsByPriorityThenName(mainTagList as MainTagInfo[]),
    [mainTagList]
  );

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
        ...(selectedMainTagName
          ? { main_tag: selectedMainTagName }
          : {}),
      }) as Promise<FutureEventItem[]>,
    { refreshDeps: [selectedMainTagName] }
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<EditorMode>('create');
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nameInput, setNameInput] = useState('');
  const [contentInput, setContentInput] = useState('');
  const [createdLocal, setCreatedLocal] = useState('');
  const [triggerLocal, setTriggerLocal] = useState('');
  const [dueLocal, setDueLocal] = useState('');
  const [relatedLines, setRelatedLines] = useState('');
  const [rankInput, setRankInput] = useState('');
  const [selectedMainTagNames, setSelectedMainTagNames] = useState<string[]>(
    []
  );

  const openCreate = useCallback(() => {
    setEditorMode('create');
    setEditingId(null);
    setNameInput('');
    setContentInput('');
    setCreatedLocal('');
    setTriggerLocal('');
    setDueLocal('');
    setRelatedLines('');
    setRankInput('');
    setSelectedMainTagNames([]);
    setModalOpen(true);
  }, []);

  const openEdit = useCallback((row: FutureEventItem) => {
    setEditorMode('edit');
    setEditingId(row.id);
    setNameInput(row.name);
    setContentInput(row.content || '');
    setCreatedLocal(toDatetimeLocalValue(row.created_timestamp));
    setTriggerLocal(toDatetimeLocalValue(row.trigger_date));
    setDueLocal(toDatetimeLocalValue(row.due_date));
    setRelatedLines((row.related_stocks || []).join('\n'));
    setRankInput(
      row.rank !== null && row.rank !== undefined ? String(row.rank) : ''
    );
    setSelectedMainTagNames([...(row.main_tags || [])]);
    setModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingId(null);
  }, []);

  const toggleCatalogTag = useCallback((tagName: string) => {
    setSelectedMainTagNames((previous) => {
      if (previous.includes(tagName)) {
        return previous.filter((item) => item !== tagName);
      }
      return [...previous, tagName];
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (editorMode === 'create' && !nameInput.trim()) {
      return;
    }
    const relatedStocks = parseRelatedStockLines(relatedLines);
    const createdTimestamp = fromDatetimeLocalValue(createdLocal);
    const triggerDate = fromDatetimeLocalValue(triggerLocal);
    const dueDate = fromDatetimeLocalValue(dueLocal);
    const rankTrimmed = rankInput.trim();
    const rankParsed =
      rankTrimmed === '' ? undefined : Number.parseInt(rankTrimmed, 10);
    const rankPayload =
      rankParsed !== undefined && !Number.isNaN(rankParsed)
        ? rankParsed
        : undefined;

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
          related_stocks:
            relatedStocks.length > 0 ? relatedStocks : undefined,
          main_tags:
            selectedMainTagNames.length > 0
              ? selectedMainTagNames
              : undefined,
        });
      } else if (editingId) {
        await services.updateFutureEvent({
          id: editingId,
          content: contentInput.trim() || undefined,
          created_timestamp: createdTimestamp,
          trigger_date: triggerDate,
          due_date: dueDate,
          rank: rankPayload,
          related_stocks: relatedStocks,
          main_tags: selectedMainTagNames,
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
    relatedLines,
    selectedMainTagNames,
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

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Typography level="title-sm">跟踪事件列表</Typography>
        <Button size="sm" onClick={openCreate}>
          新建跟踪事件
        </Button>
      </Box>

      {loading && (
        <Typography level="body-sm" sx={{ mb: 2 }}>
          加载中…
        </Typography>
      )}
      {!loading && eventRows.length === 0 && (
        <Typography level="body-sm" color="neutral">
          暂无跟踪事件
        </Typography>
      )}

      <Stack spacing={2}>
        {(eventRows as FutureEventItem[]).map((row) => (
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
                    color="danger"
                    disabled={saving}
                    onClick={() => void handleDelete(row)}
                  >
                    删除
                  </Button>
                </Box>
              </Box>
              <Typography
                level="body-sm"
                sx={{ whiteSpace: 'pre-wrap', mb: 1, color: 'text.secondary' }}
              >
                {row.content?.trim() ? row.content : '—'}
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                公布 {formatShortDate(row.created_timestamp)} · 触发{' '}
                {formatShortDate(row.trigger_date)} · 兑现{' '}
                {formatShortDate(row.due_date)}
              </Typography>
              <Typography level="body-xs" color="neutral" sx={{ mb: 0.5 }}>
                主标签：
                {(row.main_tags || []).length === 0
                  ? '—'
                  : (row.main_tags as string[]).join('、')}
              </Typography>
              <Typography level="body-xs" color="neutral">
                相关个股 entity_id：
                {(row.related_stocks || []).length === 0
                  ? '—'
                  : (row.related_stocks as string[]).join('、')}
              </Typography>
            </CardContent>
          </Card>
        ))}
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
                type="datetime-local"
                value={createdLocal}
                onChange={(event) => setCreatedLocal(event.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>触发日</FormLabel>
              <Input
                type="datetime-local"
                value={triggerLocal}
                onChange={(event) => setTriggerLocal(event.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>兑现日</FormLabel>
              <Input
                type="datetime-local"
                value={dueLocal}
                onChange={(event) => setDueLocal(event.target.value)}
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
              <FormLabel>主标签（可多选）</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 0.5 }}>
                {sortedMainTags.map((tag) => {
                  const selected = selectedMainTagNames.includes(tag.name);
                  return (
                    <Chip
                      key={tag.id}
                      size="sm"
                      variant={selected ? 'solid' : 'outlined'}
                      color={selected ? 'primary' : 'neutral'}
                      className="cursor-pointer"
                      onClick={() => toggleCatalogTag(tag.name)}
                    >
                      {tag.name}
                    </Chip>
                  );
                })}
              </Box>
            </FormControl>
            <FormControl>
              <FormLabel>相关个股（每行一个 entity_id）</FormLabel>
              <Textarea
                minRows={3}
                value={relatedLines}
                onChange={(event) => setRelatedLines(event.target.value)}
                placeholder={'例如：\nstock_sh_600000'}
              />
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
