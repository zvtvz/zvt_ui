'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Typography,
  Alert,
} from '@mui/joy';
import { FiUser, FiLock } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import services from '@/services';
import { TokenManager } from '@/services/http';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // 使用认证检查
  const { isLoading: authLoading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setLoading(true);

    try {
      // 调用真实的登录API
      const data = await services.login({
        grant_type: 'password',
        username,
        password,
      });
      TokenManager.setToken(data.access_token);

      // 登录成功后跳转到交易页面
      router.push('/trade');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 认证检查加载中
  if (authLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: '#f8fafc',
        }}
      >
        <Box sx={{ textAlign: 'center' }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '3px solid #e2e8f0',
              borderTop: '3px solid #3b82f6',
              animation: 'spin 1s linear infinite',
              mx: 'auto',
              mb: 2,
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          />
          <Typography
            level="body-lg"
            sx={{ color: '#64748b', fontWeight: 400 }}
          >
            检查登录状态...
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        paddingTop: '15vh',
        paddingBottom: '25vh',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 420,
        }}
      >
        {/* 品牌标题 */}

        {/* 登录卡片 */}
        <Card
          variant="outlined"
          sx={{
            background: 'white',
            borderRadius: 20,
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.08)',
            border: '1px solid #e2e8f0',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography
                level="h3"
                sx={{
                  fontWeight: 600,
                  color: '#1e293b',
                  mb: 1,
                }}
              >
                ZVT UI
              </Typography>
              <Typography
                level="body-sm"
                sx={{
                  color: '#64748b',
                }}
              >
                请输入您的登录信息
              </Typography>
            </Box>

            {error && (
              <Alert
                color="danger"
                variant="soft"
                sx={{
                  mb: 3,
                  borderRadius: 10,
                  border: 'none',
                }}
              >
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Stack gap={3}>
                <FormControl required>
                  <FormLabel
                    sx={{
                      fontWeight: 500,
                      color: '#374151',
                      mb: 1,
                    }}
                  >
                    用户名
                  </FormLabel>
                  <Input
                    placeholder="请输入用户名"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    startDecorator={<FiUser size={18} color="#64748b" />}
                    size="lg"
                    disabled={loading}
                    sx={{
                      borderRadius: 10,
                      fontSize: '1rem',
                      py: 1.2,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        borderColor: '#cbd5e1',
                      },
                      '&:focus-within': {
                        backgroundColor: 'white',
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset',
                        WebkitTextFillColor: '#374151',
                        borderRadius: 'inherit',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #f1f5f9 inset',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                      },
                    }}
                  />
                </FormControl>

                <FormControl required>
                  <FormLabel
                    sx={{
                      fontWeight: 500,
                      color: '#374151',
                      mb: 1,
                    }}
                  >
                    密码
                  </FormLabel>
                  <Input
                    placeholder="请输入密码"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    startDecorator={<FiLock size={18} color="#64748b" />}
                    size="lg"
                    disabled={loading}
                    sx={{
                      borderRadius: 10,
                      fontSize: '1rem',
                      py: 1.2,
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      '&:hover': {
                        backgroundColor: '#f1f5f9',
                        borderColor: '#cbd5e1',
                      },
                      '&:focus-within': {
                        backgroundColor: 'white',
                        borderColor: '#3b82f6',
                        boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset',
                        WebkitTextFillColor: '#374151',
                        borderRadius: 'inherit',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #f1f5f9 inset',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                      },
                    }}
                  />
                </FormControl>

                <Button
                  type="submit"
                  fullWidth
                  loading={loading}
                  size="lg"
                  sx={{
                    mt: 2,
                    borderRadius: 10,
                    backgroundColor: '#3b82f6',
                    fontSize: '1rem',
                    fontWeight: 600,
                    py: 1.5,
                    '&:hover': {
                      backgroundColor: '#2563eb',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 8px 25px rgba(59, 130, 246, 0.25)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  登录
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>

        {/* 版权信息 */}
        <Typography
          level="body-xs"
          sx={{
            textAlign: 'center',
            color: '#94a3b8',
            mt: 4,
          }}
        >
          © 2025 ZVT UI. 保留所有权利。
        </Typography>
      </Box>
    </Box>
  );
}
