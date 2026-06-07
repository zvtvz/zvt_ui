'use client';

import { Box } from '@mui/joy';
import { useState } from 'react';
import InviteCodeListSection from './InviteCodeListSection';
import InviteUserSection from './InviteUserSection';
import UserListSection from './UserListSection';
import {
  tradeInnerTabClass,
  tradePoolTabActiveClass,
} from './tradeStyleClasses';

const INNER_TABS = ['用户列表', '邀请码', '邀请用户'] as const;

export default function UserManageTab() {
  const [innerTab, setInnerTab] = useState(0);

  return (
    <Box>
      <div className="flex flex-row items-center flex-wrap gap-y-1 mb-3">
        {INNER_TABS.map((label, index) => (
          <div
            key={label}
            role="button"
            tabIndex={0}
            className={`${tradeInnerTabClass} ${innerTab === index ? tradePoolTabActiveClass : ''}`}
            onClick={() => setInnerTab(index)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setInnerTab(index);
              }
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {innerTab === 0 ? <UserListSection /> : null}
      {innerTab === 1 ? <InviteCodeListSection /> : null}
      {innerTab === 2 ? <InviteUserSection /> : null}
    </Box>
  );
}
