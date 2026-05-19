'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Table,
  Textarea,
  Typography,
} from '@mui/joy';
import { useRequest } from 'ahooks';
import Add from '@mui/icons-material/Add';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import services from '@/services';
import type {
  BuildMainTagSubTagFromIndustryChainResult,
  CreateIndustryChain,
  IndustryChainInfo,
  UpdateIndustryChain,
} from '@/interfaces';
import { tradeInnerTabClass, tradePoolTabActiveClass } from './tradeStyleClasses';

type BatchSetIndustryChainActiveResult = {
  updated_count: number;
  not_found_ids: string[];
};

const SEGMENT_DESCRIPTION_MAX_LENGTH = 50;

type SegmentRow = { name: string; desc: string };

function emptySegmentRow(): SegmentRow {
  return { name: '', desc: '' };
}

function segmentsRecordToRows(segments: Record<string, string> | null | undefined): SegmentRow[] {
  const entries = Object.entries(segments || {});
  if (!entries.length) {
    return [emptySegmentRow()];
  }
  return entries.map(([name, desc]) => ({ name, desc: String(desc ?? '') }));
}

function rowsToSegmentsRecord(rows: SegmentRow[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const row of rows) {
    const name = row.name.trim();
    if (!name) continue;
    out[name] = row.desc.trim().slice(0, SEGMENT_DESCRIPTION_MAX_LENGTH);
  }
  return out;
}

