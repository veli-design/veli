import { useState } from 'react';
import { ErrorPagePreview } from '@tradenetcorp/veli-blocks/examples/error-page-preview';
import type { ErrorPageKind } from '@tradenetcorp/veli-blocks/error-page';
import { VeliProvider } from '@veli-design/react/provider';

export function ErrorPageDemo() {
  const [kind, setKind] = useState<ErrorPageKind>('404');
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-border-base-muted">
      <div className="type-body-sm-regular flex flex-wrap items-center gap-4 p-4">
        <label>
          Error state{' '}
          <select value={kind} onChange={(event) => setKind(event.target.value as ErrorPageKind)}>
            {['404', '500', '503', '403', '401', 'offline'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Language{' '}
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as 'en' | 'dv')}
          >
            <option value="en">English</option>
            <option value="dv">ދިވެހި</option>
          </select>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={dark}
            onChange={(event) => setDark(event.target.checked)}
          />{' '}
          Dark mode
        </label>
      </div>
      <VeliProvider language={language} colorScheme={dark ? 'dark' : 'light'}>
        <ErrorPagePreview kind={kind} headingLevel={2} />
      </VeliProvider>
    </div>
  );
}
