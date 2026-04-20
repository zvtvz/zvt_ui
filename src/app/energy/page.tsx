'use client';

import { useMemo, useState } from 'react';
import { useRequest } from 'ahooks';
import { Chip, Typography } from '@mui/joy';

import services from '@/services';
import type { MainTagInfo } from '@/interfaces';

function sortMainTagsByPriorityThenName(tags: MainTagInfo[]) {
  return [...tags].sort((left, right) => {
    if (left.priority !== right.priority) {
      return left.priority - right.priority;
    }
    return left.name.localeCompare(right.name, 'zh-Hans-CN');
  });
}

export default function EnergyPage() {
  const { data: mainTagList = [], loading } = useRequest(services.getMainTagInfo);
  const sortedMainTags = useMemo(
    () => sortMainTagsByPriorityThenName(mainTagList as MainTagInfo[]),
    [mainTagList]
  );
  const [selectedMainTagName, setSelectedMainTagName] = useState<
    string | undefined
  >();

  return (
    <div className="pl-2">
      <Typography level="title-md" className="mb-3">
        能量
      </Typography>
      <Typography level="body-sm" color="neutral" className="mb-2">
        主标签
      </Typography>
      <div className="flex flex-row flex-wrap items-center gap-2 mb-6 min-h-[40px]">
        {loading && (
          <Typography level="body-sm" color="neutral">
            加载中…
          </Typography>
        )}
        {!loading &&
          sortedMainTags.map((tag) => {
            const isSelected = tag.name === selectedMainTagName;
            return (
              <Chip
                key={tag.id}
                color="primary"
                variant={isSelected ? 'solid' : 'soft'}
                className="cursor-pointer"
                size="md"
                onClick={() =>
                  setSelectedMainTagName(isSelected ? undefined : tag.name)
                }
              >
                {tag.name}
              </Chip>
            );
          })}
      </div>
      {selectedMainTagName ? (
        <Typography level="body-sm" color="neutral">
          已选择主标签「{selectedMainTagName}」。事件与能量测度等能力将在此逐步接入。
        </Typography>
      ) : (
        <Typography level="body-sm" color="neutral">
          请选择上方主标签，后续将在此展示该题材下的能量与催化信息。
        </Typography>
      )}
    </div>
  );
}
