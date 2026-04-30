'use client';

import { useState } from 'react';
import { Card, CardContent } from '@mui/joy';
import ScheduledJobsTab from './ScheduledJobsTab';
import RecorderRunsTab from './RecorderRunsTab';

const TAB_LABELS = ['定时任务', '数据记录'] as const;

const tabClass =
  'mr-3 px-2 text-[14px] h-8 flex items-center cursor-pointer rounded-md hover:text-[#416df9] transition-colors';
const tabActiveClass = 'bg-[rgba(65,109,249,.1)]';

export default function MonitorPage() {
  const [activeTab, setActiveTab] = useState<number>(0);

  return (
    <Card size="sm" variant="plain" className="overflow-visible">
      <CardContent className="!p-4">
        <div className="border-b pb-2 mb-3 flex flex-row items-center justify-between">
          <span className="text-sm font-bold">监控</span>
        </div>

        <div className="flex flex-row items-center flex-wrap gap-y-1 border-b border-neutral-200 pb-2 mb-3">
          {TAB_LABELS.map((label, index) => (
            <div
              key={label}
              role="button"
              tabIndex={0}
              className={`${tabClass} ${activeTab === index ? tabActiveClass : ''}`}
              onClick={() => setActiveTab(index)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setActiveTab(index);
                }
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {activeTab === 0 && <ScheduledJobsTab />}
        {activeTab === 1 && <RecorderRunsTab />}
      </CardContent>
    </Card>
  );
}
