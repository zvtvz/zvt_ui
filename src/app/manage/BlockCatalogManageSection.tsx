'use client';

import { useEffect, useMemo, useState } from 'react';
import { Box, Button, Table, Typography } from '@mui/joy';
import { useRequest } from 'ahooks';
import services from '@/services';
import type { BlockInfo } from '@/interfaces';
import { tradeInnerTabClass, tradePoolTabActiveClass } from './tradeStyleClasses';

type CatalogKind = 'industry' | 'concept';

type EntityCountSort = 'none' | 'asc' | 'desc';

function entityCountSortKey(row: BlockInfo, direction: 'asc' | 'desc'): number {
  const raw = row.entity_count;
  if (raw != null && !Number.isNaN(Number(raw))) {
    return Number(raw);
  }
  return direction === 'asc' ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
}

export default function BlockCatalogManageSection(props: {
  kind: CatalogKind;
  onAfterMutation?: () => void;
}) {
  const { kind, onAfterMutation } = props;
  const [listTab, setListTab] = useState<'active' | 'archived'>('active');
  const [entityCountSort, setEntityCountSort] = useState<EntityCountSort>('none');
  const activeQuery = listTab === 'active';

  const { data, loading, refresh } = useRequest(
    async () => {
      if (kind === 'industry') {
        return services.getIndustryInfo({ active: activeQuery });
      }
      return services.getConceptInfo({ active: activeQuery });
    },
    { refreshDeps: [kind, activeQuery] }
  );

  useEffect(() => {
    setEntityCountSort('none');
  }, [kind, activeQuery]);

  const rows = (data ?? []) as BlockInfo[];

  const displayRows = useMemo(() => {
    if (entityCountSort === 'none') {
      return rows;
    }
    const list = [...rows];
    list.sort((a, b) => {
      const va = entityCountSortKey(a, entityCountSort);
      const vb = entityCountSortKey(b, entityCountSort);
      return entityCountSort === 'asc' ? va - vb : vb - va;
    });
    return list;
  }, [rows, entityCountSort]);

  async function handleSetActive(rowId: string, active: boolean) {
    if (kind === 'industry') {
      await services.setIndustryInfoActive({ id: rowId, active });
    } else {
      await services.setConceptInfoActive({ id: rowId, active });
    }
    await refresh();
    onAfterMutation?.();
  }

  const columnCount = kind === 'industry' ? 5 : 4;

  return (
    <Box>
      <div className="flex flex-row items-center flex-wrap gap-y-1 mb-3">
        <div
          role="button"
          tabIndex={0}
          className={`${tradeInnerTabClass} ${listTab === 'active' ? tradePoolTabActiveClass : ''}`}
          onClick={() => setListTab('active')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setListTab('active');
            }
          }}
        >
          活跃
        </div>
        <div
          role="button"
          tabIndex={0}
          className={`${tradeInnerTabClass} ${listTab === 'archived' ? tradePoolTabActiveClass : ''}`}
          onClick={() => setListTab('archived')}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setListTab('archived');
            }
          }}
        >
          归档
        </div>
      </div>

      <div className="flex flex-row justify-between items-center mb-2">
        <span className="opacity-85 text-sm">共 {rows.length} 条</span>
      </div>

      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead className="font-bold">
            <tr>
              <th style={{ minWidth: 200 }}>名称</th>
              {kind === 'industry' && <th style={{ width: 72 }}>层级</th>}
              <th>说明</th>
              <th
                style={{ width: 100, whiteSpace: 'nowrap' }}
                aria-sort={
                  entityCountSort === 'asc'
                    ? 'ascending'
                    : entityCountSort === 'desc'
                      ? 'descending'
                      : 'none'
                }
              >
                <button
                  type="button"
                  title="按标的数排序：升序 → 降序 → 恢复默认"
                  className="inline-flex items-center gap-0.5 font-bold cursor-pointer select-none rounded px-0.5 py-0.5 -mx-0.5 hover:bg-neutral-100 border-0 bg-transparent text-inherit"
                  onClick={() => {
                    setEntityCountSort((previous) =>
                      previous === 'none' ? 'asc' : previous === 'asc' ? 'desc' : 'none'
                    );
                  }}
                >
                  标的数
                  {entityCountSort === 'asc' ? (
                    <span className="font-normal opacity-80 text-[#416df9]" aria-hidden>
                      ↑
                    </span>
                  ) : null}
                  {entityCountSort === 'desc' ? (
                    <span className="font-normal opacity-80 text-[#416df9]" aria-hidden>
                      ↓
                    </span>
                  ) : null}
                </button>
              </th>
              <th style={{ width: 120, whiteSpace: 'nowrap' }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columnCount}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columnCount}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    {listTab === 'active' ? '暂无活跃条目' : '暂无归档条目'}
                  </Typography>
                </td>
              </tr>
            ) : (
              displayRows.map((row) => {
                const rowId = row.id;
                return (
                  <tr key={rowId ?? row.name}>
                    <td style={{ verticalAlign: 'top' }}>
                      <Typography level="body-md" sx={{ fontSize: '0.9375rem', lineHeight: 1.45 }}>
                        {row.name}
                      </Typography>
                    </td>
                    {kind === 'industry' && (
                      <td>
                        <Typography level="body-xs" textColor="neutral.500">
                          {row.level ?? '—'}
                        </Typography>
                      </td>
                    )}
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {row.desc ?? '—'}
                      </Typography>
                    </td>
                    <td>
                      <Typography level="body-xs" textColor="neutral.500">
                        {row.entity_count != null ? row.entity_count : '—'}
                      </Typography>
                    </td>
                    <td>
                      {listTab === 'active' ? (
                        <Button
                          size="sm"
                          variant="soft"
                          color="neutral"
                          className="!text-[12px] !py-1"
                          disabled={!rowId}
                          onClick={() => rowId && handleSetActive(rowId, false)}
                        >
                          归档
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="soft"
                          color="primary"
                          className="!text-[12px] !py-1"
                          disabled={!rowId}
                          onClick={() => rowId && handleSetActive(rowId, true)}
                        >
                          恢复
                        </Button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </Table>
      </div>
    </Box>
  );
}
