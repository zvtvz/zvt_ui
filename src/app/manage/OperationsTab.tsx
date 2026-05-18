'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Box,
  Divider,
  Checkbox,
  Autocomplete,
  FormLabel,
  Radio,
  RadioGroup,
  Sheet,
  Table,
  Tooltip,
} from '@mui/joy';
import {
  tradePoolTabClass,
  tradePoolTabActiveClass,
} from './tradeStyleClasses';
import FactoryIcon from '@mui/icons-material/Factory';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import CloseRounded from '@mui/icons-material/CloseRounded';
import HealingIcon from '@mui/icons-material/Healing';
import BlockSelectorDialog from './BlockSelectorDialog';
import type { BuildStockTagsOptions, StockTagBuildType } from './useData';
import type { BlockInfo, HiddenTagInfo, IndustryChainInfo, MainTagInfo, StockIndustryChainListItem, SubTagInfo } from '@/interfaces';
import services from '@/services';

function IndustryChainClampCell({ value }: { value?: string | null }) {
  const full = (value || '').trim();
  if (!full) {
    return <span className="text-neutral-400">—</span>;
  }
  return (
    <Tooltip title={<div className="max-w-[320px] whitespace-pre-wrap">{full}</div>} variant="solid">
      <div className="max-w-[240px] text-left leading-snug line-clamp-2 break-words">{full}</div>
    </Tooltip>
  );
}

type BlockAxis = 'industry' | 'concept' | 'area';
/** 主标签构建：行业 / 概念 / 次标签（无按地域推主标签接口） */
type MainBuildAxis = 'industry' | 'concept' | 'sub_tag';

/** 与接口 sources 对应的关联维度（当前选中的 y） */
type SourceAxis = 'industry' | 'concept' | 'area' | 'sub_tag';

const OPERATION_SECTION_LABELS = [
  '数据初始化',
  '产业链标签',
  '维护主标签',
  '维护次标签',
  '维护隐藏标签',
  '数据补偿',
] as const;

interface Props {
  opLog: string[];
  mainTags: MainTagInfo[];
  subTags: SubTagInfo[];
  hiddenTags: HiddenTagInfo[];
  industries: BlockInfo[];
  concepts: BlockInfo[];
  areas: BlockInfo[];
  onInit: (type: 'industry' | 'concept' | 'area' | 'sub_tags_from_concepts') => Promise<void>;
  onBuild: (type: StockTagBuildType, options: BuildStockTagsOptions) => Promise<void>;
  onBuildStockIndustryChain: (options: { industryChainName: string }) => Promise<void>;
  onBuildStockTagsFromIndustryChain: (options: {
    industryChainName: string;
    overwriteSetByUser?: boolean;
  }) => Promise<void>;
  onSanitizeStockTags: () => Promise<void>;
}

