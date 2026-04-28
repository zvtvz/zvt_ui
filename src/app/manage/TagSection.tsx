'use client';

import { useState } from 'react';
import {
  Typography,
  Button,
  Chip,
  Table,
  Box,
  Tooltip,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import useConfirmDialog from '@/components/Dialog/useConfirmDialog';
import Dialog from '@/components/Dialog';
import {
  MainTagInfo,
  SubTagInfo,
  HiddenTagInfo,
  BlockInfo,
  TagType,
  CreateMainTagInfo,
  CreateSubTagInfo,
  CreateHiddenTagInfo,
  UpdateMainTagInfo,
  UpdateSubTagInfo,
  UpdateHiddenTagInfo,
} from '@/interfaces';
import TagEditDialog from './TagEditDialog';

// ─── 泛型行数据 ────────────────────────────────────────────────────────────────

type AnyTagInfo = MainTagInfo | SubTagInfo | HiddenTagInfo;

interface BaseProps {
  tagType: TagType;
  industries: BlockInfo[];
  concepts: BlockInfo[];
  areas: BlockInfo[];
  loading?: boolean;
  onCreate: (payload: CreateMainTagInfo | CreateSubTagInfo | CreateHiddenTagInfo) => Promise<void>;
  onUpdate: (payload: UpdateMainTagInfo | UpdateSubTagInfo | UpdateHiddenTagInfo) => Promise<void>;
  onDelete: (tagName: string) => Promise<void>;
}

// ─── 主标签 Section ────────────────────────────────────────────────────────────

interface MainTagSectionProps extends BaseProps {
  tagType: 'main_tag';
  tags: MainTagInfo[];
  /** 用于在编辑/创建主标签时选择关联的次标签 */
  subTagOptions: SubTagInfo[];
}

// ─── 次标签 Section ────────────────────────────────────────────────────────────

interface SubTagSectionProps extends BaseProps {
  tagType: 'sub_tag';
  tags: SubTagInfo[];
}

// ─── 隐藏标签 Section ──────────────────────────────────────────────────────────

interface HiddenTagSectionProps extends BaseProps {
  tagType: 'hidden_tag';
  tags: HiddenTagInfo[];
}

type TagSectionProps = MainTagSectionProps | SubTagSectionProps | HiddenTagSectionProps;

// ─── 组件 ─────────────────────────────────────────────────────────────────────

export default function TagSection(props: TagSectionProps) {
  const { tagType, industries, concepts, areas, loading, onCreate, onUpdate, onDelete } = props;
  const tags = props.tags as AnyTagInfo[];
  const subTagOptions = tagType === 'main_tag' ? (props as MainTagSectionProps).subTagOptions : [];

  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; tag?: AnyTagInfo } | null>(null);
  const confirmDialog = useConfirmDialog();
  const columnCount = tagType === 'main_tag' ? 7 : 6;

  const tagTypeLabel: Record<TagType, string> = {
    main_tag: '主标签',
    sub_tag: '次标签',
    hidden_tag: '隐藏标签',
  };

  async function handleSubmit(data: {
    name: string;
    desc: string;
    priority: number;
    sub_tags: string[];
    industries: string[];
    concepts: string[];
    areas: string[];
  }) {
    const baseFields = {
      desc: data.desc || null,
      priority: data.priority,
      industries: data.industries.length ? data.industries : null,
      concepts: data.concepts.length ? data.concepts : null,
      areas: data.areas.length ? data.areas : null,
      ...(tagType === 'main_tag' ? { sub_tags: data.sub_tags.length ? data.sub_tags : null } : {}),
    };

    if (dialog?.mode === 'create') {
      await onCreate({ name: data.name, ...baseFields });
    } else if (dialog?.mode === 'edit' && dialog.tag) {
      await onUpdate({ tag_name: dialog.tag.name, ...baseFields });
    }
    setDialog(null);
  }

  function confirmDeleteTag(tag: AnyTagInfo) {
    confirmDialog.show({
      title: '删除标签',
      content: `确定删除${tagTypeLabel[tagType]}「${tag.name}」？相关股票上的该标签将被清除。`,
      async onOk() {
        await onDelete(tag.name);
      },
    });
  }

  return (
    <Box>
      <div className="flex flex-row justify-between items-center mb-2">
        <span className="opacity-85 text-sm">共 {tags.length} 个</span>
        <Button
          size="sm"
          variant="soft"
          startDecorator={<AddIcon />}
          className="!text-[12px] !py-1"
          onClick={() => setDialog({ mode: 'create' })}
        >
          新增{tagTypeLabel[tagType]}
        </Button>
      </div>

      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead className="font-bold">
            <tr>
              <th style={{ width: 120 }}>名称</th>
              {tagType === 'main_tag' && <th>关联次标签</th>}
              <th style={{ width: 48, textAlign: 'center' }}>优先级</th>
              <th>关联行业</th>
              <th>关联概念</th>
              <th>关联地域</th>
              <th style={{ width: 140, whiteSpace: 'nowrap' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columnCount}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : tags.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    暂无数据，点击「新增」创建
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
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 0.75 }}>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="primary"
                        onClick={() => setDialog({ mode: 'edit', tag })}
                        sx={{ minWidth: 0, fontSize: 12, px: 1.25, py: 0.25 }}
                      >
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="outlined"
                        color="danger"
                        onClick={() => confirmDeleteTag(tag)}
                        sx={{ minWidth: 0, fontSize: 12, px: 1.25, py: 0.25 }}
                      >
                        删除
                      </Button>
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      {dialog && (
        <TagEditDialog
          open={!!dialog}
          mode={dialog.mode}
          tagType={tagType}
          initial={dialog.tag ?? null}
          subTagOptions={subTagOptions}
          industries={industries}
          concepts={concepts}
          areas={areas}
          onSubmit={handleSubmit}
          onClose={() => setDialog(null)}
        />
      )}
      {confirmDialog.open && <Dialog.Confirm {...confirmDialog.props} />}
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
  if (list.length === 0) {
    return (
      <Typography level="body-md" textColor="neutral.400">
        -
      </Typography>
    );
  }
  const shown = list.slice(0, max);
  const rest = list.length - shown.length;
  const chipTypographySx = {
    fontSize: '1rem',
    lineHeight: 1.4,
    fontWeight: 500,
  };
  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.65, alignItems: 'center' }}>
      {shown.map((n) => (
        <Chip
          key={n}
          size="md"
          variant="soft"
          color={color}
          sx={{
            ...chipTypographySx,
            minHeight: 32,
            px: 1,
            py: 0.35,
          }}
        >
          {n}
        </Chip>
      ))}
      {rest > 0 && (
        <Chip
          size="md"
          variant="plain"
          color="neutral"
          sx={{
            ...chipTypographySx,
            minHeight: 32,
            px: 1,
          }}
        >
          +{rest}
        </Chip>
      )}
    </Box>
  );
}
