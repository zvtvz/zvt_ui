'use client';

import type { InviteCodeItem, InviteCodeStatus } from '@/interfaces/auth';
import services from '@/services';
import { Box, Table, Typography } from '@mui/joy';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { useState } from 'react';
import { tradeInnerTabClass, tradePoolTabActiveClass } from './tradeStyleClasses';

const STATUS_FILTERS: { value: InviteCodeStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'available', label: '可用' },
  { value: 'registered', label: '已注册' },
  { value: 'expired', label: '过期' },
];

const STATUS_LABELS: Record<InviteCodeStatus, string> = {
  available: '可用',
  registered: '已注册',
  expired: '过期',
};

const COLUMN_COUNT = 5;

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—';
  }
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

export default function InviteCodeListSection() {
  const [statusFilter, setStatusFilter] = useState<InviteCodeStatus | 'all'>('all');

  const { data, loading } = useRequest(
    async () => {
      const params =
        statusFilter === 'all' ? undefined : { status: statusFilter };
      return (await services.listInviteCodes(params)) as InviteCodeItem[];
    },
    { refreshDeps: [statusFilter] }
  );

  const inviteCodes = Array.isArray(data) ? data : [];

  return (
    <Box>
      <div className="flex flex-row items-center flex-wrap gap-y-1 mb-3">
        {STATUS_FILTERS.map((item) => (
          <div
            key={item.value}
            role="button"
            tabIndex={0}
            className={`${tradeInnerTabClass} ${statusFilter === item.value ? tradePoolTabActiveClass : ''}`}
            onClick={() => setStatusFilter(item.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setStatusFilter(item.value);
              }
            }}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className="flex flex-row justify-between items-center mb-2">
        <span className="opacity-85 text-sm">共 {inviteCodes.length} 条</span>
      </div>

      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead className="font-bold">
            <tr>
              <th style={{ minWidth: 220 }}>邮箱</th>
              <th style={{ minWidth: 180 }}>邀请码</th>
              <th style={{ width: 88 }}>状态</th>
              <th style={{ width: 160, whiteSpace: 'nowrap' }}>邀请码有效期至</th>
              <th style={{ width: 160, whiteSpace: 'nowrap' }}>使用时间</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={COLUMN_COUNT}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : inviteCodes.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    暂无邀请码
                  </Typography>
                </td>
              </tr>
            ) : (
              inviteCodes.map((item) => {
                const status = (item.status || 'available') as InviteCodeStatus;
                return (
                  <tr key={item.id}>
                    <td style={{ verticalAlign: 'top' }}>
                      <Typography level="body-md" sx={{ fontSize: '0.9375rem', lineHeight: 1.45 }}>
                        {item.email || '—'}
                      </Typography>
                    </td>
                    <td>
                      <Typography
                        level="body-xs"
                        textColor="neutral.500"
                        sx={{ fontFamily: 'ui-monospace, monospace' }}
                      >
                        {item.code}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {STATUS_LABELS[status] || status}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {formatDateTime(item.expires_at)}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {formatDateTime(item.used_at)}
                      </Typography>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>

      <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1 }}>
        「已注册」表示该邀请码已被使用完成注册。
      </Typography>
    </Box>
  );
}
