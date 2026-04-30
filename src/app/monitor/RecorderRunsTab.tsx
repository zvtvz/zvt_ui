'use client';

import { useRequest } from 'ahooks';
import { Box, Typography, Chip, Skeleton, Input } from '@mui/joy';
import { useState } from 'react';
import services from '@/services';
import type { RecorderJobRunInfo } from '@/interfaces';

const STATUS_COLOR: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  success: 'success',
  running: 'warning',
  failed: 'danger',
};

const STATUS_LABEL: Record<string, string> = {
  success: '成功',
  running: '运行中',
  failed: '失败',
};

function RunRow({ run }: { run: RecorderJobRunInfo }) {
  const color = STATUS_COLOR[run.status] ?? 'neutral';
  const label = STATUS_LABEL[run.status] ?? run.status;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
        py: 1.5,
        borderBottom: '1px solid',
        borderColor: 'neutral.outlinedBorder',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
        <Typography level="title-sm" sx={{ fontWeight: 600 }}>
          {run.recorder_name}
        </Typography>
        <Chip size="sm" variant="soft" color={color}>
          {label}
        </Chip>
        {run.duration_seconds != null && (
          <Typography level="body-xs" textColor="neutral.500">
            {run.duration_seconds}s
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        {run.started_at && (
          <Typography level="body-xs" textColor="neutral.500">
            开始 {new Date(run.started_at).toLocaleString('zh-CN')}
          </Typography>
        )}
        {run.finished_at && (
          <Typography level="body-xs" textColor="neutral.500">
            结束 {new Date(run.finished_at).toLocaleString('zh-CN')}
          </Typography>
        )}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Typography level="body-xs" textColor="neutral.500">
          实体 {run.entities_processed}
        </Typography>
        <Typography level="body-xs" textColor="neutral.500">
          记录 {run.records_processed}
        </Typography>
      </Box>

      {run.error_message && (
        <Typography
          level="body-xs"
          textColor="danger.500"
          sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}
        >
          {run.error_message}
        </Typography>
      )}
    </Box>
  );
}

export default function RecorderRunsTab() {
  const [filterName, setFilterName] = useState('');

  const { data, loading } = useRequest(
    () => services.listMonitorRuns({ recorder_name: filterName.trim() || undefined, limit: 100 }),
    { refreshDeps: [filterName] }
  );

  const runs: RecorderJobRunInfo[] = data ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Input
        size="sm"
        placeholder="按 recorder 名称过滤（如 ZvtStockKdataRecorder）"
        value={filterName}
        onChange={(e) => setFilterName(e.target.value)}
        sx={{ maxWidth: 400 }}
      />

      {loading ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {[1, 2, 3, 4].map((key) => (
            <Skeleton key={key} variant="rectangular" height={72} sx={{ borderRadius: 'sm' }} />
          ))}
        </Box>
      ) : runs.length === 0 ? (
        <Typography level="body-sm" textColor="neutral.400">
          暂无执行记录
        </Typography>
      ) : (
        <Box>
          {runs.map((run) => (
            <RunRow key={run.run_id} run={run} />
          ))}
        </Box>
      )}
    </Box>
  );
}
