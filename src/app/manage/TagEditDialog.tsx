'use client';

import { useState, useEffect } from 'react';
import {
  Modal,
  ModalDialog,
  ModalClose,
  Typography,
  Input,
  Textarea,
  Button,
  FormControl,
  FormLabel,
  Chip,
  ChipDelete,
  Select,
  Option,
  Divider,
  Box,
  Stack,
} from '@mui/joy';
import AddIcon from '@mui/icons-material/Add';
import { MainTagInfo, SubTagInfo, HiddenTagInfo, BlockInfo, TagType } from '@/interfaces';
import BlockSelectorDialog from './BlockSelectorDialog';

type AnyTagInfo = MainTagInfo | SubTagInfo | HiddenTagInfo;

interface Props {
  open: boolean;
  mode: 'create' | 'edit';
  tagType: TagType;
  initial?: AnyTagInfo | null;
  mainTagOptions?: MainTagInfo[];
  industries: BlockInfo[];
  concepts: BlockInfo[];
  areas: BlockInfo[];
  onSubmit: (data: {
    name: string;
    desc: string;
    main_tag?: string;
    priority: number;
    industries: string[];
    concepts: string[];
    areas: string[];
  }) => void;
  onClose: () => void;
}

type SelectorState = 'industries' | 'concepts' | 'areas' | null;

export default function TagEditDialog({
  open,
  mode,
  tagType,
  initial,
  mainTagOptions = [],
  industries,
  concepts,
  areas,
  onSubmit,
  onClose,
}: Props) {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [mainTag, setMainTag] = useState('');
  const [priority, setPriority] = useState(0);
  const [selIndustries, setSelIndustries] = useState<string[]>([]);
  const [selConcepts, setSelConcepts] = useState<string[]>([]);
  const [selAreas, setSelAreas] = useState<string[]>([]);
  const [selector, setSelector] = useState<SelectorState>(null);

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      setName(initial.name);
      setDesc(initial.desc ?? '');
      setMainTag((initial as SubTagInfo).main_tag ?? '');
      setPriority(initial.priority ?? 0);
      setSelIndustries(initial.industries ?? []);
      setSelConcepts(initial.concepts ?? []);
      setSelAreas(initial.areas ?? []);
    } else {
      setName('');
      setDesc('');
      setMainTag(mainTagOptions[0]?.name ?? '');
      setPriority(0);
      setSelIndustries([]);
      setSelConcepts([]);
      setSelAreas([]);
    }
  }, [open, mode, initial, mainTagOptions]);

  function handleSubmit() {
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      desc: desc.trim(),
      ...(tagType === 'sub_tag' ? { main_tag: mainTag } : {}),
      priority,
      industries: selIndustries,
      concepts: selConcepts,
      areas: selAreas,
    });
  }

  const selectorConfig: Record<
    NonNullable<SelectorState>,
    { title: string; items: BlockInfo[]; selected: string[]; onConfirm: (v: string[]) => void }
  > = {
    industries: { title: '选择行业', items: industries, selected: selIndustries, onConfirm: setSelIndustries },
    concepts: { title: '选择概念', items: concepts, selected: selConcepts, onConfirm: setSelConcepts },
    areas: { title: '选择地域', items: areas, selected: selAreas, onConfirm: setSelAreas },
  };

  const tagTypeLabel: Record<TagType, string> = {
    main_tag: '主标签',
    sub_tag: '次标签',
    hidden_tag: '隐藏标签',
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalDialog sx={{ width: 560, maxHeight: '90vh', overflowY: 'auto' }}>
          <ModalClose />
          <Typography level="title-md">
            {mode === 'create' ? '新增' : '编辑'}{tagTypeLabel[tagType]}
          </Typography>

          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <FormControl>
              <FormLabel>名称</FormLabel>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={mode === 'edit'}
                placeholder="标签名称"
              />
            </FormControl>

            <FormControl>
              <FormLabel>描述</FormLabel>
              <Textarea
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                minRows={2}
                placeholder="标签描述（可选）"
              />
            </FormControl>

            {tagType === 'sub_tag' && (
              <FormControl>
                <FormLabel>所属主标签</FormLabel>
                <Select value={mainTag} onChange={(_, v) => v && setMainTag(v)}>
                  {mainTagOptions.map((t) => (
                    <Option key={t.name} value={t.name}>{t.name}</Option>
                  ))}
                </Select>
              </FormControl>
            )}

            <FormControl>
              <FormLabel>优先级（值越小越优先，默认 0）</FormLabel>
              <Input
                type="number"
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
              />
            </FormControl>

            <Divider />

            {/* 行业 */}
            <FormControl>
              <FormLabel>关联行业</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                {selIndustries.map((n) => (
                  <Chip
                    key={n}
                    size="sm"
                    variant="soft"
                    color="primary"
                    endDecorator={
                      <ChipDelete onDelete={() => setSelIndustries((p) => p.filter((x) => x !== n))} />
                    }
                  >
                    {n}
                  </Chip>
                ))}
                <Chip
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<AddIcon fontSize="small" />}
                  onClick={() => setSelector('industries')}
                  sx={{ cursor: 'pointer' }}
                >
                  添加行业
                </Chip>
              </Box>
            </FormControl>

            {/* 概念 */}
            <FormControl>
              <FormLabel>关联概念</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                {selConcepts.map((n) => (
                  <Chip
                    key={n}
                    size="sm"
                    variant="soft"
                    color="success"
                    endDecorator={
                      <ChipDelete onDelete={() => setSelConcepts((p) => p.filter((x) => x !== n))} />
                    }
                  >
                    {n}
                  </Chip>
                ))}
                <Chip
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<AddIcon fontSize="small" />}
                  onClick={() => setSelector('concepts')}
                  sx={{ cursor: 'pointer' }}
                >
                  添加概念
                </Chip>
              </Box>
            </FormControl>

            {/* 地域 */}
            <FormControl>
              <FormLabel>关联地域</FormLabel>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 0.5 }}>
                {selAreas.map((n) => (
                  <Chip
                    key={n}
                    size="sm"
                    variant="soft"
                    color="warning"
                    endDecorator={
                      <ChipDelete onDelete={() => setSelAreas((p) => p.filter((x) => x !== n))} />
                    }
                  >
                    {n}
                  </Chip>
                ))}
                <Chip
                  size="sm"
                  variant="outlined"
                  color="neutral"
                  startDecorator={<AddIcon fontSize="small" />}
                  onClick={() => setSelector('areas')}
                  sx={{ cursor: 'pointer' }}
                >
                  添加地域
                </Chip>
              </Box>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, pt: 1 }}>
              <Button variant="plain" color="neutral" onClick={onClose}>
                取消
              </Button>
              <Button onClick={handleSubmit} disabled={!name.trim()}>
                保存
              </Button>
            </Box>
          </Stack>
        </ModalDialog>
      </Modal>

      {selector && (
        <BlockSelectorDialog
          open={!!selector}
          title={selectorConfig[selector].title}
          items={selectorConfig[selector].items}
          selected={selectorConfig[selector].selected}
          onConfirm={(v) => {
            selectorConfig[selector].onConfirm(v);
            setSelector(null);
          }}
          onClose={() => setSelector(null)}
        />
      )}
    </>
  );
}
