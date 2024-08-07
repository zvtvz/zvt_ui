import Loading from '@/components/Loading';
import Events from './Events';
import News from './News';
import { Button, Typography } from '@mui/joy';
import TagUpdateDialog from './TagUpdateDialog';
import { useState } from 'react';
import CandlestickChart from './CandlestickChart';
import StockChart from './StockChart';

type Props = {
  loading: any;
  stocks: any;
  dialog: any;
  refreshNews: () => any;
};

export default function StockNews({
  loading,
  stocks,
  dialog,
  refreshNews,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="border-b !pb-2 !mb-2 font-bold">
        <div className="flex flex-row justify-between items-center">
          <div>
            <span className="mr-1">{stocks.current?.name}</span>
            <span className="ml-1 opacity-55">{stocks.current?.code}</span>
          </div>
          <Button
            size="sm"
            className="!text-xs !leading-4 !min-h-[24px] !px-2"
            onClick={() => setOpen(true)}
          >
            更新标签
          </Button>
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
            dialog={dialog}
            refreshNews={refreshNews}
          />
        </>
      </Loading>
      {open && (
        <TagUpdateDialog
          open={open}
          onSubmit={() => setOpen(false)}
          stock={stocks.current}
          onCancel={() => setOpen(false)}
        />
      )}
    </>
  );
}
