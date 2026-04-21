import { Suspense } from 'react';

import EnergyShell from './EnergyShell';

export default function EnergyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="pl-2 pr-2 py-4">
          <p className="text-sm text-neutral-500">加载中…</p>
        </div>
      }
    >
      <EnergyShell>{children}</EnergyShell>
    </Suspense>
  );
}
