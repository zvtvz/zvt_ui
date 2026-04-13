'use client';

import { useState } from 'react';
import {
  Typography,
  Button,
  Chip,
  Table,
  Sheet,
  Box,
  Tooltip,
  IconButton,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { TagInfo, BlockInfo, TagType } from '@/interfaces';
import TagEditDialog from './TagEditDialog';

interface Props {
  title: string;
  tagType: TagType;
  tags: TagInfo[];
  mainTagOptions?: TagInfo[];
  industries: BlockInfo[];
  concepts: BlockInfo[];
  areas: BlockInfo[];
  loading?: boolean;
  onCreate: (name: string, desc: string) => Promise<void>;
  onUpdateRelations: (
    tagName: string,
    patch: { industries?: string[]; concepts?: string[]; areas?: string[]; priority?: number }
  ) => Promise<void>;
}

export default function TagSection({
  title,
  tagType,
  tags,
  mainTagOptions = [],
  industries,
  concepts,
  areas,
  loading,
  onCreate,
  onUpdateRelations,
}: Props) {
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; tag?: TagInfo } | null>(null);

  async function handleSubmit(data: {
    name: string;
    desc: string;
    main_tag?: string;
    priority: number;
    industries: string[];
    concepts: string[];
    areas: string[];
  }) {
    if (dialog?.mode === 'create') {
      await onCreate(data.name, data.desc);
      // After creation, update relations if any were set
      if (data.industries.length || data.concepts.length || data.areas.length || data.priority !== 0) {
        await onUpdateRelations(data.name, {
          industries: data.industries,
          concepts: data.concepts,
          areas: data.areas,
          priority: data.priority,
        });
      }
    } else if (dialog?.mode === 'edit' && dialog.tag) {
      await onUpdateRelations(dialog.tag.name, {
        industries: data.industries,
        concepts: data.concepts,
        areas: data.areas,
        priority: data.priority,
      });
    }
    setDialog(null);
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography level="title-sm" textColor="neutral.700">
          {title}
          <Typography level="body-xs" sx={{ ml: 1 }} textColor="neutral.400">
            共 {tags.length} 个
          </Typography>
        </Typography>
        <Button
          size="sm"
          variant="soft"
          startDecorator={<AddIcon />}
          onClick={() => setDialog({ mode: 'create' })}
        >
          新增
        </Button>
      </Box>

      <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'hidden' }}>
        <Table size="sm" stripe="even" hoverRow>
          <thead>
            <tr>
              <th style={{ width: 120 }}>名称</th>
              {tagType === 'sub_tag' && <th style={{ width: 100 }}>主标签</th>}
              <th style={{ width: 48 }}>优先级</th>
              <th>关联行业</th>
              <th>关联概念</th>
              <th>关联地域</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 2 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 2 }}>
                    暂无数据，点击"新增"创建
                  </Typography>
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id || tag.name}>
                  <td>
                    <Tooltip title={tag.desc ?? ''} variant="solid" placement="top-start">
                      <Typography level="body-sm" fontWeight="md">
                        {tag.name}
                      </Typography>
                    </Tooltip>
                  </td>
                  {tagType === 'sub_tag' && (
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {tag.main_tag ?? '-'}
                      </Typography>
                    </td>
                  )}
                  <td>
                    <Typography level="body-xs" textColor="neutral.500">
                      {tag.priority ?? 0}
                    </Typography>
                  </td>
                  <td>
                    <ChipList items={tag.industries} color="primary" />
                  </td>
                  <td>
                    <ChipList items={tag.concepts} color="success" />
                  </td>
                  <td>
                    <ChipList items={tag.areas} color="warning" />
                  </td>
                  <td>
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="neutral"
                      onClick={() => setDialog({ mode: 'edit', tag })}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Sheet>

      {dialog && (
        <TagEditDialog
          open={!!dialog}
          mode={dialog.mode}
          tagType={tagType}
          initial={dialog.tag ?? null}
          mainTagOptions={mainTagOptions}
          industries={industries}
          concepts={concepts}
          areas={areas}
          onSubmit={handleSubmit}
          onClose={() => setDialog(null)}
        />
      )}
    </Box>
  );
}

function ChipList({
  items,
  color,
}: {
  items: string[] | null | undefined;
  color: 'primary' | 'success' | 'warning';
}) {
  const list = items ?? [];
  if (list.length === 0) return <Typography level="body-xs" textColor="neutral.300">-</Typography>;
  const shown = list.slice(0, 3);
  const rest = list.length - shown.length;
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.3 }}>
      {shown.map((n) => (
        <Chip key={n} size="sm" variant="soft" color={color} sx={{ fontSize: 10 }}>
          {n}
        </Chip>
      ))}
      {rest > 0 && (
        <Chip size="sm" variant="plain" color="neutral" sx={{ fontSize: 10 }}>
          +{rest}
        </Chip>
      )}
    </Box>
  );
}
