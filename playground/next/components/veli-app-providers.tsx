'use client';

import { useRouter } from 'next/navigation';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export function VeliAppProviders({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <VeliProvider
      language="en"
      colorScheme="light"
      navigate={(href, options) => {
        router.push(href, options);
      }}
    >
      {children}
    </VeliProvider>
  );
}
