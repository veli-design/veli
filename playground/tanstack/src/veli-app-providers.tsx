import * as React from 'react';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export function VeliAppProviders({ children }: { children: React.ReactNode }) {
  return (
    <VeliProvider language="en" colorScheme="light">
      {children}
    </VeliProvider>
  );
}
