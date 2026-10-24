'use client';

import type { ReactNode } from 'react';
import { VeliProvider } from '@veli-design/react/provider';
import { createToastQueue, ToastRegion, type VeliToastContent } from '@veli-design/react/toast';

export const appToastQueue = createToastQueue<VeliToastContent>();

export function VeliAppShell({ children }: { children: ReactNode }) {
  return (
    <VeliProvider language="en" colorScheme="system">
      {children}
      <ToastRegion queue={appToastQueue} placement="bottom-end" />
    </VeliProvider>
  );
}
