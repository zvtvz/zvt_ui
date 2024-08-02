import {
  Card,
  Typography,
  Select,
  Option,
  ToggleButtonGroup,
  Button,
} from '@mui/joy';
import { useAsyncEffect } from 'ahooks';
import { useState, useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import services from '@/services';
import dayjs from 'dayjs';
import { init, dispose, registerIndicator } from 'klinecharts';

type Props = {
  entityId: string;
};

type KData = {
  entity_id: string;
  code: string;
  name: string;
  level: string;
  datas: number[][];
};

type FactorResult = {
  entity_id: string;
  happen_timestamp: string;
  trading_level: string;
  trading_signal_type: string;
  position_pct: number;
  order_amount: number;
  order_money: number;
};

const upColor = '#ec0000';
const upBorderColor = '#8A0000';
const downColor = '#00da3c';
const downBorderColor = '#008F28';

const chartStyleType = {
  kline: 'candle_solid',
  ts: 'area',
} as any;

const chartCustomTooltips = {
  kline: [
    { title: '', value: '{time}' },
    { title: '开', value: '{open}' },
    { title: '高', value: '{high}' },
    { title: '低', value: '{low}' },
    { title: '收', value: '{close}' },
    { title: '量', value: '{volume}' },
  ],
  ts: [
    { title: '', value: '{time}' },
    { title: '价', value: '{close}' },
    { title: '均', value: '{low}' },
    { title: '量', value: '{volume}' },
    { title: '幅', value: '{open}' },
  ],
} as any;

export default function CandlestickChartDom({ entityId }: Props) {
  const [chartType, setChartType] = useState('kline');
  const chartRef = useRef<any>();

  useAsyncEffect(async () => {
    if (chartType === 'kline') {
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
      chartRef.current.overrideIndicator({
        name: 'MA',
        showName: 'MA',
        visible: true,
      });
      chartRef.current.overrideIndicator({
        name: 'VOL',
        showName: 'VOL',
        visible: true,
      });
      chartRef.current.overrideIndicator({
        name: 'TS_MA',
        showName: 'TS_MA',
        visible: false,
      });
    } else {
      const [result] = await services.getTData({
        entity_ids: [entityId],
        data_provider: 'qmt',
        days_count: 5,
      });
      const datas = result.datas.map((item: any) => {
        return {
          close: item[1],
          high: item[2],
          avg_price: item[2],
          low: item[2],
          open: item[3],
          timestamp: item[0],
          volume: item[4],
          turnover: item[5],
          change_pct: item[3],
          turnover_rate: item[6],
        };
      });
      chartRef.current.applyNewData(datas);
      chartRef.current.overrideIndicator({
        name: 'MA',
        showName: 'MA',
        visible: false,
      });
      chartRef.current.overrideIndicator({
        name: 'VOL',
        showName: 'VOL',
        visible: false,
      });
      chartRef.current.overrideIndicator({
        name: 'TS_MA',
        showName: 'TS_MA',
        visible: true,
      });
    }

    chartRef.current.setStyles({
      candle: {
        type: chartStyleType[chartType],
        tooltip: {
          custom: chartCustomTooltips[chartType],
        },
      },
    });
  }, [entityId, chartType]);

  useEffect(() => {
    registerIndicator({
      name: 'TS_MA',
      figures: [{ key: 'MA', title: 'MA: ', type: 'line' }],
      calc: (kLineDataList) => {
        return kLineDataList.map((kLineData, i) => {
          return {
            MA: kLineData.avg_price,
          };
        });
      },
    });

    chartRef.current = init('k-line-chart');
    // 均线图
    chartRef.current.createIndicator('MA', false, { id: 'candle_pane' });
    chartRef.current.createIndicator('TS_MA', false, { id: 'candle_pane' });
    chartRef.current.createIndicator('VOL');

    return () => {
      dispose('k-line-chart');
    };
  }, []);

  return (
    <div className="mb-4">
      <div className="text-sm font-bold opacity-85 py-1 ">
        <ToggleButtonGroup
          size="sm"
          value={chartType}
          onChange={(event, value) => setChartType(value as string)}
        >
          <Button
            value="kline"
            size="sm"
            className="!text-xs !leading-4 !min-h-[24px] !px-2 !font-normal"
          >
            K线图
          </Button>
          <Button
            value="ts"
            size="sm"
            className="!text-xs !leading-4 !min-h-[24px] !px-2 !font-normal"
          >
            分时图
          </Button>
        </ToggleButtonGroup>
      </div>
      <div id="k-line-chart" className="h-[350px]"></div>
    </div>
  );
}
