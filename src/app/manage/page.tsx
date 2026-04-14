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
    updateTag,
    initBlocks,
    buildStockTags,
  } = useManageData();

  const blockProps = { industries, concepts, areas };

  return (
    <>
      <Typography level="h4" sx={{ mb: 2 }}>
        标签管理
      </Typography>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v as number)}
        sx={{ mb: 0.5 }}
      >
        <TabList
          variant="plain"
          sx={{
            gap: 0.5,
            py: 0.5,
            px: 0.5,
            borderRadius: 'sm',
            bgcolor: 'background.surface',
            boxShadow: 'sm',
            border: '1px solid',
            borderColor: 'divider',
            '& [role="tab"]': {
              fontSize: 'md',
              fontWeight: 600,
              letterSpacing: '0.02em',
              py: 1.25,
              px: 2,
              borderRadius: 'sm',
            },
            '& [role="tab"][aria-selected="true"]': {
              bgcolor: 'primary.softBg',
              color: 'primary.plainColor',
            },
          }}
        >
          <Tab>主标签</Tab>
          <Tab>次标签</Tab>
          <Tab>隐藏标签</Tab>
          <Tab>操作</Tab>
        </TabList>

        {/* 主标签 */}
        <TabPanel value={0} sx={{ pt: 3 }}>
          <TagSection
            tagType="main_tag"
            tags={mainTags}
            subTagOptions={subTags}
            loading={loading.main}
            onCreate={(payload) => createTag('main_tag', payload)}
            onUpdate={(payload) => updateTag('main_tag', payload)}
            {...blockProps}
          />
        </TabPanel>

        {/* 次标签 */}
        <TabPanel value={1} sx={{ pt: 3 }}>
          <TagSection
            tagType="sub_tag"
            tags={subTags}
            loading={loading.sub}
            onCreate={(payload) => createTag('sub_tag', payload)}
            onUpdate={(payload) => updateTag('sub_tag', payload)}
            {...blockProps}
          />
        </TabPanel>

        {/* 隐藏标签 */}
        <TabPanel value={2} sx={{ pt: 3 }}>
          <TagSection
            tagType="hidden_tag"
            tags={hiddenTags}
            loading={loading.hidden}
            onCreate={(payload) => createTag('hidden_tag', payload)}
            onUpdate={(payload) => updateTag('hidden_tag', payload)}
            {...blockProps}
          />
        </TabPanel>

        {/* 操作 */}
        <TabPanel value={3} sx={{ pt: 3 }}>
          <OperationsTab
            opLog={opLog}
            mainTags={mainTags}
            subTags={subTags}
            hiddenTags={hiddenTags}
            industries={industries}
            concepts={concepts}
            areas={areas}
            onInit={initBlocks}
            onBuild={buildStockTags}
          />
        </TabPanel>
      </Tabs>
    </>
  );
}
