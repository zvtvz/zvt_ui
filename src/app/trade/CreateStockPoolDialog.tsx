import { useRequest } from 'ahooks';
import services from '@/services';
import {
  Autocomplete,
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  FormControl,
  FormLabel,
  Input,
  Button,
  Select,
  Option,
  ModalClose,
  Typography,
} from '@mui/joy';
import { useEffect, useMemo, useState } from 'react';
import StockPoolEntityEditor, {
  type StockPoolEntityRow,
} from './StockPoolEntityEditor';

type Props = {
  open: boolean;
  onSubmit: (poolName: string) => void;
  onCancel: () => void;
};

const POOL_TYPES = [
  { value: 'custom', label: '自定义' },
  { value: 'system', label: '系统' },
  { value: 'dynamic', label: '动态' },
] as const;

export default function CreateStockPoolDialog({
  open,
  onSubmit,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stockPoolType, setStockPoolType] = useState<string>('custom');
  const [entityRows, setEntityRows] = useState<StockPoolEntityRow[]>([]);
  const [relatedConcept, setRelatedConcept] = useState<string>('');

  const { data: conceptList = [], loading: conceptListLoading } = useRequest(
    () => services.getConceptInfo({ active: true }) as Promise<{ name?: string }[]>,
    {
      ready: open && stockPoolType === 'custom',
      refreshDeps: [open, stockPoolType],
    }
  );

  const conceptNames = useMemo(() => {
    return (Array.isArray(conceptList) ? conceptList : [])
      .map((row) => (row?.name || '').trim())
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  }, [conceptList]);

  useEffect(() => {
    if (!open) {
      setEntityRows([]);
      setError('');
      setRelatedConcept('');
    }
  }, [open]);

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[480px] !text-[14px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>创建股票池</DialogTitle>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setError('');
            setLoading(true);
            const formData = new FormData(event.currentTarget);
            const stock_pool_name = (formData.get('stock_pool_name') as string)?.trim();
            if (!stock_pool_name) {
              setError('请输入股票池名称');
              setLoading(false);
              return;
            }
            const conceptPick = relatedConcept.trim();
            if (stockPoolType === 'custom' && conceptPick && !conceptNames.includes(conceptPick)) {
              setError('请从下拉列表中选择有效的概念名称');
              setLoading(false);
              return;
            }
            try {
              const createPayload: {
                stock_pool_name: string;
                stock_pool_type: string;
                related_concept?: string | null;
              } = {
                stock_pool_name,
                stock_pool_type: stockPoolType || 'custom',
              };
              if (stockPoolType === 'custom' && relatedConcept.trim()) {
                createPayload.related_concept = relatedConcept.trim();
              }
              const res = await services.createStockPoolInfo(createPayload);
              if (res && (res as any).detail) {
                const d = (res as any).detail;
                setError(
                  Array.isArray(d) ? d[0]?.msg || String(d[0]) : String(d)
                );
                return;
              }
              if (stockPoolType === 'custom') {
                const entity_ids = entityRows.map((r) => r.entity_id);
                const buildRes = await services.buildStockPool({
                  stock_pool_name,
                  entity_ids,
                  insert_mode: 'overwrite',
                });
                if (buildRes && (buildRes as any).detail) {
                  const d = (buildRes as any).detail;
                  setError(
                    Array.isArray(d) ? d[0]?.msg || String(d[0]) : String(d)
                  );
                  return;
                }
              }
              setEntityRows([]);
              setRelatedConcept('');
              onSubmit(stock_pool_name);
            } catch (err: any) {
              setError(err?.message || err?.response?.data?.detail || '创建失败');
            } finally {
              setLoading(false);
            }
          }}
        >
          <DialogContent>
            <FormControl className="mb-4" required>
              <FormLabel>股票池名称</FormLabel>
              <Input
                name="stock_pool_name"
                placeholder="请输入名称"
                size="sm"
                autoFocus
              />
            </FormControl>
            <FormControl className="mb-4">
              <FormLabel>类型</FormLabel>
              <Select
                size="sm"
                value={stockPoolType}
                onChange={(_, value) =>
                  setStockPoolType((value as string) || 'custom')
                }
                slotProps={{
                  listbox: { variant: 'outlined' },
                }}
              >
                {POOL_TYPES.map((t) => (
                  <Option key={t.value} value={t.value}>
                    {t.label}
                  </Option>
                ))}
              </Select>
            </FormControl>
            {stockPoolType === 'custom' && (
              <>
                <FormControl className="mb-4" size="sm">
                  <FormLabel>关联概念</FormLabel>
                  <Autocomplete
                    freeSolo={false}
                    options={conceptNames}
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
                    与「从概念并入」相同：输入可筛选；须为已启用概念名。清空表示不关联。
                  </Typography>
                </FormControl>
                <StockPoolEntityEditor rows={entityRows} onChange={setEntityRows} />
              </>
            )}
            {error && (
              <div className="mt-2 text-sm text-red-600">{error}</div>
            )}
          </DialogContent>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="plain" size="sm" onClick={onCancel}>
              取消
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              确定
            </Button>
          </div>
        </form>
      </ModalDialog>
    </Modal>
  );
}
