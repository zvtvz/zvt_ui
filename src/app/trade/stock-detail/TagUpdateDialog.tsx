import Loading from '@/components/Loading';
import services from '@/services';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  Button,
  Checkbox,
  Input,
  Textarea,
  FormLabel,
  Autocomplete,
  ModalClose,
} from '@mui/joy';
import { useRequest, useSetState } from 'ahooks';
import { useEffect, useState } from 'react';

type Props = {
  open: boolean;
  onSubmit: () => void;
  stock: any;
  onCancel: () => void;
};

export default function TagUpdateDialog({
  open,
  stock,
  onSubmit,
  onCancel,
}: Props) {
  const [state, setState] = useSetState({
    main_tag: '',
    main_tag_reason: '',
    sub_tag: '',
    sub_tag_reason: '',
  });
  const [saveLoading, setSaveLoading] = useState(false);
  const { data: stockTagInfo, loading } = useRequest(
    services.getStockTagOptions,
    {
      defaultParams: [{ entity_id: stock.entity_id }],
    }
  );

  const saveStockTag = async () => {
    setSaveLoading(true);
    try {
      await services.updateStockTags({
        ...state,
        entity_id: stock.entity_id,
      });
    } finally {
      setSaveLoading(false);
    }
    onSubmit();
  };

  useEffect(() => {
    if (!stockTagInfo) return;

    setState({
      main_tag: stockTagInfo.main_tag,
      main_tag_reason: stockTagInfo.main_tag_options.find(
        (x: any) => x.tag === stockTagInfo.main_tag
      )?.tag_reason,
      sub_tag: stockTagInfo.sub_tag,
      sub_tag_reason: stockTagInfo.sub_tag_options.find(
        (x: any) => x.tag === stockTagInfo.sub_tag
      )?.tag_reason,
    });
  }, [stockTagInfo]);

  const { main_tag_options = [], sub_tag_options = [] } = stockTagInfo || {};

  const mainTagOptions = main_tag_options.map((x: any) => x.tag);
  const subTagOptions = sub_tag_options.map((x: any) => x.tag);

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[500px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>修改标签</DialogTitle>
        <DialogContent></DialogContent>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            saveStockTag();
          }}
        >
          <Loading loading={loading} fixedTop={440}>
            <Stack spacing={2}>
              <FormControl>
                <FormLabel>主标签</FormLabel>
                <Autocomplete
                  options={mainTagOptions}
                  required
                  size="sm"
                  onChange={(event, newValue) => {
                    setState({
                      main_tag_reason:
                        stockTagInfo.main_tag_options.find(
                          (x: any) => x.tag === newValue
                        )?.tag_reason || '',
                    });
                  }}
                  inputValue={state.main_tag}
                  onInputChange={(event, newInputValue) => {
                    setState({
                      main_tag: newInputValue,
                    });
                  }}
                  freeSolo
                />
              </FormControl>
              <FormControl>
                <FormLabel>主标签原因</FormLabel>
                <Textarea
                  required
                  name="main_tag_reason"
                  minRows={4}
                  size="sm"
                  value={state.main_tag_reason}
                  onChange={(event: any) => {
                    setState({
                      main_tag_reason: event.target.value,
                    });
                  }}
                />
              </FormControl>
              <FormControl>
                <FormLabel>次标签</FormLabel>
                <Autocomplete
                  options={subTagOptions}
                  name="sub_tag"
                  size="sm"
                  required
                  onChange={(event, newValue) => {
                    setState({
                      sub_tag_reason:
                        stockTagInfo.sub_tag_options.find(
                          (x: any) => x.tag === newValue
                        )?.tag_reason || '',
                    });
                  }}
                  inputValue={state.sub_tag}
                  onInputChange={(event, newInputValue) => {
                    setState({
                      sub_tag: newInputValue,
                    });
                  }}
                  freeSolo
                />
              </FormControl>
              <FormControl>
                <FormLabel>次标签原因</FormLabel>
                <Textarea
                  required
                  size="sm"
                  name="sub_tag_reason"
                  minRows={4}
                  value={state.sub_tag_reason}
                  onChange={(event: any) => {
                    setState({
                      sub_tag_reason: event.target.value,
                    });
                  }}
                />
              </FormControl>
            </Stack>
          </Loading>
          <div className="text-right mt-4">
            <Button onClick={onCancel} variant="plain" size="sm">
              取消
            </Button>
            <Button
              type="submit"
              size="sm"
              className="!ml-2"
              loading={saveLoading}
            >
              确定
            </Button>
          </div>
        </form>
      </ModalDialog>
    </Modal>
  );
}
