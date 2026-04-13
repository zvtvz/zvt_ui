'use client';

import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel, Typography } from '@mui/joy';
import { useManageData } from './useData';
import TagSection from './TagSection';
import OperationsTab from './OperationsTab';

export default function ManagePage() {
  const [tab, setTab] = useState<number>(0);
  const {
    mainTags,
    subTags,
    hiddenTags,
    industries,
    concepts,
    areas,
    loading,
    opLog,
    createTag,
    updateRelations,
    initBlocks,
    buildStockTags,
  } = useManageData();

  const blockProps = { industries, concepts, areas };

  return (
    <>
      <Typography level="h4" sx={{ mb: 2 }}>
        标签管理
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v as number)}>
        <TabList>
          <Tab>标签目录</Tab>
          <Tab>操作</Tab>
        </TabList>

        {/* 标签目录 */}
        <TabPanel value={0} sx={{ pt: 3 }}>
          <TagSection
            title="主标签"
            tagType="main_tag"
            tags={mainTags}
            loading={loading.main}
            onCreate={(name, desc) => createTag('main_tag', name, desc)}
            onUpdateRelations={(tagName, patch) => updateRelations('main_tag', tagName, patch)}
            {...blockProps}
          />

          <TagSection
            title="次标签"
            tagType="sub_tag"
            tags={subTags}
            mainTagOptions={mainTags}
            loading={loading.sub}
            onCreate={(name, desc) => createTag('sub_tag', name, desc)}
            onUpdateRelations={(tagName, patch) => updateRelations('sub_tag', tagName, patch)}
            {...blockProps}
          />

          <TagSection
            title="隐藏标签"
            tagType="hidden_tag"
            tags={hiddenTags}
            loading={loading.hidden}
            onCreate={(name, desc) => createTag('hidden_tag', name, desc)}
            onUpdateRelations={(tagName, patch) => updateRelations('hidden_tag', tagName, patch)}
            {...blockProps}
          />
        </TabPanel>

        {/* 操作 */}
        <TabPanel value={1} sx={{ pt: 3 }}>
          <OperationsTab
            opLog={opLog}
            onInit={initBlocks}
            onBuild={buildStockTags}
          />
        </TabPanel>
      </Tabs>
    </>
  );
}
