'use client';
import { useState } from 'react';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { ApplicationFooter } from '../footer-adapter';
import { SiteFooter } from '../components/blocks/site-footer/site-footer';

export default function Page() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  const [long, setLong] = useState(false);
  return (
    <VeliProvider language={language} colorScheme={dark ? 'dark' : 'light'}>
      <div
        lang={language}
        dir={language === 'dv' ? 'rtl' : 'ltr'}
        className="bg-surface-raised text-text-base min-h-screen"
      >
        <main className="p-4">
          <h1>Footer consumer fixture</h1>
          <button onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
            Change language
          </button>{' '}
          <button onClick={() => setDark(!dark)}>Change theme</button>{' '}
          <button onClick={() => setLong(!long)}>Long labels</button>
        </main>
        {language === 'en' && !long ? (
          <ApplicationFooter />
        ) : (
          <SiteFooter
            startLinks={[
              {
                id: 'about',
                label: long ? 'މިޚިދުމަތާއި ގުޅޭ ތަފްސީލު މަޢުލޫމާތު '.repeat(8) : 'ތަޢާރަފު',
                href: '/about',
              },
            ]}
            endLinks={[{ id: 'privacy', label: 'ޕްރައިވަސީ', href: '/privacy' }]}
          />
        )}
      </div>
    </VeliProvider>
  );
}
