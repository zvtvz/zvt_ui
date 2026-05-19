import {
  useAsyncEffect,
  useRequest,
  useSetState,
  useUnmountedRef,
} from 'ahooks';
import { useRef } from 'react';
import services from '@/services';
import type { IndustryChainInfo, MainTagInfo, Pool } from '@/interfaces';

type PoolState = {
  data: Pool[];
  current?: Pool;
};

type TagState = {
  data: MainTagInfo[];
  statses: any[];
  current?: MainTagInfo;
};

type SegmentState = {
  items: { name: string; desc: string }[];
  current: string | null;
};

function segmentsFromIndustryChain(chain: IndustryChainInfo | undefined) {
  const segments = chain?.segments;
  if (!segments || typeof segments !== 'object') {
    return [];
  }
  return Object.entries(segments)
    .map(([name, desc]) => ({
      name: name.trim(),
      desc: (desc || '').trim(),
    }))
    .filter((row) => row.name);
}

function isIndustryChainMainTag(tag: MainTagInfo | undefined) {
  return Boolean(tag?.is_industry_chain);
}

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
  const [segments, setSegments] = useSetState<SegmentState>({
    items: [],
    current: null,
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
  const mainTagsRef = useRef<MainTagInfo[]>([]);
  const industryChainsRef = useRef<IndustryChainInfo[]>([]);
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

  function resolveSegmentsForMainTag(tag: MainTagInfo | undefined) {
    if (!isIndustryChainMainTag(tag)) {
      return [];
    }
    const chain = industryChainsRef.current.find((row) => row.name === tag?.name);
    return segmentsFromIndustryChain(chain);
  }

  function syncSegmentsForTag(tag: MainTagInfo | undefined) {
    if (!isIndustryChainMainTag(tag)) {
      setSegments({ items: [], current: null });
      return;
    }
    const items = resolveSegmentsForMainTag(tag);
    setSegments({ items, current: null });
  }

  const buildStockQueryParams = (
    tag: MainTagInfo | undefined,
    pool: Pool | undefined,
    segmentName: string | null
  ) => {
    const params: Record<string, string> = {};
    if (pool?.stock_pool_name) {
      params.stock_pool_name = pool.stock_pool_name;
    }
    if (tag?.name) {
      params.main_tag = tag.name;
    }
    const subTag = (segmentName || '').trim();
    if (subTag && isIndustryChainMainTag(tag)) {
      params.sub_tag = subTag;
    }
    if (sortRef.current.field) {
      params.order_by_field = sortRef.current.field;
      params.order_by_type = sortRef.current.type;
    }
    return params;
  };

  const updatePool = async (pool: Pool) => {
    setPools({ current: pool });
    await changeTags(mainTagsRef.current, pool);
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

  const fetchStocksForTag = async (
    tag: MainTagInfo | undefined,
    pool: Pool | undefined,
    segmentName: string | null
  ) => {
    const params = buildStockQueryParams(tag, pool, segmentName);
    clearInterval(intervalId.current.id);
    const stocksResponse = await services.getPoolStocksByTag(params);
    const quoteRows = stocksResponse?.quotes ?? [];

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
  };

  const changeActiveTag = async (tag: MainTagInfo | undefined, pool?: Pool) => {
    setLoading({ stocks: true });
    setTags({ current: tag });
    syncSegmentsForTag(tag);

    try {
      await fetchStocksForTag(tag, pool ?? pools.current, null);
    } finally {
      setLoading({ stocks: false });
    }
  };

  const changeActiveSegment = async (segmentName: string | null) => {
    const tag = tags.current;
    if (!isIndustryChainMainTag(tag)) {
      return;
    }
    setLoading({ stocks: true });
    setSegments({ current: segmentName });
    try {
      await fetchStocksForTag(tag, pools.current, segmentName);
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

  const changeTags = async (newTags: MainTagInfo[], pool?: Pool) => {
    pool = pool || pools.current;

    clearInterval(tagsStatusIntervalId.current.id);

    const statses = await services.getTagsStats({
      stock_pool_name: pool?.stock_pool_name,
    });

    const sortedTags = statses
      .map((stats: any) => newTags.find((tag) => tag.name === stats.main_tag))
      .filter((t): t is MainTagInfo => Boolean(t));

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

    await changeActiveTag(sortedTags[0], pool);
  };

  const changeSort = async (field: string, type: string) => {
    sortRef.current.field = field;
    sortRef.current.type = type;
    await fetchStocksForTag(tags.current, pools.current, segments.current);
  };

  const refreshPools = async (switchToPoolName?: string) => {
    const poolsData = await services.getPools();
    setPools((prev) => {
      const next = { ...prev, data: poolsData };
      if (switchToPoolName) {
        const newCurrent = poolsData.find(
          (p: Pool) => p.stock_pool_name === switchToPoolName
        );
        if (newCurrent) next.current = newCurrent;
      }
      return next;
    });
    if (switchToPoolName) {
      const newCurrent = poolsData.find(
        (p: Pool) => p.stock_pool_name === switchToPoolName
      );
      if (newCurrent) await updatePool(newCurrent as Pool);
    }
  };

  useAsyncEffect(async () => {
    setLoading({ stocks: true });
    const [poolsData, setting, mainTags, industryChains] = await Promise.all([
      services.getPools(),
      services.getPoolSetting(),
      services.getMainTagInfo() as Promise<MainTagInfo[]>,
      services.getIndustryChain({ active: true }) as Promise<IndustryChainInfo[]>,
    ]);

    mainTagsRef.current = Array.isArray(mainTags) ? mainTags : [];
    industryChainsRef.current = Array.isArray(industryChains) ? industryChains : [];

    const defaultPool = poolsData.find(
      (p: Pool) => p.stock_pool_name === setting.stock_pool_name
    );

    setPools({
      data: poolsData,
      current: defaultPool,
    });

    await updatePool(defaultPool);
    setLoading({ stocks: false });
  }, []);

  const showIndustryChainSegments = isIndustryChainMainTag(tags.current);

  return {
    pools,
    tags,
    segments,
    showIndustryChainSegments,
    stocks,
    loading,
    changePool,
    changeTags,
    changeActiveTag,
    changeActiveSegment,
    sortState: sortRef.current,
    changeSort,
    selectStock,
    dailyStats,
    updateStockEvents,
    refreshPools,
  };
}
