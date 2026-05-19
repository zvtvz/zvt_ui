'use client';

import CloseRounded from '@mui/icons-material/CloseRounded';
import { useRequest } from 'ahooks';
import services from '@/services';
import type { StockListItem } from '@/interfaces';
import {
  Autocomplete,
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy';
import { useCallback, useMemo, useState } from 'react';
import type { MainTagInfo } from '@/interfaces';

export type StockPoolEntityRow = {
  entity_id: string;
  code: string;
  name: string;
};

type Props = {
  rows: StockPoolEntityRow[];
  onChange: (rows: StockPoolEntityRow[]) => void;
  /** 展示「从主标签并入」行（构建产业链等场景） */
  enableMainTagMerge?: boolean;
};

type ConceptOption = { name: string };

const MAX_CHIP_PREVIEW = 20;

export default function StockPoolEntityEditor({
  rows,
  onChange,
  enableMainTagMerge = false,
}: Props) {
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState<StockListItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [conceptDraft, setConceptDraft] = useState('');
  const [conceptSyncLoading, setConceptSyncLoading] = useState(false);
  const [conceptSyncMessage, setConceptSyncMessage] = useState('');
  const [mainTagDraft, setMainTagDraft] = useState('');
  const [mainTagSyncLoading, setMainTagSyncLoading] = useState(false);
  const [mainTagSyncMessage, setMainTagSyncMessage] = useState('');
  const [expandAllChips, setExpandAllChips] = useState(false);

  const { data: conceptList = [], loading: conceptListLoading } = useRequest(
    () => services.getConceptInfo({ active: true }) as Promise<ConceptOption[]>,
    { refreshDeps: [] }
  );
  const conceptNames = (Array.isArray(conceptList) ? conceptList : [])
    .map((item) => item?.name)
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));

  const conceptNameSet = useMemo(() => new Set(conceptNames), [conceptNames]);

  const { data: mainTagList = [], loading: mainTagListLoading } = useRequest(
    () =>
      enableMainTagMerge
        ? (services.getMainTagInfo() as Promise<MainTagInfo[]>)
        : Promise.resolve([] as MainTagInfo[]),
    { refreshDeps: [enableMainTagMerge] }
  );
  const mainTagNames = (Array.isArray(mainTagList) ? mainTagList : [])
    .map((item) => item?.name)
    .filter((name): name is string => Boolean(name))
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  const mainTagNameSet = useMemo(() => new Set(mainTagNames), [mainTagNames]);

  const mergeEntityIdsIntoRows = useCallback(
    async (rawIds: string[], emptyMessage: string): Promise<string> => {
      if (!rawIds.length) {
        return emptyMessage;
      }
      const existing = new Set(rows.map((row) => row.entity_id));
      const newIds = rawIds.filter((entityId) => entityId && !existing.has(entityId));
      const duplicateCount = rawIds.length - newIds.length;
      if (!newIds.length) {
        return duplicateCount > 0
          ? `共 ${rawIds.length} 只，均已存在于列表中`
          : '没有可并入的标的';
      }
      const labels = await services.resolveStockPoolEntities({ entity_ids: newIds });
      if (labels && (labels as { detail?: unknown }).detail) {
        const detail = (labels as { detail?: unknown }).detail;
        throw new Error(
          Array.isArray(detail)
            ? String((detail as { msg?: string }[])[0]?.msg || detail[0])
            : String(detail)
        );
      }
      const list = Array.isArray(labels) ? labels : [];
      const additionsRaw = list.map((item: StockPoolEntityRow) => ({
        entity_id: item.entity_id,
        code: item.code || '',
        name: item.name || '',
      }));
      const seenAddition = new Set<string>();
      const additions = additionsRaw.filter((row) => {
        if (!row.entity_id || seenAddition.has(row.entity_id)) {
          return false;
        }
        seenAddition.add(row.entity_id);
        return true;
      });
      const mergedIds = new Set(additions.map((row) => row.entity_id));
      onChange([...additions, ...rows.filter((row) => !mergedIds.has(row.entity_id))]);
      return `已并入 ${additions.length} 只${duplicateCount > 0 ? `，跳过与列表重复的 ${duplicateCount} 只` : ''}`;
    },
    [onChange, rows]
  );

  const runSearch = useCallback(async () => {
    const key = searchKey.trim();
    if (!key) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const list = await services.listStocks({ key });
      setSearchResults(Array.isArray(list) ? list : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchKey]);

  const addRow = (item: StockListItem) => {
    if (rows.some((r) => r.entity_id === item.entity_id)) {
      return;
    }
    const row: StockPoolEntityRow = {
      entity_id: item.entity_id,
      code: item.code,
      name: item.name,
    };
    onChange([row, ...rows.filter((r) => r.entity_id !== item.entity_id)]);
    setSearchResults([]);
    setSearchKey('');
  };

  const removeRow = (entityId: string) => {
    onChange(rows.filter((r) => r.entity_id !== entityId));
  };

  const mergeFromConcept = useCallback(async () => {
    const name = conceptDraft.trim();
    if (!name) {
      setConceptSyncMessage('请先选择概念');
      return;
    }
    if (!conceptNameSet.has(name)) {
      setConceptSyncMessage('请从下拉列表中选择有效的概念名称');
      return;
    }
    setConceptSyncMessage('');
    setConceptSyncLoading(true);
    try {
      const body = await services.listEntityIdsFromConcept({ concept_name: name });
      if (body && (body as any).detail) {
        const detail = (body as any).detail;
        setConceptSyncMessage(
          Array.isArray(detail) ? detail[0]?.msg || String(detail[0]) : String(detail)
        );
        return;
      }
      const rawIds: string[] = Array.isArray((body as { entity_ids?: string[] })?.entity_ids)
        ? (body as { entity_ids: string[] }).entity_ids
        : [];
      const message = await mergeEntityIdsIntoRows(
        rawIds,
        '该概念暂无成分数据，请确认已同步板块及 block_stock 数据集'
      );
      setConceptSyncMessage(message);
    } catch (err: unknown) {
      setConceptSyncMessage(err instanceof Error ? err.message : '从概念同步失败');
    } finally {
      setConceptSyncLoading(false);
    }
  }, [conceptDraft, conceptNameSet, mergeEntityIdsIntoRows]);

  const mergeFromMainTag = useCallback(async () => {
    const name = mainTagDraft.trim();
    if (!name) {
      setMainTagSyncMessage('请先选择主标签');
      return;
    }
    if (!mainTagNameSet.has(name)) {
      setMainTagSyncMessage('请从下拉列表中选择有效的主标签名称');
      return;
    }
    setMainTagSyncMessage('');
    setMainTagSyncLoading(true);
    try {
      const body = await services.listEntityIdsFromMainTag({ main_tag_name: name });
      if (body && (body as { detail?: unknown }).detail) {
        const detail = (body as { detail?: unknown }).detail;
        setMainTagSyncMessage(
          Array.isArray(detail)
            ? String((detail as { msg?: string }[])[0]?.msg || detail[0])
            : String(detail)
        );
        return;
      }
      const rawIds: string[] = Array.isArray((body as { entity_ids?: string[] })?.entity_ids)
        ? (body as { entity_ids: string[] }).entity_ids
        : [];
      const message = await mergeEntityIdsIntoRows(
        rawIds,
        '该主标签下暂无已打标个股，请先构建主标签或手动打标'
      );
      setMainTagSyncMessage(message);
    } catch (err: unknown) {
      setMainTagSyncMessage(err instanceof Error ? err.message : '从主标签并入失败');
    } finally {
      setMainTagSyncLoading(false);
    }
  }, [mainTagDraft, mainTagNameSet, mergeEntityIdsIntoRows]);

  const hasHiddenChips = rows.length > MAX_CHIP_PREVIEW;
  const chipRows =
    expandAllChips || !hasHiddenChips ? rows : rows.slice(0, MAX_CHIP_PREVIEW);

  return (
    <FormControl className="mb-2">
      <FormLabel>A 股标的</FormLabel>
      <div className="flex flex-wrap gap-2 mb-3 items-end">
        <Autocomplete
          options={conceptNames}
          size="sm"
          loading={conceptListLoading}
          placeholder={conceptListLoading ? '加载概念…' : '输入筛选或选择概念'}
          value={conceptDraft || null}
          onChange={(_event, newValue) => {
            setConceptDraft((newValue as string) || '');
            setConceptSyncMessage('');
          }}
          inputValue={conceptDraft}
          onInputChange={(_event, newInputValue) => {
            setConceptDraft(newInputValue);
            setConceptSyncMessage('');
          }}
          sx={{
            flex: '1 1 220px',
            minWidth: 200,
            width: '100%',
            '--unstable_popup-zIndex': 20000,
          }}
          slotProps={{
            listbox: {
              placement: 'bottom-start',
              sx: { zIndex: 20000, maxHeight: 280 },
            },
          }}
        />
        <Button
          size="sm"
          variant="outlined"
          loading={conceptSyncLoading}
          disabled={conceptListLoading || !conceptDraft.trim()}
          onClick={() => void mergeFromConcept()}
        >
          从概念并入
        </Button>
      </div>
      {conceptSyncMessage && (
        <Typography level="body-xs" className="mb-2" sx={{ color: 'neutral.700' }}>
          {conceptSyncMessage}
        </Typography>
      )}
      {enableMainTagMerge && (
        <>
          <div className="flex flex-wrap gap-2 mb-3 items-end">
            <Autocomplete
              options={mainTagNames}
              size="sm"
              loading={mainTagListLoading}
              placeholder={mainTagListLoading ? '加载主标签…' : '输入筛选或选择主标签'}
              value={mainTagDraft || null}
              onChange={(_event, newValue) => {
                setMainTagDraft((newValue as string) || '');
                setMainTagSyncMessage('');
              }}
              inputValue={mainTagDraft}
              onInputChange={(_event, newInputValue) => {
                setMainTagDraft(newInputValue);
                setMainTagSyncMessage('');
              }}
              sx={{
                flex: '1 1 220px',
                minWidth: 200,
                width: '100%',
                '--unstable_popup-zIndex': 20000,
              }}
              slotProps={{
                listbox: {
                  placement: 'bottom-start',
                  sx: { zIndex: 20000, maxHeight: 280 },
                },
              }}
            />
            <Button
              size="sm"
              variant="outlined"
              loading={mainTagSyncLoading}
              disabled={mainTagListLoading || !mainTagDraft.trim()}
              onClick={() => void mergeFromMainTag()}
            >
              从主标签并入
            </Button>
          </div>
          {mainTagSyncMessage && (
            <Typography level="body-xs" className="mb-2" sx={{ color: 'neutral.700' }}>
              {mainTagSyncMessage}
            </Typography>
          )}
        </>
      )}
      <div className="flex gap-2 mb-2">
        <Input
          size="sm"
          placeholder="代码或名称，至少 2 个汉字或 4 个字符"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              runSearch();
            }
          }}
          sx={{ flex: 1 }}
        />
        <Button size="sm" variant="outlined" loading={searching} onClick={runSearch}>
          搜索
        </Button>
      </div>
      {searchResults.length > 0 && (
        <Box
          className="mb-2 max-h-[160px] overflow-y-auto rounded-md border border-neutral-200 bg-white p-1 text-sm"
          component="div"
        >
          {searchResults.map((item) => (
            <button
              key={item.entity_id}
              type="button"
              className="flex w-full cursor-pointer flex-col items-start rounded px-2 py-1.5 text-left hover:bg-[rgba(65,109,249,.08)]"
              onClick={() => addRow(item)}
            >
              <span>
                {item.name}
                <span className="ml-2 opacity-70">{item.code}</span>
              </span>
            </button>
          ))}
        </Box>
      )}
      <div className="flex flex-row flex-wrap items-center gap-2 mb-1">
        <Typography level="body-xs" sx={{ opacity: 0.75 }}>
          已选 {rows.length} 只
          {hasHiddenChips && !expandAllChips
            ? `（展示前 ${MAX_CHIP_PREVIEW} 只）`
            : null}
        </Typography>
        <Button
          size="sm"
          variant="plain"
          color="neutral"
          disabled={rows.length === 0}
          onClick={() => {
            onChange([]);
            setExpandAllChips(false);
            setConceptSyncMessage('');
          }}
        >
          清空
        </Button>
        {hasHiddenChips ? (
          <Button
            size="sm"
            variant="plain"
            color="primary"
            onClick={() => setExpandAllChips((previous) => !previous)}
          >
            {expandAllChips ? '收起' : `展开全部 (${rows.length})`}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1 min-h-[32px]">
        {chipRows.map((r) => (
          <Box
            key={r.entity_id}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.25,
              maxWidth: '100%',
              borderRadius: 'sm',
              bgcolor: 'primary.softBg',
              color: 'primary.softColor',
              pl: 1,
              pr: 0.25,
              py: 0.25,
              fontSize: '0.875rem',
              lineHeight: 1.35,
              fontWeight: 500,
            }}
          >
            <Typography
              component="span"
              level="body-sm"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: 220,
              }}
            >
              {r.name || r.code || r.entity_id}
              <Typography component="span" level="body-xs" sx={{ opacity: 0.72, ml: 0.5 }}>
                {r.code}
              </Typography>
            </Typography>
            <button
              type="button"
              className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded p-0.5 text-neutral-600 hover:bg-[rgba(0,0,0,0.06)] hover:text-neutral-900"
              aria-label={`移除 ${r.name || r.code}`}
              onClick={() => removeRow(r.entity_id)}
            >
              <CloseRounded sx={{ fontSize: 16, opacity: 0.75 }} />
            </button>
          </Box>
        ))}
        {rows.length === 0 && (
          <span className="text-sm text-neutral-500">
            未添加标的，可从概念并入或搜索后加入
          </span>
        )}
      </div>
    </FormControl>
  );
}
