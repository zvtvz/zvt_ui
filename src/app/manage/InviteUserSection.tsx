'use client';

import type { InviteCodeItem } from '@/interfaces/auth';
import services from '@/services';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
} from '@mui/joy';
import { FormEvent, useState } from 'react';

export default function InviteUserSection() {
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setError('');
    setSuccess('');
    setCreating(true);

    const formData = new FormData(form);
    const email = String(formData.get('email') || '').trim();

    try {
      const created = (await services.createInviteCode({ email })) as InviteCodeItem;
      setSuccess(`已为 ${email} 生成邀请码：${created.code}`);
      form.reset();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '生成邀请码失败'
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <Box sx={{ maxWidth: 480 }}>
      <div className="flex flex-row justify-between items-center mb-2">
        <span className="opacity-85 text-sm">邀请新用户</span>
      </div>

      <form onSubmit={handleCreate}>
        <Stack spacing={2}>
          <FormControl required>
            <FormLabel sx={{ fontSize: 13 }}>邮箱</FormLabel>
            <Input
              name="email"
              type="email"
              size="sm"
              placeholder="user@example.com"
            />
          </FormControl>

          {error ? (
            <Typography level="body-sm" color="danger">
              {error}
            </Typography>
          ) : null}
          {success ? (
            <Typography level="body-sm" color="success">
              {success}
            </Typography>
          ) : null}

          <Box>
            <Button
              type="submit"
              size="sm"
              variant="soft"
              className="!text-[12px] !py-1"
              loading={creating}
            >
              生成邀请码
            </Button>
          </Box>
        </Stack>
      </form>

      <Typography level="body-xs" textColor="neutral.500" sx={{ mt: 1.5 }}>
        已注册邮箱无法再次邀请；邀请码默认 30 天内有效。生成后可在「邀请码」页查看。
      </Typography>
    </Box>
  );
}
