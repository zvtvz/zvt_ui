import { useSetState } from 'ahooks';

export default function useDialog() {
  const [dialog, setDialog] = useSetState({
    title: '',
    content: '',
    open: false,
  });

  const show = ({ title, content }: { title: string; content?: string }) => {
    setDialog({
      title,
      content: content || '',
      open: true,
    });
  };

  const close = () => {
    setDialog({
      open: false,
    });
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
