import Loading from '@/components/Loading';
import services from '@/services';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  Button,
  FormLabel,
  Autocomplete,
  ModalClose,
  DialogActions,
  Typography,
  Textarea,
  Box,
} from '@mui/joy';
import { useRequest } from 'ahooks';
import { useCallback, useEffect, useMemo, useState } from 'react';

type TagKind = 'main_tag' | 'sub_tag' | 'hidden_tag';

type AddKind = 'main' | 'sub' | 'hidden';

type EditTarget = {
  tagType: TagKind;
  name: string;
  reason: string;
};

function tagKindLabel(tagType: TagKind): string {
  if (tagType === 'main_tag') return '主标签';
  if (tagType === 'sub_tag') return '次标签';
  return '隐藏标签';
}

type StockTagsResponse = {
  entity_id: string;
  main_tag?: string | null;
  main_tag_reason?: string | null;
  main_tags?: Record<string, string>;
  sub_tag?: string | null;
  sub_tag_reason?: string | null;
  sub_tags?: Record<string, string> | null;
  active_hidden_tags?: Record<string, string> | null;
  hidden_tags?: Record<string, string> | null;
};

type TagOptionItem = { name: string; desc?: string | null };

type CatalogResponse = {
  main_tag_options: TagOptionItem[];
  sub_tag_options: TagOptionItem[];
  hidden_tag_options: TagOptionItem[];
};

type Props = {
  open: boolean;
  stock: { entity_id: string };
  onCancel: () => void;
};

function tagOptionNames(options: TagOptionItem[]): string[] {
  return options.map((item) => item.name);
}

function findCatalogDesc(
  catalog: CatalogResponse | undefined,
  kind: AddKind,
  name: string
): string {
  if (!catalog || !name) return '';
  const list =
    kind === 'main'
      ? catalog.main_tag_options
      : kind === 'sub'
        ? catalog.sub_tag_options
        : catalog.hidden_tag_options;
  return list.find((item) => item.name === name)?.desc || '';
}

function sortMainEntries(
  entries: [string, string][],
  activeName: string | null | undefined
): [string, string][] {
  return [...entries].sort(([nameA], [nameB]) => {
    const activeA = nameA === activeName ? 0 : 1;
    const activeB = nameB === activeName ? 0 : 1;
    if (activeA !== activeB) return activeA - activeB;
    return nameA.localeCompare(nameB);
  });
}

function sortSubEntries(
  entries: [string, string][],
  activeName: string | null | undefined
): [string, string][] {
  return [...entries].sort(([nameA], [nameB]) => {
    const activeA = nameA === activeName ? 0 : 1;
    const activeB = nameB === activeName ? 0 : 1;
    if (activeA !== activeB) return activeA - activeB;
    return nameA.localeCompare(nameB);
  });
}

function sortHiddenEntries(
  entries: [string, string][],
  activeHidden: Record<string, string> | null | undefined
): [string, string][] {
  const activeSet = new Set(Object.keys(activeHidden || {}));
  return [...entries].sort(([nameA], [nameB]) => {
    const onA = activeSet.has(nameA) ? 0 : 1;
    const onB = activeSet.has(nameB) ? 0 : 1;
    if (onA !== onB) return onA - onB;
    return nameA.localeCompare(nameB);
  });
}

