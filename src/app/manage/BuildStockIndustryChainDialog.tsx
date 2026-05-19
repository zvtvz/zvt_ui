'use client';

import { useEffect, useState } from 'react';
import {
  Button,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Typography,
} from '@mui/joy';
import StockPoolEntityEditor, {
  type StockPoolEntityRow,
} from '../trade/StockPoolEntityEditor';

type Props = {
  open: boolean;
  industryChainName: string;
  submitting?: boolean;
  onCancel: () => void;
  onConfirm: (entityIds: string[] | null) => void;
};

export default function BuildStockIndustryChainDialog({
  open,
  industryChainName,
  submitting = false,
  onCancel,
  onConfirm,
}: Props) {
  const [entityRows, setEntityRows] = useState<StockPoolEntityRow[]>([]);

  useEffect(() => {
    if (!open) {
      setEntityRows([]);
    }
  }, [open]);

  const trimmedChainName = industryChainName.trim();

  function handleConfirm() {
    const entityIds = entityRows.map((row) => row.entity_id).filter(Boolean);
    onConfirm(entityIds.length > 0 ? entityIds : null);
  }

  return (
    <Modal open={open} onClose={submitting ? undefined : onCancel}>
      <ModalDialog className="w-[480px] !text-[14px]" size="sm">
        <ModalClose size="sm" disabled={submitting} />
        <DialogTitle>构建个股产业链</DialogTitle>
        <DialogContent>
          <Typography level="body-sm" className="mb-2 opacity-80">
            {trimmedChainName
              ? `产业链「${trimmedChainName}」：可指定 A 股标的后调用 Agent；不选则各环节由模型自行举例。`
              : '请先选择产业链'}
          </Typography>
          <StockPoolEntityEditor rows={entityRows} onChange={setEntityRows} enableMainTagMerge />
          <Typography level="body-xs" className="mt-1 opacity-70">
            已选 {entityRows.length} 只时将仅对这些股票分类；清空列表后确认则走发现模式（每环节不少于 3 只示例）。
          </Typography>
        </DialogContent>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="plain" size="sm" disabled={submitting} onClick={onCancel}>
            取消
          </Button>
          <Button
            size="sm"
            loading={submitting}
            disabled={!trimmedChainName}
            onClick={handleConfirm}
          >
            {entityRows.length > 0 ? `开始构建（${entityRows.length} 只）` : '开始构建（发现模式）'}
          </Button>
        </div>
      </ModalDialog>
    </Modal>
  );
}
