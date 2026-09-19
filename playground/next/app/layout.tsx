import type { Metadata } from 'next';
import { VeliAppProviders } from '@/components/veli-app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veli — Next.js playground',
  description: 'Clean Next.js App Router playground for verifying Veli components.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <VeliAppProviders>
          <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-8">{children}</main>
        </VeliAppProviders>
      </body>
    </html>
  );
}
