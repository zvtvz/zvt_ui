'use client';

import { useRequest } from 'ahooks';
import { Box, Typography, Chip, Skeleton } from '@mui/joy';
import services from '@/services';
import type { ScheduledJobInfo } from '@/interfaces';

function JobRow({ job }: { job: ScheduledJobInfo }) {
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
          {job.job_id}
        </Typography>
        {job.cron_expr && (
          <Chip size="sm" variant="soft" color="primary" sx={{ fontFamily: 'monospace', fontSize: 11 }}>
            {job.cron_expr}
          </Chip>
        )}
      </Box>
      {job.description && (
        <Typography level="body-sm" textColor="neutral.600">
          {job.description}
        </Typography>
      )}
      {job.func_name && (
        <Typography level="body-xs" textColor="neutral.400" sx={{ fontFamily: 'monospace' }}>
          {job.func_name}
        </Typography>
      )}
      {job.registered_at && (
        <Typography level="body-xs" textColor="neutral.400">
          注册于 {new Date(job.registered_at).toLocaleString('zh-CN')}
        </Typography>
      )}
    </Box>
  );
}

export default function ScheduledJobsTab() {
  const { data, loading } = useRequest(() => services.listMonitorJobs({}));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, pt: 1 }}>
        {[1, 2, 3].map((key) => (
          <Skeleton key={key} variant="rectangular" height={64} sx={{ borderRadius: 'sm' }} />
        ))}
      </Box>
    );
  }

  const jobs: ScheduledJobInfo[] = data ?? [];

  if (jobs.length === 0) {
    return (
      <Typography level="body-sm" textColor="neutral.400" sx={{ pt: 2 }}>
        暂无已注册的定时任务
      </Typography>
    );
  }

  return (
    <Box>
      {jobs.map((job) => (
        <JobRow key={job.job_id} job={job} />
      ))}
    </Box>
  );
}
