import {
  useAsyncEffect,
  useRequest,
  useSetState,
  useUnmountedRef,
} from 'ahooks';
import { useEffect, useRef, useState } from 'react';
import services from '@/services';
import { getDate } from '@/utils';
import { GlobalTag, Pool, Stock } from '@/interfaces';
import { unescape } from 'querystring';

type PoolState = {
  data: Pool[];
  current?: Pool;
  ignoreSetting: boolean;
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
    ignoreSetting: true,
  });
  const [tags, setTags] = useSetState<TagState>({
    data: [],
    statses: [],
    current: undefined,
  });
  const [stocks, setStocks] = useSetState<{
    data: any[];
    checked: string[];
    current: any;
    events: any;
  }>({
    data: [],
    checked: [],
    current: undefined,
    events: undefined,
  });
  const settingRef = useRef<any>({
    stock_pool_name: '',
    main_tags: [],
    global_tags: [],
  });
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
    const { stock_pool_name, main_tags, global_tags } = settingRef.current;

    const poolTagStats = await services.getStockStats({
      stock_pool_name: pool.stock_pool_name,
      target_date: getDate(),
      query_type: 'simple',
    });
    const poolTags = poolTagStats
      .map((stats: any) =>
        global_tags.find((tag: any) => tag.tag === stats.main_tag)
      )
      .filter((x: any) => !!x);
    let displayTags = []; // global_tags.slice(0, 1);

    // 优先使用pool stats中的tags
    if (poolTags.length > 0) {
      displayTags = poolTags;
    } else if (main_tags.length) {
      displayTags = main_tags.map((name: string) =>
        global_tags.find((tag: any) => tag.tag === name)
      );
    } else {
      displayTags = global_tags.slice(0, 1);
    }

    setPools({
      current: pool,
      ignoreSetting: poolTags.length > 0, // 查询pool stats中有对应的tag，则不需要进行配置
    });

    changeTags(displayTags, pool);

    // setTags({
    //   data: displayTags,
    // });
    // changeActiveTag(displayTags[0], pool);
  };

  const changePool = async (value: string) => {
    setLoading({ stocks: true });
    try {
      const current = pools.data.find((pool) => pool.id === value);
      await updatePool(current as Pool);
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
      main_tag: tag?.tag || undefined,
    };
    if (sortRef.current.field) {
      params.order_by_field = sortRef.current.field;
      params.order_by_type = sortRef.current.type;
    }

    clearInterval(intervalId.current.id);

    try {
      const stocks = await services.getPoolStocksByTag(params);

      clearInterval(intervalId.current.id);
      intervalId.current.id = setInterval(() => {
        // TODO: 接口返回时间不可控，可能导致前序请求的结果覆盖后序请求的结果
        if (unmountedRef.current) {
          clearInterval(intervalId.current.id);
        }
        services.getPoolStocksByTag(params).then((data) => {
          updateStocks(data.quotes, true);
        });
      }, 3000);

      updateStocks(stocks.quotes);
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

  const checkStock = (stock: any, isChecked: boolean) => {
    if (isChecked) {
      setStocks({
        checked: [...stocks.checked, stock.entity_id],
      });
    } else {
      setStocks({
        checked: stocks.checked.filter((c) => c !== stock.entity_id),
      });
    }
  };

  const checkAllStock = (isChecked: boolean) => {
    setStocks({
      checked: isChecked ? stocks.data.map((x) => x.entity_id) : [],
    });
  };

  const updateStocks = (stocks: any, onlyUpdateData = false) => {
    const current = stocks[0];
    setStocks({
      data: stocks,
    });

    if (!onlyUpdateData) {
      setStocks({
        checked: [],
      });
    }

    if (!onlyUpdateData && current) {
      selectStock(current);
    }
  };

  const deleteTag = async (tag: GlobalTag) => {
    const newTags = tags.data.filter((t) => t.id !== tag.id);
    setTags({
      data: newTags,
    });
    if (tags.current?.id === tag.id) {
      changeActiveTag(newTags[0]);
    }
  };

  const changeTags = async (newTags: GlobalTag[], pool?: Pool) => {
    pool = pool || pools.current;

    clearInterval(tagsStatusIntervalId.current.id);

    const statses = await services.getTagsStats({
      stock_pool_name: pool?.stock_pool_name,
      main_tags: newTags.map((t) => t.tag),
    });

    const sortedTags = statses.map((stats: any) =>
      newTags.find((tag) => tag.tag === stats.main_tag)
    );

    // tags 根据 status进行排序
    setTags({
      data: sortedTags,
      statses,
    });

    clearInterval(tagsStatusIntervalId.current.id);
    // 5秒轮询 查询tag stats
    tagsStatusIntervalId.current.id = setInterval(() => {
      if (unmountedRef.current) {
        clearInterval(tagsStatusIntervalId.current.id);
      }
      services
        .getTagsStats({
          stock_pool_name: pool?.stock_pool_name,
          main_tags: newTags.map((t) => t.tag),
        })
        .then((statses) => {
          setTags({
            statses,
          });
        });
    }, 5000);

    // if (!sortedTags.find((t: any) => t.id === tags.current?.id)) {
    changeActiveTag(sortedTags[0], pool);
    // }
  };

  const saveSetting = async (tags: GlobalTag[]) => {
    setLoading({ setting: true });
    settingRef.current.stock_pool_name = pools.current?.stock_pool_name;
    settingRef.current.main_tags = tags.map((x) => x.tag);
    await services.savePoolSetting({
      stock_pool_name: settingRef.current.stock_pool_name,
      main_tags: settingRef.current.main_tags,
    });
    setLoading({ setting: false });
  };

  const changeSort = async (field: string, type: string) => {
    sortRef.current.field = field;
    sortRef.current.type = type;
    await changeActiveTag(tags.current as any, pools.current);
  };

  useAsyncEffect(async () => {
    setLoading({ stocks: true });
    const [pools, setting, globalTags] = await Promise.all([
      services.getPools(),
      services.getPoolSetting(),
      services.getMainTagInfo(),
    ]);

    const defaultPool = pools.find(
      (p: any) => p.stock_pool_name === setting.stock_pool_name
    );

    setPools({
      data: pools,
      current: defaultPool,
    });
    settingRef.current.stock_pool_name = setting.stock_pool_name;
    settingRef.current.main_tags = setting.main_tags;
    settingRef.current.global_tags = globalTags;

    await updatePool(defaultPool);
    setLoading({ stocks: false });
  }, []);

  return {
    pools,
    tags,
    stocks,
    setting: settingRef.current,
    loading,
    changePool,
    changeTags,
    changeActiveTag,
    saveSetting,
    sortState: sortRef.current,
    changeSort,
    selectStock,
    checkStock,
    checkAllStock,
    dailyStats,
    updateStockEvents,
  };
}
