import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  Button,
  Checkbox,
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
      <ModalDialog className="w-[600px]">
        <DialogTitle>修改标签</DialogTitle>
        <DialogContent></DialogContent>
        <form
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
          <div className="flex flex-row flex-wrap">
            {globalTags.map((tag: any) => (
              <FormControl key={tag.id} className="mr-4 mb-4 w-[160px]">
                <Checkbox
                  label={tag.tag}
                  name={tag.id}
                  defaultChecked={!!checkedTags.find((t) => t.id === tag.id)}
                />
              </FormControl>
            ))}
          </div>
          <div className="text-center mt-4">
            <Button onClick={onCancel}>取消</Button>
            <Button type="submit" className="!ml-4">
              确定
            </Button>
          </div>
        </form>
      </ModalDialog>
    </Modal>
  );
}
