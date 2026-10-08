'use client';

import { useState } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { ApplicationFooter } from '../footer-adapter';
import { ApplicationHeader } from '../header-adapter';
import { SiteFooter } from '../components/blocks/site-footer/site-footer';

const FLAG_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><rect width="18" height="12" fill="#D21034"/><rect x="3" y="3" width="8" height="6" fill="#007E3A"/><circle cx="8" cy="6" r="2" fill="#fff"/></svg>',
  );

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
        <ApplicationHeader
          language={language}
          onLanguageChange={(id) => setLanguage(id === 'dv' ? 'dv' : 'en')}
          colorScheme={dark ? 'dark' : 'light'}
          onColorSchemeChange={(scheme) => setDark(scheme === 'dark')}
          flagSrc={FLAG_SRC}
          actions={
            <Button intent="accent" appearance="fill" size="md">
              Sign In
            </Button>
          }
        />
        <main className="p-4">
          <h1>Blocks consumer fixture</h1>
          <button onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
            Fixture language
          </button>{' '}
          <button onClick={() => setDark(!dark)}>Fixture theme</button>{' '}
          <button onClick={() => setLong(!long)}>Long labels</button>
          <div className="h-[120vh]" aria-hidden />
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
