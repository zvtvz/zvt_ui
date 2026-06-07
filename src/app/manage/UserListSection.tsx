'use client';

import type { AuthUser, UserAccountStatus } from '@/interfaces/auth';
import services from '@/services';
import { Box, Button, Table, Typography } from '@mui/joy';
import { useRequest } from 'ahooks';
import dayjs from 'dayjs';
import { useState } from 'react';
import { tradeInnerTabClass, tradePoolTabActiveClass } from './tradeStyleClasses';

const STATUS_FILTERS: { value: UserAccountStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'active', label: '活跃' },
  { value: 'disabled', label: '禁用' },
  { value: 'expired', label: '过期' },
];

const STATUS_LABELS: Record<UserAccountStatus, string> = {
  active: '活跃',
  disabled: '禁用',
  expired: '过期',
};

const COLUMN_COUNT = 5;

function formatDateTime(value?: string | null) {
  if (!value) {
    return '—';
  }
  return dayjs(value).format('YYYY-MM-DD HH:mm');
}

export default function UserListSection() {
  const [statusFilter, setStatusFilter] = useState<UserAccountStatus | 'all'>('all');
  const [actionError, setActionError] = useState('');
  const [actingUserId, setActingUserId] = useState<string | null>(null);

  const { data, loading, refresh } = useRequest(
    async () => {
      const params =
        statusFilter === 'all' ? undefined : { status: statusFilter };
      return (await services.listUsers(params)) as AuthUser[];
    },
    { refreshDeps: [statusFilter] }
  );

  const users = Array.isArray(data) ? data : [];

  const runAction = async (userId: string, action: () => Promise<unknown>) => {
    setActingUserId(userId);
    setActionError('');
    try {
      await action();
      refresh();
    } catch (error) {
      setActionError(error instanceof Error ? error.message : '操作失败');
    } finally {
      setActingUserId(null);
    }
  };

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
        <span className="opacity-85 text-sm">共 {users.length} 人</span>
      </div>

      {actionError ? (
        <Typography level="body-sm" color="danger" sx={{ mb: 1 }}>
          {actionError}
        </Typography>
      ) : null}

      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead className="font-bold">
            <tr>
              <th style={{ minWidth: 220 }}>邮箱</th>
              <th style={{ width: 88 }}>角色</th>
              <th style={{ width: 88 }}>状态</th>
              <th style={{ width: 160, whiteSpace: 'nowrap' }}>有效期至</th>
              <th style={{ width: 180, whiteSpace: 'nowrap' }}>操作</th>
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
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={COLUMN_COUNT}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    暂无用户
                  </Typography>
                </td>
              </tr>
            ) : (
              users.map((user) => {
                const status = user.status || 'active';
                const isActing = actingUserId === user.id;
                return (
                  <tr key={user.id}>
                    <td style={{ verticalAlign: 'top' }}>
                      <Typography level="body-md" sx={{ fontSize: '0.9375rem', lineHeight: 1.45 }}>
                        {user.email}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {user.role}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {STATUS_LABELS[status] || status}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {formatDateTime(user.expires_at)}
                      </Typography>
                    </td>
                    <td>
                      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.75 }}>
                        {status === 'active' && user.role !== 'admin' ? (
                          <>
                            <Button
                              size="sm"
                              variant="outlined"
                              color="primary"
                              loading={isActing}
                              onClick={() =>
                                runAction(user.id, () =>
                                  services.extendUserValidity({ user_id: user.id })
                                )
                              }
                              sx={{ minWidth: 0, fontSize: 12, px: 1.25, py: 0.25 }}
                            >
                              延长一年
                            </Button>
                            <Button
                              size="sm"
                              variant="outlined"
                              color="danger"
                              loading={isActing}
                              onClick={() =>
                                runAction(user.id, () =>
                                  services.disableUser({ user_id: user.id })
                                )
                              }
                              sx={{ minWidth: 0, fontSize: 12, px: 1.25, py: 0.25 }}
                            >
                              禁用
                            </Button>
                          </>
                        ) : null}
                        {status === 'disabled' ? (
                          <Button
                            size="sm"
                            variant="outlined"
                            color="primary"
                            loading={isActing}
                            onClick={() =>
                              runAction(user.id, () =>
                                services.enableUser({ user_id: user.id })
                              )
                            }
                            sx={{ minWidth: 0, fontSize: 12, px: 1.25, py: 0.25 }}
                          >
                            启用
                          </Button>
                        ) : null}
                        {status === 'expired' ? (
                          <Button
                            size="sm"
                            variant="outlined"
                            color="primary"
                            loading={isActing}
                            onClick={() =>
                              runAction(user.id, () =>
                                services.extendUserValidity({ user_id: user.id })
                              )
                            }
                            sx={{ minWidth: 0, fontSize: 12, px: 1.25, py: 0.25 }}
                          >
                            延期一年
                          </Button>
                        ) : null}
                      </Box>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </Box>
  );
}
