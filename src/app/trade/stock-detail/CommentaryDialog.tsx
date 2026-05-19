import Loading from '@/components/Loading';
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
import { useEffect, useMemo, useState } from 'react';
import { CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH } from '@/constants/coreBusiness';

type StockTagsPayload = {
  main_tag?: string | null;
  main_tags?: Record<string, string> | null;
  main_tag_reason?: string | null;
  sub_tag?: string | null;
  sub_tag_reason?: string | null;
  active_hidden_tags?: Record<string, string> | null;
  core_business_and_market_position?: string | null;
};

type Props = {
  open: boolean;
  stock: { entity_id: string };
  onCancel: () => void;
};

export default function CommentaryDialog({ open, stock, onCancel }: Props) {
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
      setDraft(stockTags.core_business_and_market_position?.trim() || '');
    }
  }, [open, stockTags]);

  const activeHiddenTagsPayload = useMemo(
    () => ({ ...(stockTags?.active_hidden_tags || {}) }),
    [stockTags?.active_hidden_tags]
  );

  const canSave = Boolean(stockTags?.main_tag);

  const remaining = CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH - [...draft].length;

  const handleSave = async () => {
    const activeMain = stockTags?.main_tag;
    if (!activeMain) return;
    if ([...draft].length > CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH) return;
    setSaving(true);
    try {
      const mainReason =
        stockTags?.main_tags?.[activeMain] ?? stockTags?.main_tag_reason ?? '';
      await services.updateStockTags({
        entity_id: stock.entity_id,
        main_tag: activeMain,
        main_tag_reason: mainReason,
        sub_tag: stockTags?.sub_tag || undefined,
        sub_tag_reason: stockTags?.sub_tag_reason || undefined,
        active_hidden_tags: activeHiddenTagsPayload,
        core_business_and_market_position: draft.trim() || '',
        keep_current_selections: false,
      });
      await refresh();
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
        <DialogTitle>核心业务与市场地位</DialogTitle>
        <DialogContent sx={{ overflow: 'visible' }}>
          <Loading loading={loading} fixedTop={260}>
            <Stack spacing={1.5}>
              {!canSave ? (
                <Typography level="body-sm" color="warning">
                  请先为该股票设置主标签后再编辑核心业务与市场地位。
                </Typography>
              ) : null}
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                描述该公司在所属产业链环节下的核心业务与市场地位（50 字内）；可由产业链构建标签同步，也可手动维护。
              </Typography>
              <FormLabel>内容</FormLabel>
              <Textarea
                size="sm"
                minRows={3}
                placeholder="例如：国内刻蚀设备龙头，先进制程份额持续提升……"
                value={draft}
                onChange={(event) => {
                  const next = event.target.value;
                  const chars = [...next];
                  setDraft(
                    chars.length > CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH
                      ? chars.slice(0, CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH).join('')
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
            disabled={
              !canSave || loading || [...draft].length > CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH
            }
            onClick={handleSave}
          >
            保存
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
