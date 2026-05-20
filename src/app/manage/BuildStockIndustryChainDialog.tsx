'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Autocomplete,
  Button,
  Checkbox,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy';
import services from '@/services';
import StockPoolEntityEditor, {
  type StockPoolEntityRow,
} from '../trade/StockPoolEntityEditor';

type StockPoolInfoRow = {
  stock_pool_name: string;
  active?: boolean;
};

type Props = {
  open: boolean;
  industryChainName: string;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: (entityIds: string[]) => void;
};

export default function BuildStockIndustryChainDialog({
  open,
  industryChainName,
  submitting = false,
  onCancel,
  onConfirm,
}: Props) {
  const [entityRows, setEntityRows] = useState<StockPoolEntityRow[]>([]);
  const [ignoreExistingInIndustryChain, setIgnoreExistingInIndustryChain] = useState(true);
  const [selectedStockPoolName, setSelectedStockPoolName] = useState('');
  const [stockPoolInput, setStockPoolInput] = useState('');
  const [loadPoolBusy, setLoadPoolBusy] = useState(false);
  const [confirmHint, setConfirmHint] = useState('');

  const poolsRequest = useRequest(
    async () => (await services.getPools({ include_archived: false })) as StockPoolInfoRow[],
    { ready: open, refreshDeps: [open] }
  );

  const stockPoolNameOptions = useMemo(
    () =>
      (poolsRequest.data ?? [])
        .map((row) => row.stock_pool_name)
        .filter((name): name is string => Boolean(name?.trim())),
    [poolsRequest.data]
  );

  const stockPoolNameSet = useMemo(() => new Set(stockPoolNameOptions), [stockPoolNameOptions]);

  const poolEntitiesRequest = useRequest(
    async () => {
      const poolName = selectedStockPoolName.trim();
      if (!poolName) {
        return [] as string[];
      }
      const snapshot = (await services.getPoolEntities({
        stock_pool_name: poolName,
      })) as { entity_ids?: string[] } | null;
      return Array.isArray(snapshot?.entity_ids) ? snapshot.entity_ids.filter(Boolean) : [];
    },
    {
      ready: open && Boolean(selectedStockPoolName.trim()),
      refreshDeps: [selectedStockPoolName, open],
    }
  );

  const scopeEntityIds = useMemo(
    () => new Set(poolEntitiesRequest.data ?? []),
    [poolEntitiesRequest.data]
  );

  useEffect(() => {
    if (!open) {
      setEntityRows([]);
      setIgnoreExistingInIndustryChain(true);
      setSelectedStockPoolName('');
      setStockPoolInput('');
      setConfirmHint('');
      return;
    }
    const names = stockPoolNameOptions;
    if (!names.length) {
      setSelectedStockPoolName('');
      setStockPoolInput('');
      return;
    }
    if (!selectedStockPoolName || !names.includes(selectedStockPoolName)) {
      setSelectedStockPoolName(names[0]);
      setStockPoolInput(names[0]);
    }
  }, [open, stockPoolNameOptions, selectedStockPoolName]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setEntityRows([]);
    setConfirmHint('');
  }, [open, selectedStockPoolName]);

  const trimmedChainName = industryChainName.trim();
  const trimmedPoolName = selectedStockPoolName.trim();
  const poolEntityCount = scopeEntityIds.size;
  const poolsLoading = poolsRequest.loading;
  const poolEntitiesLoading = poolEntitiesRequest.loading && Boolean(trimmedPoolName);

  async function loadAllPoolEntitiesIntoRows() {
    const entityIds = [...scopeEntityIds];
    if (!entityIds.length) {
      setConfirmHint('当前股票池暂无成分股');
      return;
    }
    setLoadPoolBusy(true);
    setConfirmHint('');
    try {
      const labels = await services.resolveStockPoolEntities({ entity_ids: entityIds });
      if (labels && (labels as { detail?: unknown }).detail) {
        const detail = (labels as { detail?: unknown }).detail;
        setConfirmHint(
          Array.isArray(detail)
            ? String((detail as { msg?: string }[])[0]?.msg || detail[0])
            : String(detail)
        );
        return;
      }
      const list = Array.isArray(labels) ? labels : [];
      const rows: StockPoolEntityRow[] = [];
      const seen = new Set<string>();
      for (const item of list) {
        const entityId = item?.entity_id;
        if (!entityId || seen.has(entityId) || !scopeEntityIds.has(entityId)) {
          continue;
        }
        seen.add(entityId);
        rows.push({
          entity_id: entityId,
          code: item.code || '',
          name: item.name || '',
        });
      }
      setEntityRows(rows);
      setConfirmHint(rows.length ? `已载入股票池内 ${rows.length} 只` : '未能解析股票池成分');
    } catch (error: unknown) {
      setConfirmHint(error instanceof Error ? error.message : '载入股票池失败');
    } finally {
      setLoadPoolBusy(false);
    }
  }

  function handleConfirm() {
    setConfirmHint('');
    if (!trimmedPoolName) {
      setConfirmHint('请先选择股票池');
      return;
    }
    if (!stockPoolNameSet.has(trimmedPoolName)) {
      setConfirmHint('请从下拉列表中选择有效的股票池');
      return;
    }
    if (poolEntitiesLoading) {
      setConfirmHint('股票池成分加载中，请稍候');
      return;
    }
    const fromRows = entityRows
      .map((row) => row.entity_id)
      .filter((entityId) => entityId && scopeEntityIds.has(entityId));
    const entityIds = fromRows.length > 0 ? fromRows : [...scopeEntityIds];
    if (!entityIds.length) {
      setConfirmHint('所选股票池暂无成分股，请先在「股票池」页维护');
      return;
    }
    onConfirm(entityIds);
  }

  const confirmDisabled =
    submitting ||
    !trimmedChainName ||
    !trimmedPoolName ||
    poolsLoading ||
    poolEntitiesLoading ||
    poolEntityCount === 0;

  const confirmLabel =
    entityRows.length > 0
      ? `开始构建（已选 ${entityRows.length} 只）`
      : poolEntityCount > 0
        ? `开始构建（股票池共 ${poolEntityCount} 只）`
        : '开始构建';

  return (
    <Modal open={open} onClose={submitting ? undefined : onCancel}>
      <ModalDialog className="w-[520px] !text-[14px]" size="sm">
        <ModalClose size="sm" disabled={submitting} />
        <DialogTitle>构建个股产业链</DialogTitle>
        <DialogContent>
          <Typography level="body-sm" className="mb-2 opacity-80">
            {trimmedChainName
              ? `产业链「${trimmedChainName}」：须先选定股票池，再指定池内 A 股标的后调用 Agent。`
              : '请先选择产业链'}
          </Typography>
          <FormControl className="mb-2" required>
            <FormLabel>限定股票池</FormLabel>
            {poolsLoading ? (
              <Typography level="body-xs">加载股票池…</Typography>
            ) : !stockPoolNameOptions.length ? (
              <Typography level="body-xs" textColor="danger">
                暂无可用股票池，请先在「股票池」页创建
              </Typography>
            ) : (
              <Autocomplete
                options={stockPoolNameOptions}
                size="sm"
                placeholder="选择股票池"
                value={trimmedPoolName || null}
                inputValue={stockPoolInput}
                onChange={(_event, newValue) => {
                  const name = (newValue as string) || '';
                  setSelectedStockPoolName(name);
                  setStockPoolInput(name);
                  setConfirmHint('');
                }}
                onInputChange={(_event, newInputValue) => {
                  setStockPoolInput(newInputValue);
                  setConfirmHint('');
                }}
                disabled={submitting}
                sx={{ '--unstable_popup-zIndex': 20000 }}
                slotProps={{
                  listbox: {
                    placement: 'bottom-start',
                    sx: { zIndex: 20000, maxHeight: 280 },
                  },
                }}
              />
            )}
            {trimmedPoolName && !poolEntitiesLoading ? (
              <Typography level="body-xs" className="mt-1 opacity-75">
                池内 {poolEntityCount} 只
                {poolEntityCount === 0 ? '（无法构建）' : ''}
              </Typography>
            ) : null}
            {poolEntitiesLoading ? (
              <Typography level="body-xs" className="mt-1 opacity-75">
                加载池内成分…
              </Typography>
            ) : null}
          </FormControl>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Button
              size="sm"
              variant="outlined"
              loading={loadPoolBusy}
              disabled={
                submitting || !trimmedPoolName || poolEntitiesLoading || poolEntityCount === 0
              }
              onClick={() => void loadAllPoolEntitiesIntoRows()}
            >
              载入股票池全部
            </Button>
            <Checkbox
              size="sm"
              label="忽略已有个股"
              checked={ignoreExistingInIndustryChain}
              onChange={(event) => setIgnoreExistingInIndustryChain(event.target.checked)}
              disabled={submitting}
            />
          </div>
          <StockPoolEntityEditor
            rows={entityRows}
            onChange={setEntityRows}
            enableMainTagMerge
            industryChainName={trimmedChainName}
            ignoreExistingInIndustryChain={ignoreExistingInIndustryChain}
            scopeEntityIds={
              trimmedPoolName && !poolEntitiesLoading ? scopeEntityIds : null
            }
            scopeLabel={trimmedPoolName ? `股票池「${trimmedPoolName}」` : undefined}
          />
          <Typography level="body-xs" className="mt-1 opacity-70">
            未单独勾选时，将对所选股票池内全部成分构建；从主标签/概念并入仅加入池内标的。
          </Typography>
          {confirmHint ? (
            <Typography level="body-xs" className="mt-1" textColor="danger">
              {confirmHint}
            </Typography>
          ) : null}
        </DialogContent>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="plain" size="sm" disabled={submitting} onClick={onCancel}>
            取消
          </Button>
          <Button size="sm" loading={submitting} disabled={confirmDisabled} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
}
