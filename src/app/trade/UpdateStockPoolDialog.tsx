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
};

export default function UpdateStockPoolDialog({
  open,
  pool,
  onSaved,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [entityRows, setEntityRows] = useState<StockPoolEntityRow[]>([]);

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
        <div className="flex justify-end gap-2 mt-4 px-4 pb-4">
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
      </ModalDialog>
    </Modal>
  );
}