export default function TagUpdateDialog({
  open,
  stock,
  onCancel,
}: Props) {
  const [actionLoading, setActionLoading] = useState(false);
  const [addKind, setAddKind] = useState<AddKind | null>(null);
  const [draft, setDraft] = useState({ tag: '', reason: '' });
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [editReasonDraft, setEditReasonDraft] = useState('');

  const addDialogOpen = addKind !== null;
  const editDialogOpen = editTarget !== null;

  const {
    data: stockTags,
    loading: stockLoading,
    refresh: refreshStockTags,
  } = useRequest(
    () => services.getStockTags({ entity_id: stock.entity_id }) as Promise<StockTagsResponse>,
    { ready: open, refreshDeps: [stock.entity_id, open] }
  );

  const {
    data: catalog,
    loading: catalogLoading,
    refresh: refreshCatalog,
  } = useRequest(
    () =>
      services.getStockTagCatalogOptions({
        entity_id: stock.entity_id,
      }) as Promise<CatalogResponse>,
    { ready: open && addDialogOpen, refreshDeps: [stock.entity_id, open, addKind] }
  );

  useEffect(() => {
    if (!addKind) return;
    if (!catalog || catalogLoading) {
      setDraft({ tag: '', reason: '' });
      return;
    }
    const options =
      addKind === 'main'
        ? catalog.main_tag_options
        : addKind === 'sub'
          ? catalog.sub_tag_options
          : catalog.hidden_tag_options;
    const first = options[0];
    if (first?.name) {
      setDraft({ tag: first.name, reason: first.desc || '' });
    } else {
      setDraft({ tag: '', reason: '' });
    }
  }, [addKind, catalog, catalogLoading]);

  useEffect(() => {
    if (!open) {
      setAddKind(null);
      setDraft({ tag: '', reason: '' });
      setEditTarget(null);
      setEditReasonDraft('');
    }
  }, [open]);

  const openEditReason = (tagType: TagKind, name: string, reason: string) => {
    setEditTarget({ tagType, name, reason });
    setEditReasonDraft(reason || '');
  };

  const closeEditReason = () => {
    setEditTarget(null);
    setEditReasonDraft('');
  };

  const handleSaveEditReason = async () => {
    if (!editTarget) return;
    setActionLoading(true);
    try {
      await services.updateStockTagReason({
        entity_id: stock.entity_id,
        tag_type: editTarget.tagType,
        tag_name: editTarget.name,
        reason: editReasonDraft,
      });
      closeEditReason();
      await refreshStockTags();
      if (addDialogOpen) await refreshCatalog();
    } finally {
      setActionLoading(false);
    }
  };

  const refreshAll = useCallback(async () => {
    await Promise.all([refreshStockTags(), refreshCatalog()]);
  }, [refreshStockTags, refreshCatalog]);

  const mainTagEntries = useMemo(
    () => sortMainEntries(Object.entries(stockTags?.main_tags || {}), stockTags?.main_tag),
    [stockTags?.main_tags, stockTags?.main_tag]
  );
  const subTagEntries = useMemo(
    () => sortSubEntries(Object.entries(stockTags?.sub_tags || {}), stockTags?.sub_tag),
    [stockTags?.sub_tags, stockTags?.sub_tag]
  );
  const hiddenTagEntries = useMemo(
    () =>
      sortHiddenEntries(
        Object.entries(stockTags?.hidden_tags || {}),
        stockTags?.active_hidden_tags
      ),
    [stockTags?.hidden_tags, stockTags?.active_hidden_tags]
  );

  const handleRemove = async (tagType: TagKind, tagName: string) => {
    setActionLoading(true);
    try {
      await services.removeStockTag({
        entity_id: stock.entity_id,
        tag_type: tagType,
        tag_name: tagName,
      });
      await refreshStockTags();
      if (addDialogOpen) await refreshCatalog();
    } finally {
      setActionLoading(false);
    }
  };

  /** 切换主/次当前选中时须带上，避免后端把 active_hidden_tags 写成 null。 */
  const activeHiddenTagsPayload = useMemo(
    () => ({ ...(stockTags?.active_hidden_tags || {}) }),
    [stockTags?.active_hidden_tags]
  );

  const handleActivateMain = async (name: string, reason: string) => {
    setActionLoading(true);
    try {
      await services.updateStockTags({
        entity_id: stock.entity_id,
        main_tag: name,
        main_tag_reason: reason,
        sub_tag: stockTags?.sub_tag || undefined,
        sub_tag_reason: stockTags?.sub_tag_reason || undefined,
        active_hidden_tags: activeHiddenTagsPayload,
        keep_current_selections: false,
      });
      await refreshStockTags();
      if (addDialogOpen) await refreshCatalog();
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateSub = async (name: string, reason: string) => {
    const activeMain = stockTags?.main_tag;
    if (!activeMain) return;
    setActionLoading(true);
    try {
      const mainReason =
        stockTags?.main_tags?.[activeMain] ?? stockTags?.main_tag_reason ?? '';
      await services.updateStockTags({
        entity_id: stock.entity_id,
        main_tag: activeMain,
        main_tag_reason: mainReason,
        sub_tag: name,
        sub_tag_reason: reason,
        active_hidden_tags: activeHiddenTagsPayload,
        keep_current_selections: false,
      });
      await refreshStockTags();
      if (addDialogOpen) await refreshCatalog();
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivateHidden = async (name: string, reason: string) => {
    const activeMain = stockTags?.main_tag;
    if (!activeMain) return;
    setActionLoading(true);
    try {
      const mainReason =
        stockTags?.main_tags?.[activeMain] ?? stockTags?.main_tag_reason ?? '';
      await services.updateStockTags({
        entity_id: stock.entity_id,
        main_tag: activeMain,
        main_tag_reason: mainReason,
        sub_tag: stockTags?.sub_tag || undefined,
        sub_tag_reason: stockTags?.sub_tag_reason || undefined,
        active_hidden_tags: { [name]: reason },
        keep_current_selections: true,
      });
      await refreshStockTags();
      if (addDialogOpen) await refreshCatalog();
    } finally {
      setActionLoading(false);
    }
  };

  /** 仅取消该隐藏标签的激活状态，保留 hidden_tags 字典中的条目，与删除整条不同。 */
  const handleDeactivateHidden = async (name: string) => {
    const activeMain = stockTags?.main_tag;
    if (!activeMain) return;
    setActionLoading(true);
    try {
      const mainReason =
        stockTags?.main_tags?.[activeMain] ?? stockTags?.main_tag_reason ?? '';
      const nextActive = { ...activeHiddenTagsPayload };
      delete nextActive[name];
      await services.updateStockTags({
        entity_id: stock.entity_id,
        main_tag: activeMain,
        main_tag_reason: mainReason,
        sub_tag: stockTags?.sub_tag || undefined,
        sub_tag_reason: stockTags?.sub_tag_reason || undefined,
        active_hidden_tags: nextActive,
        keep_current_selections: false,
      });
      await refreshStockTags();
      if (addDialogOpen) await refreshCatalog();
    } finally {
      setActionLoading(false);
    }
  };

  const closeAddDialog = () => {
    setAddKind(null);
  };

  const appendFromCatalog = async () => {
    const name = draft.tag.trim();
    if (!name || !addKind) return;
    setActionLoading(true);
    try {
      if (addKind === 'main') {
        const isFirstMain = mainTagEntries.length === 0;
        await services.updateStockTags({
          entity_id: stock.entity_id,
          main_tag: name,
          main_tag_reason: draft.reason,
          keep_current_selections: !isFirstMain,
        });
      } else if (addKind === 'sub') {
        const activeMain = stockTags?.main_tag;
        if (!activeMain) return;
        const mainReason =
          stockTags?.main_tags?.[activeMain] ?? stockTags?.main_tag_reason ?? '';
        await services.updateStockTags({
          entity_id: stock.entity_id,
          main_tag: activeMain,
          main_tag_reason: mainReason,
          sub_tag: name,
          sub_tag_reason: draft.reason,
          keep_current_selections: true,
        });
      } else {
        const activeMain = stockTags?.main_tag;
        if (!activeMain) return;
        const mainReason =
          stockTags?.main_tags?.[activeMain] ?? stockTags?.main_tag_reason ?? '';
        await services.updateStockTags({
          entity_id: stock.entity_id,
          main_tag: activeMain,
          main_tag_reason: mainReason,
          sub_tag: stockTags?.sub_tag || undefined,
          sub_tag_reason: stockTags?.sub_tag_reason || undefined,
          active_hidden_tags: { [name]: draft.reason },
          keep_current_selections: true,
        });
      }
      closeAddDialog();
      await refreshAll();
    } finally {
      setActionLoading(false);
    }
  };

  const catalogNames = useMemo(() => {
    if (!catalog || !addKind) return [];
    if (addKind === 'main') return tagOptionNames(catalog.main_tag_options);
    if (addKind === 'sub') return tagOptionNames(catalog.sub_tag_options);
    return tagOptionNames(catalog.hidden_tag_options);
  }, [catalog, addKind]);

  const addDialogTitle =
    addKind === 'main' ? '添加主标签' : addKind === 'sub' ? '添加次标签' : '添加隐藏标签';

  const rowSx = (active: boolean) =>
    ({
      p: 1,
      borderRadius: 'sm',
      border: '1px solid',
      borderColor: active ? 'primary.outlinedBorder' : 'divider',
      bgcolor: active ? 'primary.softBg' : 'background.level1',
    }) as const;

  return (
    <>
      <Modal open={open} onClose={onCancel}>
        <ModalDialog className="w-[520px]" size="sm">
          <ModalClose size="sm" />
          <DialogTitle>修改标签</DialogTitle>
          <DialogContent>
            <Loading loading={stockLoading} fixedTop={360}>
              <Stack spacing={2.5}>
                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 0.75 }}
                  >
                    <FormLabel>主标签</FormLabel>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => setAddKind('main')}
                      loading={actionLoading}
                    >
                      添加
                    </Button>
                  </Stack>
                  {mainTagEntries.length ? (
                    <Stack spacing={1}>
                      {mainTagEntries.map(([name, reason]) => {
                        const active = name === stockTags?.main_tag;
                        return (
                          <Stack
                            key={name}
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                            sx={rowSx(active)}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography level="body-sm" fontWeight="lg">
                                {name}
                              </Typography>
                              <Typography level="body-xs" sx={{ opacity: 0.85 }}>
                                {reason || '—'}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Button
                                size="sm"
                                variant="plain"
                                color="neutral"
                                loading={actionLoading}
                                onClick={() =>
                                  openEditReason('main_tag', name, reason || '')
                                }
                              >
                                编辑
                              </Button>
                              {!active ? (
                                <Button
                                  size="sm"
                                  variant="plain"
                                  color="primary"
                                  loading={actionLoading}
                                  onClick={() =>
                                    handleActivateMain(name, reason || '')
                                  }
                                >
                                  激活
                                </Button>
                              ) : null}
                              <Button
                                size="sm"
                                variant="plain"
                                color="danger"
                                loading={actionLoading}
                                onClick={() => handleRemove('main_tag', name)}
                              >
                                删除
                              </Button>
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography level="body-sm" sx={{ opacity: 0.5 }}>
                      暂无
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 0.75 }}
                  >
                    <FormLabel>次标签</FormLabel>
                    <Button
                      size="sm"
                      variant="outlined"
                      disabled={!stockTags?.main_tag}
                      title={!stockTags?.main_tag ? '请先设置主标签' : undefined}
                      onClick={() => setAddKind('sub')}
                      loading={actionLoading}
                    >
                      添加
                    </Button>
                  </Stack>
                  {subTagEntries.length ? (
                    <Stack spacing={1}>
                      {subTagEntries.map(([name, reason]) => {
                        const active = name === stockTags?.sub_tag;
                        return (
                          <Stack
                            key={name}
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                            sx={rowSx(active)}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography level="body-sm" fontWeight="lg">
                                {name}
                              </Typography>
                              <Typography level="body-xs" sx={{ opacity: 0.85 }}>
                                {reason || '—'}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Button
                                size="sm"
                                variant="plain"
                                color="neutral"
                                loading={actionLoading}
                                onClick={() =>
                                  openEditReason('sub_tag', name, reason || '')
                                }
                              >
                                编辑
                              </Button>
                              {!active ? (
                                <Button
                                  size="sm"
                                  variant="plain"
                                  color="primary"
                                  loading={actionLoading}
                                  disabled={!stockTags?.main_tag}
                                  title={
                                    !stockTags?.main_tag ? '请先设置主标签' : undefined
                                  }
                                  onClick={() =>
                                    handleActivateSub(name, reason || '')
                                  }
                                >
                                  激活
                                </Button>
                              ) : null}
                              <Button
                                size="sm"
                                variant="plain"
                                color="danger"
                                loading={actionLoading}
                                onClick={() => handleRemove('sub_tag', name)}
                              >
                                删除
                              </Button>
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography level="body-sm" sx={{ opacity: 0.5 }}>
                      暂无
                    </Typography>
                  )}
                </Box>

                <Box>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 0.75 }}
                  >
                    <FormLabel>隐藏标签</FormLabel>
                    <Button
                      size="sm"
                      variant="outlined"
                      disabled={!stockTags?.main_tag}
                      title={!stockTags?.main_tag ? '请先设置主标签' : undefined}
                      onClick={() => setAddKind('hidden')}
                      loading={actionLoading}
                    >
                      添加
                    </Button>
                  </Stack>
                  {hiddenTagEntries.length ? (
                    <Stack spacing={1}>
                      {hiddenTagEntries.map(([name, reason]) => {
                        const active = Boolean(
                          stockTags?.active_hidden_tags &&
                            name in stockTags.active_hidden_tags
                        );
                        return (
                          <Stack
                            key={name}
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                            sx={rowSx(active)}
                          >
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography level="body-sm" fontWeight="lg">
                                {name}
                              </Typography>
                              <Typography level="body-xs" sx={{ opacity: 0.85 }}>
                                {reason || '—'}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Button
                                size="sm"
                                variant="plain"
                                color="neutral"
                                loading={actionLoading}
                                onClick={() =>
                                  openEditReason('hidden_tag', name, reason || '')
                                }
                              >
                                编辑
                              </Button>
                              {!active ? (
                                <Button
                                  size="sm"
                                  variant="plain"
                                  color="primary"
                                  loading={actionLoading}
                                  disabled={!stockTags?.main_tag}
                                  title={
                                    !stockTags?.main_tag ? '请先设置主标签' : undefined
                                  }
                                  onClick={() =>
                                    handleActivateHidden(name, reason || '')
                                  }
                                >
                                  激活
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="plain"
                                  color="neutral"
                                  loading={actionLoading}
                                  disabled={!stockTags?.main_tag}
                                  title={
                                    !stockTags?.main_tag ? '请先设置主标签' : undefined
                                  }
                                  onClick={() => handleDeactivateHidden(name)}
                                >
                                  取消激活
                                </Button>
                              )}
                              <Button
                                size="sm"
                                variant="plain"
                                color="danger"
                                loading={actionLoading}
                                onClick={() => handleRemove('hidden_tag', name)}
                              >
                                删除
                              </Button>
                            </Stack>
                          </Stack>
                        );
                      })}
                    </Stack>
                  ) : (
                    <Typography level="body-sm" sx={{ opacity: 0.5 }}>
                      暂无
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Loading>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start' }}>
            <Button size="sm" variant="plain" onClick={onCancel}>
              取消
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      <Modal open={editDialogOpen} onClose={closeEditReason}>
        <ModalDialog sx={{ maxWidth: 420, width: '100%' }} size="sm">
          <ModalClose size="sm" />
          <DialogTitle>
            编辑原因
            {editTarget
              ? ` · ${tagKindLabel(editTarget.tagType)} · ${editTarget.name}`
              : ''}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={1.5}>
              <FormLabel>原因</FormLabel>
              <Textarea
                size="sm"
                minRows={3}
                placeholder="填写该标签的原因"
                value={editReasonDraft}
                onChange={(event) => setEditReasonDraft(event.target.value)}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start' }}>
            <Button size="sm" variant="plain" onClick={closeEditReason}>
              取消
            </Button>
            <Button
              size="sm"
              className="!ml-2"
              loading={actionLoading}
              onClick={handleSaveEditReason}
            >
              保存
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>

      <Modal open={addDialogOpen} onClose={closeAddDialog}>
        <ModalDialog sx={{ maxWidth: 420, width: '100%' }} size="sm">
          <ModalClose size="sm" />
          <DialogTitle>{addDialogTitle}</DialogTitle>
          <DialogContent>
            <Loading loading={catalogLoading} fixedTop={280}>
              <Stack spacing={1.5}>
                <Autocomplete
                  options={catalogNames}
                  size="sm"
                  value={draft.tag || null}
                  onChange={(event, newValue) => {
                    const name = (newValue as string) || '';
                    setDraft({
                      tag: name,
                      reason: findCatalogDesc(catalog, addKind || 'main', name),
                    });
                  }}
                  inputValue={draft.tag}
                  onInputChange={(event, newInputValue) => {
                    setDraft((previous) => ({ ...previous, tag: newInputValue }));
                  }}
                  sx={{ '--unstable_popup-zIndex': 20000 }}
                  slotProps={{
                    listbox: {
                      placement: 'bottom-start',
                      sx: { zIndex: 20000 },
                    },
                  }}
                />
                <FormLabel>原因</FormLabel>
                <Textarea
                  size="sm"
                  minRows={2}
                  placeholder="可编辑原因"
                  value={draft.reason}
                  onChange={(event) =>
                    setDraft((previous) => ({ ...previous, reason: event.target.value }))
                  }
                />
              </Stack>
            </Loading>
          </DialogContent>
          <DialogActions sx={{ justifyContent: 'flex-start' }}>
            <Button size="sm" variant="plain" onClick={closeAddDialog}>
              取消
            </Button>
            <Button
              size="sm"
              className="!ml-2"
              loading={actionLoading}
              disabled={!draft.tag.trim()}
              onClick={appendFromCatalog}
            >
              激活
            </Button>
          </DialogActions>
        </ModalDialog>
      </Modal>
    </>
  );
}
