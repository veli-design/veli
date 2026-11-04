'use client';

import { useState } from 'react';
import { VeliProvider } from '@veli-design/react/provider';
import { ServiceDetail } from '../../../components/blocks/service-detail/service-detail';
import { ServiceDetailComposition } from '../../../service-detail-composition';
import { serviceDetailContent } from '../../../service-detail-content';

export default function CompositionFixture() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  const [defaultOpen, setDefaultOpen] = useState(false);
  const data = serviceDetailContent(language);
  return (
    <>
      <button onClick={() => setLanguage(language === 'en' ? 'dv' : 'en')}>Fixture language</button>
      <button onClick={() => setDark(!dark)}>Fixture theme</button>
      <button onClick={() => setOpen(true)}>Open controlled guideline</button>
      <button onClick={() => setDefaultOpen(true)}>Mount default-open guideline</button>
      <output aria-label="Controlled open">{String(open)}</output>
      <main>
        <VeliProvider language={language} colorScheme={dark ? 'dark' : 'light'}>
          <ServiceDetailComposition id="first" language={language} />
          <ServiceDetailComposition id="second" language={language} />
          <div id="controlled">
            <ServiceDetail {...data} isGuidelineOpen={open} onGuidelineOpenChange={setOpen} />
          </div>
          {defaultOpen && (
            <div id="default-open">
              <ServiceDetail {...data} defaultGuidelineOpen />
            </div>
          )}
        </VeliProvider>
      </main>
    </>
  );
}