export default function IndustryChainManageSection() {
  const [listTab, setListTab] = useState<'active' | 'archived'>('active');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchBusy, setBatchBusy] = useState(false);
  const [syncTagsBusy, setSyncTagsBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit'>('create');
  const [editingRow, setEditingRow] = useState<IndustryChainInfo | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formSegmentRows, setFormSegmentRows] = useState<SegmentRow[]>([emptySegmentRow()]);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const activeQuery = listTab === 'active';

  const { data, loading, refresh } = useRequest(
    async () => services.getIndustryChain({ active: activeQuery }) as Promise<IndustryChainInfo[]>,
    { refreshDeps: [activeQuery] }
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [listTab, activeQuery]);

  const rows = (data ?? []) as IndustryChainInfo[];

  const selectableIdsOnPage = useMemo(
    () => rows.map((row) => row.id).filter((id): id is string => Boolean(id)),
    [rows]
  );

  const allDisplayedSelected =
    selectableIdsOnPage.length > 0 && selectableIdsOnPage.every((id) => selectedIds.has(id));

  const headerCheckboxIndeterminate =
    selectedIds.size > 0 && !allDisplayedSelected && selectableIdsOnPage.some((id) => selectedIds.has(id));

  function toggleSelectAllOnPage() {
    if (allDisplayedSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(selectableIdsOnPage));
  }

  function toggleRow(rowId: string) {
    setSelectedIds((previous) => {
      const next = new Set(previous);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  }

  async function syncTagsFromIndustryChain() {
    setSyncTagsBusy(true);
    setNotice(null);
    try {
      const result = (await services.buildMainTagSubTagInfoFromIndustryChain()) as BuildMainTagSubTagFromIndustryChainResult;
      setNotice(
        `已同步标签：产业链 ${result.chains_processed} 条，` +
          `主标新建 ${result.main_tag_created}、更新 ${result.main_tag_updated}，` +
          `次标新建 ${result.sub_tag_created}、更新 ${result.sub_tag_updated}`
      );
      window.setTimeout(() => setNotice(null), 10000);
    } catch {
      setNotice('从产业链同步标签失败');
      window.setTimeout(() => setNotice(null), 6000);
    } finally {
      setSyncTagsBusy(false);
    }
  }

  function openCreate() {
    setEditorMode('create');
    setEditingRow(null);
    setFormName('');
    setFormDesc('');
    setFormSegmentRows([emptySegmentRow()]);
    setEditorOpen(true);
  }

  function openEdit(row: IndustryChainInfo) {
    setEditorMode('edit');
    setEditingRow(row);
    setFormName(row.name);
    setFormDesc(row.desc ?? '');
    setFormSegmentRows(segmentsRecordToRows(row.segments));
    setEditorOpen(true);
  }

  async function handleFormSubmit() {
    const nameTrimmed = formName.trim();
    if (!nameTrimmed) {
      setNotice('请填写产业链名称');
      window.setTimeout(() => setNotice(null), 4000);
      return;
    }
    const segments = rowsToSegmentsRecord(formSegmentRows);
    if (!Object.keys(segments).length) {
      setNotice('请至少填写一个产业链环节名称');
      window.setTimeout(() => setNotice(null), 4000);
      return;
    }
    setFormSubmitting(true);
    try {
      if (editorMode === 'create') {
        const payload: CreateIndustryChain = {
          name: nameTrimmed,
          segments,
          desc: formDesc.trim() || null,
        };
        await services.createIndustryChain(payload);
        setNotice('已创建');
      } else if (editingRow) {
        const payload: UpdateIndustryChain = {
          id: editingRow.id,
          name: nameTrimmed,
          segments,
          desc: formDesc.trim() || null,
          active: Boolean(editingRow.active),
        };
        await services.updateIndustryChain(payload);
        setNotice('已保存');
      }
      setEditorOpen(false);
      await refresh();
      window.setTimeout(() => setNotice(null), 6000);
    } catch {
      setNotice('保存失败');
      window.setTimeout(() => setNotice(null), 6000);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete(row: IndustryChainInfo) {
    if (!window.confirm(`确定删除产业链「${row.name}」？`)) {
      return;
    }
    try {
      await services.deleteIndustryChain({ record_id: row.id });
      setNotice('已删除');
      await refresh();
      window.setTimeout(() => setNotice(null), 6000);
    } catch {
      setNotice('删除失败');
      window.setTimeout(() => setNotice(null), 6000);
    }
  }

  async function handleToggleRowActive(row: IndustryChainInfo, nextActive: boolean) {
    try {
      await services.setIndustryChainActive({ id: row.id, active: nextActive });
      await refresh();
    } catch {
      setNotice('更新归档状态失败');
      window.setTimeout(() => setNotice(null), 6000);
    }
  }

  async function handleBatchSetActive(active: boolean) {
    const ids = [...selectedIds];
    if (!ids.length) {
      return;
    }
    setBatchBusy(true);
    try {
      const result = (await services.batchSetIndustryChainActive({
        ids,
        active,
      })) as BatchSetIndustryChainActiveResult;
      setSelectedIds(new Set());
      await refresh();
      const missing = result.not_found_ids?.length
        ? `；未找到 id：${result.not_found_ids.slice(0, 5).join('、')}${
            result.not_found_ids.length > 5 ? '…' : ''
          }`
        : '';
      setNotice(`已更新 ${result.updated_count} 条${missing}`);
      window.setTimeout(() => setNotice(null), 8000);
    } finally {
      setBatchBusy(false);
    }
  }

  return (
    <Box>
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

      <div className="flex flex-row flex-wrap justify-between items-center gap-2 mb-2">
        <span className="opacity-85 text-sm">共 {rows.length} 条</span>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
          <Button size="sm" variant="solid" color="primary" className="!text-[12px]" onClick={openCreate}>
            新建产业链
          </Button>
          <Button
            size="sm"
            variant="outlined"
            color="primary"
            className="!text-[12px]"
            loading={syncTagsBusy}
            onClick={() => void syncTagsFromIndustryChain()}
          >
            从产业链同步标签
          </Button>
          <Typography level="body-sm" textColor="neutral.600">
            已选 {selectedIds.size} 条
          </Typography>
          {listTab === 'active' ? (
            <Button
              size="sm"
              variant="soft"
              color="neutral"
              className="!text-[12px]"
              loading={batchBusy}
              disabled={!selectedIds.size}
              onClick={() => handleBatchSetActive(false)}
            >
              批量归档
            </Button>
          ) : (
            <Button
              size="sm"
              variant="soft"
              color="primary"
              className="!text-[12px]"
              loading={batchBusy}
              disabled={!selectedIds.size}
              onClick={() => handleBatchSetActive(true)}
            >
              批量恢复
            </Button>
          )}
        </Box>
      </div>

      {notice ? (
        <Typography level="body-sm" color="success" sx={{ mb: 1 }}>
          {notice}
        </Typography>
      ) : null}

      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead className="font-bold">
            <tr>
              <th style={{ width: 44, textAlign: 'center' }}>
                <Checkbox
                  size="sm"
                  checked={allDisplayedSelected}
                  indeterminate={headerCheckboxIndeterminate}
                  disabled={!selectableIdsOnPage.length}
                  onChange={toggleSelectAllOnPage}
                  slotProps={{
                    input: { 'aria-label': '全选当前列表' },
                  }}
                />
              </th>
              <th style={{ minWidth: 140 }}>产业链名称</th>
              <th style={{ minWidth: 260 }}>环节及描述</th>
              <th style={{ minWidth: 160 }}>说明</th>
              <th style={{ width: 200 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    {listTab === 'active' ? '暂无活跃产业链' : '暂无归档产业链'}
                  </Typography>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const rowId = row.id;
                const canSelect = Boolean(rowId);
                const segmentEntries = Object.entries(row.segments || {});
                return (
                  <tr key={rowId}>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <Checkbox
                        size="sm"
                        checked={Boolean(rowId && selectedIds.has(rowId))}
                        disabled={!canSelect}
                        onChange={() => rowId && toggleRow(rowId)}
                        slotProps={{
                          input: { 'aria-label': `选择 ${row.name}` },
                        }}
                      />
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <Typography level="body-md" sx={{ fontSize: '0.9375rem', lineHeight: 1.45 }}>
                        {row.name}
                      </Typography>
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      {segmentEntries.length === 0 ? (
                        <Typography level="body-xs" textColor="neutral.500">
                          —
                        </Typography>
                      ) : (
                        <Stack spacing={0.875}>
                          {segmentEntries.map(([segmentName, segmentDesc]) => (
                            <Box
                              key={segmentName}
                              sx={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                columnGap: 1,
                                rowGap: 0.25,
                                alignItems: 'baseline',
                              }}
                            >
                              <Typography
                                component="span"
                                sx={{
                                  fontSize: '0.8125rem',
                                  lineHeight: 1.45,
                                  fontWeight: 600,
                                  color: 'neutral.800',
                                }}
                              >
                                {segmentName}
                              </Typography>
                              {String(segmentDesc || '').trim() ? (
                                <Typography
                                  level="body-xs"
                                  component="span"
                                  textColor="neutral.600"
                                  sx={{ fontWeight: 400, flex: '1 1 140px', minWidth: 0 }}
                                >
                                  {String(segmentDesc).trim()}
                                </Typography>
                              ) : null}
                            </Box>
                          ))}
                        </Stack>
                      )}
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <Typography level="body-xs" textColor="neutral.500">
                        {row.desc ?? '—'}
                      </Typography>
                    </td>
                    <td style={{ verticalAlign: 'top' }}>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        <Button size="sm" variant="plain" color="primary" onClick={() => openEdit(row)}>
                          编辑
                        </Button>
                        {listTab === 'active' ? (
                          <Button
                            size="sm"
                            variant="plain"
                            color="neutral"
                            onClick={() => handleToggleRowActive(row, false)}
                          >
                            归档
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="plain"
                            color="primary"
                            onClick={() => handleToggleRowActive(row, true)}
                          >
                            恢复
                          </Button>
                        )}
                        <Button size="sm" variant="plain" color="danger" onClick={() => handleDelete(row)}>
                          删除
                        </Button>
                      </Box>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      <Modal open={editorOpen} onClose={() => setEditorOpen(false)}>
        <ModalDialog
          sx={{
            maxWidth: 560,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <ModalClose />
          <Typography level="h4" sx={{ mb: 2, flexShrink: 0 }}>
            {editorMode === 'create' ? '新建产业链' : '编辑产业链'}
          </Typography>
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
            <FormControl required sx={{ flexShrink: 0 }}>
              <FormLabel>产业链名称</FormLabel>
              <Input value={formName} onChange={(event) => setFormName(event.target.value)} placeholder="如 半导体" />
            </FormControl>
            <FormControl sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <FormLabel sx={{ flexShrink: 0 }}>
                产业链环节（名称须与 Agent 输出 JSON 第二层键一致；环节描述 ≤{SEGMENT_DESCRIPTION_MAX_LENGTH}{' '}
                字，用于提示模型理解环节边界）
              </FormLabel>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 120,
                  maxHeight: { xs: '36vh', sm: 280 },
                  overflowY: 'auto',
                  mt: 0.5,
                  pr: 0.25,
                }}
              >
                <Stack spacing={1.25}>
                  {formSegmentRows.map((row, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.75,
                        p: 1,
                        borderRadius: 'sm',
                        border: '1px solid',
                        borderColor: 'neutral.outlinedBorder',
                        bgcolor: 'background.surface',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'flex-start' }}>
                        <Input
                          size="sm"
                          placeholder="环节名称"
                          value={row.name}
                          onChange={(event) => {
                            const next = formSegmentRows.slice();
                            next[index] = { ...next[index], name: event.target.value };
                            setFormSegmentRows(next);
                          }}
                          sx={{ flex: '1 1 200px', minWidth: 140 }}
                        />
                        <IconButton
                          size="sm"
                          variant="plain"
                          color="neutral"
                          disabled={formSegmentRows.length <= 1}
                          onClick={() => {
                            setFormSegmentRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index));
                          }}
                          aria-label="删除该行"
                        >
                          <DeleteOutline />
                        </IconButton>
                      </Box>
                      <FormControl sx={{ m: 0 }}>
                        <Textarea
                          size="sm"
                          minRows={2}
                          maxRows={2}
                          placeholder={`环节描述（可选，最多 ${SEGMENT_DESCRIPTION_MAX_LENGTH} 字）`}
                          value={row.desc}
                          onChange={(event) => {
                            const next = formSegmentRows.slice();
                            next[index] = {
                              ...next[index],
                              desc: event.target.value.slice(0, SEGMENT_DESCRIPTION_MAX_LENGTH),
                            };
                            setFormSegmentRows(next);
                          }}
                          sx={{
                            width: '100%',
                            '& textarea': {
                              minHeight: '3.25rem',
                              maxHeight: '3.25rem',
                              overflowY: 'auto',
                              resize: 'none',
                              wordBreak: 'break-word',
                              whiteSpace: 'pre-wrap',
                              lineHeight: 1.5,
                            },
                          }}
                        />
                        <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 0.25 }}>
                          {row.desc.length}/{SEGMENT_DESCRIPTION_MAX_LENGTH}
                        </Typography>
                      </FormControl>
                    </Box>
                  ))}
                  <Button
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    startDecorator={<Add />}
                    onClick={() => setFormSegmentRows((previous) => [...previous, emptySegmentRow()])}
                  >
                    添加环节
                  </Button>
                </Stack>
              </Box>
            </FormControl>
            <FormControl sx={{ flexShrink: 0 }}>
              <FormLabel>说明</FormLabel>
              <Input value={formDesc} onChange={(event) => setFormDesc(event.target.value)} />
            </FormControl>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1, flexShrink: 0 }}>
              <Button variant="plain" color="neutral" onClick={() => setEditorOpen(false)}>
                取消
              </Button>
              <Button loading={formSubmitting} onClick={handleFormSubmit}>
                保存
              </Button>
            </Box>
          </Stack>
        </ModalDialog>
      </Modal>
    </Box>
  );
}
