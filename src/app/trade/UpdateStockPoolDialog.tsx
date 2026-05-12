'use client';

import { useRequest } from 'ahooks';
import services from '@/services';
import type { Pool } from '@/interfaces';
import {
  Autocomplete,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Button,
  ModalClose,
  Typography,
  FormControl,
  FormLabel,
} from '@mui/joy';
import { useEffect, useMemo, useState } from 'react';
import StockPoolEntityEditor, {
  type StockPoolEntityRow,
} from './StockPoolEntityEditor';

type Props = {
  open: boolean;
  pool: Pool | null;
  onSaved: () => void;
  onCancel: () => void;
  onArchived?: () => void;
};

export default function UpdateStockPoolDialog({
  open,
  pool,
  onSaved,
  onCancel,
  onArchived,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const [confirmArchive, setConfirmArchive] = useState(false);
  const [error, setError] = useState('');
  const [entityRows, setEntityRows] = useState<StockPoolEntityRow[]>([]);
  const [relatedConcept, setRelatedConcept] = useState<string>('');

  const isCustomPool = pool?.stock_pool_type === 'custom';

  const { data: conceptList = [], loading: conceptListLoading } = useRequest(
    () => services.getConceptInfo({ active: true }) as Promise<{ name?: string }[]>,
    {
      ready: open && isCustomPool,
      refreshDeps: [open, pool?.stock_pool_name, isCustomPool],
    }
  );

  const conceptNames = useMemo(() => {
    return (Array.isArray(conceptList) ? conceptList : [])
      .map((row) => (row?.name || '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  }, [conceptList]);

  const poolRelatedOrphan = useMemo(() => {
    const raw = pool?.related_concept;
    return typeof raw === 'string' && raw.trim() ? raw.trim() : '';
  }, [pool?.related_concept]);

  const selectOptionNames = useMemo(() => {
    const names = [...conceptNames];
    if (poolRelatedOrphan && !names.includes(poolRelatedOrphan)) {
      names.push(poolRelatedOrphan);
      names.sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    }
    return names;
  }, [conceptNames, poolRelatedOrphan]);

  useEffect(() => {
    if (!open) {
      setConfirmArchive(false);
      setError('');
      setRelatedConcept('');
    }
  }, [open]);

  useEffect(() => {
    if (!open || !pool?.stock_pool_name) return;
    const raw = pool.related_concept;
    const normalized =
      typeof raw === 'string' && raw.trim() ? raw.trim() : '';
    setRelatedConcept(normalized);
  }, [open, pool?.stock_pool_name, pool?.related_concept]);

  useEffect(() => {
    if (!open || !pool?.stock_pool_name) {
      setEntityRows([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoadingData(true);
      setError('');
      try {
        const snap = await services.getPoolEntities({
          stock_pool_name: pool.stock_pool_name,
        });
        const rawIds: string[] = Array.isArray((snap as any)?.entity_ids)
          ? (snap as any).entity_ids
          : [];
        if (!rawIds.length) {
          if (!cancelled) setEntityRows([]);
          return;
        }
        const labels = await services.resolveStockPoolEntities({
          entity_ids: rawIds,
        });
        if (cancelled) return;
        const list = Array.isArray(labels) ? labels : [];
        setEntityRows(
          list.map((item: any) => ({
            entity_id: item.entity_id,
            code: item.code || '',
            name: item.name || '',
          }))
        );
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || '加载股票池失败');
          setEntityRows([]);
        }
      } finally {
        if (!cancelled) setLoadingData(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, pool?.stock_pool_name]);

  const handleArchive = async () => {
    if (!pool?.stock_pool_name) return;
    setArchiving(true);
    setError('');
    try {
      await services.archiveStockPool({ stock_pool_name: pool.stock_pool_name });
      onArchived?.();
    } catch (err: any) {
      setError(err?.message || '归档失败');
      setConfirmArchive(false);
    } finally {
      setArchiving(false);
    }
  };

  const handleSave = async () => {
    if (!pool?.stock_pool_name) return;
    setError('');
    setLoading(true);
    try {
      if (isCustomPool) {
        const conceptName = relatedConcept.trim();
        if (
          conceptName &&
          !conceptNames.includes(conceptName) &&
          conceptName !== poolRelatedOrphan
        ) {
          setError('请从下拉列表中选择有效的概念名称');
          setLoading(false);
          return;
        }
        const conceptRes = await services.setStockPoolRelatedConcept({
          stock_pool_name: pool.stock_pool_name,
          related_concept: conceptName || null,
        });
        if (conceptRes && (conceptRes as any).detail) {
          const d = (conceptRes as any).detail;
          setError(
            Array.isArray(d) ? d[0]?.msg || String(d[0]) : String(d)
          );
          return;
        }
      }
      const res = await services.buildStockPool({
        stock_pool_name: pool.stock_pool_name,
        entity_ids: entityRows.map((r) => r.entity_id),
        insert_mode: 'overwrite',
      });
      if (res && (res as any).detail) {
        const d = (res as any).detail;
        setError(
          Array.isArray(d) ? d[0]?.msg || String(d[0]) : String(d)
        );
        return;
      }
      onSaved();
    } catch (err: any) {
      setError(err?.message || err?.response?.data?.detail || '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[480px] !text-[14px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>更新股票池标的</DialogTitle>
        <DialogContent>
          <Typography level="body-sm" className="mb-2 opacity-80">
            {pool?.stock_pool_name
              ? `「${pool.stock_pool_name}」内 A 股标的，可搜索添加或点击标签删除`
              : ''}
          </Typography>
          {isCustomPool && (
            <FormControl className="mb-3" size="sm">
              <FormLabel>关联概念</FormLabel>
              <Autocomplete
                freeSolo={false}
                options={selectOptionNames}
                size="sm"
                loading={conceptListLoading}
                placeholder={
                  conceptListLoading ? '加载概念…' : '输入筛选或选择概念（可选）'
                }
                value={relatedConcept || null}
                onChange={(_event, newValue) => {
                  setRelatedConcept(typeof newValue === 'string' ? newValue : '');
                }}
                inputValue={relatedConcept}
                onInputChange={(_event, newInputValue) => {
                  setRelatedConcept(newInputValue);
                }}
                sx={{
                  width: '100%',
                  '--unstable_popup-zIndex': 20000,
                }}
                slotProps={{
                  listbox: {
                    variant: 'outlined',
                    placement: 'bottom-start',
                    sx: { zIndex: 20000, maxHeight: 280 },
                  },
                }}
              />
              <Typography level="body-xs" className="mt-1 opacity-70">
                与「从概念并入」相同：输入可筛选列表；须为已启用概念名。清空表示不关联板块成分。
              </Typography>
            </FormControl>
          )}
          {loadingData ? (
            <div className="py-8 text-center text-sm text-neutral-500">
              加载中…
            </div>
          ) : (
            <StockPoolEntityEditor rows={entityRows} onChange={setEntityRows} />
          )}
          {error && (
            <div className="mt-2 text-sm text-red-600">{error}</div>
          )}
        </DialogContent>
        <div className="flex justify-between gap-2 mt-4 px-4 pb-4">
          <div>
            {pool?.stock_pool_type === 'custom' && (
              confirmArchive ? (
                <div className="flex items-center gap-2">
                  <Typography level="body-xs" textColor="warning.600">确认归档？</Typography>
                  <Button
                    size="sm"
                    variant="soft"
                    color="warning"
                    loading={archiving}
                    onClick={handleArchive}
                  >
                    确认
                  </Button>
                  <Button size="sm" variant="plain" onClick={() => setConfirmArchive(false)}>
                    取消
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="soft"
                  color="neutral"
                  onClick={() => setConfirmArchive(true)}
                >
                  归档
                </Button>
              )
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="plain" size="sm" onClick={onCancel}>
              取消
            </Button>
            <Button
              size="sm"
              loading={loading}
              disabled={loadingData}
              onClick={handleSave}
            >
              保存
            </Button>
          </div>
        </div>
      </ModalDialog>
    </Modal>
  );
}
