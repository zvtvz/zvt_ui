'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Input,
  Button,
  Checkbox,
  List,
  ListItem,
  Divider,
  Box,
} from '@mui/joy';
import SearchIcon from '@mui/icons-material/Search';
import { BlockInfo } from '@/interfaces';

interface Props {
  open: boolean;
  title: string;
  items: BlockInfo[];
  selected: string[];
  onConfirm: (selected: string[]) => void;
  onClose: () => void;
}

export default function BlockSelectorDialog({ open, title, items, selected, onConfirm, onClose }: Props) {
  const [search, setSearch] = useState('');
  const [draft, setDraft] = useState<string[]>(selected);

  const filtered = useMemo(
    () => items.filter((item) => item.name.includes(search)),
    [items, search]
  );

  function toggle(name: string) {
    setDraft((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  useEffect(() => {
    if (open) {
      setSearch('');
      setDraft(selected);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      open={open}
      onClose={onClose}
    >
      <ModalDialog
        sx={{ width: 480, maxHeight: '80vh', display: 'flex', flexDirection: 'column' }}
      >
        <ModalClose />
        <Typography level="title-md">{title}</Typography>
        <Input
          startDecorator={<SearchIcon />}
          placeholder="搜索..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mt: 1 }}
        />
        <Divider sx={{ my: 1 }} />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <List size="sm">
            {filtered.map((item) => (
              <ListItem key={item.name}>
                <Checkbox
                  size="sm"
                  label={item.name}
                  checked={draft.includes(item.name)}
                  onChange={() => toggle(item.name)}
                />
              </ListItem>
            ))}
            {filtered.length === 0 && (
              <ListItem>
                <Typography level="body-sm" textColor="neutral.400">
                  无匹配结果
                </Typography>
              </ListItem>
            )}
          </List>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography level="body-sm" textColor="neutral.500">
            已选 {draft.length} 项
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="plain" color="neutral" onClick={onClose}>
              取消
            </Button>
            <Button onClick={() => onConfirm(draft)}>确定</Button>
          </Box>
        </Box>
      </ModalDialog>
    </Modal>
  );
}
