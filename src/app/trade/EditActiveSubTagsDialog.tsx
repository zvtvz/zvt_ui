'use client';

import CloseRounded from '@mui/icons-material/CloseRounded';
import services from '@/services';
import type { MainTagInfo } from '@/interfaces';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy';
import { useEffect, useMemo, useState } from 'react';

type Props = {
  open: boolean;
  mainTag: MainTagInfo | null | undefined;
  onSaved: () => void | Promise<void>;
  onCancel: () => void;
};

function uniqueSubTagNames(names: string[]) {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const name of names) {
    const trimmed = (name || '').trim();
    if (!trimmed || seen.has(trimmed)) {
      continue;
    }
    seen.add(trimmed);
    result.push(trimmed);
  }
  return result;
}

function RemovableChip({
  name,
  tone,
  onRemove,
  onActivate,
}: {
  name: string;
  tone: 'primary' | 'neutral';
  onRemove: () => void;
  onActivate?: () => void;
}) {
  return (
    <Box
      component="span"
      role={onActivate ? 'button' : undefined}
      tabIndex={onActivate ? 0 : undefined}
      onClick={onActivate}
      onKeyDown={
        onActivate
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onActivate();
              }
            }
          : undefined
      }
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.25,
        maxWidth: '100%',
        borderRadius: 'sm',
        bgcolor: tone === 'primary' ? 'primary.softBg' : 'background.level1',
        color: tone === 'primary' ? 'primary.softColor' : 'text.primary',
        border: '1px solid',
        borderColor: tone === 'primary' ? 'primary.outlinedBorder' : 'neutral.outlinedBorder',
        pl: 1,
        pr: 0.25,
        py: 0.25,
        fontSize: '0.875rem',
        lineHeight: 1.35,
        fontWeight: 500,
        cursor: onActivate ? 'pointer' : 'default',
        '&:hover': onActivate
          ? {
              bgcolor: 'primary.softHoverBg',
            }
          : undefined,
      }}
    >
      <Typography component="span" level="body-sm">
        {name}
      </Typography>
      <Box
        component="button"
        type="button"
        aria-label={`移除 ${name}`}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onRemove();
        }}
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          background: 'transparent',
          cursor: 'pointer',
          borderRadius: 'xs',
          p: 0.25,
          color: 'neutral.600',
          '&:hover': {
            bgcolor: 'rgba(0,0,0,0.06)',
            color: 'neutral.900',
          },
        }}
      >
        <CloseRounded sx={{ fontSize: 16, opacity: 0.75 }} />
      </Box>
    </Box>
  );
}

export default function EditActiveSubTagsDialog({
  open,
  mainTag,
  onSaved,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftActiveSubTags, setDraftActiveSubTags] = useState<string[]>([]);
  const [draftRelationSubTags, setDraftRelationSubTags] = useState<string[]>([]);
  const [newSubTagName, setNewSubTagName] = useState('');

  const activeSubTagSet = useMemo(
    () => new Set(draftActiveSubTags),
    [draftActiveSubTags]
  );

  useEffect(() => {
    if (!open) {
      setDraftActiveSubTags([]);
      setDraftRelationSubTags([]);
      setNewSubTagName('');
      setError('');
      return;
    }
    const activeNames = uniqueSubTagNames(mainTag?.active_sub_tags ?? []);
    const relationNames = uniqueSubTagNames([
      ...(mainTag?.sub_tags ?? []),
      ...activeNames,
    ]);
    setDraftActiveSubTags(activeNames);
    setDraftRelationSubTags(relationNames);
    setNewSubTagName('');
    setError('');
    // Re-seed only when dialog opens / main tag switches; keep in-dialog edits stable.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, mainTag?.name]);

  const addToActive = (name: string) => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      return;
    }
    setDraftActiveSubTags((previous) => uniqueSubTagNames([...previous, trimmed]));
    setDraftRelationSubTags((previous) => uniqueSubTagNames([...previous, trimmed]));
    setNewSubTagName('');
    setError('');
  };

  const removeFromActive = (name: string) => {
    setDraftActiveSubTags((previous) => previous.filter((item) => item !== name));
  };

  const removeFromRelation = (name: string) => {
    setDraftRelationSubTags((previous) => previous.filter((item) => item !== name));
    setDraftActiveSubTags((previous) => previous.filter((item) => item !== name));
  };

  const handleSave = async () => {
    const mainTagName = (mainTag?.name || '').trim();
    if (!mainTagName) {
      setError('未选择主标签');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await services.setActiveSubTagsOnMainTag({
        main_tag_name: mainTagName,
        active_sub_tags: draftActiveSubTags,
        sub_tags: draftRelationSubTags,
      });
      await onSaved();
      onCancel();
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : '保存活跃子标签失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[520px] !text-[14px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>编辑活跃子标签</DialogTitle>
        <DialogContent>
          <Typography level="body-sm" className="mb-2 opacity-80">
            {mainTag?.name
              ? `「${mainTag.name}」下可统一管理活跃次标签与关系次标签：活跃用于交易页三级 tab，关系用于个股主标签反推`
              : ''}
          </Typography>
          <FormControl className="mb-3">
            <FormLabel>当前活跃子标签</FormLabel>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {draftActiveSubTags.length ? (
                draftActiveSubTags.map((name) => (
                  <RemovableChip
                    key={name}
                    name={name}
                    tone="primary"
                    onRemove={() => removeFromActive(name)}
                  />
                ))
              ) : (
                <span className="text-sm text-neutral-500">
                  暂无活跃子标签，可从下方关系目录点选或输入新名称
                </span>
              )}
            </div>
          </FormControl>
          <FormControl className="mb-3">
            <FormLabel>关系次标签</FormLabel>
            <Typography level="body-xs" className="mb-1 opacity-70">
              点击未活跃项加入活跃；× 从关系目录删除（同时移出活跃）
            </Typography>
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {draftRelationSubTags.length ? (
                draftRelationSubTags.map((name) => {
                  const alreadyActive = activeSubTagSet.has(name);
                  return (
                    <RemovableChip
                      key={name}
                      name={name}
                      tone={alreadyActive ? 'primary' : 'neutral'}
                      onRemove={() => removeFromRelation(name)}
                      onActivate={
                        alreadyActive ? undefined : () => addToActive(name)
                      }
                    />
                  );
                })
              ) : (
                <span className="text-sm text-neutral-500">
                  暂无关系次标签，可在下方输入新名称
                </span>
              )}
            </div>
          </FormControl>
          <FormControl>
            <FormLabel>或输入新次标签</FormLabel>
            <div className="flex gap-2">
              <Input
                size="sm"
                name="new_sub_tag_name"
                value={newSubTagName}
                onChange={(event) => setNewSubTagName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    addToActive(newSubTagName);
                  }
                }}
                placeholder="输入新的次标签名称"
                sx={{ flex: 1 }}
              />
              <Button
                size="sm"
                variant="outlined"
                disabled={!newSubTagName.trim()}
                onClick={() => addToActive(newSubTagName)}
              >
                添加
              </Button>
            </div>
          </FormControl>
          {error ? (
            <Typography level="body-sm" color="danger" sx={{ mt: 1 }}>
              {error}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-start' }}>
          <Button size="sm" variant="plain" type="button" onClick={onCancel}>
            取消
          </Button>
          <Button size="sm" className="!ml-2" loading={loading} onClick={handleSave}>
            保存
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
