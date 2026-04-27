import {
  useAsyncEffect,
  useRequest,
  useSetState,
  useUnmountedRef,
} from 'ahooks';
import { useRef } from 'react';
import services from '@/services';
import { GlobalTag, Pool } from '@/interfaces';

type PoolState = {
  data: Pool[];
  current?: Pool;
};

type TagState = {
  data: GlobalTag[];
  statses: any[];
  current?: GlobalTag;
};

export default function useData() {
  const [loading, setLoading] = useSetState({
    stocks: false,
    setting: false,
    events: false,
  });
  const [pools, setPools] = useSetState<PoolState>({
    data: [],
    current: undefined,
  });
  const [tags, setTags] = useSetState<TagState>({
    data: [],
    statses: [],
    current: undefined,
  });
  const [stocks, setStocks] = useSetState<{
    data: any[];
    current: any;
    events: any;
  }>({
    data: [],
    current: undefined,
    events: undefined,
  });
  const globalTagsRef = useRef<GlobalTag[]>([]);
  const sortRef = useRef<any>({
    field: '',
    type: '',
  });

  const intervalId = useRef<any>({
    id: undefined,
  });
  const tagsStatusIntervalId = useRef<any>({
    id: undefined,
  });
  const unmountedRef = useUnmountedRef();

  const { data: dailyStats } = useRequest(services.getDailyQuoteStats, {
    pollingInterval: 1000 * 60,
  });

  const updatePool = async (pool: Pool) => {
    setPools({ current: pool });
    await changeTags(globalTagsRef.current, pool);
  };

  const changePool = async (value: string) => {
    setLoading({ stocks: true });
    try {
      const current = pools.data.find((pool) => pool.id === value);
      await updatePool(current as Pool);
      await services.savePoolSetting({
        stock_pool_name: current?.stock_pool_name,
      });
    } finally {
      setLoading({ stocks: false });
    }
  };

  const changeActiveTag = async (tag: GlobalTag | undefined, pool?: Pool) => {
    setLoading({ stocks: true });
    setTags({
      current: tag,
    });

    const params: any = {
      stock_pool_name: pool?.stock_pool_name,
      main_tag: tag?.name || undefined,
    };
    if (sortRef.current.field) {
      params.order_by_field = sortRef.current.field;
      params.order_by_type = sortRef.current.type;
    }

    clearInterval(intervalId.current.id);

    try {
      const stocks = await services.getPoolStocksByTag(params);
      const quoteRows = stocks?.quotes ?? [];

      clearInterval(intervalId.current.id);
      intervalId.current.id = setInterval(() => {
        if (unmountedRef.current) {
          clearInterval(intervalId.current.id);
        }
        services.getPoolStocksByTag(params).then((data) => {
          updateStocks(data?.quotes ?? [], true);
        });
      }, 3000);

      updateStocks(quoteRows);
    } finally {
      setLoading({ stocks: false });
    }
  };

  const selectStock = async (stock: any) => {
    setLoading({ events: true });
    setStocks({
      current: stock,
    });
    try {
      const events = await services.getStockEvents({
        entity_id: stock.entity_id,
      });
      setStocks({
        events,
        current: stock,
      });
    } finally {
      setLoading({ events: false });
    }
  };

  const updateStockEvents = async () => {
    setLoading({ events: true });
    try {
      const events = await services.getStockEvents({
        entity_id: stocks.current.entity_id,
      });
      setStocks({
        events,
      });
    } finally {
      setLoading({ events: false });
    }
  };

  const updateStocks = (rows: any, onlyUpdateData = false) => {
    const list = Array.isArray(rows) ? rows : [];
    const first = list[0];
    if (onlyUpdateData) {
      setStocks({ data: list });
      if (!first) {
        setStocks({
          current: undefined,
          events: undefined,
        });
      }
      return;
    }
    setStocks({
      data: list,
    });
    if (first) {
      selectStock(first);
    } else {
      setStocks({
        current: undefined,
        events: undefined,
      });
    }
  };

  const changeTags = async (newTags: GlobalTag[], pool?: Pool) => {
    pool = pool || pools.current;

    clearInterval(tagsStatusIntervalId.current.id);

    const statses = await services.getTagsStats({
      stock_pool_name: pool?.stock_pool_name,
    });

    const sortedTags = statses
      .map((stats: any) => newTags.find((tag) => tag.name === stats.main_tag))
      .filter((t: any) => !!t);

    setTags({
      data: sortedTags,
      statses,
    });

    clearInterval(tagsStatusIntervalId.current.id);
    tagsStatusIntervalId.current.id = setInterval(() => {
      if (unmountedRef.current) {
        clearInterval(tagsStatusIntervalId.current.id);
      }
      services
        .getTagsStats({
          stock_pool_name: pool?.stock_pool_name,
        })
        .then((statses) => {
          setTags({
            statses,
          });
        });
    }, 5000);

    changeActiveTag(sortedTags[0], pool);
  };

  const changeSort = async (field: string, type: string) => {
    sortRef.current.field = field;
    sortRef.current.type = type;
    await changeActiveTag(tags.current as any, pools.current);
  };

  const refreshPools = async (switchToPoolName?: string) => {
    const poolsData = await services.getPools();
    setPools((prev) => {
      const next = { ...prev, data: poolsData };
      if (switchToPoolName) {
        const newCurrent = poolsData.find(
          (p: any) => p.stock_pool_name === switchToPoolName
        );
        if (newCurrent) next.current = newCurrent;
      }
      return next;
    });
    if (switchToPoolName) {
      const newCurrent = poolsData.find(
        (p: any) => p.stock_pool_name === switchToPoolName
      );
      if (newCurrent) await updatePool(newCurrent as Pool);
    }
  };

  useAsyncEffect(async () => {
    setLoading({ stocks: true });
    const [poolsData, setting, globalTags] = await Promise.all([
      services.getPools(),
      services.getPoolSetting(),
      services.getMainTagInfo(),
    ]);

    globalTagsRef.current = globalTags;

    const defaultPool = poolsData.find(
      (p: any) => p.stock_pool_name === setting.stock_pool_name
    );

    setPools({
      data: poolsData,
      current: defaultPool,
    });

    await updatePool(defaultPool);
    setLoading({ stocks: false });
  }, []);

  return {
    pools,
    tags,
    stocks,
    loading,
    changePool,
    changeTags,
    changeActiveTag,
    sortState: sortRef.current,
    changeSort,
    selectStock,
    dailyStats,
    updateStockEvents,
    refreshPools,
  };
}
