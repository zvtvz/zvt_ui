import Loading from '@/components/Loading';
import { RISE_REASON_MAX_LENGTH } from '@/constants/riseReason';
import services from '@/services';
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormLabel,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Textarea,
  Typography,
} from '@mui/joy';
import { useRequest } from 'ahooks';
import { useEffect, useState } from 'react';

type StockTagsPayload = {
  rise_reason?: string | null;
};

type Props = {
  open: boolean;
  stock: { entity_id: string };
  onCancel: () => void;
  onSaved?: (riseReason: string | null) => void;
};

export default function RiseReasonDialog({ open, stock, onCancel, onSaved }: Props) {
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: stockTags, loading, refresh } = useRequest(
    () => services.getStockTags({ entity_id: stock.entity_id }) as Promise<StockTagsPayload>,
    { ready: open, refreshDeps: [stock.entity_id, open] }
  );

  useEffect(() => {
    if (!open) {
      setDraft('');
      return;
    }
    if (stockTags !== undefined) {
      setDraft(stockTags.rise_reason?.trim() || '');
    }
  }, [open, stockTags]);

  const remaining = RISE_REASON_MAX_LENGTH - [...draft].length;

  const handleSave = async () => {
    if ([...draft].length > RISE_REASON_MAX_LENGTH) return;
    setSaving(true);
    try {
      await services.updateStockRiseReason({
        entity_id: stock.entity_id,
        rise_reason: draft.trim(),
      });
      await refresh();
      onSaved?.(draft.trim() || null);
      onCancel();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog
        sx={{
          maxWidth: 480,
          width: '100%',
          maxHeight: 'none',
          overflow: 'visible',
        }}
        size="sm"
      >
        <ModalClose size="sm" />
        <DialogTitle>上涨原因</DialogTitle>
        <DialogContent sx={{ overflow: 'visible' }}>
          <Loading loading={loading} fixedTop={260}>
            <Stack spacing={1.5}>
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                描述当前市场认可的上涨驱动因素；可由题材大师自动写入，也可手动维护。
              </Typography>
              <FormLabel>上涨原因</FormLabel>
              <Textarea
                size="sm"
                minRows={3}
                placeholder="例如：受益于 AI 算力需求，公司先进封装订单饱满……"
                value={draft}
                onChange={(event) => {
                  const next = event.target.value;
                  const chars = [...next];
                  setDraft(
                    chars.length > RISE_REASON_MAX_LENGTH
                      ? chars.slice(0, RISE_REASON_MAX_LENGTH).join('')
                      : next
                  );
                }}
              />
              <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                还可输入 {Math.max(0, remaining)} 字
              </Typography>
            </Stack>
          </Loading>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button size="sm" variant="plain" onClick={onCancel}>
            取消
          </Button>
          <Button
            size="sm"
            className="!ml-2"
            loading={saving}
            disabled={loading || [...draft].length > RISE_REASON_MAX_LENGTH}
            onClick={handleSave}
          >
            保存
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
