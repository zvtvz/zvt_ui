import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  Input,
  Textarea,
  FormLabel,
  Button,
} from '@mui/joy';

type Props = {
  open: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
};

export default function TagInfoDialog({ open, onSubmit, onCancel }: Props) {
  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog>
        <DialogTitle>创建新的标签</DialogTitle>
        <DialogContent></DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            onSubmit({
              tag: formData.get('tag'),
              tag_reason: formData.get('tag_reason'),
            });
          }}
        >
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>标签</FormLabel>
              <Input autoFocus required name="tag" />
            </FormControl>
            <FormControl>
              <FormLabel>标签原因</FormLabel>
              <Textarea required name="tag_reason" minRows={4} />
            </FormControl>
            <Button type="submit">提交</Button>
          </Stack>
        </form>
      </ModalDialog>
    </Modal>
  );
}
