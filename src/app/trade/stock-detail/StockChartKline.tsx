import { useRef, useEffect } from 'react';
import services from '@/services';
import { init, dispose, registerStyles, PolygonType, LineType, DomPosition } from 'klinecharts';
import { isAshareTradingSession } from '@/utils/trading-session';

const KLINE_RISE_COLOR = '#F92855';
const KLINE_FALL_COLOR = '#2DC08E';
const KLINE_RISE_COLOR_ALPHA = 'rgba(249, 40, 85, .7)';
const KLINE_FALL_COLOR_ALPHA = 'rgba(45, 192, 142, .7)';

/** A 股习惯：红涨绿跌（klinecharts 默认绿涨红跌） */
registerStyles('red_rise_green_fall', {
  candle: {
    bar: {
      upColor: KLINE_RISE_COLOR,
      downColor: KLINE_FALL_COLOR,
      upBorderColor: KLINE_RISE_COLOR,
      downBorderColor: KLINE_FALL_COLOR,
      upWickColor: KLINE_RISE_COLOR,
      downWickColor: KLINE_FALL_COLOR,
    },
    priceMark: {
      last: {
        upColor: KLINE_RISE_COLOR,
        downColor: KLINE_FALL_COLOR,
      },
    },
  },
  indicator: {
    ohlc: {
      upColor: KLINE_RISE_COLOR_ALPHA,
      downColor: KLINE_FALL_COLOR_ALPHA,
    },
    bars: [
      {
        style: PolygonType.Fill,
        borderStyle: LineType.Solid,
        borderSize: 1,
        borderDashedValue: [2, 2],
        upColor: KLINE_RISE_COLOR_ALPHA,
        downColor: KLINE_FALL_COLOR_ALPHA,
        noChangeColor: '#888888',
      },
    ],
    circles: [
      {
        style: PolygonType.Fill,
        borderStyle: LineType.Solid,
        borderSize: 1,
        borderDashedValue: [2, 2],
        upColor: KLINE_RISE_COLOR_ALPHA,
        downColor: KLINE_FALL_COLOR_ALPHA,
        noChangeColor: '#888888',
      },
    ],
  },
});

type Props = {
  entityId: string;
};

const CHART_CONTAINER_ID = 'k-line-chart';
const DEFAULT_VISIBLE_BAR_COUNT = 280;
const KLINE_CHART_HEIGHT_CLASS = 'h-[420px]';
const KLINE_MA_PERIODS = [5, 10, 20, 30, 60, 120, 250];

function fitChartBarSpace(
  chart: NonNullable<ReturnType<typeof init>>,
  dataBarCount: number
) {
  if (dataBarCount <= 0) return;
  const chartSize = chart.getSize(undefined, DomPosition.Main);
  const chartWidth =
    chartSize?.width ??
    document.getElementById(CHART_CONTAINER_ID)?.clientWidth ??
    0;
  if (chartWidth <= 0) return;
  const visibleBarCount = Math.min(dataBarCount, DEFAULT_VISIBLE_BAR_COUNT);
  const barSpace = Math.min(50, Math.max(1, chartWidth / visibleBarCount));
  chart.setBarSpace(barSpace);
  chart.scrollToRealTime();
}

export default function StockChartKline({ entityId }: Props) {
  const chartRef = useRef<any>();
  const dataBarCountRef = useRef(0);

  useEffect(() => {
    chartRef.current = init(CHART_CONTAINER_ID);
    chartRef.current.setStyles({
      candle: {
        type: 'candle_solid',
        tooltip: { showRule: 'none' },
      },
      indicator: {
        tooltip: { showRule: 'none' },
      },
    });
    chartRef.current.setStyles('red_rise_green_fall');
    chartRef.current.createIndicator(
      { name: 'MA', calcParams: KLINE_MA_PERIODS },
      true,
      { id: 'candle_pane' }
    );
    chartRef.current.createIndicator({ name: 'VOL', calcParams: [] });
    chartRef.current.setOffsetRightDistance(10);

    const chartContainer = document.getElementById(CHART_CONTAINER_ID);
    const resizeObserver = new ResizeObserver(() => {
      chartRef.current?.resize();
      if (chartRef.current && dataBarCountRef.current > 0) {
        fitChartBarSpace(chartRef.current, dataBarCountRef.current);
      }
    });
    if (chartContainer) {
      resizeObserver.observe(chartContainer);
    }

    return () => {
      resizeObserver.disconnect();
      dispose(CHART_CONTAINER_ID);
    };
  }, []);

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
      if (!chartRef.current) return;
      dataBarCountRef.current = datas.length;
      chartRef.current.applyNewData(datas);
      requestAnimationFrame(() => {
        if (chartRef.current) {
          fitChartBarSpace(chartRef.current, dataBarCountRef.current);
        }
      });
    };
    loadKData();
    const intervalId = setInterval(() => {
      if (!isAshareTradingSession()) {
        return;
      }
      loadKData();
    }, 60 * 1000);
    return () => {
      clearInterval(intervalId);
    };
  }, [entityId]);

  return <div id={CHART_CONTAINER_ID} className={KLINE_CHART_HEIGHT_CLASS}></div>;
}
