'use client';

import type { ReactNode } from 'react';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { createToastQueue, ToastRegion, type VeliToastContent } from '@tradenetcorp/veli-ui/toast';

export const appToastQueue = createToastQueue<VeliToastContent>();

export function VeliAppShell({ children }: { children: ReactNode }) {
  return (
    <VeliProvider language="en" colorScheme="system">
      {children}
      <ToastRegion queue={appToastQueue} placement="bottom-end" />
    </VeliProvider>
  );
}
