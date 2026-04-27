import services from '@/services';
import {
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
} from '@mui/joy';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    if (!open) {
      setEntityRows([]);
      setError('');
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
            try {
              const res = await services.createStockPoolInfo({
                stock_pool_name,
                stock_pool_type: stockPoolType || 'custom',
              });
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
              <StockPoolEntityEditor rows={entityRows} onChange={setEntityRows} />
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
