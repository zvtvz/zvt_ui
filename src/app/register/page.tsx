'use client';

import { useAuth } from '@/contexts/AuthContext';
import {
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Input,
  Typography,
} from '@mui/joy';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');
    const invite_code = String(formData.get('invite_code') || '').trim();

    if (password.length < 8) {
      setError('密码至少需要 8 位');
      setLoading(false);
      return;
    }

    try {
      await register({ email, password, invite_code });
      router.replace('/login?registered=1');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '注册失败，请重试'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8] px-4">
      <Card className="w-full max-w-[420px]" variant="outlined">
        <CardContent>
          <Typography level="h3" className="mb-1 text-center">
            注册账号
          </Typography>
          <Typography level="body-sm" className="mb-6 text-center text-gray-500">
            普通用户注册需要邀请码
          </Typography>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormControl required>
              <FormLabel>邮箱</FormLabel>
              <Input name="email" type="email" placeholder="name@example.com" />
            </FormControl>

            <FormControl required>
              <FormLabel>密码</FormLabel>
              <Input
                name="password"
                type="password"
                placeholder="至少 8 位"
                slotProps={{ input: { minLength: 8 } }}
              />
            </FormControl>

            <FormControl required>
              <FormLabel>邀请码</FormLabel>
              <Input name="invite_code" placeholder="请输入管理员提供的邀请码" />
            </FormControl>

            {error ? (
              <Typography level="body-sm" color="danger">
                {error}
              </Typography>
            ) : null}

            <Button type="submit" loading={loading} className="mt-2">
              注册
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">已有账号？</span>
            <Link href="/login" className="text-[#0d6efd] hover:underline">
              返回登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
