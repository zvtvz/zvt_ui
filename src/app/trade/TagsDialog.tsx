import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  Button,
  Checkbox,
  ModalClose,
  Typography,
} from '@mui/joy';

type Props = {
  open: boolean;
  onSubmit: (data: any) => void;
  globalTags: any[];
  checkedTags: any[];
  onCancel: () => void;
};

export default function TagsDialog({
  open,
  globalTags,
  checkedTags,
  onSubmit,
  onCancel,
}: Props) {
  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[600px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>修改标签</DialogTitle>
        <form
          className="flex flex-col flex-grow overflow-hidden"
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            let keys = Array.from(formData.keys());
            if (!keys.length) {
              keys = globalTags.slice(0).map((x) => x.id);
            }

            onSubmit(keys.map((key) => globalTags.find((t) => t.id === key)));
          }}
        >
          <div className="flex flex-row flex-wrap flex-grow overflow-auto py-2 px-2">
            {globalTags.map((tag: any) => (
              <FormControl key={tag.id} className="mr-4 mb-4 w-[160px]">
                <Checkbox
                  label={tag.tag}
                  name={tag.id}
                  defaultChecked={!!checkedTags.find((t) => t.id === tag.id)}
                  size="sm"
                />
              </FormControl>
            ))}
          </div>
          <div className="text-right mt-4">
            <Button size="sm" variant="plain" onClick={onCancel}>
              取消
            </Button>
            <Button size="sm" type="submit" className="!ml-2">
              确定
            </Button>
          </div>
        </form>
      </ModalDialog>
    </Modal>
  );
}
