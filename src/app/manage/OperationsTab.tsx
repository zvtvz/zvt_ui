'use client';

import { useState } from 'react';
import {
  Typography,
  Button,
  Card,
  CardContent,
  Box,
  Divider,
  Chip,
} from '@mui/joy';
import FactoryIcon from '@mui/icons-material/Factory';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import BuildIcon from '@mui/icons-material/Build';

interface Props {
  opLog: string[];
  onInit: (type: 'industry' | 'concept' | 'area') => Promise<void>;
  onBuild: () => Promise<void>;
}

export default function OperationsTab({ opLog, onInit, onBuild }: Props) {
  const [busy, setBusy] = useState<string | null>(null);

  async function handle(key: string, fn: () => Promise<void>) {
    setBusy(key);
    try {
      await fn();
    } finally {
      setBusy(null);
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 初始化 */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 2 }}>
            数据初始化
          </Typography>
          <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2 }}>
            从东方财富（em）抓取行业、概念、地域板块列表，写入本地参考数据。已存在的条目跳过，不覆盖已配置的标签关系。
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              startDecorator={<FactoryIcon />}
              variant="soft"
              color="primary"
              loading={busy === 'industry'}
              onClick={() => handle('industry', () => onInit('industry'))}
            >
              初始化行业数据
            </Button>
            <Button
              startDecorator={<LightbulbIcon />}
              variant="soft"
              color="success"
              loading={busy === 'concept'}
              onClick={() => handle('concept', () => onInit('concept'))}
            >
              初始化概念数据
            </Button>
            <Button
              startDecorator={<LocationCityIcon />}
              variant="soft"
              color="warning"
              loading={busy === 'area'}
              onClick={() => handle('area', () => onInit('area'))}
            >
              初始化地域数据
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 重建 */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 2 }}>
            重建股票标签
          </Typography>
          <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2 }}>
            根据当前标签目录中配置的行业/概念/地域关系，自动为全市场股票推导
            <Chip size="sm" variant="soft" sx={{ mx: 0.5 }}>主标签</Chip>
            <Chip size="sm" variant="soft" color="success" sx={{ mx: 0.5 }}>次标签</Chip>
            <Chip size="sm" variant="soft" color="warning" sx={{ mx: 0.5 }}>隐藏标签</Chip>。
            已由用户手动设定的股票（set_by_user=true）跳过。
          </Typography>
          <Button
            startDecorator={<BuildIcon />}
            color="danger"
            variant="soft"
            loading={busy === 'build'}
            onClick={() => handle('build', onBuild)}
          >
            重建股票标签
          </Button>
        </CardContent>
      </Card>

      {/* 操作日志 */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 1 }}>操作日志</Typography>
          <Divider sx={{ mb: 1 }} />
          <Box
            sx={{
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'text.tertiary',
              maxHeight: 240,
              overflowY: 'auto',
              whiteSpace: 'pre-wrap',
            }}
          >
            {opLog.length === 0 ? (
              <Typography level="body-xs" textColor="neutral.300">
                暂无操作记录
              </Typography>
            ) : (
              opLog.map((line, i) => (
                <div key={i}>{line}</div>
              ))
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
