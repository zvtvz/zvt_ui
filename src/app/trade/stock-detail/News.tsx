import services from '@/services';
import { Tooltip } from '@mui/joy';
import dayjs from 'dayjs';
import { AiOutlineClose } from 'react-icons/ai';
import useConfirmDialog from '@/components/Dialog/useConfirmDialog';
import Dialog from '@/components/Dialog';

type Props = {
  title: string;
  news: any[];
  dialog: any;
  entityId: string;
  refreshNews: () => any;
  isAdmin?: boolean;
};

export default function Events({
  title,
  news,
  refreshNews,
  dialog,
  entityId,
  isAdmin = false,
}: Props) {
  news = news || [];

  const confirmDialog = useConfirmDialog();

  const handleIgnoreNews = (newsItem: any) => {
    confirmDialog.show({
      title: '提示',
      content: '是否确定忽略此新闻？',
      async onOk() {
        if (!entityId) {
          dialog.show({ title: '无法忽略', content: '缺少当前股票 entity_id' });
          return;
        }
        await services.ignoreStockNews({
          news_id: newsItem.id,
          entity_id: entityId,
        });
        refreshNews();
      },
    });
  };

  return (
    <div className="mb-1 pb-1 ">
      <div className="flex flex-row justify-between text-sm font-bold opacity-85">
        {title}
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
            {isAdmin ? (
              <AiOutlineClose
                onClick={() => handleIgnoreNews(item)}
                className="invisible group-hover:visible absolute right-0 top-[2px] cursor-pointer"
              />
            ) : null}
          </li>
        ))}
      </ul>
      {confirmDialog.open && <Dialog.Confirm {...confirmDialog.props} />}
    </div>
  );
}
