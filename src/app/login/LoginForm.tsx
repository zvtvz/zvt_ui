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
import { useRouter, useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const registered = searchParams.get('registered') === '1';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') || '').trim();
    const password = String(formData.get('password') || '');

    try {
      await login({ email, password });
      const redirect = searchParams.get('redirect') || '/trade';
      router.replace(redirect.startsWith('/') ? redirect : '/trade');
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : '登录失败，请重试'
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
            登录 ZVT
          </Typography>
          <Typography level="body-sm" className="mb-6 text-center text-gray-500">
            使用邮箱和密码登录
          </Typography>

          {registered ? (
            <Typography level="body-sm" color="success" className="mb-4">
              注册成功，请登录
            </Typography>
          ) : null}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <FormControl required>
              <FormLabel>邮箱</FormLabel>
              <Input name="email" type="email" placeholder="name@example.com" />
            </FormControl>

            <FormControl required>
              <FormLabel>密码</FormLabel>
              <Input name="password" type="password" placeholder="请输入密码" />
            </FormControl>

            {error ? (
              <Typography level="body-sm" color="danger">
                {error}
              </Typography>
            ) : null}

            <Button type="submit" loading={loading} className="mt-2">
              登录
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm">
            <span className="text-gray-500">还没有账号？</span>
            <Link href="/register" className="text-[#0d6efd] hover:underline">
              注册
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
