'use client';

import {
  Card,
  Button,
  Chip,
  CardContent,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/joy';
import Add from '@mui/icons-material/Add';
import ChevronLeft from '@mui/icons-material/ChevronLeft';
import ChevronRight from '@mui/icons-material/ChevronRight';
import EditOutlined from '@mui/icons-material/EditOutlined';

import useData, { INDUSTRY_CHAIN_OTHER_SEGMENT } from './useData';
import CreateStockPoolDialog from './CreateStockPoolDialog';
import EditActiveSubTagsDialog from './EditActiveSubTagsDialog';
import UpdateStockPoolDialog from './UpdateStockPoolDialog';
import { useCallback, useEffect, useState } from 'react';
import { toMoney, toPercent, toTradePercent } from '@/utils';

import StockList from './stock-list/StockList';
import StockDetail from './stock-detail/StockDetail';
import TradeHotTopicsPanel from './TradeHotTopicsPanel';
import Dialog from '@/components/Dialog';
import useDialog from '@/components/Dialog/useDialog';

const HOT_TOPICS_SIDEBAR_STORAGE_KEY = 'zvt_trade_hot_topics_sidebar_open';
const STOCK_DETAIL_SIDEBAR_STORAGE_KEY = 'zvt_trade_stock_detail_sidebar_open';

export default function Workspace() {
  const {
    pools,
    tags,
    segments,
    showSubTagSegments,
    stocks,
    loading,
    changePool,
    changeActiveTag,
    changeActiveSegment,
    sortState,
    changeSort,
    selectStock,
    dailyStats,
    updateStockEvents,
    patchStockRiseReason,
    refreshPools,
    refreshActiveSubTags,
    isAdmin,
  } = useData();
  const [createPoolOpen, setCreatePoolOpen] = useState(false);
  const [editActiveSubTagsOpen, setEditActiveSubTagsOpen] = useState(false);
  const [updatePoolOpen, setUpdatePoolOpen] = useState(false);
  const [hotTopicsSidebarOpen, setHotTopicsSidebarOpen] = useState(true);
  const [stockDetailSidebarOpen, setStockDetailSidebarOpen] = useState(true);
  const dialog = useDialog();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HOT_TOPICS_SIDEBAR_STORAGE_KEY);
      if (raw === '0') {
        setHotTopicsSidebarOpen(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STOCK_DETAIL_SIDEBAR_STORAGE_KEY);
      if (raw === '0') {
        setStockDetailSidebarOpen(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const setHotTopicsSidebarOpenPersisted = useCallback((open: boolean) => {
    setHotTopicsSidebarOpen(open);
    try {
      localStorage.setItem(HOT_TOPICS_SIDEBAR_STORAGE_KEY, open ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const setStockDetailSidebarOpenPersisted = useCallback((open: boolean) => {
    setStockDetailSidebarOpen(open);
    try {
      localStorage.setItem(STOCK_DETAIL_SIDEBAR_STORAGE_KEY, open ? '1' : '0');
    } catch {
      /* ignore */
    }
  }, []);

  const stocksProps = {
    stocks,
    selectStock,
    loading,
    sortState,
    changeSort,
  } as any;

  const hasListRows = (stocks.data?.length ?? 0) > 0;
  const showTradeMain = Boolean(pools.current);

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
        <div className="flex flex-row items-center">
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
          {isAdmin && pools.current?.stock_pool_type === 'custom' && (
            <Tooltip title="更新股票池标的" variant="solid">
              <span>
                <Button
                  type="button"
                  variant="plain"
                  size="sm"
                  color="neutral"
                  className="!min-w-0 !px-1.5 h-6 rounded-md hover:bg-[rgba(65,109,249,.1)] hover:text-[#416df9]"
                  onClick={() => setUpdatePoolOpen(true)}
                >
                  <EditOutlined sx={{ fontSize: 18 }} />
                </Button>
              </span>
            </Tooltip>
          )}
          {isAdmin ? (
            <Tooltip title="创建股票池" variant="solid">
              <span>
                <Button
                  type="button"
                  variant="plain"
                  size="sm"
                  color="neutral"
                  className="!min-w-0 !px-1.5 h-6 rounded-md hover:bg-[rgba(65,109,249,.1)] hover:text-[#416df9]"
                  onClick={() => setCreatePoolOpen(true)}
                >
                  <Add sx={{ fontSize: 18 }} />
                </Button>
              </span>
            </Tooltip>
          ) : null}
        </div>
      </div>
      <div className="flex flex-row justify-between my-2 mt-2 ">
        <div className="flex flex-row flex-nowrap flex-grow overflow-x-auto pt-2 py-3 h-[60px] ">
          {tags.data?.length ? (
            (tags.data || []).filter((t: any) => t != null).map((tag: any) => {
              const isSelected = tag.id === tags.current?.id;
              const stats = tags.statses.find(
                (st: any) => st.main_tag === tag.name
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
                        {tag.name}
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
            })
          ) : !loading.stocks &&
            pools.current &&
            pools.current.stock_pool_name !== 'A股' &&
            tags.statses.length === 0 ? (
            <div className="text-neutral-500 text-sm pl-1 self-center">
              当前股票池还未添加标的
            </div>
          ) : null}
        </div>
      </div>
      {showSubTagSegments ? (
        <div className="flex flex-row flex-nowrap overflow-x-auto pb-2 pl-1 min-h-[44px] items-center">
          <Tooltip title="不按次标签筛选" variant="solid">
            <Chip
              color="primary"
              onClick={() => changeActiveSegment(null)}
              variant={segments.current === null ? 'solid' : 'soft'}
              className="cursor-pointer mr-2 my-0 !px-4"
              size="sm"
              sx={{ borderRadius: 8 }}
            >
              <span className="text-[14px] py-1.5">全部</span>
            </Chip>
          </Tooltip>
          {segments.items.map((segment) => {
            const isSelected = segments.current === segment.name;
            const tooltipTitle = segment.desc?.trim() || segment.name;
            return (
              <Tooltip key={segment.name} title={tooltipTitle} variant="solid">
                <Chip
                  color="primary"
                  onClick={() =>
                    changeActiveSegment(isSelected ? null : segment.name)
                  }
                  variant={isSelected ? 'solid' : 'soft'}
                  className="cursor-pointer mr-2 my-0 !px-4"
                  size="sm"
                  sx={{ borderRadius: 8 }}
                >
                  <span className="text-[14px] py-1.5">{segment.name}</span>
                </Chip>
              </Tooltip>
            );
          })}
          <Tooltip
            title="主标签下次标签不属于当前次标签列表的个股"
            variant="solid"
          >
            <Chip
              color="primary"
              onClick={() =>
                changeActiveSegment(
                  segments.current === INDUSTRY_CHAIN_OTHER_SEGMENT
                    ? null
                    : INDUSTRY_CHAIN_OTHER_SEGMENT
                )
              }
              variant={
                segments.current === INDUSTRY_CHAIN_OTHER_SEGMENT ? 'solid' : 'soft'
              }
              className="cursor-pointer mr-2 my-0 !px-4"
              size="sm"
              sx={{ borderRadius: 8 }}
            >
              <span className="text-[14px] py-1.5">其他</span>
            </Chip>
          </Tooltip>
          {isAdmin && tags.current?.name ? (
            <Tooltip title="编辑活跃子标签" variant="solid">
              <span>
                <Button
                  type="button"
                  variant="plain"
                  size="sm"
                  color="neutral"
                  className="!min-w-0 !px-1.5 h-8 rounded-md hover:bg-[rgba(65,109,249,.1)] hover:text-[#416df9] flex-shrink-0"
                  onClick={() => setEditActiveSubTagsOpen(true)}
                >
                  <EditOutlined sx={{ fontSize: 18 }} />
                </Button>
              </span>
            </Tooltip>
          ) : null}
        </div>
      ) : null}
      {showTradeMain ? (
        <div className="flex flex-row items-stretch gap-2 mt-0 mb-2 min-w-0">
          {hotTopicsSidebarOpen ? (
            <Card
              className="w-[min(100%,300px)] flex-shrink-0 overflow-hidden flex flex-col min-h-0"
              size="sm"
              variant="plain"
            >
              <TradeHotTopicsPanel
                mainTagName={tags.current?.name}
                stockPoolName={pools.current?.stock_pool_name ?? null}
                titleEndAction={
                  <Tooltip title="收起侧栏" placement="bottom" variant="solid">
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="neutral"
                      aria-label="收起相关热点侧栏"
                      onClick={() => setHotTopicsSidebarOpenPersisted(false)}
                    >
                      <ChevronLeft sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                }
              />
            </Card>
          ) : (
            <Card
              className="w-10 flex-shrink-0 flex flex-col items-center py-2 min-h-0 self-stretch"
              size="sm"
              variant="plain"
            >
              <Tooltip title="展开相关热点" placement="right" variant="solid">
                <IconButton
                  size="sm"
                  variant="soft"
                  color="neutral"
                  aria-label="展开相关热点侧栏"
                  onClick={() => setHotTopicsSidebarOpenPersisted(true)}
                >
                  <ChevronRight sx={{ fontSize: 20 }} />
                </IconButton>
              </Tooltip>
            </Card>
          )}
          <Card
            className={`flex-1 min-w-0 overflow-hidden flex flex-col relative ${
              hasListRows ? 'min-h-[1000px]' : 'min-h-[400px]'
            }`}
            size="sm"
            variant="plain"
          >
            <div className="p-2 flex-1 min-h-0 overflow-auto relative">
              {hasListRows ? (
                <StockList {...stocksProps} />
              ) : loading.stocks ? (
                <div className="flex w-full min-h-[360px] items-center justify-center">
                  <CircularProgress color="primary" size="md" variant="soft" />
                </div>
              ) : (
                <div className="flex w-full min-h-[200px] items-center justify-center text-neutral-500 text-sm">
                  暂无个股数据
                </div>
              )}
            </div>
          </Card>
          {hasListRows &&
            (stockDetailSidebarOpen ? (
              <Card
                className="w-[550px] max-w-[550px] shrink-0 grow-0 basis-[550px] !sticky !top-[56px] min-h-0 flex flex-col overflow-hidden"
                size="sm"
                variant="plain"
              >
                <div className="flex flex-row justify-end items-center flex-shrink-0 px-2 pt-2">
                  <Tooltip title="收起个股详情侧栏" placement="bottom" variant="solid">
                    <IconButton
                      size="sm"
                      variant="plain"
                      color="neutral"
                      aria-label="收起个股详情侧栏"
                      onClick={() => setStockDetailSidebarOpenPersisted(false)}
                    >
                      <ChevronRight sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Tooltip>
                </div>
                <CardContent className="flex-1 min-h-0 overflow-auto !pt-0">
                  <StockDetail
                    loading={loading}
                    stocks={stocks}
                    dialog={dialog}
                    refreshNews={updateStockEvents}
                    isAdmin={isAdmin}
                    onRiseReasonSaved={patchStockRiseReason}
                  />
                </CardContent>
              </Card>
            ) : (
              <Card
                className="w-10 flex-shrink-0 flex flex-col items-center py-2 min-h-0 self-stretch !sticky !top-[56px]"
                size="sm"
                variant="plain"
              >
                <Tooltip title="展开个股详情" placement="left" variant="solid">
                  <IconButton
                    size="sm"
                    variant="soft"
                    color="neutral"
                    aria-label="展开个股详情侧栏"
                    onClick={() => setStockDetailSidebarOpenPersisted(true)}
                  >
                    <ChevronLeft sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>
              </Card>
            ))}
        </div>
      ) : null}
      {isAdmin && tags.current?.name ? (
        <EditActiveSubTagsDialog
          open={editActiveSubTagsOpen}
          mainTag={tags.current}
          onSaved={refreshActiveSubTags}
          onCancel={() => setEditActiveSubTagsOpen(false)}
        />
      ) : null}
      {isAdmin ? (
        <>
          <CreateStockPoolDialog
            open={createPoolOpen}
            onSubmit={(poolName) => {
              refreshPools(poolName);
              setCreatePoolOpen(false);
            }}
            onCancel={() => setCreatePoolOpen(false)}
          />
          <UpdateStockPoolDialog
            open={updatePoolOpen}
            pool={pools.current?.stock_pool_type === 'custom' ? pools.current : null}
            onSaved={async () => {
              setUpdatePoolOpen(false);
              if (pools.current?.stock_pool_name) {
                await refreshPools(pools.current.stock_pool_name);
              }
            }}
            onCancel={() => setUpdatePoolOpen(false)}
            onArchived={async () => {
              setUpdatePoolOpen(false);
              const nextPool = pools.data?.find((p) => p.id !== pools.current?.id);
              await refreshPools(nextPool?.stock_pool_name);
            }}
          />
        </>
      ) : null}
      {dialog.open && <Dialog.Info {...dialog.props} />}
    </>
  );
}
