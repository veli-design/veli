import { useState } from 'react';
import { PageNavigationFooter } from '@tradenetcorp/veli-blocks/page-navigation-footer';
import { pageNavigationFooterContent } from '@tradenetcorp/veli-blocks/examples/page-navigation-footer-content';
import { VeliProvider } from '@veli-design/react/provider';

export function PageNavigationFooterDemo() {
  const [language, setLanguage] = useState<'en' | 'dv'>('en');
  const [dark, setDark] = useState(false);
  const content = pageNavigationFooterContent(language);
  return (
    <div className="overflow-hidden rounded-xl border border-border-base-muted">
      <div className="type-body-sm-regular flex flex-wrap gap-4 p-4">
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
        <PageNavigationFooter
          {...content}
          identity={{
            ...content.identity,
            logo: (
              <img
                src="/blocks/example-organization-emblem.svg"
                alt=""
                width={61}
                height={70}
                className="object-contain"
              />
            ),
          }}
        />
      </VeliProvider>
    </div>
  );
}
