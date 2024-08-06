import { useAsyncEffect } from 'ahooks';
import { useRef, useEffect } from 'react';
import services from '@/services';
import * as echarts from 'echarts';
import dayjs from 'dayjs';

type Props = {
  entityId: string;
};

const chartCustomTooltips = [
  { title: '', value: '{time}' },
  { title: '价', value: '{close}' },
  { title: '均', value: '{low}' },
  { title: '量', value: '{volume}' },
  { title: '幅', value: '{open}' },
] as any;

export default function StockChartTs({ entityId }: Props) {
  const chartRef = useRef<any>();
  const chartDomRef = useRef<HTMLDivElement>(null);
  const fixedTooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadTsData = async () => {
      const [result] = await services.getTData({
        entity_ids: [entityId],
        data_provider: 'qmt',
        days_count: 5,
      });
      const datas = result.datas.map((item: any) => {
        return {
          close: item[1],
          avg_price: item[2],
          timestamp: item[0],
          volume: item[4],
          turnover: item[5],
          change_pct: item[3],
          turnover_rate: item[6],
        };
      });
      const lastTradeTime = datas.at(-1).timestamp;
      const lastTradeDayStarTime = dayjs(lastTradeTime)
        .startOf('d')
        .add(9, 'h')
        .add(30, 'm')
        .valueOf();
      const lastTradeDayEndTime = dayjs(lastTradeTime)
        .startOf('d')
        .add(15, 'h')
        .valueOf();

      // 补全至交易结束时间
      let lastTradeFixedTime = lastTradeTime;
      while (lastTradeFixedTime < lastTradeDayEndTime) {
        lastTradeFixedTime += 60 * 1000;
        datas.push({
          close: null,
          avg_price: null,
          timestamp: lastTradeFixedTime,
          volume: null,
          turnover: null,
          change_pct: null,
          turnover_rate: null,
        });
      }

      chartRef.current.setOption({
        dataset: {
          dimensions: ['timestamp', 'avg_price', 'change_pct'],
          source: datas,
        },
        dataZoom: {
          startValue: lastTradeDayStarTime,
          endValue: lastTradeDayEndTime,
        },
      });
    };
    loadTsData();
    const intervalId = setInterval(loadTsData, 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [entityId]);

  useEffect(() => {
    const chart = echarts.init(chartDomRef.current);
    chartRef.current = chart;
    chart.setOption({
      title: {
        text: '',
      },
      tooltip: {
        show: true,
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
        formatter(params: any, ticket: any) {
          const value = params[0]?.value;
          const { close, avg_price, timestamp, volume, change_pct } = value;
          const html = `
          <div style="font-size: 12px">
            <div>${dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')}</div>
            <div>价格：${(close || 0).toFixed(2)}</div>
            <div>均价：${(avg_price || 0).toFixed(2)}</div>
            <div>涨跌：${((change_pct || 0) * 100).toFixed(2)}%</div>
            <div>成交：${volume || 0}</div>
          </div>
          `;
          if (fixedTooltipRef.current) {
            fixedTooltipRef.current.innerHTML = `
          <div style="font-size: 12px; display: flex; flex-direction: row;opacity: 0.6">
            <div style="margin-right: 12px;">${dayjs(timestamp).format(
              'YYYY-MM-DD HH:mm:ss'
            )}</div>
            <div style="margin-right: 12px;">价${(close || 0).toFixed(2)}</div>
            <div style="margin-right: 12px;">均${(avg_price || 0).toFixed(
              2
            )}</div>
            <div style="margin-right: 12px;">幅${(
              (change_pct || 0) * 100
            ).toFixed(2)}%</div>
            <div>量${volume || 0}</div>
          </div>
          `;
          }

          return html;
        },
      },
      dataset: {
        dimensions: ['timestamp', 'avg_price', 'change_pct'],
        source: [],
      },
      dataZoom: {
        type: 'slider',
        xAxisIndex: 0,
      },
      xAxis: {
        type: 'time',
        maxInterval: 3600 * 24 * 1000,
        minInterval: 60 * 1000,
      },
      yAxis: [
        {
          type: 'value',
          name: '均价',
          position: 'left',
        },
        {
          type: 'value',
          name: '涨跌',
          position: 'right',
          axisLabel: {
            formatter(value: number) {
              return (value * 100).toFixed(2) + '%';
            },
          },
          axisPointer: {
            label: {
              formatter: function (params: any) {
                return (params.value * 100).toFixed(2) + '%';
              },
            },
          },
        },
      ],

      series: [
        {
          name: '均价',
          type: 'line',
          yAxisIndex: 0,
          smooth: true,
          connectNulls: true,
          showSymbol: false,
          encode: {
            x: 'timestamp',
            y: 'avg_price',
          },
          lineStyle: {
            width: 1,
          },
        },
        {
          name: '涨跌',
          type: 'line',
          yAxisIndex: 1,
          smooth: true,
          connectNulls: true,
          showSymbol: false,
          encode: {
            x: 'timestamp',
            y: 'change_pct',
          },
          lineStyle: {
            width: 1,
          },
        },
      ],
    });

    const onResize = () => {
      chart.resize();
    };

    return () => {
      chart.dispose();
    };
  }, []);

  return (
    <div>
      <div className="h-0" ref={fixedTooltipRef}></div>
      <div id="k-line-chart" className="h-[350px]" ref={chartDomRef}></div>
    </div>
  );
}
