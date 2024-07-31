import { Card, Typography, Select, Option } from '@mui/joy';
import { useAsyncEffect } from 'ahooks';
import { useState, useRef, useEffect } from 'react';
import * as echarts from 'echarts';
import services from '@/services';
import dayjs from 'dayjs';

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

export default function CandlestickChartDom({ entityId }: Props) {
  const [factors, setFactors] = useState([]);
  const [kdata, setKdata] = useState<KData>();
  const [factorResults, setFactorResults] = useState<FactorResult[]>([]);
  const [selectedFactor, setSelectedFactor] = useState<string>();

  const chartContainer = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>();

  useEffect(() => {
    chartRef.current = echarts.init(chartContainer.current, {});
  }, []);

  useAsyncEffect(async () => {
    const [kdata] = await services.getKData({ entity_ids: [entityId] });

    const dates = kdata.datas.map((x: any) =>
      dayjs(x[0] * 1000).format('YYYY-MM-DD')
    );
    const values = kdata.datas.map((x: any) => x.slice(1));

    chartRef.current.setOption({
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross',
        },
      },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        axisLine: { onZero: false },
        splitLine: { show: false },
        min: 'dataMin',
        max: 'dataMax',
        data: dates,
      },
      yAxis: {
        scale: true,
        splitArea: {
          show: true,
        },
      },
      dataZoom: [
        // {
        //   type: 'inside',
        //   start: 90,
        //   end: 100,
        // },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 50,
          end: 100,
        },
      ],
      series: [
        {
          name: '日K',
          type: 'candlestick',
          data: values,
          top: 0,
          itemStyle: {
            // color: upColor,
            // color0: downColor,
            // borderColor: upBorderColor,
            // borderColor0: downBorderColor,
          },
          // markPoint: {
          //   label: {
          //     formatter: function (param: Record<string, any>) {
          //       return param.name;
          //     },
          //     color: '#fff',
          //   },
          //   data: marks,
          // },
        },
      ],
    });
    chartRef.current.render();
  }, [entityId]);

  return (
    <div className="mb-4">
      <div className="text-sm font-bold opacity-85 h-0">K线图</div>
      <div ref={chartContainer} className="h-[350px]"></div>
    </div>
  );
}
