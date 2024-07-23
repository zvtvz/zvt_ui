import * as React from 'react';
import Button from '@mui/joy/Button';
import Divider from '@mui/joy/Divider';
import DialogTitle from '@mui/joy/DialogTitle';
import DialogContent from '@mui/joy/DialogContent';
import DialogActions from '@mui/joy/DialogActions';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import DeleteForever from '@mui/icons-material/DeleteForever';
import WarningRoundedIcon from '@mui/icons-material/WarningRounded';
import { AiFillCheckCircle } from 'react-icons/ai';

type Props = {
  open: boolean;
  onClose(): void;
  title: string;
  content: string;
};

export default function Info({ open, onClose, title, content }: Props) {
  return (
    <Modal open={open} onClose={() => onClose()}>
      <ModalDialog
        variant="outlined"
        role="alertdialog"
        className="!text-[14px]"
        size="sm"
      >
        <DialogTitle className="!text-[14px] items-center pt-1">
          <AiFillCheckCircle className="text-[20px] text-green-700" /> {title}
        </DialogTitle>
        {content && <DialogContent>{content}</DialogContent>}
        <div className="text-right">
          <Button
            variant="solid"
            color="primary"
            size="sm"
            onClick={() => onClose()}
          >
            确定
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
}
