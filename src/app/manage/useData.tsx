'use client';

import { useRequest } from 'ahooks';
import { useState } from 'react';
import services from '@/services';
import {
  MainTagInfo,
  SubTagInfo,
  HiddenTagInfo,
  BlockInfo,
  TagType,
  CreateMainTagInfo,
  CreateSubTagInfo,
  CreateHiddenTagInfo,
  UpdateMainTagInfo,
  UpdateSubTagInfo,
  UpdateHiddenTagInfo,
} from '@/interfaces';

export function useManageData() {
  const mainTags = useRequest(services.getMainTagInfo, { refreshDeps: [] });
  const subTags = useRequest(services.getSubTagInfo, { refreshDeps: [] });
  const hiddenTags = useRequest(services.getHiddenTagInfo, { refreshDeps: [] });
  const industries = useRequest(services.getIndustryInfo, { refreshDeps: [] });
  const concepts = useRequest(services.getConceptInfo, { refreshDeps: [] });
  const areas = useRequest(services.getAreaInfo, { refreshDeps: [] });

  const [opLog, setOpLog] = useState<string[]>([]);

  function addLog(msg: string) {
    setOpLog((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 49)]);
  }

  async function createTag(
    tagType: 'main_tag',
    payload: CreateMainTagInfo
  ): Promise<void>;
  async function createTag(
    tagType: 'sub_tag',
    payload: CreateSubTagInfo
  ): Promise<void>;
  async function createTag(
    tagType: 'hidden_tag',
    payload: CreateHiddenTagInfo
  ): Promise<void>;
  async function createTag(
    tagType: TagType,
    payload: CreateMainTagInfo | CreateSubTagInfo | CreateHiddenTagInfo
  ) {
    if (tagType === 'main_tag') {
      await services.createMainTagInfo(payload as CreateMainTagInfo);
    } else if (tagType === 'sub_tag') {
      await services.createSubTagInfo(payload as CreateSubTagInfo);
    } else {
      await services.createHiddenTagInfo(payload as CreateHiddenTagInfo);
    }
    addLog(`创建 ${tagType} [${payload.name}] 成功`);
    refreshByType(tagType);
  }

  async function updateTag(tagType: 'main_tag', payload: UpdateMainTagInfo): Promise<void>;
  async function updateTag(tagType: 'sub_tag', payload: UpdateSubTagInfo): Promise<void>;
  async function updateTag(tagType: 'hidden_tag', payload: UpdateHiddenTagInfo): Promise<void>;
  async function updateTag(
    tagType: TagType,
    payload: UpdateMainTagInfo | UpdateSubTagInfo | UpdateHiddenTagInfo
  ) {
    if (tagType === 'main_tag') {
      await services.updateMainTagInfo(payload as UpdateMainTagInfo);
    } else if (tagType === 'sub_tag') {
      await services.updateSubTagInfo(payload as UpdateSubTagInfo);
    } else {
      await services.updateHiddenTagInfo(payload as UpdateHiddenTagInfo);
    }
    addLog(`更新 [${payload.tag_name}] 成功`);
    refreshByType(tagType);
  }

  function refreshByType(tagType: TagType) {
    if (tagType === 'main_tag') mainTags.refresh();
    else if (tagType === 'sub_tag') subTags.refresh();
    else hiddenTags.refresh();
  }

  async function initBlocks(type: 'industry' | 'concept' | 'area') {
    addLog(`正在初始化 ${type} 数据...`);
    try {
      if (type === 'industry') await services.initIndustryInfo();
      else if (type === 'concept') await services.initConceptInfo();
      else await services.initAreaInfo();
      addLog(`初始化 ${type} 数据完成`);
      if (type === 'industry') industries.refresh();
      else if (type === 'concept') concepts.refresh();
      else areas.refresh();
    } catch {
      addLog(`初始化 ${type} 数据失败`);
    }
  }

  async function buildStockTags(entityIds?: string[]) {
    addLog('正在重建股票标签...');
    try {
      const res = await services.buildStockTagsFromRelations({
        entity_ids: entityIds ?? null,
      });
      addLog(`重建完成：处理 ${res?.processed ?? '?'} 条，跳过 ${res?.skipped ?? '?'} 条`);
    } catch {
      addLog('重建股票标签失败');
    }
  }

  return {
    mainTags: (mainTags.data ?? []) as MainTagInfo[],
    subTags: (subTags.data ?? []) as SubTagInfo[],
    hiddenTags: (hiddenTags.data ?? []) as HiddenTagInfo[],
    industries: (industries.data ?? []) as BlockInfo[],
    concepts: (concepts.data ?? []) as BlockInfo[],
    areas: (areas.data ?? []) as BlockInfo[],
    loading: {
      main: mainTags.loading,
      sub: subTags.loading,
      hidden: hiddenTags.loading,
    },
    opLog,
    createTag,
    updateTag,
    initBlocks,
    buildStockTags,
    refreshByType,
  };
}
