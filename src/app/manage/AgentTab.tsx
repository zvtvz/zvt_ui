'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Table,
  Textarea,
  Typography,
} from '@mui/joy';
import { useRequest } from 'ahooks';
import services from '@/services';
import { tradeInnerTabClass, tradePoolTabActiveClass } from './tradeStyleClasses';

// ── Types ──────────────────────────────────────────────────────────────────

type ModelProvider = {
  id: string;
  provider_name: string;
  model_name: string;
  base_url?: string;
  api_key: string;
};

type AgentDefinition = {
  id: string;
  name: string;
  description?: string;
  system_prompt?: string;
  provider_name: string;
  model_name: string;
  output_format: string;
  working_directory?: string;
  temperature?: number;
  max_tokens?: number;
};

type AgentRunLog = {
  id: string;
  agent_id: string;
  prompt: string;
  thinking?: string;
  output?: string;
  status: string;
  error_detail?: string;
  started_at?: string;
  finished_at?: string;
};

const AGENT_SUB_TABS = ['智能体定义', '智能体活动', '模型配置'] as const;
type AgentSubTab = (typeof AGENT_SUB_TABS)[number];

// ── ModelProvider section ──────────────────────────────────────────────────

function ModelProviderSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<ModelProvider | null>(null);
  const [formError, setFormError] = useState('');

  const { data, loading, refresh } = useRequest(() => services.listModelProviders() as Promise<ModelProvider[]>, {
    refreshDeps: [],
  });
  const rows = data ?? [];

  function openCreate() {
    setEditTarget(null);
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(row: ModelProvider) {
    setEditTarget(row);
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const provider_name = (formData.get('provider_name') as string).trim();
    const model_name = (formData.get('model_name') as string).trim();
    const base_url = (formData.get('base_url') as string).trim() || undefined;
    const api_key = (formData.get('api_key') as string).trim();

    if (!provider_name || !model_name || !api_key) {
      setFormError('Provider、模型名称和 API Key 为必填项');
      return;
    }
    setFormError('');

    if (editTarget) {
      await services.updateModelProvider({ id: editTarget.id, provider_name, model_name, base_url, api_key });
    } else {
      await services.createModelProvider({ provider_name, model_name, base_url, api_key });
    }
    setDialogOpen(false);
    refresh();
  }

  async function handleDelete(row: ModelProvider) {
    if (!window.confirm(`确认删除 ${row.provider_name} / ${row.model_name}？`)) return;
    await services.deleteModelProvider({ record_id: row.id });
    refresh();
  }

  return (
    <Box>
      <div className="flex items-center justify-between mb-3">
        <Typography level="body-sm" textColor="neutral.600">
          共 {rows.length} 条
        </Typography>
        <Button size="sm" variant="soft" color="primary" onClick={openCreate}>
          新增
        </Button>
      </div>

      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead>
            <tr>
              <th style={{ minWidth: 100 }}>Provider</th>
              <th style={{ minWidth: 160 }}>模型名称</th>
              <th style={{ minWidth: 200 }}>Base URL</th>
              <th style={{ minWidth: 120 }}>API Key</th>
              <th style={{ width: 120 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    暂无数据
                  </Typography>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Typography level="body-sm">{row.provider_name}</Typography>
                  </td>
                  <td>
                    <Typography level="body-sm">{row.model_name}</Typography>
                  </td>
                  <td>
                    <Typography level="body-xs" textColor="neutral.500">
                      {row.base_url || '—'}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs" textColor="neutral.500" sx={{ fontFamily: 'monospace' }}>
                      {row.api_key ? `${row.api_key.slice(0, 6)}…` : '—'}
                    </Typography>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="sm" variant="plain" color="neutral" onClick={() => openEdit(row)}>
                        编辑
                      </Button>
                      <Button size="sm" variant="plain" color="danger" onClick={() => handleDelete(row)}>
                        删除
                      </Button>
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <ModalDialog sx={{ width: 440 }}>
          <ModalClose />
          <Typography level="title-md">{editTarget ? '编辑模型配置' : '新增模型配置'}</Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <FormControl required>
                <FormLabel>Provider</FormLabel>
                <Input name="provider_name" placeholder="如 cursor、openai、deepseek" defaultValue={editTarget?.provider_name ?? ''} />
              </FormControl>
              <FormControl required>
                <FormLabel>模型名称</FormLabel>
                <Input name="model_name" placeholder="如 claude-sonnet-4-5、gpt-4o-mini" defaultValue={editTarget?.model_name ?? ''} />
              </FormControl>
              <FormControl>
                <FormLabel>Base URL（可选）</FormLabel>
                <Input name="base_url" placeholder="留空则使用默认 host" defaultValue={editTarget?.base_url ?? ''} />
              </FormControl>
              <FormControl required>
                <FormLabel>API Key</FormLabel>
                <Input name="api_key" type="password" placeholder="Bearer API Key" defaultValue={editTarget?.api_key ?? ''} />
              </FormControl>
              {formError && (
                <Typography level="body-xs" color="danger">
                  {formError}
                </Typography>
              )}
              <Button type="submit" size="sm">
                保存
              </Button>
            </Box>
          </form>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

// ── AgentDefinition section ────────────────────────────────────────────────

function AgentDefinitionSection() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AgentDefinition | null>(null);
  const [formError, setFormError] = useState('');
  const [initBusy, setInitBusy] = useState(false);
  const [initNotice, setInitNotice] = useState<string | null>(null);

  const { data, loading, refresh } = useRequest(() => services.listAgents() as Promise<AgentDefinition[]>, {
    refreshDeps: [],
  });
  const rows = data ?? [];

  async function handleInitPresetAgents() {
    setInitBusy(true);
    setInitNotice(null);
    try {
      await services.initPresetAgents();
      await refresh();
      setInitNotice('系统智能体初始化完成');
      window.setTimeout(() => setInitNotice(null), 5000);
    } finally {
      setInitBusy(false);
    }
  }

  function openCreate() {
    setEditTarget(null);
    setFormError('');
    setDialogOpen(true);
  }

  function openEdit(row: AgentDefinition) {
    setEditTarget(row);
    setFormError('');
    setDialogOpen(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = (formData.get('name') as string).trim();
    const description = (formData.get('description') as string).trim() || undefined;
    const system_prompt = (formData.get('system_prompt') as string).trim() || undefined;
    const model_name = (formData.get('model_name') as string).trim();
    const output_format = (formData.get('output_format') as string).trim() || 'text';
    const working_directory = (formData.get('working_directory') as string).trim() || undefined;
    const temperature_raw = (formData.get('temperature') as string).trim();
    const max_tokens_raw = (formData.get('max_tokens') as string).trim();
    const temperature = temperature_raw ? parseFloat(temperature_raw) : undefined;
    const max_tokens = max_tokens_raw ? parseInt(max_tokens_raw, 10) : undefined;

    if (!name || !model_name) {
      setFormError('名称和模型名称为必填项');
      return;
    }
    setFormError('');

    const provider_name = 'cursor';

    if (editTarget) {
      await services.updateAgent({
        id: editTarget.id,
        name,
        description,
        system_prompt,
        provider_name,
        model_name,
        output_format,
        working_directory,
        temperature,
        max_tokens,
      });
    } else {
      await services.createAgent({
        name,
        description,
        system_prompt,
        provider_name,
        model_name,
        output_format,
        working_directory,
        temperature,
        max_tokens,
      });
    }
    setDialogOpen(false);
    refresh();
  }

  async function handleDelete(row: AgentDefinition) {
    if (!window.confirm(`确认删除智能体 "${row.name}"？`)) return;
    await services.deleteAgent({ record_id: row.id });
    refresh();
  }

  return (
    <Box>
      <div className="flex items-center justify-between mb-3">
        <Typography level="body-sm" textColor="neutral.600">
          共 {rows.length} 个智能体
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          {initNotice && (
            <Typography level="body-xs" color="success">
              {initNotice}
            </Typography>
          )}
          <Button size="sm" variant="soft" color="neutral" loading={initBusy} onClick={handleInitPresetAgents}>
            初始化系统智能体
          </Button>
          <Button size="sm" variant="soft" color="primary" onClick={openCreate}>
            新增
          </Button>
        </Box>
      </div>

      <div className="overflow-auto">
        <Table borderAxis="xBetween" size="sm" hoverRow stickyHeader>
          <thead>
            <tr>
              <th style={{ minWidth: 120 }}>名称</th>
              <th style={{ minWidth: 100 }}>模型</th>
              <th style={{ width: 80 }}>输出格式</th>
              <th>描述</th>
              <th>系统提示词</th>
              <th style={{ width: 120 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    加载中...
                  </Typography>
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={6}>
                  <Typography level="body-sm" textColor="neutral.400" sx={{ p: 1.5 }}>
                    暂无智能体
                  </Typography>
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Typography level="body-sm" fontWeight="md">
                      {row.name}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs" textColor="neutral.600">
                      {row.model_name}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs" textColor="neutral.500">
                      {row.output_format}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs" textColor="neutral.500" sx={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.description || '—'}
                    </Typography>
                  </td>
                  <td>
                    <Typography level="body-xs" textColor="neutral.500" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.system_prompt || '—'}
                    </Typography>
                  </td>
                  <td>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Button size="sm" variant="plain" color="neutral" onClick={() => openEdit(row)}>
                        编辑
                      </Button>
                    </Box>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>

      <Modal open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <ModalDialog sx={{ width: 520, maxHeight: '90vh', overflow: 'auto' }}>
          <ModalClose />
          <Typography level="title-md">{editTarget ? '编辑智能体' : '新增智能体'}</Typography>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              <FormControl required>
                <FormLabel>名称</FormLabel>
                <Input name="name" placeholder="智能体唯一名称" defaultValue={editTarget?.name ?? ''} />
              </FormControl>
              <FormControl>
                <FormLabel>描述</FormLabel>
                <Input name="description" placeholder="用途说明（可选）" defaultValue={editTarget?.description ?? ''} />
              </FormControl>
              <FormControl>
                <FormLabel>系统提示词</FormLabel>
                <Textarea
                  name="system_prompt"
                  placeholder="定义角色与行为（可选）"
                  minRows={3}
                  maxRows={6}
                  defaultValue={editTarget?.system_prompt ?? ''}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Provider</FormLabel>
                <Input value="cursor" disabled sx={{ color: 'neutral.500' }} />
              </FormControl>
              <FormControl required>
                <FormLabel>模型名称</FormLabel>
                <Input name="model_name" placeholder="如 composer-2.5、claude-sonnet-4-5" defaultValue={editTarget?.model_name ?? ''} />
              </FormControl>
              <FormControl>
                <FormLabel>输出格式</FormLabel>
                <Input name="output_format" placeholder="text 或 json" defaultValue={editTarget?.output_format ?? 'text'} />
              </FormControl>
              <FormControl>
                <FormLabel>工作目录（可选）</FormLabel>
                <Input name="working_directory" placeholder="留空则使用全局配置" defaultValue={editTarget?.working_directory ?? ''} />
              </FormControl>
              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Temperature</FormLabel>
                  <Input name="temperature" type="number" slotProps={{ input: { step: 0.01, min: 0, max: 2 } }} placeholder="留空" defaultValue={editTarget?.temperature ?? ''} />
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Max Tokens</FormLabel>
                  <Input name="max_tokens" type="number" slotProps={{ input: { step: 1, min: 1 } }} placeholder="留空" defaultValue={editTarget?.max_tokens ?? ''} />
                </FormControl>
              </Box>
              {formError && (
                <Typography level="body-xs" color="danger">
                  {formError}
                </Typography>
              )}
              <Button type="submit" size="sm">
                保存
              </Button>
            </Box>
          </form>
        </ModalDialog>
      </Modal>
    </Box>
  );
}

// ── AgentRunLog section ────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function ConversationEntry({ log }: { log: AgentRunLog }) {
  const [thinkingOpen, setThinkingOpen] = useState(false);
  const [promptOpen, setPromptOpen] = useState(false);

  const timeLabel = log.started_at ? log.started_at.slice(0, 19).replace('T', ' ') : '';
  const isError = log.status === 'error';

  return (
    <Sheet
      variant="outlined"
      sx={{ borderRadius: 'md', p: 2, mb: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}
    >
      {/* ── header ── */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography level="body-xs" textColor="neutral.400" sx={{ fontFamily: 'monospace' }}>
          {timeLabel}
        </Typography>
        <Typography
          level="body-xs"
          color={isError ? 'danger' : 'success'}
          sx={{ fontWeight: 'md' }}
        >
          {isError ? '● 失败' : '● 完成'}
        </Typography>
      </Box>

      {/* ── user prompt ── */}
      <Box>
        <button
          type="button"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '2px 0',
            marginBottom: 4,
            fontSize: '0.75rem',
            color: '#555',
            fontWeight: 600,
          }}
          onClick={() => setPromptOpen((v) => !v)}
        >
          <span style={{ fontSize: '0.65rem' }}>{promptOpen ? '▼' : '▶'}</span>
          用户
        </button>
        {promptOpen && (
          <Sheet
            variant="soft"
            color="primary"
            sx={{
              borderRadius: 'sm',
              p: 1.5,
              whiteSpace: 'pre-wrap',
              fontSize: '0.8125rem',
              lineHeight: 1.6,
              maxHeight: 280,
              overflow: 'auto',
            }}
          >
            {log.prompt}
          </Sheet>
        )}
      </Box>

      {/* ── thinking (collapsible) ── */}
      {log.thinking && (
        <Box>
          <button
            type="button"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 0',
              fontSize: '0.75rem',
              color: '#888',
            }}
            onClick={() => setThinkingOpen((v) => !v)}
          >
            <span style={{ fontSize: '0.65rem' }}>{thinkingOpen ? '▼' : '▶'}</span>
            思考过程
          </button>
          {thinkingOpen && (
            <Sheet
              variant="soft"
              color="neutral"
              sx={{
                borderRadius: 'sm',
                p: 1.5,
                mt: 0.5,
                whiteSpace: 'pre-wrap',
                fontSize: '0.75rem',
                lineHeight: 1.6,
                color: 'neutral.600',
                maxHeight: 280,
                overflow: 'auto',
              }}
            >
              {log.thinking}
            </Sheet>
          )}
        </Box>
      )}

      {/* ── agent output / error ── */}
      <Box>
        <Typography level="body-xs" textColor="neutral.500" sx={{ mb: 0.5, fontWeight: 'md' }}>
          智能体
        </Typography>
        <Sheet
          variant="soft"
          color={isError ? 'danger' : 'neutral'}
          sx={{ borderRadius: 'sm', p: 1.5, whiteSpace: 'pre-wrap', fontSize: '0.8125rem', lineHeight: 1.6 }}
        >
          {log.error_detail || log.output || '（无输出）'}
        </Sheet>
      </Box>
    </Sheet>
  );
}

function AgentRunLogSection() {
  const [selectedAgentId, setSelectedAgentId] = useState<string>('');
  const [page, setPage] = useState<number>(1);

  const { data: agents } = useRequest(() => services.listAgents() as Promise<AgentDefinition[]>, {
    refreshDeps: [],
  });
  const agentRows = agents ?? [];

  const { data: logs, loading, refresh } = useRequest(
    async () => {
      if (!selectedAgentId) return [];
      return services.listAgentRunLogs({ agent_id: selectedAgentId, limit: 200 }) as Promise<AgentRunLog[]>;
    },
    { refreshDeps: [selectedAgentId] }
  );
  const logRows = logs ?? [];
  const totalPages = Math.max(1, Math.ceil(logRows.length / PAGE_SIZE));
  const pageRows = logRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSelectAgent(agentId: string) {
    setSelectedAgentId(agentId);
    setPage(1);
  }

  return (
    <Box>
      {/* ── agent selector ── */}
      <div className="flex flex-row flex-wrap items-center gap-3 mb-3">
        <Typography level="body-sm" textColor="neutral.600" sx={{ whiteSpace: 'nowrap' }}>
          选择智能体：
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {agentRows.map((agent) => (
            <div
              key={agent.id}
              role="button"
              tabIndex={0}
              className={`${tradeInnerTabClass} ${selectedAgentId === agent.id ? tradePoolTabActiveClass : ''}`}
              onClick={() => handleSelectAgent(agent.id)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  handleSelectAgent(agent.id);
                }
              }}
            >
              {agent.name}
            </div>
          ))}
        </Box>
        {selectedAgentId && (
          <Button size="sm" variant="plain" color="neutral" onClick={refresh}>
            刷新
          </Button>
        )}
      </div>

      {/* ── content ── */}
      {!selectedAgentId ? (
        <Typography level="body-sm" textColor="neutral.400">
          请先选择一个智能体查看运行记录
        </Typography>
      ) : loading ? (
        <Typography level="body-sm" textColor="neutral.400">
          加载中...
        </Typography>
      ) : logRows.length === 0 ? (
        <Typography level="body-sm" textColor="neutral.400">
          暂无运行记录
        </Typography>
      ) : (
        <>
          {/* ── stats + pagination top ── */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography level="body-xs" textColor="neutral.500">
              共 {logRows.length} 条，第 {page} / {totalPages} 页
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                下一页
              </Button>
            </Box>
          </Box>

          {/* ── conversation entries ── */}
          {pageRows.map((log) => (
            <ConversationEntry key={log.id} log={log} />
          ))}

          {/* ── pagination bottom ── */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5, mt: 1 }}>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                上一页
              </Button>
              <Button
                size="sm"
                variant="outlined"
                color="neutral"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                下一页
              </Button>
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

// ── Main AgentTab ──────────────────────────────────────────────────────────

export default function AgentTab() {
  const [subTab, setSubTab] = useState<AgentSubTab>('智能体定义');

  return (
    <Box>
      <div className="flex flex-row items-center flex-wrap gap-y-1 mb-3">
        {AGENT_SUB_TABS.map((label) => (
          <div
            key={label}
            role="button"
            tabIndex={0}
            className={`${tradeInnerTabClass} ${subTab === label ? tradePoolTabActiveClass : ''}`}
            onClick={() => setSubTab(label)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSubTab(label);
              }
            }}
          >
            {label}
          </div>
        ))}
      </div>

      {subTab === '智能体定义' && <AgentDefinitionSection />}
      {subTab === '智能体活动' && <AgentRunLogSection />}
      {subTab === '模型配置' && <ModelProviderSection />}
    </Box>
  );
}
