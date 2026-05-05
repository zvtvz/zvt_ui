'use client';

import { useState } from 'react';
import { useRequest } from 'ahooks';
import { Button, Chip, Typography } from '@mui/joy';
import services from '@/services';
import type { Pool } from '@/interfaces';
import CreateStockPoolDialog from '@/app/trade/CreateStockPoolDialog';
import UpdateStockPoolDialog from '@/app/trade/UpdateStockPoolDialog';

export default function StockPoolsTab() {
  const [createPoolOpen, setCreatePoolOpen] = useState(false);
  const [editingPool, setEditingPool] = useState<Pool | null>(null);
  const [restoringName, setRestoringName] = useState<string | null>(null);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [confirmDeleteName, setConfirmDeleteName] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string>('');

  const {
    data: pools,
    loading,
    refresh,
  } = useRequest(() => services.getPools({ include_archived: true }), {
    refreshDeps: [],
  });

  const poolList: Pool[] = Array.isArray(pools) ? pools : [];

  const handleRestore = async (pool: Pool) => {
    setRestoringName(pool.stock_pool_name);
    setActionError('');
    try {
      await services.restoreStockPool({ stock_pool_name: pool.stock_pool_name });
      refresh();
    } catch (err: any) {
      setActionError(err?.message || '恢复失败');
    } finally {
      setRestoringName(null);
    }
  };

  const handleDelete = async (pool: Pool) => {
    setDeletingName(pool.stock_pool_name);
    setActionError('');
    try {
      await services.deleteStockPool({ stock_pool_name: pool.stock_pool_name });
      setConfirmDeleteName(null);
      refresh();
    } catch (err: any) {
      setActionError(err?.message || '删除失败');
      setConfirmDeleteName(null);
    } finally {
      setDeletingName(null);
    }
  };

  return (
    <div>
      <div className="flex flex-row justify-between items-center mb-2">
        <span className="opacity-85 text-sm">共 {poolList.length} 个</span>
        <Button
          size="sm"
          variant="soft"
          className="!text-[12px] !py-1"
          onClick={() => setCreatePoolOpen(true)}
        >
          新建股票池
        </Button>
      </div>

      {loading && (
        <div className="text-sm text-neutral-500 py-4">加载中…</div>
      )}

      {!loading && poolList.length === 0 && (
        <div className="text-sm text-neutral-400 py-4">暂无股票池</div>
      )}

      {actionError && (
        <div className="mb-2 text-sm text-red-600">{actionError}</div>
      )}

      <div className="flex flex-col gap-2">
        {poolList.map((pool) => {
          const isArchived = pool.active === false;
          const isCustom = pool.stock_pool_type === 'custom';
          const isConfirmingDelete = confirmDeleteName === pool.stock_pool_name;

          return (
            <div
              key={pool.id}
              className="flex items-center justify-between px-3 py-2 rounded-lg border border-neutral-200 bg-white"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Typography level="body-sm" className="font-medium truncate">
                  {pool.stock_pool_name}
                </Typography>
                <Chip
                  size="sm"
                  variant="soft"
                  color={isCustom ? 'primary' : 'neutral'}
                >
                  {isCustom ? '自定义' : pool.stock_pool_type}
                </Chip>
                {isArchived && (
                  <Chip size="sm" variant="soft" color="warning">
                    已归档
                  </Chip>
                )}
              </div>

              {isCustom && (
                <div className="flex items-center gap-2 ml-2 shrink-0">
                  {isConfirmingDelete ? (
                    <>
                      <Typography level="body-xs" textColor="danger.600">
                        确认删除？
                      </Typography>
                      <Button
                        size="sm"
                        variant="soft"
                        color="danger"
                        loading={deletingName === pool.stock_pool_name}
                        onClick={() => handleDelete(pool)}
                      >
                        确认
                      </Button>
                      <Button
                        size="sm"
                        variant="plain"
                        onClick={() => setConfirmDeleteName(null)}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      {isArchived ? (
                        <Button
                          size="sm"
                          variant="soft"
                          color="success"
                          loading={restoringName === pool.stock_pool_name}
                          onClick={() => handleRestore(pool)}
                        >
                          恢复
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="plain"
                          onClick={() => setEditingPool(pool)}
                        >
                          编辑
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="plain"
                        color="danger"
                        onClick={() => {
                          setConfirmDeleteName(pool.stock_pool_name);
                          setActionError('');
                        }}
                      >
                        删除
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <CreateStockPoolDialog
        open={createPoolOpen}
        onSubmit={() => {
          refresh();
          setCreatePoolOpen(false);
        }}
        onCancel={() => setCreatePoolOpen(false)}
      />
      <UpdateStockPoolDialog
        open={editingPool !== null}
        pool={editingPool}
        onSaved={() => {
          setEditingPool(null);
          refresh();
        }}
        onCancel={() => setEditingPool(null)}
        onArchived={() => {
          setEditingPool(null);
          refresh();
        }}
      />
    </div>
  );
}
