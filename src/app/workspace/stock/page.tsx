'use client';

import { Card, Typography, Chip, Button } from '@mui/joy';
import { MdOutlineArrowBackIos } from 'react-icons/md';
import { Suspense } from 'react';

import useData from './useData';
import { getDate } from '@/utils';
import { useRouter } from 'next/navigation';
import CandlestickChart from './CandlestickChart';

function Stock() {
  const router = useRouter();
  const { entityId, stockTags, stockHistoryTags } = useData();
  const {
    main_tags = {},
    sub_tags = {},
    hidden_tags = {},
    active_hidden_tags = {},
  } = stockHistoryTags || {};

  return (
    <div>
      <div className="flex flex-row pt-4 justify-between">
        <div className="flex flex-row items-center">
          <div
            className="px-4 hover:cursor-pointer"
            onClick={() => router.back()}
          >
            <MdOutlineArrowBackIos />
          </div>
          <Typography level="h2" fontSize="xl" sx={{ mb: 0.5 }}>
            {stockTags.name}
          </Typography>
        </div>
        <div>
          <Button
            color="primary"
            onClick={() =>
              router.push(
                '/workspace/stock_tag?entityId=' + stockTags.entity_id
              )
            }
            size="sm"
            variant="outlined"
          >
            修改标签
          </Button>
        </div>
      </div>
      <CandlestickChart entityId={entityId as string} />
      <Card className="mt-4" size="lg" variant="plain">
        <div className="flex flex-row">
          <div className="w-[100px] flex-shrink-0 text-right">
            <Chip className="mx-2" color="primary">
              {stockTags.main_tag}
            </Chip>
          </div>
          <div>{stockTags.main_tag_reason}</div>
        </div>
        <div className="flex flex-row">
          <div className="w-[100px] flex-shrink-0 text-right">
            <Chip className="mx-2" color="success">
              {stockTags.sub_tag}
            </Chip>
          </div>
          <div>{stockTags.sub_tag_reason}</div>
        </div>
        {Object.keys(active_hidden_tags || {}).map((key, index) => (
          <div className="flex flex-row" key={index}>
            <div className="w-[100px] flex-shrink-0 text-right">
              <Chip className="mx-2" color="neutral">
                {key}
              </Chip>
            </div>
            <div>{active_hidden_tags[key]}</div>
          </div>
        ))}
      </Card>

      <Card className="mt-4" size="lg" variant="plain">
        <Typography level="h4" fontSize="md" sx={{ mb: 0.5 }}>
          标签历史
        </Typography>
        <div className=" mx-2 pb-4 mb-4">
          <div className="flex justify-start flex-col pb-4 border-b">
            <div className="w-[300px] font-medium	">主标签</div>
            {Object.keys(main_tags || {}).map((key) => (
              <div className="flex flex-row pt-2" key={key}>
                <div className="w-[100px] flex-shrink-0 text-right">
                  <Chip className="mx-2" color="primary" variant="soft">
                    {key}
                  </Chip>
                </div>
                <div>
                  <span>{main_tags[key]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-start flex-col py-4 border-b">
            <div className="w-[300px] font-medium	">次标签</div>
            {Object.keys(sub_tags || {}).map((key) => (
              <div className="flex flex-row pt-2" key={key}>
                <div className="w-[100px] flex-shrink-0 text-right">
                  <Chip className="mx-2" color="success" variant="soft">
                    {key}
                  </Chip>
                </div>
                <div>
                  <span>{sub_tags[key]}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-start flex-col pt-4">
            <div className="w-[300px] font-medium	">隐藏标签</div>
            {Object.keys(hidden_tags || {}).map((key) => (
              <div className="flex flex-row pt-2" key={key}>
                <div className="w-[100px] flex-shrink-0 text-right">
                  <Chip className="mx-2" color="neutral" variant="soft">
                    {key}
                  </Chip>
                </div>
                <div>
                  <span>{hidden_tags[key]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Stock />
    </Suspense>
  );
}
