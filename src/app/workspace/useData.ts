import { useAsyncEffect, useSetState } from 'ahooks';
import { useEffect, useState } from 'react';
import services from '@/services';
import { getDate } from '@/utils';
import { Pool, Stock, StockItemStats } from '@/interfaces';

export type PoolState = {
  data: Pool[];
  current?: Pool;
  entityIds: string[];
};

export default function useData() {
  const [pools, setPools] = useSetState<PoolState>({
    data: [],
    current: undefined,
    entityIds: [],
  });
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockStats, setStockStats] = useState<StockItemStats[]>([]);

  const updatePool = async (pool: Pool) => {
    setPools({
      current: pool,
    });
    const { entity_ids } = await services.getPoolEntities({
      stock_pool_name: pool.stock_pool_name,
    });
    setPools({
      entityIds: entity_ids,
    });

    const stocks = await services.getSimpleStockTags({
      entity_ids: entity_ids,
    });
    setStocks(stocks);

    const stockStats = await services.getStockStats({
      stock_pool_name: pool.stock_pool_name,
      target_date: '2024-04-08', //getDate()
    });
    setStockStats(stockStats);
  };

  const changePool = async (value: string) => {
    const current = pools.data.find((pool: Pool) => pool.id === value);
    updatePool(current as Pool);
  };

  useAsyncEffect(async () => {
    const data = await services.getPools();
    setPools({
      data,
    });
    updatePool(data[0]);
  }, []);

  return {
    pools,
    stocks,
    stockStats,
    changePool,
  };
}
