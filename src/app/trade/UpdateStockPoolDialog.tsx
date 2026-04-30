'use client';

import services from '@/services';
import type { Pool } from '@/interfaces';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Button,
  ModalClose,
  Typography,
} from '@mui/joy';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!open) {
      setConfirmArchive(false);
      setError('');
    }
  }, [open]);

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
