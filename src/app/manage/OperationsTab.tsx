'use client';

import { useMemo, useState } from 'react';
import {
  Typography,
  Button,
  IconButton,
  Card,
  CardContent,
  Box,
  Divider,
  Checkbox,
  Select,
  Option,
  Tabs,
  TabList,
  Tab,
  TabPanel,
  Radio,
  RadioGroup,
} from '@mui/joy';
import FactoryIcon from '@mui/icons-material/Factory';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import LabelIcon from '@mui/icons-material/Label';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseRounded from '@mui/icons-material/CloseRounded';
import BlockSelectorDialog from './BlockSelectorDialog';
import type { BuildStockTagsOptions, StockTagBuildType } from './useData';
import type { BlockInfo, HiddenTagInfo, MainTagInfo, SubTagInfo } from '@/interfaces';

type BlockAxis = 'industry' | 'concept' | 'area';
/** 主标签构建：行业 / 概念 / 次标签（无按地域推主标签接口） */
type MainBuildAxis = 'industry' | 'concept' | 'sub_tag';

/** 与接口 sources 对应的关联维度（当前选中的 y） */
type SourceAxis = 'industry' | 'concept' | 'area' | 'sub_tag';

const TARGET_TAG_NONE = '__none__';

interface Props {
  opLog: string[];
  mainTags: MainTagInfo[];
  subTags: SubTagInfo[];
  hiddenTags: HiddenTagInfo[];
  industries: BlockInfo[];
  concepts: BlockInfo[];
  areas: BlockInfo[];
  onInit: (type: 'industry' | 'concept' | 'area' | 'sub_tag') => Promise<void>;
  onBuild: (type: StockTagBuildType, options?: BuildStockTagsOptions) => Promise<void>;
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
}: Props) {
  const [operationSectionTab, setOperationSectionTab] = useState<number>(0);
  const [busy, setBusy] = useState<string | null>(null);
  const [overwriteUserTags, setOverwriteUserTags] = useState(false);

  const [targetTagName, setTargetTagName] = useState('');
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

  function optionsForBuildType(type: StockTagBuildType): BuildStockTagsOptions {
    const trimmed = targetTagName.trim();
    const options: BuildStockTagsOptions = { overwriteSetByUser: overwriteUserTags };
    if (trimmed) options.tagName = trimmed;
    if (type === 'main_sub_tag' && subTagSources.length) options.subTagSources = [...subTagSources];
    if (type.endsWith('_industry') && industrySources.length) options.industrySources = [...industrySources];
    if (type.endsWith('_concept') && conceptSources.length) options.conceptSources = [...conceptSources];
    if (type.endsWith('_area') && areaSources.length) options.areaSources = [...areaSources];
    return options;
  }

  function runBuild(type: StockTagBuildType) {
    return handle(type, () => onBuild(type, optionsForBuildType(type)));
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

  function renderBuildActionsRow(buildType: StockTagBuildType) {
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
        <Button variant="solid" color="primary" loading={busy === buildType} onClick={() => runBuild(buildType)}>
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
      <Card variant="outlined">
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <FilterListIcon fontSize="small" />
            <Typography level="title-sm">重建限定（可选）</Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography level="body-xs" sx={{ mb: 0.5 }}>
                目标标签（选填）
              </Typography>
              <Select
                size="sm"
                value={
                  targetTagName && tagNameOptions.includes(targetTagName)
                    ? targetTagName
                    : TARGET_TAG_NONE
                }
                onChange={(_, value) =>
                  setTargetTagName(value === TARGET_TAG_NONE ? '' : String(value))
                }
                sx={{ maxWidth: 360 }}
                slotProps={{ listbox: { sx: { maxHeight: 280 } } }}
              >
                <Option value={TARGET_TAG_NONE}>不限制</Option>
                {tagNameOptions.map((name) => (
                  <Option key={name} value={name}>
                    {name}
                  </Option>
                ))}
              </Select>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
              <Button size="sm" variant="outlined" color={pickerColor} onClick={openPicker}>
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
        <Tabs
          value={operationSectionTab}
          onChange={(_, value) => setOperationSectionTab(value as number)}
          size="sm"
        >
          <TabList
            size="sm"
            variant="soft"
            color="neutral"
            sx={{
              gap: 0.25,
              p: 0.5,
              borderRadius: 'sm',
              minHeight: 36,
              boxShadow: 'none',
              bgcolor: 'neutral.softBg',
              border: '1px solid',
              borderColor: 'neutral.outlinedBorder',
              '& [role="tab"]': {
                fontSize: 'sm',
                fontWeight: 500,
                minHeight: '1.75rem',
                py: 0.5,
                px: 1.25,
                borderRadius: 'sm',
              },
              '& [role="tab"][aria-selected="true"]': {
                bgcolor: 'background.surface',
                boxShadow: 'xs',
                color: 'text.primary',
              },
            }}
          >
            <Tab>数据初始化</Tab>
            <Tab>维护主标签</Tab>
            <Tab>维护次标签</Tab>
            <Tab>维护隐藏标签</Tab>
          </TabList>

        <TabPanel value={0} sx={{ pt: 2 }}>
          <Card variant="outlined">
            <CardContent>
              <Typography level="title-sm" sx={{ mb: 2 }}>
                数据初始化
              </Typography>
              <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2 }}>
                从东方财富（em）抓取行业、概念、地域板块列表，写入本地参考数据。已存在的条目跳过，不覆盖已配置的标签关系。
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  startDecorator={<FactoryIcon />}
                  variant="soft"
                  color="primary"
                  loading={busy === 'industry'}
                  onClick={() => handle('industry', () => onInit('industry'))}
                >
                  初始化行业数据
                </Button>
                <Button
                  startDecorator={<LightbulbIcon />}
                  variant="soft"
                  color="success"
                  loading={busy === 'concept'}
                  onClick={() => handle('concept', () => onInit('concept'))}
                >
                  初始化概念数据
                </Button>
                <Button
                  startDecorator={<LocationCityIcon />}
                  variant="soft"
                  color="warning"
                  loading={busy === 'area'}
                  onClick={() => handle('area', () => onInit('area'))}
                >
                  初始化地域数据
                </Button>
                <Button
                  startDecorator={<LabelIcon />}
                  variant="soft"
                  color="neutral"
                  loading={busy === 'sub_tag'}
                  onClick={() => handle('sub_tag', () => onInit('sub_tag'))}
                >
                  初始化次标签（概念映射）
                </Button>
              </Box>
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={1} sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography level="title-sm">来自属性</Typography>
              <RadioGroup
                orientation="horizontal"
                value={mainBuildAxis}
                onChange={(event) => {
                  setMainBuildAxis(event.target.value as MainBuildAxis);
                  clearAllRelationSources();
                  setTargetTagName('');
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
                : 'main_sub_tag'
          )}
        </TabPanel>

        <TabPanel value={2} sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography level="title-sm">来自属性</Typography>
              <RadioGroup
                orientation="horizontal"
                value={subBuildAxis}
                onChange={(event) => {
                  setSubBuildAxis(event.target.value as BlockAxis);
                  clearAllRelationSources();
                  setTargetTagName('');
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
                : 'sub_area'
          )}
        </TabPanel>

        <TabPanel value={3} sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Card variant="outlined">
            <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Typography level="title-sm">来自属性</Typography>
              <RadioGroup
                orientation="horizontal"
                value={hiddenBuildAxis}
                onChange={(event) => {
                  setHiddenBuildAxis(event.target.value as BlockAxis);
                  clearAllRelationSources();
                  setTargetTagName('');
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
                : 'hidden_area'
          )}
        </TabPanel>
        </Tabs>
      </Box>

      {/* 操作日志 */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 1 }}>
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
