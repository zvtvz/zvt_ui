import * as React from 'react';
import Button from '@mui/joy/Button';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogActions from '@mui/joy/DialogActions';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import {
  FormControl,
  FormLabel,
  Select,
  Stack,
  Option,
  ModalClose,
} from '@mui/joy';
import { useState } from 'react';
import services from '@/services';

type Props = {
  open: boolean;
  onClose(): void;
  data: any;
};

export default function SelectTagTypeDialog({ open, onClose, data }: Props) {
  const [loading, setLoading] = useState(false);

  return (
    <Modal open={open} onClose={() => close}>
      <ModalDialog variant="outlined" role="alertdialog" size="sm">
        <ModalClose size="sm" />
        <DialogTitle></DialogTitle>
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            const formData = new FormData(event.currentTarget);
            try {
              await services.batchUpdateStockTags({
                ...data,
                tag_type: formData.get('tag_type'),
              });
            } finally {
              setLoading(false);
            }

            onClose();
          }}
        >
          <Stack spacing={2}>
            <FormControl>
              <FormLabel>标签类型:</FormLabel>
              <Select size="sm" name="tag_type" defaultValue="main_tag">
                <Option value="main_tag">主标签</Option>
                <Option value="sub_tag">次标签</Option>
              </Select>
            </FormControl>
          </Stack>
          <DialogActions className="!pt-6">
            <Button variant="solid" type="submit" size="sm" loading={loading}>
              确定
            </Button>
            <Button variant="plain" onClick={onClose} size="sm">
              取消
            </Button>
          </DialogActions>
        </form>
      </ModalDialog>
    </Modal>
  );
}
