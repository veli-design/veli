import * as React from 'react';
import { useRouter } from '@tanstack/react-router';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export function VeliAppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <VeliProvider
      language="en"
      colorScheme="light"
      navigate={(to, options) => {
        void router.navigate({ to, ...options });
      }}
      useHref={(to) => router.buildLocation({ to }).href}
    >
      {children}
    </VeliProvider>
  );
}
