import Loading from '@/components/Loading';
import Events from './Events';
import News from './News';
import { Typography } from '@mui/joy';

type Props = {
  loading: any;
  stocks: any;
  dialog: any;
};

export default function StockNews({ loading, stocks, dialog }: Props) {
  return (
    <>
      <Typography className="border-b !pb-2 !mb-2" level="title-sm">
        <span className="mr-1">{stocks.current?.name}</span>
        <span className="ml-1 opacity-55">{stocks.current?.code}</span>
      </Typography>
      <Loading loading={loading.events} fixedTop={100}>
        <>
          <Events title="利好事件" events={stocks.events?.good_events} />
          <Events title="利空事件" events={stocks.events?.bad_events} />
          <News title="新闻" news={stocks.events?.news} dialog={dialog} />
        </>
      </Loading>
    </>
  );
}
