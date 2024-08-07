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
import { useEffect, useRef, useState } from 'react';
import services from '@/services';
import dayjs from 'dayjs';
import { useSetState, useUnmountedRef } from 'ahooks';
import { getSimpleId } from '@/utils';

const tagTypeText = {
  main_tag: '更新主标签',
  sub_tag: '更新次标签',
  new_tag: '待处理标签',
} as any;

export default function NewsAnalysises({ dialog }: { dialog: any }) {
  const [newsAnalysises, setNewsAnalysises] = useState([]);
  const [loading, setLoading] = useSetState<Record<string, boolean>>({});
  const unmountedRef = useUnmountedRef();

  const batchUpdateTags = async (analysis: any, suggestion: any) => {
    setLoading({
      [suggestion.id]: true,
    });

    try {
      await services.batchUpdateStockTags({
        entity_ids: suggestion.stocks.map((s: any) => s.entity_id),
        tag: suggestion.tag,
        tag_type: suggestion.tag_type,
        tag_reason: analysis.news_title,
      });
      dialog.show({
        title: '更新标签成功',
      });
    } finally {
      setLoading({
        [suggestion.id]: false,
      });
    }
  };

  useEffect(() => {
    const poolLoadNews = async () => {
      if (unmountedRef.current) return;
      try {
        const data = await services.getNewsAnalysis();
        data.forEach((item: any) => {
          item.news_analysis.tag_suggestions.up?.forEach((x: any) => {
            x.id = getSimpleId();
          });
          item.news_analysis.tag_suggestions.down?.forEach((x: any) => {
            x.id = getSimpleId();
          });
        });
        setNewsAnalysises(data);
      } finally {
        setTimeout(() => {
          poolLoadNews();
        }, 5000);
      }
    };

    poolLoadNews();
  }, []);

  return (
    <div className="h-[700px] overflow-auto text-[12px]">
      {newsAnalysises?.map((analysis: any, index: number) => {
        return (
          <div key={index} className=" py-1">
            <div className="mb-1">
              <Tooltip
                title={
                  <div className="w-[500px]">
                    {analysis.news_content || analysis.news_title}
                  </div>
                }
                variant="solid"
              >
                <span>
                  <span className="mr-1">
                    {dayjs(analysis.timestamp).format('YYYY-MM-DD')}
                  </span>
                  {analysis.news_title || ''}
                </span>
              </Tooltip>
            </div>
            <div>
              {analysis.news_analysis?.tag_suggestions?.up?.map(
                (suggestion: any, idx: number) => {
                  return (
                    <div
                      key={idx}
                      className="group flex flex-row justify-between rounded px-2  hover:bg-[#CDD7E1] cursor-pointer"
                    >
                      <div className="inline-flex flex-row items-center">
                        <Chip
                          color="primary"
                          variant="soft"
                          className="mr-1 !text-[12px]"
                          key={idx}
                          size="sm"
                        >
                          {suggestion.tag}
                        </Chip>
                        <span className="opacity-75 text-xs">
                          {suggestion.stocks
                            .map((s: any, idx: number) => s.name)
                            .join('、')}
                        </span>
                      </div>
                      <div>
                        <Button
                          variant="plain"
                          size="sm"
                          disabled={suggestion.tag_type === 'new_tag'}
                          className=" !text-[12px] !min-h-[24px] !leading-none !py-0 !font-normal	"
                          onClick={() => batchUpdateTags(analysis, suggestion)}
                          loading={loading[suggestion.id]}
                        >
                          {tagTypeText[suggestion.tag_type]}
                        </Button>
                      </div>
                    </div>
                  );
                }
              )}
              {analysis.news_analysis?.tag_suggestions?.down?.map(
                (suggestion: any, index: number) => {
                  return (
                    <div
                      key={index}
                      className="group flex flex-row justify-between px-2 rounded hover:bg-[#CDD7E1] cursor-pointer"
                    >
                      <div className="inline-flex flex-row items-center">
                        <Chip
                          color="success"
                          variant="soft"
                          className="mr-1 !text-[12px]"
                          key={index}
                          size="sm"
                        >
                          {suggestion.tag}
                        </Chip>
                        <span className="opacity-75 text-sm ">
                          {suggestion.stocks
                            .map((s: any, index: number) => s.name)
                            .join('、')}
                        </span>
                      </div>
                      <div>
                        <Button
                          variant="plain"
                          size="sm"
                          disabled={suggestion.tag_type === 'new_tag'}
                          className=" !text-[12px] !min-h-[24px] !leading-none !py-0 !font-normal"
                          onClick={() => batchUpdateTags(analysis, suggestion)}
                          loading={loading[suggestion.id]}
                        >
                          {tagTypeText[suggestion.tag_type]}
                        </Button>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
