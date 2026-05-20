'use client';

import { Table, Tooltip } from '@mui/joy';
import { CircularProgress } from '@mui/joy';

import SortCell from './SortCell';
import { toMoney } from '@/utils';
import Blink from './Blink';
import { SENTIMENT_PREFIX, TREND_PREFIX } from '@/constants/capitalStructure';

/** 仅情绪类资金结构用于行背景高亮；趋势类与其它值不做区分。 */
function stockListRowBackgroundClass(
  capitalStructure: string | null | undefined,
  isSelected: boolean
): string {
  if (isSelected) return 'bg-[#E3FBE3]';
  const value = capitalStructure?.trim();
  if (!value || value.startsWith(TREND_PREFIX)) return '';
  if (value.startsWith(SENTIMENT_PREFIX)) return 'bg-amber-50';
  return '';
}
function CoreBusinessCell({ value }: { value?: string | null }) {
  const full = (value || '').trim();
  if (!full) return null;
  const inner = (
    <div className="max-w-[240px] text-left leading-snug line-clamp-2 break-words">
      {full}
    </div>
  );
  return (
    <Tooltip
      title={<div className="max-w-[320px] whitespace-pre-wrap">{full}</div>}
      variant="solid"
    >
      {inner}
    </Tooltip>
  );
}

type Props = any;

export default function StockList({
  stocks,
  selectStock,
  loading,
  sortState,
  changeSort,
}: Props) {
  const renderHeaderCell = (key: string, title: string) => {
    return (
      <SortCell sortState={sortState} name={key} changeSort={changeSort}>
        {title}
      </SortCell>
    );
  };

  return (
    <>
      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead className="font-bold ">
            <tr>
              <th className="w-[140px]">股票名称</th>
              <th className="!text-right">
                {renderHeaderCell('price', '最新价')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('change_pct', '涨跌幅')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('turnover', '成交金额')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('turnover_rate', '换手率')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('float_cap', '流通市值')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('total_cap', '总市值')}
              </th>
              <th>主标签</th>
              <th>次标签</th>
              <th>隐藏标签</th>
              <th>市场地位</th>
            </tr>
          </thead>
          <tbody>
            {stocks?.data?.map((stock: any) => {
              const isSelected = stock.id === (stocks.current as any)?.id;
              const rowBg = stockListRowBackgroundClass(
                stock.capital_structure,
                isSelected
              );
              return (
              <tr
                key={stock.id}
                onClick={() => selectStock(stock)}
                className={`cursor-pointer ${rowBg}`}
              >
                <td>
                  {stock.name}|<span className="opacity-90">{stock.code}</span>
                </td>
                <td className="text-right">{stock.price.toFixed(2)}</td>
                <td className="text-right">
                  <Blink mkey={stock.change_pct}>
                    <span
                      className={`inline-block p-1  rounded ${
                        stock.change_pct > 0 ? 'text-red-900' : 'text-green-900'
                      }`}
                    >
                      {stock.change_pct > 0 ? '+' : ''}
                      {(stock.change_pct * 100).toFixed(2) + '%'}
                    </span>
                  </Blink>
                </td>
                <td className="text-right">
                  <Blink mkey={toMoney(stock.turnover)} />
                </td>
                <td className="text-right">
                  <Blink mkey={(stock.turnover_rate * 100).toFixed(2) + '%'} />
                </td>
                <td className="text-right">
                  <Blink mkey={toMoney(stock.float_cap)} />
                </td>
                <td className="text-right">
                  <Blink mkey={toMoney(stock.total_cap)} />
                </td>
                <td>{stock.main_tag}</td>
                <td>{stock.sub_tag}</td>
                <td>
                  <Tooltip
                    title={
                      <div className="">
                        {(stock.hidden_tags || []).join('、')}
                      </div>
                    }
                    variant="solid"
                  >
                    <div className="relative overflow-hidden whitespace-nowrap text-ellipsis">
                      {(stock.hidden_tags || []).join('、')}
                    </div>
                  </Tooltip>
                </td>
                <td>
                  <CoreBusinessCell value={stock.core_business_and_market_position} />
                </td>
              </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
      {loading.stocks && (
        <div
          className={`w-full h-full pt-[200px] flex justify-center items-start absolute inset-0 z-10 bg-[rgba(255,255,255,0.1)]`}
        >
          <CircularProgress color="primary" size="md" variant="soft" />
        </div>
      )}
    </>
  );
}
