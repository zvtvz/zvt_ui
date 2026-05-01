import Loading from '@/components/Loading';
import { CAPITAL_STRUCTURE_OPTIONS } from '@/constants/capitalStructure';
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
  Option,
  Select,
  Stack,
  Typography,
} from '@mui/joy';
import { useRequest } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';

type StockTagsPayload = {
  main_tag?: string | null;
  main_tags?: Record<string, string> | null;
  main_tag_reason?: string | null;
  sub_tag?: string | null;
  sub_tag_reason?: string | null;
  active_hidden_tags?: Record<string, string> | null;
  capital_structure?: string | null;
};

type Props = {
  open: boolean;
  stock: { entity_id: string };
  onCancel: () => void;
};

const optionList = [...CAPITAL_STRUCTURE_OPTIONS];

export default function CapitalStructureDialog({ open, stock, onCancel }: Props) {
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
      setDraft(stockTags.capital_structure?.trim() || '');
    }
  }, [open, stockTags]);

  const activeHiddenTagsPayload = useMemo(
    () => ({ ...(stockTags?.active_hidden_tags || {}) }),
    [stockTags?.active_hidden_tags]
  );

  const presetSet = useMemo(() => new Set<string>(optionList), []);
  const isLegacyStoredValue = Boolean(draft) && !presetSet.has(draft);

  const canSave = Boolean(stockTags?.main_tag);

  const handleSave = async () => {
    const activeMain = stockTags?.main_tag;
    if (!activeMain) return;
    if (draft && !presetSet.has(draft)) return;
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
        capital_structure: draft.trim() || '',
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
          maxWidth: 420,
          width: '100%',
          maxHeight: 'none',
          overflow: 'visible',
        }}
        size="sm"
      >
        <ModalClose size="sm" />
        <DialogTitle>资金结构</DialogTitle>
        <DialogContent sx={{ overflow: 'visible' }}>
          <Loading loading={loading} fixedTop={240}>
            <Stack spacing={1.5}>
              {!canSave ? (
                <Typography level="body-sm" color="warning">
                  请先为该股票设置主标签后再设置资金结构。
                </Typography>
              ) : null}
              {isLegacyStoredValue ? (
                <Typography level="body-sm" color="warning">
                  当前存盘值不在预设内，请改选或清空。
                </Typography>
              ) : null}
              <FormLabel>资金结构</FormLabel>
              <Select
                size="sm"
                value={draft}
                onChange={(event, newValue) => {
                  setDraft((newValue as string) ?? '');
                }}
                placeholder="请选择"
                sx={{ '--unstable_popup-zIndex': 20000 }}
                slotProps={{
                  listbox: {
                    placement: 'bottom-start',
                    sx: {
                      zIndex: 20000,
                    },
                  },
                }}
              >
                <Option value="">未设置</Option>
                {isLegacyStoredValue ? <Option value={draft}>{draft}</Option> : null}
                {optionList.map((name) => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
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
            disabled={!canSave || loading || isLegacyStoredValue}
            onClick={handleSave}
          >
            保存
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
