import services from '@/services';
import type { MainTagInfo } from '@/interfaces';
import {
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
  onAdded: () => void | Promise<void>;
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

export default function AddActiveSubTagDialog({
  open,
  mainTag,
  onAdded,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedSubTags, setSelectedSubTags] = useState<string[]>([]);
  const [newSubTagName, setNewSubTagName] = useState('');

  const activeSubTagSet = useMemo(
    () => new Set(mainTag?.active_sub_tags ?? []),
    [mainTag?.active_sub_tags]
  );

  const selectableSubTags = useMemo(() => {
    const relationSubTags = mainTag?.sub_tags ?? [];
    return relationSubTags.filter((name) => {
      const trimmed = (name || '').trim();
      return trimmed && !activeSubTagSet.has(trimmed);
    });
  }, [mainTag?.sub_tags, activeSubTagSet]);

  useEffect(() => {
    if (!open) {
      setSelectedSubTags([]);
      setNewSubTagName('');
      setError('');
    }
  }, [open]);

  const toggleSubTag = (name: string) => {
    setSelectedSubTags((previous) =>
      previous.includes(name)
        ? previous.filter((item) => item !== name)
        : [...previous, name]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const mainTagName = (mainTag?.name || '').trim();
    if (!mainTagName) {
      setError('未选择主标签');
      return;
    }

    const customName = newSubTagName.trim();
    const subTagNames = uniqueSubTagNames([
      ...selectedSubTags,
      ...(customName ? [customName] : []),
    ]);
    if (!subTagNames.length) {
      setError('请从关系目录选择次标签，或输入新次标签名称');
      return;
    }

    setError('');
    setLoading(true);
    try {
      await services.addActiveSubTagsToMainTag({
        main_tag_name: mainTagName,
        sub_tag_names: subTagNames,
      });
      await onAdded();
      onCancel();
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : '添加活跃子标签失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[480px] !text-[14px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>添加活跃子标签</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography level="body-sm" sx={{ mb: 1.5, opacity: 0.75 }}>
              主标签：{mainTag?.name || '—'}
            </Typography>
            {selectableSubTags.length ? (
              <FormControl sx={{ mb: 1.5 }}>
                <FormLabel>从关系次标签选择</FormLabel>
                <div className="flex flex-wrap gap-1.5">
                  {selectableSubTags.map((name) => {
                    const selected = selectedSubTags.includes(name);
                    return (
                      <Chip
                        key={name}
                        size="sm"
                        variant={selected ? 'solid' : 'outlined'}
                        color={selected ? 'primary' : 'neutral'}
                        onClick={() => toggleSubTag(name)}
                        className="cursor-pointer"
                      >
                        {name}
                      </Chip>
                    );
                  })}
                </div>
              </FormControl>
            ) : (
              <Typography level="body-sm" sx={{ mb: 1.5, opacity: 0.65 }}>
                关系目录（sub_tags）暂无可选次标签，可直接输入新名称。
              </Typography>
            )}
            <FormControl>
              <FormLabel>或输入新次标签</FormLabel>
              <Input
                size="sm"
                name="new_sub_tag_name"
                value={newSubTagName}
                onChange={(event) => setNewSubTagName(event.target.value)}
                placeholder="输入新的次标签名称"
              />
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
            <Button size="sm" className="!ml-2" type="submit" loading={loading}>
              添加
            </Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
}
