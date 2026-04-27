'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  List,
  ListItem,
  ListItemButton,
  ListItemContent,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from '@mui/joy';

import type { MainTagInfo } from '@/interfaces';

import type { TagPoolBlockKind } from './TagAndPoolFourBlocks';

export type TagPoolRelationAddDialogProps = {
  open: boolean;
  title: string;
  kind: TagPoolBlockKind | null;
  tagCandidates: MainTagInfo[];
  poolNameCandidates: string[];
  actionLoading: boolean;
  onClose: () => void;
  /** 点选一项即关联；内部传单元素数组，与上层原 batch 实现兼容 */
  onConfirmBatch: (names: string[]) => void | Promise<void>;
};

function isMainTagKind(k: TagPoolBlockKind | null): k is 'positive_main' | 'negative_main' {
  return k === 'positive_main' || k === 'negative_main';
}

function isPoolKind(k: TagPoolBlockKind | null): k is 'positive_pool' | 'negative_pool' {
  return k === 'positive_pool' || k === 'negative_pool';
}

/**
 * 与标签管理「选择次标签」弹层一致：顶部搜索，下面为**可点选列表**（点一行即选），无多选 / 无底部「确定」。
 */
export default function TagPoolRelationAddDialog(props: TagPoolRelationAddDialogProps) {
  const {
    open,
    title,
    kind,
    tagCandidates,
    poolNameCandidates,
    actionLoading,
    onClose,
    onConfirmBatch,
  } = props;

  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!open) {
      setSearch('');
    }
  }, [open]);

  const query = search.trim().toLowerCase();

  const filteredTags = useMemo(() => {
    if (!isMainTagKind(kind)) {
      return [];
    }
    return tagCandidates.filter((tag) => {
      if (!query) {
        return true;
      }
      const inName = tag.name.toLowerCase().includes(query);
      const inDesc = (tag.desc || '').toLowerCase().includes(query);
      return inName || inDesc;
    });
  }, [kind, tagCandidates, query]);

  const filteredPools = useMemo(() => {
    if (!isPoolKind(kind)) {
      return [];
    }
    return poolNameCandidates.filter((name) => {
      if (!query) {
        return true;
      }
      return name.toLowerCase().includes(query);
    });
  }, [kind, poolNameCandidates, query]);

  const pickOne = async (name: string) => {
    if (actionLoading) {
      return;
    }
    await onConfirmBatch([name]);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalDialog
        layout="center"
        size="sm"
        sx={{
          width: 'min(92vw, 360px)',
          maxWidth: 360,
          p: 2,
          boxSizing: 'border-box',
        }}
      >
        <ModalClose size="sm" />
        <DialogTitle sx={{ pr: 2.5 }}>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5}>
            <Input
              size="sm"
              placeholder="搜索名称"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Box
              sx={{
                maxHeight: 320,
                overflowY: 'auto',
                borderRadius: 'sm',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {isMainTagKind(kind) && (
                <List variant="outlined" size="sm" sx={{ py: 0, '--ListDivider-color': 'divider' }}>
                  {filteredTags.length === 0 ? (
                    <Typography level="body-sm" sx={{ p: 2, color: 'neutral.500' }}>
                      {tagCandidates.length === 0 ? '暂无可关联项' : '无匹配项'}
                    </Typography>
                  ) : (
                    filteredTags.map((tag) => (
                      <ListItem key={tag.name} sx={{ p: 0 }}>
                        <ListItemButton
                          disabled={actionLoading}
                          sx={{
                            py: 1,
                            px: 1.5,
                            borderRadius: 0,
                            flexDirection: 'column',
                            alignItems: 'stretch',
                          }}
                          onClick={() => void pickOne(tag.name)}
                        >
                          <ListItemContent>
                            <Typography level="body-sm" fontWeight="md">
                              {tag.name}
                            </Typography>
                            <Typography level="body-xs" sx={{ opacity: 0.85 }}>
                              {tag.desc?.trim() || '—'}
                            </Typography>
                          </ListItemContent>
                        </ListItemButton>
                      </ListItem>
                    ))
                  )}
                </List>
              )}
              {isPoolKind(kind) && (
                <List variant="outlined" size="sm" sx={{ py: 0 }}>
                  {filteredPools.length === 0 ? (
                    <Typography level="body-sm" sx={{ p: 2, color: 'neutral.500' }}>
                      {poolNameCandidates.length === 0 ? '暂无可关联项' : '无匹配项'}
                    </Typography>
                  ) : (
                    filteredPools.map((poolName) => (
                      <ListItem key={poolName} sx={{ p: 0 }}>
                        <ListItemButton
                          disabled={actionLoading}
                          sx={{
                            py: 1,
                            px: 1.5,
                            borderRadius: 0,
                            flexDirection: 'column',
                            alignItems: 'stretch',
                          }}
                          onClick={() => void pickOne(poolName)}
                        >
                          <ListItemContent>
                            <Typography level="body-sm" fontWeight="md">
                              {poolName}
                            </Typography>
                            <Typography level="body-xs" sx={{ opacity: 0.85 }}>
                              股票池
                            </Typography>
                          </ListItemContent>
                        </ListItemButton>
                      </ListItem>
                    ))
                  )}
                </List>
              )}
              {!kind && (
                <Typography level="body-sm" sx={{ p: 2, color: 'neutral.500' }}>
                  —
                </Typography>
              )}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
          <Button size="sm" variant="plain" color="neutral" onClick={onClose}>
            取消
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
