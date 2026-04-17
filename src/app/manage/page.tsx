'use client';

import { useState } from 'react';
import { Card, CardContent } from '@mui/joy';
import { useManageData } from './useData';
import TagSection from './TagSection';
import OperationsTab from './OperationsTab';
import {
  tradePoolTabClass,
  tradePoolTabActiveClass,
  tradeInnerTabClass,
} from './tradeStyleClasses';

const SECTION_LABELS = ['标签信息', '构建标签'] as const;
const TAG_KIND_LABELS = ['主标签', '次标签', '隐藏标签'] as const;

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
    deleteTag,
    initBlocks,
    buildStockTags,
  } = useManageData();

  const blockProps = { industries, concepts, areas };

  return (
    <Card size="sm" variant="plain" className="overflow-visible">
      <CardContent className="!p-4">
        <div className="border-b pb-2 mb-3 flex flex-row items-center justify-between">
          <span className="text-sm font-bold">标签管理</span>
        </div>

        <div className="flex flex-row items-center flex-wrap gap-y-1 border-b border-neutral-200 pb-2 mb-3">
          {SECTION_LABELS.map((label, index) => (
            <div
              key={label}
              role="button"
              tabIndex={0}
              className={`${tradePoolTabClass} ${sectionTab === index ? tradePoolTabActiveClass : ''}`}
              onClick={() => setSectionTab(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setSectionTab(index);
                }
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {sectionTab === 0 && (
          <>
            <div className="flex flex-row items-center flex-wrap gap-y-1 mb-3">
              {TAG_KIND_LABELS.map((label, index) => (
                <div
                  key={label}
                  role="button"
                  tabIndex={0}
                  className={`${tradeInnerTabClass} ${tagTab === index ? tradePoolTabActiveClass : ''}`}
                  onClick={() => setTagTab(index)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setTagTab(index);
                    }
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
            {tagTab === 0 && (
              <TagSection
                tagType="main_tag"
                tags={mainTags}
                subTagOptions={subTags}
                loading={loading.main}
                onCreate={(payload) => createTag('main_tag', payload)}
                onUpdate={(payload) => updateTag('main_tag', payload)}
                onDelete={(tagName) => deleteTag('main_tag', tagName)}
                {...blockProps}
              />
            )}
            {tagTab === 1 && (
              <TagSection
                tagType="sub_tag"
                tags={subTags}
                loading={loading.sub}
                onCreate={(payload) => createTag('sub_tag', payload)}
                onUpdate={(payload) => updateTag('sub_tag', payload)}
                onDelete={(tagName) => deleteTag('sub_tag', tagName)}
                {...blockProps}
              />
            )}
            {tagTab === 2 && (
              <TagSection
                tagType="hidden_tag"
                tags={hiddenTags}
                loading={loading.hidden}
                onCreate={(payload) => createTag('hidden_tag', payload)}
                onUpdate={(payload) => updateTag('hidden_tag', payload)}
                onDelete={(tagName) => deleteTag('hidden_tag', tagName)}
                {...blockProps}
              />
            )}
          </>
        )}

        {sectionTab === 1 && (
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
        )}
      </CardContent>
    </Card>
  );
}
