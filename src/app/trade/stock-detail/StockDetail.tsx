import Loading from '@/components/Loading';
import Events from './Events';
import News from './News';
import { Button } from '@mui/joy';
import TagUpdateDialog from './TagUpdateDialog';
import { useState } from 'react';
import StockChart from './StockChart';
import CapitalStructureDialog from './CapitalStructureDialog';
import CommentaryDialog from './CommentaryDialog';
import StockIndustryChainDialog from './StockIndustryChainDialog';

type Props = {
  loading: any;
  stocks: any;
  dialog: any;
  refreshNews: () => any;
};

export default function StockDetail({
  loading,
  stocks,
  dialog,
  refreshNews,
}: Props) {
  const [open, setOpen] = useState(false);
  const [industryChainOpen, setIndustryChainOpen] = useState(false);
  const [capitalOpen, setCapitalOpen] = useState(false);
  const [commentaryOpen, setCommentaryOpen] = useState(false);

  return (
    <>
      <div className="border-b !pb-2 !mb-2 font-bold">
        <div className="flex flex-row justify-between items-center">
          <div>
            <span className="mr-1">{stocks.current?.name}</span>
            <span className="ml-1 opacity-55">{stocks.current?.code}</span>
          </div>

          <div className="flex flex-row gap-1 items-center">
            <Button
              size="sm"
              className="!text-xs !leading-4 !min-h-[24px] !px-2"
              onClick={() => setCapitalOpen(true)}
            >
              资金结构
            </Button>
            <Button
              size="sm"
              className="!text-xs !leading-4 !min-h-[24px] !px-2"
              onClick={() => setCommentaryOpen(true)}
            >
              市场地位
            </Button>
            <Button
              size="sm"
              className="!text-xs !leading-4 !min-h-[24px] !px-2"
              onClick={() => setOpen(true)}
            >
              更新标签
            </Button>
            <Button
              size="sm"
              className="!text-xs !leading-4 !min-h-[24px] !px-2"
              onClick={() => setIndustryChainOpen(true)}
            >
              更新产业链
            </Button>
          </div>
        </div>
      </div>
      {stocks.current && <StockChart entityId={stocks.current?.entity_id} />}
      <Loading loading={loading.events} fixedTop={100}>
        <>
          <Events title="利好事件" events={stocks.events?.good_events} />
          <Events title="利空事件" events={stocks.events?.bad_events} />
          <News
            title="新闻"
            news={stocks.events?.news}
            entityId={stocks.current?.entity_id}
            dialog={dialog}
            refreshNews={refreshNews}
          />
        </>
      </Loading>
      {open && (
        <TagUpdateDialog
          open={open}
          stock={stocks.current}
          onCancel={() => setOpen(false)}
        />
      )}
      {capitalOpen && stocks.current && (
        <CapitalStructureDialog
          open={capitalOpen}
          stock={stocks.current}
          onCancel={() => setCapitalOpen(false)}
        />
      )}
      {commentaryOpen && stocks.current && (
        <CommentaryDialog
          open={commentaryOpen}
          stock={stocks.current}
          onCancel={() => setCommentaryOpen(false)}
        />
      )}
      {industryChainOpen && stocks.current && (
        <StockIndustryChainDialog
          open={industryChainOpen}
          stock={stocks.current}
          onCancel={() => setIndustryChainOpen(false)}
        />
      )}
    </>
  );
}
