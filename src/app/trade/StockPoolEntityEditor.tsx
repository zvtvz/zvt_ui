'use client';

import CloseRounded from '@mui/icons-material/CloseRounded';
import services from '@/services';
import type { StockListItem } from '@/interfaces';
import { Button, Chip, IconButton, Input, FormControl, FormLabel, Box } from '@mui/joy';
import { useCallback, useState } from 'react';

export type StockPoolEntityRow = {
  entity_id: string;
  code: string;
  name: string;
};

type Props = {
  rows: StockPoolEntityRow[];
  onChange: (rows: StockPoolEntityRow[]) => void;
};

export default function StockPoolEntityEditor({ rows, onChange }: Props) {
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState<StockListItem[]>([]);
  const [searching, setSearching] = useState(false);

  const runSearch = useCallback(async () => {
    const key = searchKey.trim();
    if (!key) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const list = await services.listStocks({ key });
      setSearchResults(Array.isArray(list) ? list : []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, [searchKey]);

  const addRow = (item: StockListItem) => {
    if (rows.some((r) => r.entity_id === item.entity_id)) {
      return;
    }
    onChange([
      ...rows,
      {
        entity_id: item.entity_id,
        code: item.code,
        name: item.name,
      },
    ]);
    setSearchResults([]);
    setSearchKey('');
  };

  const removeRow = (entityId: string) => {
    onChange(rows.filter((r) => r.entity_id !== entityId));
  };

  return (
    <FormControl className="mb-2">
      <FormLabel>标的（A 股）</FormLabel>
      <div className="flex gap-2 mb-2">
        <Input
          size="sm"
          placeholder="代码或名称，至少 2 个汉字或 4 个字符"
          value={searchKey}
          onChange={(e) => setSearchKey(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              runSearch();
            }
          }}
          sx={{ flex: 1 }}
        />
        <Button size="sm" variant="outlined" loading={searching} onClick={runSearch}>
          搜索
        </Button>
      </div>
      {searchResults.length > 0 && (
        <Box
          className="mb-2 max-h-[160px] overflow-y-auto rounded-md border border-neutral-200 bg-white p-1 text-sm"
          component="div"
        >
          {searchResults.map((item) => (
            <button
              key={item.entity_id}
              type="button"
              className="flex w-full cursor-pointer flex-col items-start rounded px-2 py-1.5 text-left hover:bg-[rgba(65,109,249,.08)]"
              onClick={() => addRow(item)}
            >
              <span>
                {item.name}
                <span className="ml-2 opacity-70">{item.code}</span>
              </span>
            </button>
          ))}
        </Box>
      )}
      <div className="flex flex-wrap gap-1 min-h-[32px]">
        {rows.map((r) => (
          <Chip
            key={r.entity_id}
            size="sm"
            variant="soft"
            color="primary"
            endDecorator={
              <IconButton
                size="sm"
                variant="plain"
                color="neutral"
                aria-label={`移除 ${r.name || r.code}`}
                sx={{ minWidth: 24, minHeight: 24, p: 0, mr: -0.25 }}
                onClick={(event) => {
                  event.stopPropagation();
                  removeRow(r.entity_id);
                }}
              >
                <CloseRounded sx={{ fontSize: 16, opacity: 0.7 }} />
              </IconButton>
            }
          >
            {r.name || r.code || r.entity_id}
            <span className="ml-1 opacity-70">{r.code}</span>
          </Chip>
        ))}
        {rows.length === 0 && (
          <span className="text-sm text-neutral-500">未添加标的，可在上方搜索后加入</span>
        )}
      </div>
    </FormControl>
  );
}
