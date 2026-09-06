'use client';

import { Table, Tooltip } from '@mui/joy';
import { CircularProgress } from '@mui/joy';

import SortCell from './SortCell';
import { toMoney } from '@/utils';
import Blink from './Blink';
import {
  ABNORMAL_STATUS_APPROACHING,
  ABNORMAL_STATUS_MONITORING,
} from '@/constants/abnormalStatus';

/** 按异动状态行背景高亮：监管中 红色，接近异动 黄色。 */
function stockListRowBackgroundClass(
  abnormalStatus: string | null | undefined,
  isSelected: boolean
): string {
  if (isSelected) return 'bg-[#E3FBE3]';
  const value = abnormalStatus?.trim();
  if (!value) return '';
  if (value.startsWith(ABNORMAL_STATUS_MONITORING)) return 'bg-red-100';
  if (value.startsWith(ABNORMAL_STATUS_APPROACHING)) return 'bg-amber-100';
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

function HighDaysCell({ value }: { value?: string | null }) {
  const full = (value || '').trim();
  if (!full) return null;
  return <div className="text-left text-xs">{full}</div>;
}

function RiseReasonCell({ value }: { value?: string | null }) {
  const full = (value || '').trim();
  if (!full) return null;
  const inner = (
    <div className="max-w-[200px] text-left leading-snug line-clamp-2 break-words text-xs">
      {full}
    </div>
  );
  return (
    <Tooltip title={<div className="max-w-[320px] whitespace-pre-wrap">{full}</div>} variant="solid">
      {inner}
    </Tooltip>
  );
}

function HiddenTagsCell({ value }: { value?: string[] | null }) {
  const labels = (value || []).filter(Boolean);
  if (!labels.length) return null;
  const text = labels.join('、');
  return (
    <Tooltip title={<div className="max-w-[320px] whitespace-pre-wrap">{text}</div>} variant="solid">
      <div className="max-w-[160px] text-left leading-snug line-clamp-2 break-words text-xs">
        {text}
      </div>
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
              <th>{renderHeaderCell('hidden_tag', '隐藏标签')}</th>
              <th>{renderHeaderCell('high_days', '高度')}</th>
              <th>上涨原因</th>
              <th>市场地位</th>
            </tr>
          </thead>
          <tbody>
            {stocks?.data?.map((stock: any) => {
              const isSelected = stock.id === (stocks.current as any)?.id;
              const rowBg = stockListRowBackgroundClass(stock.abnormal_status, isSelected);
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
                  <HiddenTagsCell value={stock.hidden_tags} />
                </td>
                <td>
                  <HighDaysCell value={stock.high_days} />
                </td>
                <td>
                  <RiseReasonCell value={stock.rise_reason} />
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
