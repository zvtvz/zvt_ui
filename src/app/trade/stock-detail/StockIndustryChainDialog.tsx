import Loading from '@/components/Loading';
import { CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH } from '@/constants/coreBusiness';
import { INDUSTRY_CHAIN_POSITION_OPTIONS } from '@/constants/industryChainPosition';
import type {
  BuildStockTagsFromIndustryChainResult,
  IndustryChainInfo,
  StockIndustryChainListItem,
} from '@/interfaces';
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
  Textarea,
  Typography,
} from '@mui/joy';
import { useRequest } from 'ahooks';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  open: boolean;
  stock: { entity_id: string };
  onCancel: () => void;
};

function segmentNamesFromChain(chain: IndustryChainInfo | undefined): string[] {
  const segments = chain?.segments;
  if (!segments || typeof segments !== 'object') {
    return [];
  }
  return Object.keys(segments)
    .map((name) => name.trim())
    .filter(Boolean);
}

export default function StockIndustryChainDialog({ open, stock, onCancel }: Props) {
  const [industryChain, setIndustryChain] = useState('');
  const [industrySegment, setIndustrySegment] = useState('');
  const [position, setPosition] = useState('');
  const [coreBusiness, setCoreBusiness] = useState('');
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    tone: 'success' | 'warning' | 'danger';
    text: string;
  } | null>(null);

  const { data: chainRow, loading: chainLoading, refresh } = useRequest(
    () =>
      services.getStockIndustryChain({
        entity_id: stock.entity_id,
      }) as Promise<StockIndustryChainListItem>,
    { ready: open, refreshDeps: [stock.entity_id, open] }
  );

  const { data: industryChains, loading: chainsLoading } = useRequest(
    async () => (await services.getIndustryChain({ active: true })) as IndustryChainInfo[],
    { ready: open }
  );

  const industryChainOptions = useMemo(
    () => industryChains?.map((row) => row.name).filter(Boolean) ?? [],
    [industryChains]
  );

  const selectedChainDefinition = useMemo(
    () => industryChains?.find((row) => row.name === industryChain),
    [industryChains, industryChain]
  );

  const segmentOptions = useMemo(
    () => segmentNamesFromChain(selectedChainDefinition),
    [selectedChainDefinition]
  );

  useEffect(() => {
    if (!open) {
      setIndustryChain('');
      setIndustrySegment('');
      setPosition('');
      setCoreBusiness('');
      setSyncFeedback(null);
      return;
    }
    if (chainRow === undefined) {
      return;
    }
    setIndustryChain(chainRow.industry_chain?.trim() || '');
    setIndustrySegment(chainRow.industry_segment?.trim() || '');
    setPosition(chainRow.position?.trim() || '');
    setCoreBusiness(chainRow.core_business_and_market_position?.trim() || '');
  }, [open, chainRow]);

  useEffect(() => {
    if (!open || !industrySegment) {
      return;
    }
    if (segmentOptions.length && !segmentOptions.includes(industrySegment)) {
      setIndustrySegment('');
    }
  }, [open, industryChain, segmentOptions, industrySegment]);

  const coreRemaining =
    CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH - [...coreBusiness].length;

  const canSave = Boolean(industryChain.trim() && industrySegment.trim());
  const loading = chainLoading || chainsLoading;

  async function persistChainRow() {
    const chainName = industryChain.trim();
    const segmentName = industrySegment.trim();
    if (!chainName || !segmentName) {
      return false;
    }
    if ([...coreBusiness].length > CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH) {
      return false;
    }
    await services.updateStockIndustryChain({
      entity_id: stock.entity_id,
      industry_chain: chainName,
      industry_segment: segmentName,
      position: position.trim() || undefined,
      core_business_and_market_position: coreBusiness.trim() || undefined,
    });
    await refresh();
    return true;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      const persisted = await persistChainRow();
      if (persisted) {
        onCancel();
      }
    } finally {
      setSaving(false);
    }
  };

  const handleSyncToTags = async () => {
    const chainName = industryChain.trim();
    if (!chainName || !industrySegment.trim()) {
      setSyncFeedback({
        tone: 'warning',
        text: '请先选择产业链与环节',
      });
      return;
    }
    setSyncing(true);
    setSyncFeedback(null);
    try {
      const persisted = await persistChainRow();
      if (!persisted) {
        setSyncFeedback({ tone: 'danger', text: '保存中间表失败，无法同步' });
        return;
      }
      const response = (await services.buildStockTagsFromIndustryChain({
        industry_chain_name: chainName,
        entity_ids: [stock.entity_id],
        overwrite_set_by_user: true,
      })) as BuildStockTagsFromIndustryChainResult | { detail?: unknown };
      if (
        typeof (response as BuildStockTagsFromIndustryChainResult).applied_entity_count !==
        'number'
      ) {
        const detail = (response as { detail?: unknown }).detail;
        setSyncFeedback({
          tone: 'danger',
          text:
            typeof detail === 'string'
              ? detail
              : '同步失败，请确认中间表数据完整',
        });
        return;
      }
      const result = response as BuildStockTagsFromIndustryChainResult;
      if (result.applied_entity_count > 0) {
        setSyncFeedback({ tone: 'success', text: '已同步到 StockTags（主/次标签与市场地位）' });
        return;
      }
      const hint = result.skipped_messages?.[0];
      setSyncFeedback({
        tone: 'warning',
        text: hint
          ? `未写入标签：${hint}`
          : '未写入标签，请检查中间表或 chain_apply_payload',
      });
    } catch {
      setSyncFeedback({ tone: 'danger', text: '同步请求失败' });
    } finally {
      setSyncing(false);
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
        <DialogTitle>更新产业链</DialogTitle>
        <DialogContent sx={{ overflow: 'visible' }}>
          <Loading loading={loading} fixedTop={320}>
            <Stack spacing={1.5}>
              <Typography level="body-xs" sx={{ opacity: 0.8 }}>
                维护个股产业链中间表；保存或同步可将主/次标签与市场地位写入 StockTags。
              </Typography>
              {syncFeedback ? (
                <Typography
                  level="body-xs"
                  color={syncFeedback.tone}
                  sx={{ mt: -0.5 }}
                >
                  {syncFeedback.text}
                </Typography>
              ) : null}
              <FormLabel>产业链</FormLabel>
              <Select
                size="sm"
                value={industryChain}
                onChange={(_, newValue) => {
                  setIndustryChain((newValue as string) ?? '');
                  setIndustrySegment('');
                }}
                placeholder="请选择产业链"
                sx={{ '--unstable_popup-zIndex': 20000 }}
                slotProps={{
                  listbox: {
                    placement: 'bottom-start',
                    sx: { zIndex: 20000 },
                  },
                }}
              >
                {industryChainOptions.map((name) => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
              <FormLabel>环节</FormLabel>
              <Select
                size="sm"
                value={industrySegment}
                onChange={(_, newValue) => {
                  setIndustrySegment((newValue as string) ?? '');
                }}
                placeholder={industryChain ? '请选择环节' : '请先选择产业链'}
                disabled={!industryChain}
                sx={{ '--unstable_popup-zIndex': 20000 }}
                slotProps={{
                  listbox: {
                    placement: 'bottom-start',
                    sx: { zIndex: 20000 },
                  },
                }}
              >
                {segmentOptions.map((name) => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
                {industrySegment &&
                !segmentOptions.includes(industrySegment) ? (
                  <Option value={industrySegment}>{industrySegment}</Option>
                ) : null}
              </Select>
              <FormLabel>定位</FormLabel>
              <Select
                size="sm"
                value={position}
                onChange={(_, newValue) => {
                  setPosition((newValue as string) ?? '');
                }}
                placeholder="可选"
                sx={{ '--unstable_popup-zIndex': 20000 }}
                slotProps={{
                  listbox: {
                    placement: 'bottom-start',
                    sx: { zIndex: 20000 },
                  },
                }}
              >
                <Option value="">未设置</Option>
                {INDUSTRY_CHAIN_POSITION_OPTIONS.map((tier) => (
                  <Option key={tier} value={tier}>
                    {tier}
                  </Option>
                ))}
                {position &&
                !(INDUSTRY_CHAIN_POSITION_OPTIONS as readonly string[]).includes(
                  position
                ) ? (
                  <Option value={position}>{position}</Option>
                ) : null}
              </Select>
              <FormLabel>市场地位</FormLabel>
              <Textarea
                size="sm"
                minRows={3}
                placeholder="该公司在本环节的市场地位（50 字内）"
                value={coreBusiness}
                onChange={(event) => {
                  const next = event.target.value;
                  const chars = [...next];
                  setCoreBusiness(
                    chars.length > CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH
                      ? chars
                          .slice(0, CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH)
                          .join('')
                      : next
                  );
                }}
              />
              <Typography level="body-xs" sx={{ opacity: 0.75 }}>
                还可输入 {Math.max(0, coreRemaining)} 字
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
            loading={syncing}
            disabled={
              !canSave ||
              loading ||
              saving ||
              syncing ||
              [...coreBusiness].length > CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH
            }
            onClick={handleSyncToTags}
          >
            同步到标签
          </Button>
          <Button
            size="sm"
            className="!ml-2"
            loading={saving}
            disabled={
              !canSave ||
              loading ||
              saving ||
              syncing ||
              [...coreBusiness].length > CORE_BUSINESS_AND_MARKET_POSITION_MAX_LENGTH
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
