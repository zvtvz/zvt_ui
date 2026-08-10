import {
  useAsyncEffect,
  useRequest,
  useSetState,
  useUnmountedRef,
} from 'ahooks';
import { useRef } from 'react';
import services from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { useTradingSession } from '@/hooks/useTradingSession';
import type { MainTagInfo, Pool } from '@/interfaces';
import { isAshareTradingSession } from '@/utils/trading-session';

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

/** 主标签下当前市场认可的次标签子集（``active_sub_tags``），驱动交易页三级 tab */
function segmentsFromMainTag(tag: MainTagInfo | undefined) {
  const activeSubTags = tag?.active_sub_tags;
  if (!Array.isArray(activeSubTags)) {
    return [];
  }
  return activeSubTags
    .map((name) => ({ name: (name || '').trim(), desc: '' }))
    .filter((row) => row.name);
}

/** 三级 tab「其他」：不在 active_sub_tags 列表中的 sub_tag 个股 */
export const INDUSTRY_CHAIN_OTHER_SEGMENT = '__industry_chain_other__';

export default function useData() {
  const { isAdmin } = useAuth();
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
  const isTradingSession = useTradingSession();

  const { data: dailyStats } = useRequest(services.getDailyQuoteStats, {
    pollingInterval: isTradingSession ? 1000 * 60 : undefined,
  });

  function syncSegmentsForTag(tag: MainTagInfo | undefined) {
    setSegments({ items: segmentsFromMainTag(tag), current: null });
  }

  const buildStockQueryParams = (
    tag: MainTagInfo | undefined,
    pool: Pool | undefined,
    segmentName: string | null
  ) => {
    const params: Record<string, string | string[]> = {};
    if (pool?.stock_pool_name) {
      params.stock_pool_name = pool.stock_pool_name;
    }
    if (tag?.name) {
      params.main_tag = tag.name;
    }
    if (segmentName === INDUSTRY_CHAIN_OTHER_SEGMENT) {
      const segmentNames = segmentsFromMainTag(tag).map((row) => row.name);
      if (segmentNames.length) {
        params.sub_tag_not_in = segmentNames;
      }
    } else {
      const subTag = (segmentName || '').trim();
      if (subTag) {
        params.sub_tag = subTag;
      }
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
      if (isAdmin) {
        await services.savePoolSetting({
          stock_pool_name: current?.stock_pool_name,
        });
      }
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
      if (!isAshareTradingSession()) {
        return;
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
    if (!segments.items.length) {
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
    setStocks({
      current: stock,
    });

    setLoading({ events: true });
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
    if (!stocks.current?.entity_id) {
      return;
    }
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

  const patchStockRiseReason = (entityId: string, riseReason: string | null) => {
    setStocks({
      data: stocks.data.map((row: { entity_id?: string; rise_reason?: string | null }) =>
        row.entity_id === entityId ? { ...row, rise_reason: riseReason } : row
      ),
      current:
        stocks.current?.entity_id === entityId
          ? { ...stocks.current, rise_reason: riseReason }
          : stocks.current,
    });
  };

  /** 改个股标签后立刻重拉列表（不依赖交易时段轮询）。保留当前选中若仍在结果中。 */
  const refreshCurrentStocks = async () => {
    const tag = tags.current;
    const pool = pools.current;
    const segmentName = segments.current;
    const previousEntityId = stocks.current?.entity_id as string | undefined;
    const params = buildStockQueryParams(tag, pool, segmentName);

    const [stocksResponse, statses] = await Promise.all([
      services.getPoolStocksByTag(params),
      pool?.stock_pool_name
        ? services.getTagsStats({ stock_pool_name: pool.stock_pool_name })
        : Promise.resolve(null),
    ]);
    const list = Array.isArray(stocksResponse?.quotes) ? stocksResponse.quotes : [];
    if (statses) {
      setTags({ statses });
    }

    const stillSelected = previousEntityId
      ? list.find((row: { entity_id?: string }) => row.entity_id === previousEntityId)
      : undefined;
    if (stillSelected) {
      setStocks({
        data: list,
        current: stillSelected,
      });
      return;
    }
    if (list[0]) {
      setStocks({ data: list });
      await selectStock(list[0]);
      return;
    }
    setStocks({
      data: list,
      current: undefined,
      events: undefined,
    });
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
      .filter((tag_info: MainTagInfo | undefined): tag_info is MainTagInfo => Boolean(tag_info));

    setTags({
      data: sortedTags,
      statses,
    });

    clearInterval(tagsStatusIntervalId.current.id);
    tagsStatusIntervalId.current.id = setInterval(() => {
      if (unmountedRef.current) {
        clearInterval(tagsStatusIntervalId.current.id);
      }
      if (!isAshareTradingSession()) {
        return;
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

  /** 编辑活跃子标签后刷新：重新拉取主标签目录以更新 active_sub_tags */
  const refreshActiveSubTags = async () => {
    if (!isAdmin) {
      return;
    }
    const mainTags = (await services.getMainTagInfo()) as MainTagInfo[];
    const nextMainTags = Array.isArray(mainTags) ? mainTags : [];
    mainTagsRef.current = nextMainTags;
    const currentName = tags.current?.name;
    const updatedTag = nextMainTags.find((row) => row.name === currentName);
    if (!updatedTag) {
      return;
    }
    setTags((previous) => ({
      ...previous,
      current: updatedTag,
      data: previous.data.map((row) => (row.name === updatedTag.name ? updatedTag : row)),
    }));
    const nextItems = segmentsFromMainTag(updatedTag);
    let nextCurrent: string | null = segments.current;
    const segmentStillValid =
      nextCurrent === null ||
      nextCurrent === INDUSTRY_CHAIN_OTHER_SEGMENT ||
      nextItems.some((item) => item.name === nextCurrent);
    if (!segmentStillValid) {
      nextCurrent = null;
    }
    setSegments({
      items: nextItems,
      current: nextCurrent,
    });
    if (!segmentStillValid) {
      setLoading({ stocks: true });
      try {
        await fetchStocksForTag(updatedTag, pools.current, null);
      } finally {
        setLoading({ stocks: false });
      }
    }
  };

  const refreshPools = async (switchToPoolName?: string) => {
    if (!isAdmin) {
      return;
    }
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
    try {
      const [poolsData, setting, mainTags] = await Promise.all([
        services.getPools(),
        services.getPoolSetting(),
        services.getMainTagInfo() as Promise<MainTagInfo[]>,
      ]);
      const poolName = setting?.stock_pool_name || 'A股';

      mainTagsRef.current = Array.isArray(mainTags) ? mainTags : [];

      const defaultPool = poolsData.find(
        (pool: Pool) => pool.stock_pool_name === poolName
      ) ?? poolsData[0];

      setPools({
        data: poolsData,
        current: defaultPool,
      });

      await updatePool(defaultPool);
    } finally {
      setLoading({ stocks: false });
    }
  }, []);

  // 有次标签 tab 时展示；管理员选中主标签时也展示（便于添加首个活跃子标签）
  const showSubTagSegments = segments.items.length > 0 || (isAdmin && Boolean(tags.current));

  return {
    pools,
    tags,
    segments,
    showSubTagSegments,
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
    patchStockRiseReason,
    refreshCurrentStocks,
    refreshPools,
    refreshActiveSubTags,
    isAdmin,
  };
}
