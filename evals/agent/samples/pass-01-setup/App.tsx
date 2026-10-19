import { VeliProvider } from '@tradenetcorp/veli-ui/provider';

export function App({ children }: { children: React.ReactNode }) {
  return (
    <VeliProvider language="en" colorScheme="system">
      {children}
    </VeliProvider>
  );
}
