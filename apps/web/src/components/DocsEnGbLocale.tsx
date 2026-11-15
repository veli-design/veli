import type { ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components';

/** Match Storybook / VeliProvider `language="en"` → `en-GB` date segments. */
export function DocsEnGbLocale({ children }: { children: ReactNode }) {
  return <I18nProvider locale="en-GB">{children}</I18nProvider>;
}
