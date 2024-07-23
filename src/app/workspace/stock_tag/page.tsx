'use client';

import {
  Card,
  Typography,
  Chip,
  Button,
  Input,
  Textarea,
  Select,
  Option,
  Stack,
} from '@mui/joy';
import { MdOutlineArrowBackIos } from 'react-icons/md';
import useData from './useData';
import { useRef, useState, Suspense } from 'react';
import { useRequest, useSetState } from 'ahooks';
import { useRouter } from 'next/navigation';
import { fromJSON } from 'postcss';
import services from '@/services';
import TagModal from './TagInfoDialog';
import TagInfoDialog from './TagInfoDialog';

function StockTag() {
  const router = useRouter();

  const {
    entityId,
    stockTags,
    globalMainTags,
    globalHiddenTags,
    globalSubTags,
    stockMainTags,
    stockSubTags,
    stockHiddenTags,
    currentMainTag,
    currentSubTag,
    currentHiddenTags,
    setCurrentSubTag,
    setCurrentMainTag,
    setCurrentHiddenTags,
    refreshTags,
  } = useData();
  const [tagSourceMap, setTagSourceMap] = useSetState<Record<string, string>>({
    main: 'stock',
    sub: 'stock',
  });

  const [visible, setVisible] = useState(false);
  const tagTypeRef = useRef('');

  const { loading, run: updateStockTags } = useRequest(
    services.updateStockTags,
    {
      manual: true,
    }
  );

  const mainTagOptions =
    tagSourceMap.main === 'stock' ? stockMainTags : globalMainTags;
  const subTagOptions =
    tagSourceMap.sub === 'stock' ? stockSubTags : globalSubTags;

  const getHiddenTagOptions = (key: string) => {
    const source = tagSourceMap[key] ?? 'stock';
    return source === 'stock' ? stockHiddenTags : globalHiddenTags;
  };

  const changeTagSource = (key: string, value: string | null) => {
    setTagSourceMap({ [key]: value as string });
    if (key === 'main') {
      setCurrentMainTag({
        reason: '',
        tag: '',
      });
    } else if (key === 'sub') {
      setCurrentSubTag({
        reason: '',
        tag: '',
      });
    }
  };

  const changeHiddenTagSource = (key: string, value: string | null) => {
    setTagSourceMap({ [key]: value as string });
    setCurrentHiddenTags((prev) => {
      const selectedIndex = prev.findIndex((x) => x.id === key);
      if (selectedIndex !== -1) {
        prev[selectedIndex] = {
          id: key,
          reason: '',
          tag: '',
        };
      }
      return [...prev];
    });
  };

  const changeMainTagName = (tagName: string | null) => {
    const selectedOption = mainTagOptions.find((x) => x.tag === tagName);
    if (selectedOption) {
      setCurrentMainTag({
        tag: selectedOption.tag,
        reason: selectedOption.tag_reason,
      });
    }
  };

  const changeSubTagName = (tagName: string | null) => {
    const selectedOption = subTagOptions.find((x) => x.tag === tagName);
    if (selectedOption) {
      setCurrentSubTag({
        tag: selectedOption.tag,
        reason: selectedOption.tag_reason,
      });
    }
  };

  const changeHiddenTagName = (key: string, tagName: string | null) => {
    const selectedOption = getHiddenTagOptions(key).find(
      (x) => x.tag === tagName
    );
    if (selectedOption) {
      setCurrentHiddenTags((prev) => {
        const selectedTag = prev.find((x) => x.id === key);
        const selectedIndex = prev.findIndex((x) => x.id === key);
        if (selectedTag) {
          prev[selectedIndex] = {
            ...selectedTag,
            tag: tagName as string,
            reason: selectedOption.tag_reason,
          };
        }
        return [...prev];
      });
    }
  };

  const changeHiddenTagReason = (key: string, value: string) => {
    setCurrentHiddenTags((prev) => {
      const selectedTag = prev.find((x) => x.id === key);
      const selectedIndex = prev.findIndex((x) => x.id === key);
      if (selectedTag) {
        prev[selectedIndex] = {
          ...selectedTag,
          reason: value,
        };
      }
      return [...prev];
    });
  };

  const addHiddenTag = () => {
    const key = Date.now() + '';
    setCurrentHiddenTags((x) => [
      ...(x || []),
      { id: key, tag: '', reason: '' },
    ]);
    setTagSourceMap({ [key]: 'stock' });
  };

  const removeHiddenTag = (key: string) => {
    setCurrentHiddenTags((x) => x?.filter((item) => item.id !== key));
  };

  const saveStockTag = async (data: any) => {
    const {
      main_tag,
      main_tag_reason,
      sub_tag,
      sub_tag_reason,
      ...hiddenTagData
    } = data;

    const active_hidden_tags: Record<string, string> = {};
    Object.keys(hiddenTagData).forEach((key) => {
      if (
        key.startsWith('hidden_tag_') &&
        !key.startsWith('hidden_tag_reason')
      ) {
        const id = key.replace('hidden_tag_', '');
        const tagName = hiddenTagData[key];
        const tagReason = hiddenTagData[`hidden_tag_reason_${id}`];
        active_hidden_tags[tagName] = tagReason;
      }
    });

    await updateStockTags({
      entity_id: entityId,
      main_tag,
      main_tag_reason,
      sub_tag,
      sub_tag_reason,
      active_hidden_tags,
    });

    router.back();
  };

  const showTagInfo = (type: string) => () => {
    tagTypeRef.current = type;
    setVisible(true);
  };

  const saveTagInfo = async (data: any) => {
    const tagType = tagTypeRef.current;
    if (tagType === 'main') {
      await services.createMainTagInfo(data);
    } else if (tagType === 'sub') {
      await services.createSubTagInfo(data);
    } else {
      await services.createHiddenTagInfo(data);
    }
    await refreshTags();
    setVisible(false);
  };

  const cancelTagInfo = () => {
    setVisible(false);
  };

  return (
    <div>
      <div className="flex flex-row pt-4 justify-between">
        <div className="flex flex-row items-center">
          <div
            className="px-4 hover:cursor-pointer"
            onClick={() => router.back()}
          >
            <MdOutlineArrowBackIos />
          </div>
          <Typography level="h2" fontSize="xl" sx={{ mb: 0.5 }}>
            修改标签
          </Typography>
        </div>
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.currentTarget);
          const formJson = Object.fromEntries((formData as any).entries());
          saveStockTag(formJson);
        }}
      >
        {/* 主标签 */}
        {stockTags.main_tag && (
          <Card className="mt-4" size="lg" variant="plain">
            <Typography level="h4" fontSize="md" sx={{ mb: 0.5 }}>
              主标签
            </Typography>
            <div className="mx-2 flex flex-row items-center">
              <div className="w-20 mr-4 text-right">标签名:</div>
              <Select
                placeholder="请选择来源"
                defaultValue="stock"
                sx={{ width: 120 }}
                onChange={(_, value) => changeTagSource('main', value)}
              >
                <Option value="stock">历史标签</Option>
                <Option value="global">系统标签</Option>
              </Select>
              <Select
                className="w-[200px] mx-2"
                placeholder="请选择标签"
                name="main_tag"
                value={currentMainTag.tag}
                onChange={(_, value) => changeMainTagName(value)}
                required
              >
                {mainTagOptions.map((option) => (
                  <Option
                    value={option.tag}
                    key={option.tag + '_' + tagSourceMap.main}
                  >
                    {option.tag}
                  </Option>
                ))}
              </Select>
              <Button onClick={showTagInfo('main')} size="sm" variant="plain">
                新增
              </Button>
            </div>
            <div className="mx-2  mb-4 flex flex-row ">
              <div className="w-20 mr-4 text-right">原因:</div>
              <Textarea
                name="main_tag_reason"
                className="w-[550px]"
                required
                minRows={3}
                defaultValue={stockTags.main_tag_reason}
                value={currentMainTag.reason}
                onChange={(e) => setCurrentMainTag({ reason: e.target.value })}
              />
            </div>
          </Card>
        )}

        {/* 次标签 */}
        {stockTags.sub_tag && (
          <Card className="mt-4" size="lg" variant="plain">
            <Typography level="h4" fontSize="md" sx={{ mb: 0.5 }}>
              次标签
            </Typography>
            <div className="mx-2 flex flex-row items-center">
              <div className="w-20 mr-4 text-right">标签名:</div>
              <Select
                placeholder="Select Pool"
                defaultValue="stock"
                sx={{ width: 120 }}
                onChange={(_, value) => changeTagSource('sub', value)}
              >
                <Option value="stock">历史标签</Option>
                <Option value="global">系统标签</Option>
              </Select>
              <Select
                className="w-[200px] mx-2"
                placeholder="Select Pool"
                name="sub_tag"
                value={currentSubTag.tag}
                onChange={(e, value) => changeSubTagName(value)}
                required
              >
                {subTagOptions.map((option) => (
                  <Option
                    value={option.tag}
                    key={option.tag + '_' + tagSourceMap.main}
                  >
                    {option.tag}
                  </Option>
                ))}
              </Select>
              <Button onClick={showTagInfo('sub')} size="sm" variant="plain">
                新增
              </Button>
            </div>
            <div className="mx-2 mb-4 flex flex-row ">
              <div className="w-20 mr-4 text-right">原因:</div>
              <Textarea
                name="sub_tag_reason"
                className="w-[550px]"
                required
                minRows={3}
                value={currentSubTag.reason}
                defaultValue={stockTags.sub_tag_reason}
                onChange={(e) => setCurrentSubTag({ reason: e.target.value })}
              />
            </div>
          </Card>
        )}

        {/* 隐藏标签 */}
        <Card className="mt-4" size="lg" variant="plain">
          <div className="flex flex-row justify-between items-center">
            <Typography level="h4" fontSize="md" sx={{ mb: 0.5 }}>
              隐藏标签
            </Typography>
            <Button onClick={addHiddenTag} variant="outlined">
              新增隐藏标签
            </Button>
          </div>
          {currentHiddenTags?.length === 0 && (
            <div className="flex justify-center items-center opacity-35 min-h-40 text-base	">
              暂无系统标签
            </div>
          )}
          {currentHiddenTags?.map((tag) => (
            <div className=" relative group" key={tag.id + 'hidden'}>
              <div className="mx-2 mb-4 flex flex-row items-center">
                <div className="w-20 mr-4 text-right">标签名:</div>
                <Select
                  placeholder="Select Pool"
                  defaultValue="stock"
                  onChange={(_, value) =>
                    changeHiddenTagSource(tag.id + '', value)
                  }
                  sx={{ width: 120 }}
                >
                  <Option value="stock">历史标签</Option>
                  <Option value="global">系统标签</Option>
                </Select>
                <Select
                  className="w-[200px] mx-2"
                  placeholder="Select Pool"
                  value={tag.tag}
                  name={`hidden_tag_${tag.id}`}
                  onChange={(e, value) => changeHiddenTagName(tag.id, value)}
                  required
                >
                  {getHiddenTagOptions(tag.id).map((option) => (
                    <Option value={option.tag} key={option.id}>
                      {option.tag}
                    </Option>
                  ))}
                </Select>
                <Button
                  onClick={showTagInfo('hidden')}
                  size="sm"
                  variant="plain"
                >
                  新增
                </Button>
              </div>
              <div className="mx-2 mb-4 flex flex-row ">
                <div className="w-20 mr-4 text-right">原因:</div>
                <Textarea
                  className="w-[550px]"
                  name={`hidden_tag_reason_${tag.id}`}
                  required
                  minRows={3}
                  value={tag.reason}
                  onChange={(e) =>
                    changeHiddenTagReason(tag.id, e.target.value)
                  }
                />
              </div>
              <div className="absolute right-0 top-0 invisible group-hover:visible">
                <Button
                  color="danger"
                  onClick={() => removeHiddenTag(tag.id)}
                  variant="soft"
                >
                  删除标签
                </Button>
              </div>
            </div>
          ))}
        </Card>

        {/* 按钮 */}
        <div className="mt-4 pl-4 mb-16">
          <Stack
            direction="row"
            justifyContent="start"
            alignItems="center"
            spacing={2}
          >
            <Button type="submit" size="lg" variant="solid" loading={loading}>
              提交
            </Button>
            <Button
              className="ml-4"
              onClick={() => router.back()}
              size="lg"
              variant="soft"
            >
              取消
            </Button>
          </Stack>
        </div>
      </form>
      <TagInfoDialog
        open={visible}
        onSubmit={saveTagInfo}
        onCancel={cancelTagInfo}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <StockTag />
    </Suspense>
  );
}
