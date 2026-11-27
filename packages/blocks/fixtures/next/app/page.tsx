'use client';

import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { VeliProvider } from '@veli-design/react/provider';
import { ApplicationFooter } from '../footer-adapter';
import { ApplicationHeader } from '../header-adapter';
import {
  SiteFooter,
  SiteFooterThemeToggle,
  type SiteFooterColorScheme,
} from '../components/blocks/site-footer/site-footer';

const FLAG_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><rect width="18" height="12" fill="#D21034"/><rect x="3" y="3" width="8" height="6" fill="#007E3A"/><circle cx="8" cy="6" r="2" fill="#fff"/></svg>',
  );

export default function Page() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  const [colorScheme, setColorScheme] = useState<SiteFooterColorScheme>('system');
  const [long, setLong] = useState(false);
  const [entityTitle, setEntityTitle] = useState<string | undefined>();
  const changeColorScheme = (next: SiteFooterColorScheme) => {
    setColorScheme(next);
    setDark(next === 'dark');
  };
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
          title={entityTitle}
          actions={
            <Button intent="accent" appearance="fill" size="md">
              Sign In
            </Button>
          }
        />
        <main id="main-content" tabIndex={-1} className="p-4 focus:outline-none">
          <h1>Blocks consumer fixture</h1>
          <button onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
            Fixture language
          </button>{' '}
          <button onClick={() => setDark(!dark)}>Fixture theme</button>{' '}
          <button onClick={() => setLong(!long)}>Long labels</button>{' '}
          <button
            type="button"
            onClick={() =>
              setEntityTitle(
                'Ministry of Fisheries, Agriculture and Ocean Resources, Longer Affairs, National Planning, Coastal Administration, and Maritime Safety',
              )
            }
          >
            Long entity
          </button>
          {/* Host editable outside the switcher panel — keyboard capture must not steal keys. */}
          <label className="mt-4 block">
            Host notes
            <textarea aria-label="Host notes" className="mt-1 block w-full border p-2" rows={3} />
          </label>
          <div className="h-[120vh]" aria-hidden />
        </main>
        {language === 'en' && !long ? (
          <ApplicationFooter colorScheme={colorScheme} onColorSchemeChange={changeColorScheme} />
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
            endSlot={
              <SiteFooterThemeToggle
                colorScheme={colorScheme}
                onColorSchemeChange={changeColorScheme}
                labels={{
                  change: 'ތީމު ބަދަލުކުރަން',
                  label: 'ތީމު',
                  light: 'އަލި',
                  dark: 'އަނދިރި',
                  auto: 'އޮޓޯ',
                }}
              />
            }
          />
        )}
      </div>
    </VeliProvider>
  );
}
