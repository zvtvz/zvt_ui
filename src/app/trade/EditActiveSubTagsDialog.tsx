'use client';

import CloseRounded from '@mui/icons-material/CloseRounded';
import services from '@/services';
import type { MainTagInfo } from '@/interfaces';
import {
  Box,
  Button,
  Chip,
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

export default function EditActiveSubTagsDialog({
  open,
  mainTag,
  onSaved,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [draftActiveSubTags, setDraftActiveSubTags] = useState<string[]>([]);
  const [newSubTagName, setNewSubTagName] = useState('');

  const activeSubTagSet = useMemo(
    () => new Set(draftActiveSubTags),
    [draftActiveSubTags]
  );

  const selectableRelationSubTags = useMemo(() => {
    const relationSubTags = mainTag?.sub_tags ?? [];
    return relationSubTags.filter((name) => {
      const trimmed = (name || '').trim();
      return trimmed && !activeSubTagSet.has(trimmed);
    });
  }, [mainTag?.sub_tags, activeSubTagSet]);

  useEffect(() => {
    if (!open) {
      setDraftActiveSubTags([]);
      setNewSubTagName('');
      setError('');
      return;
    }
    setDraftActiveSubTags(uniqueSubTagNames(mainTag?.active_sub_tags ?? []));
    setNewSubTagName('');
    setError('');
  }, [open, mainTag?.active_sub_tags, mainTag?.name]);

  const addSubTagName = (name: string) => {
    const trimmed = (name || '').trim();
    if (!trimmed) {
      return;
    }
    setDraftActiveSubTags((previous) => uniqueSubTagNames([...previous, trimmed]));
    setNewSubTagName('');
    setError('');
  };

  const removeSubTagName = (name: string) => {
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
      <ModalDialog className="w-[480px] !text-[14px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>编辑活跃子标签</DialogTitle>
        <DialogContent>
          <Typography level="body-sm" className="mb-2 opacity-80">
            {mainTag?.name
              ? `「${mainTag.name}」下交易页三级 tab 展示的活跃次标签，可从关系目录添加或点击标签删除`
              : ''}
          </Typography>
          <FormControl className="mb-3">
            <FormLabel>当前活跃子标签</FormLabel>
            <div className="flex flex-wrap gap-1 min-h-[32px]">
              {draftActiveSubTags.length ? (
                draftActiveSubTags.map((name) => (
                  <Box
                    key={name}
                    component="span"
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.25,
                      maxWidth: '100%',
                      borderRadius: 'sm',
                      bgcolor: 'primary.softBg',
                      color: 'primary.softColor',
                      pl: 1,
                      pr: 0.25,
                      py: 0.25,
                      fontSize: '0.875rem',
                      lineHeight: 1.35,
                      fontWeight: 500,
                    }}
                  >
                    <Typography component="span" level="body-sm">
                      {name}
                    </Typography>
                    <button
                      type="button"
                      className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded p-0.5 text-neutral-600 hover:bg-[rgba(0,0,0,0.06)] hover:text-neutral-900"
                      aria-label={`移除 ${name}`}
                      onClick={() => removeSubTagName(name)}
                    >
                      <CloseRounded sx={{ fontSize: 16, opacity: 0.75 }} />
                    </button>
                  </Box>
                ))
              ) : (
                <span className="text-sm text-neutral-500">
                  暂无活跃子标签，可从下方关系目录添加或输入新名称
                </span>
              )}
            </div>
          </FormControl>
          {selectableRelationSubTags.length ? (
            <FormControl className="mb-3">
              <FormLabel>从关系次标签添加</FormLabel>
              <div className="flex flex-wrap gap-1.5">
                {selectableRelationSubTags.map((name) => (
                  <Chip
                    key={name}
                    size="sm"
                    variant="outlined"
                    color="neutral"
                    onClick={() => addSubTagName(name)}
                    className="cursor-pointer"
                  >
                    {name}
                  </Chip>
                ))}
              </div>
            </FormControl>
          ) : null}
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
                    addSubTagName(newSubTagName);
                  }
                }}
                placeholder="输入新的次标签名称"
                sx={{ flex: 1 }}
              />
              <Button
                size="sm"
                variant="outlined"
                disabled={!newSubTagName.trim()}
                onClick={() => addSubTagName(newSubTagName)}
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
