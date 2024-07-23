import {
  Button,
  Card,
  CardContent,
  Chip,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Tooltip,
  Typography,
  tabClasses,
} from '@mui/joy';
import { useEffect, useState } from 'react';
import services from '@/services';
import dayjs from 'dayjs';
import { useSetState } from 'ahooks';

const tagTypeText = {
  main_tag: '更新主标签',
  sub_tag: '更新次标签',
  new_tag: '待处理标签',
} as any;

export default function NewsAnalysisesStats({ dialog }: { dialog: any }) {
  const [newsAnalysisesStats, setNewsAnalysisesStats] = useState([]);
  const [loading, setLoading] = useSetState<Record<string, boolean>>({});

  const batchUpdateTags = async (suggestion: any) => {
    setLoading({
      [suggestion.tag]: true,
    });
    try {
      await services.batchUpdateStockTags({
        entity_ids: suggestion.entity_ids,
        tag: suggestion.tag,
        tag_type: suggestion.tag_type,
        tag_reason: suggestion.tag + '_消息刺激',
      });
      dialog.show({
        title: '更新标签成功',
      });
    } finally {
      setLoading({ [suggestion.tag]: false });
    }
  };

  const loadStatus = async () => {
    const stats = await services.getSuggestionStats();
    setNewsAnalysisesStats(stats);
  };

  useEffect(() => {
    loadStatus();
  }, []);

  return (
    <div className="h-[700px] overflow-auto text-[12px]">
      {newsAnalysisesStats?.map((suggestion: any, index: number) => {
        return (
          <div
            key={index}
            className="group flex flex-row justify-between rounded px-2 py-1 hover:bg-[#CDD7E1] cursor-pointer"
          >
            <div className="inline-flex flex-row items-start">
              <div className="w-[110px] text-right shrink-0 overflow-auto pt-[2px]">
                <Chip
                  color="primary"
                  variant="soft"
                  className="mr-1 !text-[12px]"
                  size="sm"
                >
                  <span className="mr-1 text-green-600">
                    +{suggestion.tag_count}
                  </span>
                  {suggestion.tag}
                </Chip>
              </div>
              <span className="opacity-75 text-xs pt-[4px]">
                {suggestion.stock_names.join('、')}
              </span>
            </div>
            <div className="shrink-0">
              <Button
                variant="plain"
                size="sm"
                disabled={suggestion.tag_type === 'new_tag'}
                className=" !text-[12px] !min-h-[24px] !leading-none !py-0 !font-normal	"
                onClick={() => batchUpdateTags(suggestion)}
                loading={loading[suggestion.tag]}
              >
                {tagTypeText[suggestion.tag_type || 'main_tag']}
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
