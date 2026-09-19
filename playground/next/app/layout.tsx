import type { Metadata } from 'next';
import { VeliAppProviders } from '@/components/veli-app-providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Veli Tabs — Next.js playground',
  description: 'Temporary PD-914 Tabs href navigation playground for Next.js App Router.',
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
