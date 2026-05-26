import services from '@/services';
import {
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
  Textarea,
  Typography,
} from '@mui/joy';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  industryChainName: string;
  onAdded: () => void | Promise<void>;
  onCancel: () => void;
};

export default function AddIndustryChainSegmentDialog({
  open,
  industryChainName,
  onAdded,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [segmentName, setSegmentName] = useState('');
  const [segmentDesc, setSegmentDesc] = useState('');

  useEffect(() => {
    if (!open) {
      setSegmentName('');
      setSegmentDesc('');
      setError('');
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const name = segmentName.trim();
    if (!name) {
      setError('请填写环节名称');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await services.addIndustryChainSegment({
        industry_chain_name: industryChainName,
        segment_name: name,
        segment_desc: segmentDesc.trim() || name,
      });
      await onAdded();
      onCancel();
    } catch (submitError: unknown) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : '添加产业链环节失败';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[440px] !text-[14px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>添加产业链环节</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Typography level="body-sm" sx={{ mb: 1.5, opacity: 0.75 }}>
              产业链：{industryChainName}
            </Typography>
            <FormControl required sx={{ mb: 1.5 }}>
              <FormLabel>环节名称</FormLabel>
              <Input
                size="sm"
                name="segment_name"
                value={segmentName}
                onChange={(event) => setSegmentName(event.target.value)}
                placeholder="如：上游材料"
              />
            </FormControl>
            <FormControl>
              <FormLabel>环节描述</FormLabel>
              <Textarea
                size="sm"
                name="segment_desc"
                minRows={3}
                value={segmentDesc}
                onChange={(event) => setSegmentDesc(event.target.value)}
                placeholder="可选；用于 Agent 归类与环节 Tab 提示"
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
