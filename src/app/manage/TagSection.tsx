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
import { MainTagInfo, SubTagInfo, HiddenTagInfo, BlockInfo, TagType } from '@/interfaces';
import TagEditDialog from './TagEditDialog';

// ─── 泛型行数据 ────────────────────────────────────────────────────────────────

type AnyTagInfo = MainTagInfo | SubTagInfo | HiddenTagInfo;

interface BaseProps {
  tagType: TagType;
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

// ─── 主标签 Section ────────────────────────────────────────────────────────────

interface MainTagSectionProps extends BaseProps {
  tagType: 'main_tag';
  tags: MainTagInfo[];
}

// ─── 次标签 Section ────────────────────────────────────────────────────────────

interface SubTagSectionProps extends BaseProps {
  tagType: 'sub_tag';
  tags: SubTagInfo[];
  mainTagOptions: MainTagInfo[];
}

// ─── 隐藏标签 Section ──────────────────────────────────────────────────────────

interface HiddenTagSectionProps extends BaseProps {
  tagType: 'hidden_tag';
  tags: HiddenTagInfo[];
}

type TagSectionProps = MainTagSectionProps | SubTagSectionProps | HiddenTagSectionProps;

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export default function TagSection(props: TagSectionProps) {
  const { tagType, industries, concepts, areas, loading, onCreate, onUpdateRelations } = props;
  const tags = props.tags as AnyTagInfo[];
  const mainTagOptions = tagType === 'sub_tag' ? (props as SubTagSectionProps).mainTagOptions : [];

  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; tag?: AnyTagInfo } | null>(null);

  const tagTypeLabel: Record<TagType, string> = {
    main_tag: '主标签',
    sub_tag: '次标签',
    hidden_tag: '隐藏标签',
  };

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
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography level="body-xs" textColor="neutral.400">
          共 {tags.length} 个
        </Typography>
        <Button
          size="sm"
          variant="soft"
          startDecorator={<AddIcon />}
          onClick={() => setDialog({ mode: 'create' })}
        >
          新增{tagTypeLabel[tagType]}
        </Button>
      </Box>

      <Sheet variant="outlined" sx={{ borderRadius: 'sm', overflow: 'auto' }}>
        <Table size="sm" stripe="even" hoverRow>
          <thead>
            <tr>
              <th style={{ width: 120 }}>名称</th>
              {tagType === 'sub_tag' && <th style={{ width: 100 }}>所属主标签</th>}
              {tagType === 'main_tag' && <th>关联次标签</th>}
              <th style={{ width: 48, textAlign: 'center' }}>优先级</th>
              <th>关联行业</th>
              <th>关联概念</th>
              <th>关联地域</th>
              <th style={{ width: 48 }} />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={8}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    暂无数据，点击"新增"创建
                  </Typography>
                </td>
              </tr>
            ) : (
              tags.map((tag) => (
                <tr key={tag.id || tag.name}>
                  <td>
                    <Tooltip title={tag.desc ?? ''} variant="solid" placement="top-start">
                      <Typography level="body-sm" fontWeight="md">{tag.name}</Typography>
                    </Tooltip>
                  </td>

                  {tagType === 'sub_tag' && (
                    <td>
                      <Typography level="body-xs" textColor="primary.500">
                        {(tag as SubTagInfo).main_tag ?? '-'}
                      </Typography>
                    </td>
                  )}

                  {tagType === 'main_tag' && (
                    <td>
                      <ChipList
                        items={(tag as MainTagInfo).sub_tags}
                        color="neutral"
                        max={4}
                      />
                    </td>
                  )}

                  <td style={{ textAlign: 'center' }}>
                    <Typography level="body-xs" textColor="neutral.500">
                      {tag.priority ?? 0}
                    </Typography>
                  </td>
                  <td><ChipList items={tag.industries} color="primary" /></td>
                  <td><ChipList items={tag.concepts} color="success" /></td>
                  <td><ChipList items={tag.areas} color="warning" /></td>

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

// ─── ChipList ─────────────────────────────────────────────────────────────────

function ChipList({
  items,
  color,
  max = 3,
}: {
  items: string[] | null | undefined;
  color: 'primary' | 'success' | 'warning' | 'neutral';
  max?: number;
}) {
  const list = items ?? [];
  if (list.length === 0) return <Typography level="body-xs" textColor="neutral.300">-</Typography>;
  const shown = list.slice(0, max);
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
