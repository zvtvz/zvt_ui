import services from '@/services';
import { Button, Chip, Tooltip } from '@mui/joy';
import { useSetState } from 'ahooks';
import dayjs from 'dayjs';
import { AiOutlineClose } from 'react-icons/ai';
import { useState } from 'react';
import SelectTagTypeDialog from './SelectTagTypeDialog';
import useConfirmDialog from '@/components/Dialog/useConfirmDialog';
import Dialog from '@/components/Dialog';

type Props = {
  title: string;
  news: any[];
  dialog: any;
  entityId: string;
  refreshNews: () => any;
};

const tagTypeText = {
  main_tag: '更新主标签',
  sub_tag: '更新次标签',
  new_tag: '待处理标签',
} as any;

export default function Events({
  title,
  news,
  refreshNews,
  dialog,
  entityId,
}: Props) {
  news = news || [];

  const confirmDialog = useConfirmDialog();
  const [loading, setLoading] = useSetState<Record<string, boolean>>({});
  const [selectTagDialog, setSelectTagDialog] = useSetState<{
    open: boolean;
    data: any;
  }>({
    open: false,
    data: {},
  });

  const batchUpdateTags = async (
    analysis: any,
    suggestion: any,
    suggestionId: string
  ) => {
    setLoading({
      [suggestionId]: true,
    });

    try {
      await services.batchUpdateStockTags({
        entity_ids: suggestion.stocks.map((s: any) => s.entity_id),
        tag: suggestion.tag,
        tag_type: suggestion.tag_type,
        tag_reason: analysis.news_title,
      });
      dialog.show({
        title: '更新标签成功',
      });
    } finally {
      setLoading({
        [suggestionId]: false,
      });
    }
  };

  const showSelectTagType = (analysis: any, suggestion: any) => {
    setSelectTagDialog({
      open: true,
      data: {
        entity_ids: suggestion.stocks.map((s: any) => s.entity_id),
        tag: suggestion.tag,
        tag_type: suggestion.tag_type,
        tag_reason: analysis.news_title,
      },
    });
  };

  const handleIgnoreNews = (news: any) => {
    confirmDialog.show({
      title: '提示',
      content: '是否确定忽略此新闻？',
      async onOk() {
        await services.ignoreStockNews({ news_id: news.id });
        refreshNews();
      },
    });
  };

  const handleBuildSuggestions = async () => {
    setLoading({ build: true });
    try {
      if (entityId) {
        await services.buildTagSuggestions({ entity_id: entityId });
        dialog.show({
          title: 'AI分析完成',
        });
      }
    } finally {
      setLoading({ build: false });
    }
  };

  return (
    <div className="mb-1 pb-1 ">
      <div className="flex flex-row justify-between text-sm font-bold opacity-85">
        {title}
        <Button
          size="sm"
          className="!text-xs !leading-4 !min-h-[24px] !px-2"
          loading={loading.build}
          onClick={handleBuildSuggestions}
        >
          AI分析
        </Button>
      </div>
      {news.length == 0 && <span className="text-sm pr-4">暂无</span>}
      <ul className="list-inside list-disc  overflow-auto">
        {news.map((item: any, index: number) => (
          <li
            className="group relative pt-0 pl-2 mt-1 text-[12px] text-ellipsis overflow-hidden  whitespace-nowrap"
            key={index}
          >
            <Tooltip
              title={
                <div className="w-[300px]">
                  {item.news_content || item.news_title}
                </div>
              }
              variant="solid"
            >
              <span className="relative">
                <span className="mr-1">
                  {dayjs(item.timestamp).format('YYYY-MM-DD')}
                </span>
                {item.news_title || ''}
              </span>
            </Tooltip>
            <AiOutlineClose
              onClick={() => handleIgnoreNews(item)}
              className="invisible group-hover:visible absolute right-0 top-[2px] cursor-pointer"
            />
            <div>
              {item.news_analysis?.tag_suggestions?.up?.map(
                (suggestion: any, idx: number) => {
                  const suggestionId = `${index}_up_${idx}`;
                  const stocksText = suggestion.stocks
                    .map((s: any, idx: number) => s.name)
                    .join('、');
                  return (
                    <div
                      key={idx}
                      className="w-[340px] group flex flex-row justify-between items-start rounded px-2 "
                    >
                      <Chip
                        color="primary"
                        variant="soft"
                        className="mr-1 !text-[12px] relative top-[1px]"
                        key={idx}
                        size="sm"
                      >
                        {suggestion.tag}
                      </Chip>
                      <div className="flex-grow overflow-hidden opacity-75 text-xs text-left pt-1">
                        <Tooltip
                          title={<div className="w-[300px]">{stocksText}</div>}
                          variant="solid"
                        >
                          <span>{stocksText}</span>
                        </Tooltip>
                      </div>
                      <div>
                        <Button
                          variant="plain"
                          size="sm"
                          className=" !text-[12px] !min-h-[24px] !leading-none !py-0 !font-normal	"
                          onClick={() => {
                            if (suggestion.tag_type === 'new_tag') {
                              showSelectTagType(item, suggestion);
                            } else {
                              batchUpdateTags(item, suggestion, suggestionId);
                            }
                          }}
                          loading={loading[suggestionId]}
                        >
                          {tagTypeText[suggestion.tag_type]}
                        </Button>
                      </div>
                    </div>
                  );
                }
              )}
              {item.news_analysis?.tag_suggestions?.down?.map(
                (suggestion: any, idx: number) => {
                  const suggestionId = `${index}_down_${idx}`;
                  const stocksText = suggestion.stocks
                    .map((s: any, idx: number) => s.name)
                    .join('、');
                  return (
                    <div
                      key={idx}
                      className="w-[340px] group flex flex-row justify-between items-start rounded px-2 "
                    >
                      <Chip
                        color="success"
                        variant="soft"
                        className="mr-1 !text-[12px] relative top-[1px]"
                        key={idx}
                        size="sm"
                      >
                        {suggestion.tag}
                      </Chip>
                      <div className="flex-grow overflow-hidden whitespace-normal opacity-75 text-xs text-left pt-1">
                        <Tooltip
                          title={<div className="w-[300px]">{stocksText}</div>}
                          variant="solid"
                        >
                          <span>{stocksText}</span>
                        </Tooltip>
                      </div>
                      <div>
                        <Button
                          variant="plain"
                          size="sm"
                          className=" !text-[12px] !min-h-[24px] !leading-none !py-0 !font-normal	"
                          onClick={() => {
                            if (suggestion.tag_type === 'new_tag') {
                              showSelectTagType(item, suggestion);
                            } else {
                              batchUpdateTags(item, suggestion, suggestionId);
                            }
                          }}
                          loading={loading[suggestionId]}
                        >
                          {tagTypeText[suggestion.tag_type]}
                        </Button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </li>
        ))}
      </ul>
      {selectTagDialog.open && (
        <SelectTagTypeDialog
          open={selectTagDialog.open}
          onClose={() => setSelectTagDialog({ open: false })}
          data={selectTagDialog.data}
        />
      )}
      {confirmDialog.open && <Dialog.Confirm {...confirmDialog.props} />}
    </div>
  );
}
