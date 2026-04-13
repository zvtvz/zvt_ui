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
import LabelIcon from '@mui/icons-material/Label';

type BuildType =
  | 'main_industry' | 'main_concept' | 'main_sub_tag'
  | 'sub_industry' | 'sub_concept' | 'sub_area'
  | 'hidden_industry' | 'hidden_concept' | 'hidden_area';

interface Props {
  opLog: string[];
  onInit: (type: 'industry' | 'concept' | 'area' | 'sub_tag') => Promise<void>;
  onBuild: (type: BuildType) => Promise<void>;
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
            <Button
              startDecorator={<LabelIcon />}
              variant="soft"
              color="neutral"
              loading={busy === 'sub_tag'}
              onClick={() => handle('sub_tag', () => onInit('sub_tag'))}
            >
              初始化次标签（概念映射）
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 重建主标签 */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 1 }}>重建主标签</Typography>
          <Typography level="body-sm" textColor="neutral.500" sx={{ mb: 2 }}>
            已手动设定（set_by_user=true）的股票跳过。执行顺序由用户决定。
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="soft" color="primary" startDecorator={<FactoryIcon />}
              loading={busy === 'main_industry'} onClick={() => handle('main_industry', () => onBuild('main_industry'))}>
              行业 → 主标签
            </Button>
            <Button variant="soft" color="success" startDecorator={<LightbulbIcon />}
              loading={busy === 'main_concept'} onClick={() => handle('main_concept', () => onBuild('main_concept'))}>
              概念 → 主标签
            </Button>
            <Button variant="soft" color="neutral" startDecorator={<LabelIcon />}
              loading={busy === 'main_sub_tag'} onClick={() => handle('main_sub_tag', () => onBuild('main_sub_tag'))}>
              次标签 → 主标签
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 重建次标签 */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 1 }}>重建次标签</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="soft" color="primary" startDecorator={<FactoryIcon />}
              loading={busy === 'sub_industry'} onClick={() => handle('sub_industry', () => onBuild('sub_industry'))}>
              行业 → 次标签
            </Button>
            <Button variant="soft" color="success" startDecorator={<LightbulbIcon />}
              loading={busy === 'sub_concept'} onClick={() => handle('sub_concept', () => onBuild('sub_concept'))}>
              概念 → 次标签
            </Button>
            <Button variant="soft" color="warning" startDecorator={<LocationCityIcon />}
              loading={busy === 'sub_area'} onClick={() => handle('sub_area', () => onBuild('sub_area'))}>
              地域 → 次标签
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* 重建隐藏标签 */}
      <Card variant="outlined">
        <CardContent>
          <Typography level="title-sm" sx={{ mb: 1 }}>重建隐藏标签</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button variant="soft" color="primary" startDecorator={<FactoryIcon />}
              loading={busy === 'hidden_industry'} onClick={() => handle('hidden_industry', () => onBuild('hidden_industry'))}>
              行业 → 隐藏标签
            </Button>
            <Button variant="soft" color="success" startDecorator={<LightbulbIcon />}
              loading={busy === 'hidden_concept'} onClick={() => handle('hidden_concept', () => onBuild('hidden_concept'))}>
              概念 → 隐藏标签
            </Button>
            <Button variant="soft" color="warning" startDecorator={<LocationCityIcon />}
              loading={busy === 'hidden_area'} onClick={() => handle('hidden_area', () => onBuild('hidden_area'))}>
              地域 → 隐藏标签
            </Button>
          </Box>
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
