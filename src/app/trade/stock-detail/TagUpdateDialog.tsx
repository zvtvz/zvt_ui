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
  Textarea,
  FormLabel,
  Autocomplete,
  ModalClose,
  DialogActions,
  Typography,
} from '@mui/joy';
import { useRequest, useSetState } from 'ahooks';
import { useEffect, useState } from 'react';

type HiddenTag = {
  id: string;
  tag: string;
  reason: string;
};

type Props = {
  open: boolean;
  onSubmit: () => void;
  stock: any;
  onCancel: () => void;
};

// 生成唯一ID的函数
const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
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
    hidden_tags: [] as HiddenTag[],
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
      // 过滤掉空的隐藏标签
      const { hidden_tags, ...rest } = state;
      const filteredHiddenTags = state.hidden_tags.filter(
        (item) => item.tag.trim() !== ''
      );

      // 转换为后端需要的格式
      const hiddenTagsObj = filteredHiddenTags.reduce((acc, curr) => {
        acc[curr.tag] = curr.reason;
        return acc;
      }, {} as Record<string, string>);

      await services.updateStockTags({
        ...rest,
        active_hidden_tags: hiddenTagsObj,
        entity_id: stock.entity_id,
      });
    } finally {
      setSaveLoading(false);
    }
    onSubmit();
  };

  useEffect(() => {
    if (!stockTagInfo) return;

    // 将对象格式转换为数组格式
    const hiddenTagsArray = Object.entries(
      stockTagInfo.active_hidden_tags || {}
    ).map(([tag, reason]) => ({
      id: generateId(),
      tag,
      reason: reason as string,
    }));

    setState({
      main_tag: stockTagInfo.main_tag,
      main_tag_reason: stockTagInfo.main_tag_options.find(
        (x: any) => x.name === stockTagInfo.main_tag
      )?.desc,
      sub_tag: stockTagInfo.sub_tag,
      sub_tag_reason: stockTagInfo.sub_tag_options.find(
        (x: any) => x.name === stockTagInfo.sub_tag
      )?.desc,
      hidden_tags: hiddenTagsArray,
    });
  }, [stockTagInfo]);

  const {
    main_tag_options = [],
    sub_tag_options = [],
    hidden_tag_options = [],
  } = stockTagInfo || {};

  const mainTagOptions = main_tag_options.map((x: any) => x.name);
  const subTagOptions = sub_tag_options.map((x: any) => x.name);

  const handleAddHiddenTag = () => {
    // 检查是否已经存在空标签
    const hasEmptyTag = state.hidden_tags.some(
      (item) => item.tag.trim() === ''
    );
    if (hasEmptyTag) return;

    setState({
      hidden_tags: [
        ...state.hidden_tags,
        {
          id: generateId(),
          tag: '',
          reason: '',
        },
      ],
    });
  };

  const handleRemoveHiddenTag = (id: string) => {
    setState({
      hidden_tags: state.hidden_tags.filter((item) => item.id !== id),
    });
  };

  const handleHiddenTagChange = (
    id: string,
    newTag: string,
    reason: string
  ) => {
    // 检查新标签是否已存在
    const existingTag = state.hidden_tags.find(
      (item) => item.tag === newTag && item.id !== id
    );
    if (existingTag) return;

    setState({
      hidden_tags: state.hidden_tags.map((item) =>
        item.id === id ? { ...item, tag: newTag, reason } : item
      ),
    });
  };

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[800px]" size="sm">
        <ModalClose size="sm" />
        <DialogTitle>修改标签</DialogTitle>
        <DialogContent>
          <form
            id="tag-form"
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
                            (x: any) => x.name === newValue
                          )?.desc || '',
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
                    minRows={2}
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
                            (x: any) => x.name === newValue
                          )?.desc || '',
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
                    minRows={2}
                    value={state.sub_tag_reason}
                    onChange={(event: any) => {
                      setState({
                        sub_tag_reason: event.target.value,
                      });
                    }}
                  />
                </FormControl>
                <FormControl>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="start"
                    className="!mb-2 mt-4"
                  >
                    <FormLabel>隐藏标签</FormLabel>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={handleAddHiddenTag}
                      className="!text-xs !leading-4 !min-h-[24px] !px-2 relative top-[-2px] !ml-4"
                    >
                      新增
                    </Button>
                  </Stack>
                  <Stack spacing={2} className="pb-4">
                    {state.hidden_tags.length > 0 ? (
                      state.hidden_tags.map((item) => (
                        <Stack
                          key={item.id}
                          direction="row"
                          spacing={2}
                          alignItems="flex-start"
                        >
                          <Autocomplete
                            options={hidden_tag_options}
                            size="sm"
                            sx={{ width: 200 }}
                            value={item.tag}
                            placeholder="隐藏标签名称"
                            onChange={(event, newValue) => {
                              console.log('on change', newValue);
                              if (newValue) {
                                const selectedTag =
                                  typeof newValue === 'string'
                                    ? newValue
                                    : (newValue as any).name;
                                const selectedReason =
                                  typeof newValue === 'string'
                                    ? ''
                                    : (newValue as any).desc || '';
                                handleHiddenTagChange(
                                  item.id,
                                  selectedTag,
                                  selectedReason
                                );
                              }
                            }}
                            getOptionLabel={(option) => {
                              return typeof option === 'string'
                                ? option
                                : (option as any).name;
                            }}
                            freeSolo
                            inputValue={item.tag}
                            onInputChange={(event, newInputValue) => {
                              console.log('input change', newInputValue);
                              handleHiddenTagChange(
                                item.id,
                                newInputValue,
                                item.reason
                              );
                            }}
                          />
                          <Textarea
                            size="sm"
                            minRows={1}
                            sx={{ flex: 1 }}
                            value={item.reason}
                            onChange={(event) => {
                              handleHiddenTagChange(
                                item.id,
                                item.tag,
                                event.target.value
                              );
                            }}
                            placeholder="隐藏标签原因"
                          />
                          <Button
                            size="sm"
                            variant="plain"
                            color="danger"
                            onClick={() => handleRemoveHiddenTag(item.id)}
                          >
                            删除
                          </Button>
                        </Stack>
                      ))
                    ) : (
                      <Typography
                        level="body-sm"
                        className="text-left opacity-50"
                      >
                        暂无
                      </Typography>
                    )}
                  </Stack>
                </FormControl>
              </Stack>
            </Loading>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} size="sm" variant="plain">
            取消
          </Button>
          <Button
            form="tag-form"
            type="submit"
            size="sm"
            className="!ml-2"
            loading={saveLoading}
          >
            确定
          </Button>
        </DialogActions>
      </ModalDialog>
    </Modal>
  );
}
