import { VeliProvider } from '@veli-design/react/provider';

export function App({ children }: { children: React.ReactNode }) {
  return (
    <VeliProvider language="en" colorScheme="system">
      {children}
    </VeliProvider>
  );
}
