import services from '@/services';
import {
  Modal,
  ModalDialog,
  DialogTitle,
  DialogContent,
  Stack,
  FormControl,
  Button,
  Checkbox,
  Input,
  FormLabel,
  Divider,
  Select,
  Option,
} from '@mui/joy';
import { useState } from 'react';

type Props = {
  open: boolean;
  onSubmit: () => void;
  stocks: any[];
  onCancel: () => void;
};

export default function SellDialog({
  open,
  stocks,
  onSubmit,
  onCancel,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState('normal');

  return (
    <Modal open={open} onClose={onCancel}>
      <ModalDialog className="w-[510px] !text-[14px]">
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            setLoading(true);
            const formData = new FormData(event.currentTarget);
            let keys = Array.from(formData.keys());
            const data: any = {
              entity_ids: [],
              weights: [],
            };

            keys.map((key) => {
              if (key === 'position_type') {
                data[key] = formData.get(key);
              } else if (key === 'position_pct') {
                data[key] = Number(formData.get(key)) / 100;
              } else {
                data.entity_ids.push(key);
                data.weights.push(Number(formData.get(key)));
              }
            });
            try {
              await services.sellStocks(data);
              onSubmit();
            } finally {
              setLoading(false);
            }
          }}
        >
          <div className="flex flex-row items-center mb-4 pb-4 border-b">
            <div className="mr-2 w-[130px] text-right">卖出额度:</div>
            <Input
              placeholder="百分比"
              size="sm"
              className="text-right"
              required
              name="position_pct"
              endDecorator={
                <>
                  <span className="w-6 text-center">%</span>
                  <Divider orientation="vertical" />
                  <Select
                    variant="plain"
                    value={type}
                    onChange={(_, value) => setType(value as any)}
                    size="sm"
                    name="position_type"
                    slotProps={{
                      listbox: {
                        variant: 'outlined',
                      },
                    }}
                    sx={{ mr: -1, '&:hover': { bgcolor: 'transparent' } }}
                  >
                    <Option value="normal">仓位</Option>
                  </Select>
                </>
              }
              sx={{ width: 140 }}
            />
          </div>
          <div className="flex flex-row flex-wrap max-h-[300px] items-start min-h-[100px] overflow-auto">
            {stocks.map((stock: any) => (
              <FormControl
                key={stock.entity_id}
                className="mr-0 mb-2 flex !flex-row !items-center"
              >
                <div className="mr-2 w-[130px] text-right opacity-75">
                  {stock.name}:
                </div>
                <Input
                  className="w-[70px] text-right"
                  size="sm"
                  name={stock.entity_id}
                  required
                  placeholder="权重"
                  type="number"
                />
              </FormControl>
            ))}
          </div>
          <div className="text-right mt-4">
            <Button onClick={onCancel} size="sm">
              取消
            </Button>
            <Button type="submit" className="!ml-2" size="sm" loading={loading}>
              确定
            </Button>
          </div>
        </form>
      </ModalDialog>
    </Modal>
  );
}
