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

  const changeFactor = async (value: string) => {
    setSelectedFactor(value);
    const results = await services.getFactorResult({
      factor_name: 'GoldCrossFactor',
      entity_ids: [entityId],
    });
    setFactorResults(results);
  };

  useEffect(() => {
    chartRef.current = echarts.init(chartContainer.current);
  }, []);

  useAsyncEffect(async () => {
    const factors = await services.getFactors();
    const [kdata] = await services.getKData({ entity_ids: [entityId] });

    changeFactor('GoldCrossFactor');

    setFactors(factors);
    setKdata(kdata);
  }, []);

  useEffect(() => {
    if (!kdata) return;

    const dates = kdata.datas.map((x) =>
      dayjs(x[0] * 1000).format('YYYY-MM-DD')
    );
    const values = kdata.datas.map((x) => x.slice(1));
    const marks = factorResults.map((result) => {
      const date = dayjs(result.happen_timestamp).format('YYYY-MM-DD');
      const dateIndex = dates.indexOf(date);
      const dateValue = values[dateIndex];
      const maxValue = Math.max(dateValue[0], dateValue[1]);

      const isBuy = result.trading_signal_type === 'open_long';

      return {
        name: isBuy ? '买入' : '卖出',
        coord: [date, maxValue],
        value: maxValue,
        action: result.trading_signal_type,
        itemStyle: {
          color: isBuy ? '#0958d9' : '#fa541c',
        },
      };
    });

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
        {
          type: 'inside',
          start: 90,
          end: 100,
        },
        {
          show: true,
          type: 'slider',
          top: '90%',
          start: 90,
          end: 100,
        },
      ],
      series: [
        {
          name: '日K',
          type: 'candlestick',
          data: values,
          itemStyle: {
            // color: upColor,
            // color0: downColor,
            // borderColor: upBorderColor,
            // borderColor0: downBorderColor,
          },
          markPoint: {
            label: {
              formatter: function (param: Record<string, any>) {
                return param.name;
              },
              color: '#fff',
            },
            data: marks,
          },
        },
      ],
    });
  }, [kdata, factorResults]);

  return (
    <Card className="mt-4" size="lg" variant="plain">
      <Typography level="h4" fontSize="md" sx={{ mb: 0.5 }}>
        K线图
      </Typography>
      <div className="flex flex-row justify-end">
        <Select
          placeholder="请选择因子"
          sx={{ width: 180 }}
          value={selectedFactor}
          defaultValue="GoldCrossFactor"
          onChange={(_, value) => changeFactor(value as string)}
        >
          {factors.map((factor) => (
            <Option value={factor} key={factor}>
              {factor}
            </Option>
          ))}
        </Select>
      </div>
      <div ref={chartContainer} className="h-[400px]"></div>
    </Card>
  );
}
