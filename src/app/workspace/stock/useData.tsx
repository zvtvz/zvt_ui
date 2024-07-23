import { useAsyncEffect } from 'ahooks';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import services from '@/services';

type StockHistoryTag = {
  id: string;
  entity_id: string;
  main_tag: string;
  sub_tag: string;
  main_tag_reason: string;
  sub_tag_reason: string;
  main_tags: Record<string, string>;
  sub_tags: Record<string, string>;
  hidden_tags: Record<string, string>;
  active_hidden_tags: Record<string, string>;
};

export default function useData() {
  const [stockTags, setStockTags] = useState<any>({});
  const [stockHistoryTags, setStockHistoryTags] = useState<StockHistoryTag>();

  const searchParams = useSearchParams();
  const entityId = searchParams.get('entityId');

  useAsyncEffect(async () => {
    const [stockTags] = await services.getSimpleStockTags({
      entity_ids: [entityId],
    });
    const [stockHistoryTags] = await services.getHistoryStockTags({
      entity_ids: [entityId],
    });

    setStockTags(stockTags);
    setStockHistoryTags(stockHistoryTags);
  }, []);

  return {
    stockTags,
    stockHistoryTags,
    entityId
  };
}
