import { useAsyncEffect } from 'ahooks';
import { useRef, useEffect } from 'react';
import services from '@/services';
import { init, dispose } from 'klinecharts';

type Props = {
  entityId: string;
};

const chartCustomTooltips = [
  { title: '', value: '{time}' },
  { title: '开', value: '{open}' },
  { title: '高', value: '{high}' },
  { title: '低', value: '{low}' },
  { title: '收', value: '{close}' },
  { title: '量', value: '{volume}' },
] as any;

export default function StockChartKline({ entityId }: Props) {
  const chartRef = useRef<any>();

  useEffect(() => {
    const loadKData = async () => {
      const [kdata] = await services.getKData({ entity_ids: [entityId] });
      const datas = kdata.datas.map((item: any) => {
        return {
          close: item[4],
          high: item[2],
          low: item[3],
          open: item[1],
          timestamp: item[0] * 1000,
          volume: item[5],
        };
      });
      chartRef.current.applyNewData(datas);
    };
    loadKData();
    const intervalId = setInterval(() => {
      loadKData();
    }, 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [entityId]);

  useEffect(() => {
    chartRef.current = init('k-line-chart');
    chartRef.current.setStyles({
      candle: {
        type: 'candle_solid',
        tooltip: {
          custom: chartCustomTooltips,
        },
      },
    });
    // 均线图
    chartRef.current.createIndicator('MA', false, { id: 'candle_pane' });
    chartRef.current.createIndicator('VOL');
    chartRef.current.setOffsetRightDistance(10);

    return () => {
      dispose('k-line-chart');
    };
  }, []);

  return <div id="k-line-chart" className="h-[350px]"></div>;
}
