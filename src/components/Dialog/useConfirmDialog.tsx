import { useSetState } from 'ahooks';

export default function useDialog() {
  const [dialog, setDialog] = useSetState({
    title: '',
    content: '',
    open: false,
    onOk() {},
    onCancel() {},
  });

  const show = ({
    title,
    content,
    onOk = () => {},
    onCancel = () => {},
  }: {
    title: string;
    content?: string;
    onOk(): void;
    onCancel?: () => void;
  }) => {
    setDialog({
      title,
      content: content || '',
      open: true,
      onOk,
      onCancel,
    });
  };

  const close = (isOk: boolean) => {
    setDialog({
      open: false,
    });
    if (isOk) {
      dialog.onOk();
    } else {
      dialog.onCancel();
    }
  };

  return {
    props: {
      ...dialog,
      onClose: close,
    },
    open: dialog.open,
    show,
    close,
  };
}
