'use client';

import { useRequest } from 'ahooks';
import { useState } from 'react';
import services from '@/services';
import { TagInfo, BlockInfo, TagType } from '@/interfaces';

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

  async function createTag(tagType: TagType, name: string, desc: string) {
    const api =
      tagType === 'main_tag'
        ? services.createMainTagInfo
        : tagType === 'sub_tag'
        ? services.createSubTagInfo
        : services.createHiddenTagInfo;
    await api({ name, desc });
    addLog(`创建${tagType} [${name}] 成功`);
    refreshByType(tagType);
  }

  async function updateRelations(
    tagType: TagType,
    tagName: string,
    patch: {
      industries?: string[] | null;
      concepts?: string[] | null;
      areas?: string[] | null;
      priority?: number | null;
    }
  ) {
    await services.updateTagInfoRelations({
      tag_type: tagType,
      tag_name: tagName,
      ...patch,
    });
    addLog(`更新 [${tagName}] 关系成功`);
    refreshByType(tagType);
  }

  function refreshByType(tagType: TagType) {
    if (tagType === 'main_tag') mainTags.refresh();
    else if (tagType === 'sub_tag') subTags.refresh();
    else hiddenTags.refresh();
  }

  async function initBlocks(type: 'industry' | 'concept' | 'area') {
    addLog(`正在初始化${type}数据...`);
    try {
      if (type === 'industry') await services.initIndustryInfo();
      else if (type === 'concept') await services.initConceptInfo();
      else await services.initAreaInfo();
      addLog(`初始化${type}数据完成`);
      if (type === 'industry') industries.refresh();
      else if (type === 'concept') concepts.refresh();
      else areas.refresh();
    } catch {
      addLog(`初始化${type}数据失败`);
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
    mainTags: (mainTags.data ?? []) as TagInfo[],
    subTags: (subTags.data ?? []) as TagInfo[],
    hiddenTags: (hiddenTags.data ?? []) as TagInfo[],
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
    updateRelations,
    initBlocks,
    buildStockTags,
    refreshByType,
  };
}
