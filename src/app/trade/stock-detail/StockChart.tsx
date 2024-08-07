import {
  Card,
  Typography,
  Select,
  Option,
  ToggleButtonGroup,
  Button,
} from '@mui/joy';
import { useState } from 'react';
import StockChartKline from './StockChartKline';
import StockChartTs from './StockChartTs';

type Props = {
  entityId: string;
};

export default function StockChart({ entityId }: Props) {
  const [chartType, setChartType] = useState('kline');

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
      {chartType === 'kline' && <StockChartKline entityId={entityId} />}
      {chartType === 'ts' && <StockChartTs entityId={entityId} />}
    </div>
  );
}
