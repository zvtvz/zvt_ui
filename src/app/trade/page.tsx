'use client';

import {
  Card,
  Select,
  Option,
  Button,
  Chip,
  CardContent,
  Tooltip,
} from '@mui/joy';

import { useRouter } from 'next/navigation';
import useData from './useData';
import TagsDialog from './TagsDialog';
import { useState } from 'react';
import cls from 'classnames';
import { toMoney, toPercent, toTradePercent } from '@/utils';

import NewsAnalysises from './NewsAnalysises';
import BuyDialog from './BuyDialog';
import SellDialog from './SellDialog';
import Stocks from './StockList';
import StockNews from './StockNews';
import Dialog from '@/components/Dialog';
import useDialog from '@/components/Dialog/useDialog';

export default function Workspace() {
  const {
    pools,
    tags,
    stocks,
    setting,
    loading,
    changePool,
    changeActiveTag,
    changeTags,
    saveSetting,
    sortState,
    changeSort,
    selectStock,
    checkStock,
    checkAllStock,
    dailyStats,
  } = useData();
  const router = useRouter();
  const [open, setOpen] = useState<any>({
    setting: false,
    buy: false,
  });
  const dialog = useDialog();

  const handleSaveSetting = async () => {
    await saveSetting();
    dialog.show({ title: '提示', content: '修改配置成功' });
  };

  const stocksProps = {
    stocks,
    setOpen,
    checkAllStock,
    selectStock,
    checkStock,
    loading,
    sortState,
    changeSort,
  } as any;

  return (
    <>
      <div className="mb-2 pl-2">
        {dailyStats && (
          <div className="text-sm border-b pb-2 ">
            <span>涨跌停:</span>
            <span className="text-red-600">{dailyStats.limit_up_count}</span>/
            <span className="text-green-600">
              {dailyStats.limit_down_count}
            </span>
            <span className="ml-6">涨跌比:</span>
            <span className="text-red-600">{dailyStats.up_count}</span>/
            <span className="text-green-600">{dailyStats.down_count}</span>
            <span className="ml-6">
              平均涨幅:{toTradePercent(dailyStats.change_pct)}
            </span>
            <span className="ml-6">
              交易量:{toMoney(dailyStats.turnover, 0)}
            </span>
            <span className="ml-6 mr-2">
              同比{dailyStats.turnover_change > 0 ? '放量' : '缩量'}:
              {toMoney(dailyStats.turnover_change, 0)}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row">
          {pools.data?.map((pool, index) => (
            <div
              key={index}
              className={`mr-4 px-2 text-[14px] h-6 cursor-pointer hover:text-[#416df9] rounded-md ${
                pools.current?.id === pool.id && 'bg-[rgba(65,109,249,.1)]'
              }`}
              onClick={() => changePool(pool.id)}
            >
              {pool.stock_pool_name}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-row justify-between my-2 mt-2 ">
        <div className="flex flex-row flex-nowrap flex-grow overflow-x-auto pt-2 py-3 h-[60px] ">
          {tags.data.map((tag: any) => {
            const isSelected = tag.id === tags.current?.id;
            const stats = tags.statses.find(
              (st: any) => st.main_tag === tag.tag
            );
            return (
              <Tooltip
                key={tag.id}
                title={
                  <div className="w-[160px]">
                    <p>涨停数：{stats?.limit_up_count}</p>
                    <p>跌停数：{stats?.limit_down_count}</p>
                    <p>上涨数：{stats?.up_count}</p>
                    <p>下跌数：{stats?.down_count}</p>
                    <p>涨幅：{toPercent(stats?.change_pct)}</p>
                    <p>成交额：{toMoney(stats?.turnover)}</p>
                  </div>
                }
                variant="solid"
              >
                <Chip
                  color="primary"
                  onClick={() => {
                    changeActiveTag(
                      tag.id === tags.current?.id ? undefined : tag,
                      pools.current
                    );
                  }}
                  variant={isSelected ? 'solid' : 'soft'}
                  className="cursor-pointer mr-2 my-0 !px-4"
                  size="sm"
                  sx={{
                    borderRadius: 8,
                  }}
                >
                  <div className="flex items-center py-2">
                    <div className="text-center mr-2 text-[14px]">
                      {tag.tag}
                    </div>
                    <div className="text-[12px] leading-none">
                      <div>{toMoney(stats?.turnover)}</div>
                      <div>
                        <span
                          className={
                            isSelected
                              ? 'text-white'
                              : stats?.change_pct > 0
                              ? 'text-red-800'
                              : 'text-green-800'
                          }
                        >
                          {toTradePercent(stats?.change_pct)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Chip>
              </Tooltip>
            );
          })}
        </div>
        {!pools.ignoreSetting && (
          <div className="h-[60px] w-[176px] flex flex-row flex-shrink-0 items-center">
            <Button
              className="flex-grow-0 !mx-1"
              onClick={() => {
                setOpen({ setting: true });
              }}
              variant="plain"
              size="sm"
            >
              修改配置
            </Button>
            <Button
              className="flex-grow-0"
              size="sm"
              onClick={handleSaveSetting}
              loading={loading.setting}
            >
              保存配置
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-row items-start justify-between mt-0 mb-2">
        <Card
          className=" flex-grow overflow-auto relative min-h-[1000px] mr-4"
          size="sm"
          variant="plain"
        >
          <Stocks {...stocksProps} />
        </Card>
        <Card
          className="w-[500px] !sticky !top-[56px] flex-shrink-0 "
          size="sm"
          variant="plain"
        >
          <CardContent>
            <StockNews loading={loading} stocks={stocks} dialog={dialog} />
          </CardContent>
        </Card>
      </div>
      {/* <NewsAnalysises dialog={dialog} /> */}
      {open.setting && (
        <TagsDialog
          globalTags={setting.global_tags}
          checkedTags={tags.data}
          open={open}
          onSubmit={(tags) => {
            changeTags(tags);
            setOpen({ setting: false });
          }}
          onCancel={() => setOpen({ setting: false })}
        />
      )}
      {open.buy && (
        <BuyDialog
          open={open.buy}
          stocks={stocks.checked.map((i) =>
            stocks.data.find((s) => s.entity_id === i)
          )}
          onSubmit={() => setOpen({ buy: false })}
          onCancel={() => setOpen({ buy: false })}
        />
      )}
      {open.sell && (
        <SellDialog
          open={open.sell}
          stocks={stocks.checked.map((i) =>
            stocks.data.find((s) => s.entity_id === i)
          )}
          onSubmit={() => setOpen({ sell: false })}
          onCancel={() => setOpen({ sell: false })}
        />
      )}
      {dialog.open && <Dialog.Info {...dialog.props} />}
    </>
  );
}
