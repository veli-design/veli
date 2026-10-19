'use client';

import { useState } from 'react';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { ApplicationPreviewBanner } from '../../preview-banner-adapter';

const sampleNotice = {
  id: 'draft-mode',
  title: 'Preview',
  message: 'Only editors can see this version.',
  previewStatus: 'draft' as const,
  statusLabel: 'Draft',
  action: { href: '/preview-banner', label: 'Exit preview' },
};

export default function PreviewBannerPage() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [hidden, setHidden] = useState(false);

  return (
    <VeliProvider language={language} colorScheme="light">
      <div
        lang={language}
        dir={language === 'dv' ? 'rtl' : 'ltr'}
        className="bg-surface-raised min-h-screen"
      >
        <main className="p-6">
          <h1>Preview banner fixture</h1>
          <p>Toggle visibility to exercise the floating banner and scroll spacer.</p>
          <button type="button" onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>
            Fixture language
          </button>{' '}
          <button type="button" onClick={() => setHidden((value) => !value)}>
            {hidden ? 'Show banner' : 'Hide banner'}
          </button>
          <div className="h-[120vh]" aria-hidden />
        </main>
        <ApplicationPreviewBanner notices={[sampleNotice]} hidden={hidden} />
      </div>
    </VeliProvider>
  );
}
