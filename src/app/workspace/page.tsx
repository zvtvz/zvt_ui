'use client';

import { Card, Select, Option, Typography, Chip } from '@mui/joy';
import { useRouter } from 'next/navigation';
import useData from './useData';

export default function Workspace() {
  const { pools, stocks, stockStats, changePool } = useData();
  const router = useRouter();

  const handleStockClick = (entityId: string) => {
    router.push('/workspace/stock?entityId=' + entityId);
  };

  return (
    <>
      <div className="my-4 mt-8 ">
        <Select
          placeholder="Select Pool"
          required
          sx={{ width: 200 }}
          value={pools.current?.id}
          onChange={(_, value) => changePool(value as string)}
        >
          {pools.data?.map((pool, index) => (
            <Option value={pool.id} key={index}>
              {pool.stock_pool_name}
            </Option>
          ))}
        </Select>
      </div>
      <Card className="mt-4" size="lg" variant="plain">
        <Typography level="h3" fontSize="xl" sx={{ mb: 0.5 }}>
          股票池
        </Typography>
        <div className="h-[200px] overflow-auto">
          {stocks.map((stock) => (
            <div
              className="flex flex-row items-center justify-between py-2 border-b pr-4 hover:cursor-pointer hover:bg-slate-100"
              key={stock.entity_id}
              onClick={() => handleStockClick(stock.entity_id)}
            >
              <div className="w-60 pl-2">{stock.name}</div>
              <div>
                <Chip className="mx-2" color="primary">
                  {stock.main_tag}
                </Chip>
                <Chip className="mx-2" color="success">
                  {stock.sub_tag}
                </Chip>
                {Object.keys(stock.active_hidden_tags || {}).map(
                  (key, index) => (
                    <Chip className="mx-2" color="neutral" key={index}>
                      {key}
                    </Chip>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
      {stockStats.map((stats) => (
        <Card className="mt-4" size="lg" variant="plain" key={stats.id}>
          <Typography level="h3" fontSize="lg" sx={{ mb: 0.5 }}>
            <Chip color="neutral" size="sm" variant="solid">
              {stats.position + 1}
            </Chip>{' '}
            {stats.main_tag}
          </Typography>
          <div className="max-h-[200px] overflow-auto">
            {stats.stock_details?.map((stock) => (
              <div
                className="flex flex-row items-center justify-between py-2 border-b pr-4 hover:cursor-pointer hover:bg-slate-100	"
                key={stock.entity_id}
                onClick={() => handleStockClick(stock.entity_id)}
              >
                <div className="w-60 pl-2">{stock.name}</div>
                <div>
                  <Chip className="mx-2" color="primary">
                    {stock.main_tag}
                  </Chip>
                  <Chip className="mx-2" color="success">
                    {stock.sub_tag}
                  </Chip>
                  {stock.hidden_tags?.map((key, index) => (
                    <Chip className="mx-2" color="neutral" key={index}>
                      {key}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </>
  );
}
