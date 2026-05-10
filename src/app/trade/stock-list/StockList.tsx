'use client';

import { Chip, Table, Tooltip } from '@mui/joy';
import { CircularProgress } from '@mui/joy';

import SortCell from './SortCell';
import { toMoney } from '@/utils';
import Blink from './Blink';
import { TREND_PREFIX, SENTIMENT_PREFIX } from '@/constants/capitalStructure';

function isTrendKind(value?: string | null) {
  return Boolean(value?.startsWith(TREND_PREFIX));
}
function isSentimentKind(value?: string | null) {
  return Boolean(value?.startsWith(SENTIMENT_PREFIX));
}
function EssenceCell({ value }: { value?: string | null }) {
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

function CapitalStructureChip({ value }: { value?: string | null }) {
  if (!value) return null;
  const trend = isTrendKind(value);
  return (
    <Chip
      size="sm"
      variant="soft"
      color={trend ? 'primary' : 'warning'}
      sx={{ fontWeight: 'bold' }}
    >
      {value}
    </Chip>
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
              <th>资金结构</th>
              <th>本质</th>
            </tr>
          </thead>
          <tbody>
            {stocks?.data?.map((stock: any) => {
              const isSelected = stock.id === (stocks.current as any)?.id;
              const isSentiment = isSentimentKind(stock.capital_structure);
              const rowBg = isSelected
                ? 'bg-[#E3FBE3]'
                : isSentiment
                  ? 'bg-amber-50'
                  : '';
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
                  <CapitalStructureChip value={stock.capital_structure} />
                </td>
                <td>
                  <EssenceCell value={stock.essence} />
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
