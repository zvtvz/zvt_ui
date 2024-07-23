import { useAsyncEffect, useSetState } from 'ahooks';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import services from '@/services';
import { GlobalTag, StockHistoryTag, TagState } from '@/interfaces';

function tagObject2Array(obj: Record<string, string>): GlobalTag[] {
  return Object.keys(obj).map((key, index) => ({
    id: index + '',
    tag: key,
    tag_reason: obj[key],
  }));
}

export default function useData() {
  const [stockTags, setStockTags] = useState<any>({});
  const [stockHistoryTags, setStockHistoryTags] = useState<StockHistoryTag>();
  const [globalMainTags, setGlobalMainTag] = useState<GlobalTag[]>([]);
  const [globalSubTags, setGlobalSubTag] = useState<GlobalTag[]>([]);
  const [globalHiddenTags, setGlobalHiddenTag] = useState<GlobalTag[]>([]);

  const [currentMainTag, setCurrentMainTag] = useSetState({
    id: 'main',
    tag: '',
    reason: '',
  });
  const [currentSubTag, setCurrentSubTag] = useSetState({
    id: 'sub',
    tag: '',
    reason: '',
  });
  const [currentHiddenTags, setCurrentHiddenTags] = useState<TagState[]>([]);

  const searchParams = useSearchParams();
  const entityId = searchParams.get('entityId');

  const fetchTags = async () => {
    const [stockTags] = await services.getSimpleStockTags({
      entity_ids: [entityId],
    });
    const [stockHistoryTags] = await services.getHistoryStockTags({
      entity_ids: [entityId],
    });

    const [gloablMainTags, globalSubTags, globalHiddenTags] = await Promise.all(
      [
        services.getMainTagInfo(),
        services.getSubTagInfo(),
        services.getHiddenTagInfo(),
      ]
    );

    setStockTags(stockTags);
    setStockHistoryTags(stockHistoryTags);
    setGlobalMainTag(gloablMainTags || []);
    setGlobalSubTag(globalSubTags || []);
    setGlobalHiddenTag(globalHiddenTags || []);

    setCurrentMainTag({
      tag: stockTags.main_tag,
      reason: stockTags.main_tag_reason,
    });
    setCurrentSubTag({
      tag: stockTags.sub_tag,
      reason: stockTags.sub_tag_reason,
    });

    const activeHiddenTags = tagObject2Array(
      stockHistoryTags?.active_hidden_tags || {}
    );

    setCurrentHiddenTags(
      activeHiddenTags.map((x) => ({
        id: x.id,
        tag: x.tag,
        reason: x.tag_reason,
      }))
    );
  };

  useAsyncEffect(fetchTags, []);

  const stockMainTags = tagObject2Array(stockHistoryTags?.main_tags || {});
  const stockSubTags = tagObject2Array(stockHistoryTags?.sub_tags || {});
  const stockHiddenTags = tagObject2Array(stockHistoryTags?.hidden_tags || {});

  return {
    entityId,
    stockTags,
    stockHistoryTags,
    globalMainTags,
    globalSubTags,
    globalHiddenTags,
    stockMainTags,
    stockSubTags,
    stockHiddenTags,
    currentMainTag,
    currentSubTag,
    currentHiddenTags,
    setCurrentMainTag,
    setCurrentSubTag,
    setCurrentHiddenTags,
    refreshTags: fetchTags,
  };
}
