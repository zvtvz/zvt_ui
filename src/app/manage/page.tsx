'use client';

import { useState } from 'react';
import { Tabs, TabList, Tab, TabPanel, Typography, Box } from '@mui/joy';
import { useManageData } from './useData';
import TagSection from './TagSection';
import OperationsTab from './OperationsTab';

export default function ManagePage() {
  const [sectionTab, setSectionTab] = useState<number>(0);
  const [tagTab, setTagTab] = useState<number>(0);
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

  const outerTabListSx = {
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
  } as const;

  const innerTabListSx = {
    gap: 0.25,
    p: 0.5,
    borderRadius: 'sm',
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
  } as const;

  return (
    <>
      <Typography level="h4" sx={{ mb: 2 }}>
        标签管理
      </Typography>

      <Tabs value={sectionTab} onChange={(_, v) => setSectionTab(v as number)} sx={{ mb: 0.5 }}>
        <TabList variant="plain" sx={outerTabListSx}>
          <Tab>标签信息</Tab>
          <Tab>构建标签</Tab>
        </TabList>

        <TabPanel value={0} sx={{ pt: 3 }}>
          <Box sx={{ pt: 0.5 }}>
            <Tabs value={tagTab} onChange={(_, v) => setTagTab(v as number)} size="sm">
              <TabList size="sm" variant="soft" color="neutral" sx={innerTabListSx}>
                <Tab>主标签</Tab>
                <Tab>次标签</Tab>
                <Tab>隐藏标签</Tab>
              </TabList>

              <TabPanel value={0} sx={{ pt: 2 }}>
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

              <TabPanel value={1} sx={{ pt: 2 }}>
                <TagSection
                  tagType="sub_tag"
                  tags={subTags}
                  loading={loading.sub}
                  onCreate={(payload) => createTag('sub_tag', payload)}
                  onUpdate={(payload) => updateTag('sub_tag', payload)}
                  {...blockProps}
                />
              </TabPanel>

              <TabPanel value={2} sx={{ pt: 2 }}>
                <TagSection
                  tagType="hidden_tag"
                  tags={hiddenTags}
                  loading={loading.hidden}
                  onCreate={(payload) => createTag('hidden_tag', payload)}
                  onUpdate={(payload) => updateTag('hidden_tag', payload)}
                  {...blockProps}
                />
              </TabPanel>
            </Tabs>
          </Box>
        </TabPanel>

        <TabPanel value={1} sx={{ pt: 3 }}>
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
