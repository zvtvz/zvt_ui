import * as React from 'react';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { ModalClose } from '@mui/joy';

type Props = {
  open: boolean;
  onClose(isOk?: boolean): void;
  title: string;
  content: string;
};

export default function Confirm({ open, onClose, title, content }: Props) {
  return (
    <Modal open={open} onClose={() => close}>
      <ModalDialog variant="outlined" role="alertdialog" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>
          {/* <WarningRoundedIcon /> */}
          {title}
        </DialogTitle>
        {/* <Divider /> */}
        <DialogContent className="mt-2">{content}</DialogContent>
        <DialogActions>
          <Button
            size="sm"
            variant="solid"
            color="danger"
            onClick={() => onClose(true)}
          >
            确定
          </Button>
          <Button
            variant="plain"
            color="neutral"
            size="sm"
            onClick={() => onClose(false)}
          >
            取消
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
