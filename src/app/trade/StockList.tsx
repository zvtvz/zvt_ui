'use client';

import { Table, Card, Button, Checkbox } from '@mui/joy';
import { CircularProgress } from '@mui/joy';

import SortCell from './SortCell';
import { toMoney } from '@/utils';
import Blink from './Blink';

type Props = any;

export default function StockList({
  stocks,
  setOpen,
  checkAllStock,
  selectStock,
  checkStock,
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
      <div className="flex flex-row justify-between items-center">
        <span className="opacity-85 text-">
          已选中 {stocks.checked.length} 只股票{' '}
        </span>
        <div>
          <Button
            size="sm"
            onClick={() => setOpen({ buy: true })}
            disabled={stocks.checked.length === 0}
            className="!text-[12px] !py-1"
          >
            买入
          </Button>{' '}
          <Button
            size="sm"
            onClick={() => setOpen({ sell: true })}
            disabled={stocks.checked.length === 0}
            className="!text-[12px]"
          >
            卖出
          </Button>
        </div>
      </div>
      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead className="font-bold ">
            <tr>
              <th className="w-[50px]">
                <Checkbox
                  size="sm"
                  indeterminate={
                    stocks.checked.length > 0 &&
                    stocks.checked.length < stocks.data.length
                  }
                  checked={
                    stocks.data.length === stocks.checked.length &&
                    stocks.checked.length > 0
                  }
                  onChange={(event) => {
                    checkAllStock(event.target.checked);
                  }}
                />
              </th>
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
                {renderHeaderCell('ask_amount', '5挡卖单金额')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('bid_amount', '5挡买单金额')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('float_cap', '流通市值')}
              </th>
              <th className="!text-right">
                {renderHeaderCell('total_cap', '总市值')}
              </th>
              <th>主标签</th>
              <th>次标签</th>
            </tr>
          </thead>
          <tbody>
            {stocks?.data?.map((stock: any) => (
              <tr
                key={stock.id}
                onClick={() => selectStock(stock)}
                className={`cursor-pointer ${
                  stock.id === (stocks.current as any)?.id && 'bg-[#E3FBE3]'
                }`}
              >
                <td>
                  <Checkbox
                    size="sm"
                    checked={stocks.checked.includes(stock.entity_id)}
                    onClick={(e: any) => e.stopPropagation()}
                    onChange={(event) => {
                      checkStock(stock, event.target.checked);
                    }}
                  />
                </td>
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
                  <Blink mkey={toMoney(stock.ask_amount)} />
                </td>
                <td className="text-right">
                  <Blink mkey={toMoney(stock.bid_amount)} />
                </td>
                <td className="text-right">
                  <Blink mkey={toMoney(stock.float_cap)} />
                </td>
                <td className="text-right">
                  <Blink mkey={toMoney(stock.total_cap)} />
                </td>
                <td>{stock.main_tag}</td>
                <td>{stock.sub_tag}</td>
              </tr>
            ))}
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