export default function OperationsTab({
  opLog,
  mainTags,
  subTags,
  hiddenTags,
  industries,
  concepts,
  areas,
  onInit,
  onBuild,
  onBuildStockIndustryChain,
  onBuildStockTagsFromIndustryChain,
  onSanitizeStockTags,
}: Props) {
  const [operationSectionTab, setOperationSectionTab] = useState<number>(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [overwriteUserTags, setOverwriteUserTags] = useState(false);

  const [targetTagName, setTargetTagName] = useState('');
  /** 输入框展示与筛选用，与已选中的 ``targetTagName`` 分离，避免未点选列表时把部分输入当作 tagName。 */
  const [targetTagInput, setTargetTagInput] = useState('');
  const [industrySources, setIndustrySources] = useState<string[]>([]);
  const [conceptSources, setConceptSources] = useState<string[]>([]);
  const [areaSources, setAreaSources] = useState<string[]>([]);
  const [subTagSources, setSubTagSources] = useState<string[]>([]);

  const [openIndustryPicker, setOpenIndustryPicker] = useState(false);
  const [openConceptPicker, setOpenConceptPicker] = useState(false);
  const [openAreaPicker, setOpenAreaPicker] = useState(false);
  const [openSubTagPicker, setOpenSubTagPicker] = useState(false);

  const [mainBuildAxis, setMainBuildAxis] = useState<MainBuildAxis>('industry');
  const [subBuildAxis, setSubBuildAxis] = useState<BlockAxis>('industry');
  const [hiddenBuildAxis, setHiddenBuildAxis] = useState<BlockAxis>('industry');

  const industryChainsForAgent = useRequest(
    async () => (await services.getIndustryChain({ active: true })) as IndustryChainInfo[],
    { refreshDeps: [] }
  );
  const industryChainNameOptions = useMemo(
    () => industryChainsForAgent.data?.map((row) => row.name).filter(Boolean) ?? [],
    [industryChainsForAgent.data]
  );
  const [selectedIndustryChainName, setSelectedIndustryChainName] = useState('');
  const [industryChainOverwriteUser, setIndustryChainOverwriteUser] = useState(true);

  const chainRowsForIndustry = useRequest(
    async () => {
      const chain = selectedIndustryChainName.trim();
      if (!chain) return [] as StockIndustryChainListItem[];
      return (await services.listStockIndustryChain({
        industry_chain_name: chain,
      })) as StockIndustryChainListItem[];
    },
    { refreshDeps: [selectedIndustryChainName], ready: Boolean(selectedIndustryChainName.trim()) }
  );

  useEffect(() => {
    const names = industryChainNameOptions;
    if (!names.length) {
      if (selectedIndustryChainName) setSelectedIndustryChainName('');
      return;
    }
    if (!selectedIndustryChainName || !names.includes(selectedIndustryChainName)) {
      setSelectedIndustryChainName(names[0]);
    }
  }, [industryChainNameOptions, selectedIndustryChainName]);

  const subTagBlockItems: BlockInfo[] = useMemo(
    () => subTags.map((tag) => ({ name: tag.name, desc: tag.desc })),
    [subTags]
  );

  async function handle(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  function optionsForBuildType(type: StockTagBuildType, tagName: string): BuildStockTagsOptions {
    const options: BuildStockTagsOptions = {
      tagName,
      overwriteSetByUser: overwriteUserTags,
    };
    if (type === 'main_sub_tag' && subTagSources.length) options.subTagSources = [...subTagSources];
    if (type.endsWith('_industry') && industrySources.length) options.industrySources = [...industrySources];
    if (type.endsWith('_concept') && conceptSources.length) options.conceptSources = [...conceptSources];
    if (type.endsWith('_area') && areaSources.length) options.areaSources = [...areaSources];
    return options;
  }

  function runBuild(type: StockTagBuildType, tagName: string) {
    return handle(type, () => onBuild(type, optionsForBuildType(type, tagName)));
  }

  function clearAllRelationSources() {
    setIndustrySources([]);
    setConceptSources([]);
    setAreaSources([]);
    setSubTagSources([]);
  }

  function removeSelectedSource(axis: SourceAxis, name: string) {
    if (axis === 'industry') setIndustrySources((prev) => prev.filter((item) => item !== name));
    else if (axis === 'concept') setConceptSources((prev) => prev.filter((item) => item !== name));
    else if (axis === 'area') setAreaSources((prev) => prev.filter((item) => item !== name));
    else setSubTagSources((prev) => prev.filter((item) => item !== name));
  }

  function renderBuildActionsRow(buildType: StockTagBuildType, validTargetTagNames: string[]) {
    const trimmed = targetTagName.trim();
    const targetOk = Boolean(trimmed && validTargetTagNames.includes(trimmed));
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
          py: 1,
        }}
      >
        <Button
          variant="solid"
          color="primary"
          size="sm"
          className="!text-[12px]"
          loading={busy === buildType}
          disabled={!targetOk}
          onClick={() => {
            if (!targetOk) return;
            runBuild(buildType, trimmed);
          }}
        >
          构建标签
        </Button>
        <Checkbox
          label="覆盖手动设置"
          checked={overwriteUserTags}
          onChange={(e) => setOverwriteUserTags(e.target.checked)}
          size="sm"
        />
      </Box>
    );
  }

  const mainTagNames = useMemo(() => mainTags.map((tag) => tag.name), [mainTags]);
  const subTagNames = useMemo(() => subTags.map((tag) => tag.name), [subTags]);
  const hiddenTagNames = useMemo(() => hiddenTags.map((tag) => tag.name), [hiddenTags]);

  function renderRebuildLimitsCard(sourceAxis: SourceAxis, tagNameOptions: string[]) {
    const names =
      sourceAxis === 'industry'
        ? industrySources
        : sourceAxis === 'concept'
          ? conceptSources
          : sourceAxis === 'area'
            ? areaSources
            : subTagSources;
    const axisLabel =
      sourceAxis === 'industry'
        ? '行业'
        : sourceAxis === 'concept'
          ? '概念'
          : sourceAxis === 'area'
            ? '地域'
            : '次标签';
    const pickerColor =
      sourceAxis === 'industry'
        ? 'primary'
        : sourceAxis === 'concept'
          ? 'success'
          : sourceAxis === 'area'
            ? 'warning'
            : 'neutral';
    const openPicker = () => {
      if (sourceAxis === 'industry') setOpenIndustryPicker(true);
      else if (sourceAxis === 'concept') setOpenConceptPicker(true);
      else if (sourceAxis === 'area') setOpenAreaPicker(true);
      else setOpenSubTagPicker(true);
    };

    return (
      <Card variant="plain" size="sm">
        <CardContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <FormLabel sx={{ mb: 0.5 }}>目标标签（必填）</FormLabel>
              <Autocomplete
                size="sm"
                options={tagNameOptions}
                placeholder="从列表选择；可输入筛选"
                value={
                  targetTagName && tagNameOptions.includes(targetTagName) ? targetTagName : null
                }
                onChange={(_, newValue) => {
                  const next = typeof newValue === 'string' ? newValue : '';
                  setTargetTagName(next);
                  setTargetTagInput(next);
                }}
                inputValue={targetTagInput}
                onInputChange={(_, newInputValue, reason) => {
                  if (reason === 'reset') {
                    setTargetTagInput(targetTagName);
                    return;
                  }
                  setTargetTagInput(newInputValue);
                }}
                sx={{ maxWidth: 360, '--unstable_popup-zIndex': 20000 }}
                slotProps={{
                  listbox: {
                    placement: 'bottom-start',
                    sx: { zIndex: 20000, maxHeight: 280 },
                  },
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Button
                size="sm"
                variant="outlined"
                color={pickerColor}
                className="!text-[12px]"
                onClick={openPicker}
              >
                选择{axisLabel}名称
              </Button>
            </Box>
            {names.length > 0 && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography level="body-xs" textColor="neutral.500">
                  已选 sources
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {names.map((n) => (
                    <Box
                      key={`${sourceAxis}:${n}`}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.25,
                        pl: 1,
                        pr: 0.25,
                        py: 0.25,
                        borderRadius: 'sm',
                        bgcolor: 'neutral.softBg',
                        border: '1px solid',
                        borderColor: 'neutral.outlinedBorder',
                        maxWidth: '100%',
                      }}
                    >
                      <Typography level="body-xs" sx={{ pr: 0.25, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {n}
                      </Typography>
                      <IconButton
                        size="sm"
                        variant="plain"
                        color="neutral"
                        aria-label={`移除 ${n}`}
                        sx={{ minWidth: 24, minHeight: 24, flexShrink: 0, '--IconButton-size': '22px', p: 0 }}
                        onClick={() => removeSelectedSource(sourceAxis, n)}
                      >
                        <CloseRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </CardContent>
      </Card>
    );
  }

  function mainBuildAxisToSourceAxis(axis: MainBuildAxis): SourceAxis {
    return axis === 'sub_tag' ? 'sub_tag' : axis;
  }

  function switchOperationSection(index: number) {
    if (operationSectionTab !== index && (index === 2 || index === 3 || index === 4)) {
      setTargetTagName('');
      setTargetTagInput('');
    }
    setOperationSectionTab(index);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <BlockSelectorDialog
        open={openIndustryPicker}
        title="选择起作用的行业名称（关联属性）"
        items={industries}
        selected={industrySources}
        onClose={() => setOpenIndustryPicker(false)}
        onConfirm={(next) => {
          setIndustrySources(next);
          setOpenIndustryPicker(false);
        }}
      />
      <BlockSelectorDialog
        open={openConceptPicker}
        title="选择起作用的概念名称（关联属性）"
        items={concepts}
        selected={conceptSources}
        onClose={() => setOpenConceptPicker(false)}
        onConfirm={(next) => {
          setConceptSources(next);
          setOpenConceptPicker(false);
        }}
      />
      <BlockSelectorDialog
        open={openAreaPicker}
        title="选择起作用的地域名称（关联属性）"
        items={areas}
        selected={areaSources}
        onClose={() => setOpenAreaPicker(false)}
        onConfirm={(next) => {
          setAreaSources(next);
          setOpenAreaPicker(false);
        }}
      />
      <BlockSelectorDialog
        open={openSubTagPicker}
        title="选择起作用的次标签名称（仅用于「次标签→主标签」）"
        items={subTagBlockItems}
        selected={subTagSources}
        onClose={() => setOpenSubTagPicker(false)}
        onConfirm={(next) => {
          setSubTagSources(next);
          setOpenSubTagPicker(false);
        }}
      />

      <Box sx={{ pt: 0.5 }}>
        <div className="flex flex-row items-center flex-wrap gap-y-1 border-b border-neutral-200 pb-2 mb-3">
          {OPERATION_SECTION_LABELS.map((label, index) => (
            <div
              key={label}
              role="button"
              tabIndex={0}
              className={`${tradePoolTabClass} ${operationSectionTab === index ? tradePoolTabActiveClass : ''}`}
              onClick={() => switchOperationSection(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  switchOperationSection(index);
                }
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {operationSectionTab === 0 && (
          <Card variant="plain" size="sm" sx={{ mb: 0 }}>
            <CardContent>
              <Typography level="title-sm" sx={{ mb: 2 }} className="!text-sm !font-bold">
                数据初始化
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  size="sm"
                  className="!text-[12px]"
                  startDecorator={<FactoryIcon />}
                  variant="soft"
                  color="primary"
                  loading={busy === 'industry'}
                  onClick={() => handle('industry', () => onInit('industry'))}
                >
                  初始化行业数据
                </Button>
                <Button
                  size="sm"
                  className="!text-[12px]"
                  startDecorator={<LightbulbIcon />}
                  variant="soft"
                  color="success"
                  loading={busy === 'concept'}
                  onClick={() => handle('concept', () => onInit('concept'))}
                >
                  初始化概念数据
                </Button>
                <Button
                  size="sm"
                  className="!text-[12px]"
                  startDecorator={<LocationCityIcon />}
                  variant="soft"
                  color="warning"
                  loading={busy === 'area'}
                  onClick={() => handle('area', () => onInit('area'))}
                >
                  初始化地域数据
                </Button>
                <Button
                  size="sm"
                  className="!text-[12px]"
                  startDecorator={<LightbulbIcon />}
                  variant="outlined"
                  color="success"
                  loading={busy === 'sub_tags_from_concepts'}
                  onClick={() => handle('sub_tags_from_concepts', () => onInit('sub_tags_from_concepts'))}
                >
                  从概念生成次标签
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {operationSectionTab === 1 && (
          <Card variant="plain" size="sm" sx={{ mb: 0 }}>
            <CardContent>
              {industryChainsForAgent.loading ? (
                <Typography level="body-sm">加载产业链目录…</Typography>
              ) : !industryChainNameOptions.length ? (
                <Typography level="body-sm" textColor="neutral.500">
                  暂无活跃产业链，请在「标签信息 → 产业链」中维护。
                </Typography>
              ) : (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: 1,
                      rowGap: 1,
                      mb: 1.5,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 0.75,
                        flex: '1 1 auto',
                        minWidth: 0,
                      }}
                    >
                      {industryChainNameOptions.map((name) => (
                        <div
                          key={name}
                          role="button"
                          tabIndex={0}
                          className={`${tradePoolTabClass} ${
                            selectedIndustryChainName === name ? tradePoolTabActiveClass : ''
                          }`}
                          onClick={() => setSelectedIndustryChainName(name)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault();
                              setSelectedIndustryChainName(name);
                            }
                          }}
                        >
                          {name}
                        </div>
                      ))}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        gap: 1,
                        flexShrink: 0,
                        marginLeft: 'auto',
                      }}
                    >
                      <Button
                        size="sm"
                        variant="soft"
                        className="!text-[12px] !py-1"
                        loading={busy === 'industry_chain_build_table'}
                        disabled={!selectedIndustryChainName.trim()}
                        onClick={() =>
                          handle('industry_chain_build_table', async () => {
                            await onBuildStockIndustryChain({
                              industryChainName: selectedIndustryChainName,
                            });
                            chainRowsForIndustry.refresh();
                          })
                        }
                      >
                        构建个股产业链
                      </Button>
                      <Sheet
                        variant="outlined"
                        sx={{
                          display: 'inline-flex',
                          flexDirection: 'row',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.25,
                          py: 0.75,
                          borderRadius: 'sm',
                        }}
                      >
                        <Button
                          size="sm"
                          variant="soft"
                          className="!text-[12px] !py-1"
                          loading={busy === 'industry_chain_build_tags'}
                          disabled={!selectedIndustryChainName.trim()}
                          onClick={() =>
                            handle('industry_chain_build_tags', async () => {
                              await onBuildStockTagsFromIndustryChain({
                                industryChainName: selectedIndustryChainName,
                                overwriteSetByUser: industryChainOverwriteUser,
                              });
                              chainRowsForIndustry.refresh();
                            })
                          }
                        >
                          由产业链构建标签
                        </Button>
                        <Checkbox
                          label="覆盖手动设置"
                          checked={industryChainOverwriteUser}
                          onChange={(event) => setIndustryChainOverwriteUser(event.target.checked)}
                          size="sm"
                          sx={{ py: 0, minHeight: 0, '& .MuiCheckbox-label': { fontSize: 12 } }}
                        />
                      </Sheet>
                    </Box>
                  </Box>
                  <div className="overflow-auto max-h-[420px]">
                    <Table
                      borderAxis="xBetween"
                      size="sm"
                      hoverRow
                      stickyHeader
                      aria-label="产业链中间表"
                    >
                      <thead className="font-bold">
                        <tr>
                          <th className="w-[140px]">股票名称</th>
                          <th className="min-w-[128px] max-w-[180px]">标的 ID</th>
                          <th>产业链</th>
                          <th>环节</th>
                          <th>定位</th>
                          <th className="min-w-[200px]">核心业务与市场地位</th>
                          <th>上轮产业链</th>
                          <th>上轮环节</th>
                          <th>上轮定位</th>
                          <th className="min-w-[160px]">上轮核心业务与市场地位</th>
                        </tr>
                      </thead>
                      <tbody>
                        {chainRowsForIndustry.loading && (
                          <tr>
                            <td colSpan={10}>
                              <Typography level="body-sm" sx={{ p: 1 }}>
                                加载中…
                              </Typography>
                            </td>
                          </tr>
                        )}
                        {!chainRowsForIndustry.loading &&
                          !(chainRowsForIndustry.data?.length ?? 0) && (
                            <tr>
                              <td colSpan={10}>
                                <Typography level="body-sm" textColor="neutral.500" sx={{ p: 1 }}>
                                  暂无中间表数据；可先执行「构建个股产业链」。
                                </Typography>
                              </td>
                            </tr>
                          )}
                        {!chainRowsForIndustry.loading &&
                          (chainRowsForIndustry.data ?? []).map((row) => (
                            <tr key={row.id}>
                              <td>
                                {(row.name || '').trim() || '—'}|
                                <span className="opacity-90">{row.code ?? ''}</span>
                              </td>
                              <td>
                                <Tooltip
                                  title={row.entity_id || ''}
                                  variant="solid"
                                  placement="top-start"
                                >
                                  <div className="max-w-[168px] truncate text-xs opacity-90 font-mono">
                                    {row.entity_id}
                                  </div>
                                </Tooltip>
                              </td>
                              <td>{row.industry_chain ?? ''}</td>
                              <td>{row.industry_segment ?? ''}</td>
                              <td>{row.position ?? ''}</td>
                              <td>
                                <IndustryChainClampCell value={row.core_business_and_market_position} />
                              </td>
                              <td>{row.pre_industry_chain ?? ''}</td>
                              <td>{row.pre_industry_segment ?? ''}</td>
                              <td>{row.pre_position ?? ''}</td>
                              <td>
                                <IndustryChainClampCell value={row.pre_core_business_and_market_position} />
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        {operationSectionTab === 2 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="plain" size="sm">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography level="title-sm" className="!text-sm !font-bold">
                来自属性
              </Typography>
              <RadioGroup
                orientation="horizontal"
                value={mainBuildAxis}
                onChange={(event) => {
                  setMainBuildAxis(event.target.value as MainBuildAxis);
                  clearAllRelationSources();
                  setTargetTagName('');
                  setTargetTagInput('');
                }}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                <Radio value="industry" label="行业" />
                <Radio value="concept" label="概念" />
                <Radio value="sub_tag" label="次标签" />
              </RadioGroup>
            </CardContent>
          </Card>
          {renderRebuildLimitsCard(mainBuildAxisToSourceAxis(mainBuildAxis), mainTagNames)}
          {renderBuildActionsRow(
            mainBuildAxis === 'industry'
              ? 'main_industry'
              : mainBuildAxis === 'concept'
                ? 'main_concept'
                : 'main_sub_tag',
            mainTagNames
          )}
          </Box>
        )}

        {operationSectionTab === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="plain" size="sm">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography level="title-sm" className="!text-sm !font-bold">
                来自属性
              </Typography>
              <RadioGroup
                orientation="horizontal"
                value={subBuildAxis}
                onChange={(event) => {
                  setSubBuildAxis(event.target.value as BlockAxis);
                  clearAllRelationSources();
                  setTargetTagName('');
                  setTargetTagInput('');
                }}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                <Radio value="industry" label="行业" />
                <Radio value="concept" label="概念" />
                <Radio value="area" label="地域" />
              </RadioGroup>
            </CardContent>
          </Card>
          {renderRebuildLimitsCard(subBuildAxis, subTagNames)}
          {renderBuildActionsRow(
            subBuildAxis === 'industry'
              ? 'sub_industry'
              : subBuildAxis === 'concept'
                ? 'sub_concept'
                : 'sub_area',
            subTagNames
          )}
          </Box>
        )}

        {operationSectionTab === 4 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="plain" size="sm">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography level="title-sm" className="!text-sm !font-bold">
                来自属性
              </Typography>
              <RadioGroup
                orientation="horizontal"
                value={hiddenBuildAxis}
                onChange={(event) => {
                  setHiddenBuildAxis(event.target.value as BlockAxis);
                  clearAllRelationSources();
                  setTargetTagName('');
                  setTargetTagInput('');
                }}
                sx={{ flexWrap: 'wrap', gap: 1 }}
              >
                <Radio value="industry" label="行业" />
                <Radio value="concept" label="概念" />
                <Radio value="area" label="地域" />
              </RadioGroup>
            </CardContent>
          </Card>
          {renderRebuildLimitsCard(hiddenBuildAxis, hiddenTagNames)}
          {renderBuildActionsRow(
            hiddenBuildAxis === 'industry'
              ? 'hidden_industry'
              : hiddenBuildAxis === 'concept'
                ? 'hidden_concept'
                : 'hidden_area',
            hiddenTagNames
          )}
          </Box>
        )}

        {operationSectionTab === 5 && (
          <Card variant="plain" size="sm" sx={{ mb: 0 }}>
            <CardContent>
              <Typography level="title-sm" sx={{ mb: 2 }} className="!text-sm !font-bold">
                数据补偿
              </Typography>
              <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2 }}>
                先修剪主/次/隐藏标签目录：去掉已删除或已归档（行业/概念）的板块名、不存在的地域名、主标签下已不存在的次标签名；
                再扫描全部 StockTags，移除主/次/隐藏 JSON 中已不在标签目录的名称，并回退展示列。结果写入操作日志。
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  size="sm"
                  className="!text-[12px]"
                  startDecorator={<HealingIcon />}
                  variant="soft"
                  color="primary"
                  loading={busy === 'sanitize_tags'}
                  onClick={() => handle('sanitize_tags', () => onSanitizeStockTags())}
                >
                  标签补偿
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* 操作日志 */}
      <Card variant="plain" size="sm" sx={{ mt: 2 }}>
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 1 }} className="!text-sm !font-bold">
            操作日志
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Box
            sx={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'text.tertiary',
              maxHeight: 240,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {opLog.length === 0 ? (
              <Typography level="body-xs" textColor="neutral.300">
                暂无操作记录
              </Typography>
            ) : (
              opLog.map((line, i) => (
                <div key={i}>{line}</div>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
