'use client';

import LoginForm from '@/app/login/LoginForm';
import { CircularProgress } from '@mui/joy';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#f8f8f8]">
          <CircularProgress color="primary" size="md" variant="soft" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
