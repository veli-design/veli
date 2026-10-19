'use client';

import { useState } from 'react';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { ApplicationShell } from '../../shell-adapter';

const FLAG_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><rect width="18" height="12" fill="#D21034"/><rect x="3" y="3" width="8" height="6" fill="#007E3A"/><circle cx="8" cy="6" r="2" fill="#fff"/></svg>',
  );

const sampleNotice = {
  id: 'draft-mode',
  title: 'Preview',
  message: 'Only editors can see this version.',
  previewStatus: 'draft' as const,
  statusLabel: 'Draft',
  action: { href: '/shell', label: 'Exit preview' },
};

export default function ShellPage() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);

  return (
    <VeliProvider language={language} colorScheme={dark ? 'dark' : 'light'}>
      <div lang={language} dir={language === 'dv' ? 'rtl' : 'ltr'} className="min-h-screen">
        <ApplicationShell
          language={language}
          onLanguageChange={(id) => setLanguage(id === 'dv' ? 'dv' : 'en')}
          colorScheme={dark ? 'dark' : 'light'}
          onColorSchemeChange={(scheme) => setDark(scheme === 'dark')}
          flagSrc={FLAG_SRC}
          notices={[sampleNotice]}
        >
          <div className="p-6">
            <h1>Shell fixture</h1>
            <p>Open the app switcher to fade this main landmark and hide the notice.</p>
            <button type="button" onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
              Fixture language
            </button>{' '}
            <button type="button" onClick={() => setDark(!dark)}>
              Fixture theme
            </button>
            <div className="h-[120vh]" aria-hidden />
          </div>
        </ApplicationShell>
      </div>
    </VeliProvider>
  );
}
