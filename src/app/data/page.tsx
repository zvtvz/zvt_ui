'use client';

import { Skeleton, Table, Card, Select, Option, Stack, Button } from '@mui/joy';
import useSchemas from './useSchemas';
import Loading from '@/components/Loading';

export default function Data() {
  const { providers, schemas, datas, loading, changeProvider, changeSchema } =
    useSchemas();

  const columns = Object.keys(datas?.[0] || {});

  return (
    <div>
      <div className="mt-8">
        <Stack direction="row" justifyContent="flex-start" spacing={4}>
          <Select
            placeholder="Select Provider"
            required
            value={providers.current}
            sx={{ minWidth: 200 }}
            onChange={(_, value) => changeProvider(value as string)}
          >
            {providers.data?.map((provider, index) => (
              <Option value={provider} key={index}>
                {provider}
              </Option>
            ))}
          </Select>
          <Select
            placeholder="Select Schema"
            required
            value={schemas.current}
            sx={{ minWidth: 200 }}
            onChange={(_, value) => changeSchema(value as string)}
          >
            {schemas.data?.map((schema, index) => (
              <Option value={schema} key={index}>
                {schema}
              </Option>
            ))}
          </Select>
        </Stack>
      </div>
      <Card className="mt-8 min-h-80" size="lg" variant="plain">
        <Loading className="min-h-80" loading={loading}>
          {columns.length === 0 && (
            <div className="text-center opacity-65">暂无数据</div>
          )}
          <Table>
            <thead>
              {columns.map((col) => (
                <th key={col}>{col}</th>
              ))}
            </thead>
            <tbody>
              {datas.map((row, index) => {
                return (
                  <tr key={index}>
                    {columns.map((col, cIndex) => (
                      <td key={`${index}_${cIndex}`}>{row[col]}</td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Loading>
      </Card>
    </div>
  );
}
