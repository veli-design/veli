'use client';

import * as React from 'react';
import { I18nProvider } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import {
  getVeliLanguageConfig,
  VeliColorSchemeContext,
  VeliLanguageContext,
  type VeliColorScheme,
  type VeliProviderProps,
  type VeliResolvedColorScheme,
} from './provider-shared';

export function VeliProvider({
  language = 'en',
  colorScheme = 'system',
  children,
  className,
}: VeliProviderProps) {
  const config = getVeliLanguageConfig(language);
  const resolvedColorScheme = useResolvedColorScheme(colorScheme);
  const isDark = resolvedColorScheme === 'dark';
  const colorSchemeContext = React.useMemo(
    () => ({ colorScheme, resolvedColorScheme }),
    [colorScheme, resolvedColorScheme],
  );

  return (
    <VeliLanguageContext.Provider value={config}>
      <VeliColorSchemeContext.Provider value={colorSchemeContext}>
        <I18nProvider locale={config.locale}>
          <div
            lang={config.lang}
            dir={config.direction}
            data-theme={resolvedColorScheme}
            data-color-scheme={colorScheme}
            className={twMerge('scheme-light dark:scheme-dark', isDark && 'dark', className)}
          >
            {children}
          </div>
        </I18nProvider>
      </VeliColorSchemeContext.Provider>
    </VeliLanguageContext.Provider>
  );
}

function useResolvedColorScheme(colorScheme: VeliColorScheme): VeliResolvedColorScheme {
  const systemColorScheme = React.useSyncExternalStore(
    subscribeToSystemColorScheme,
    getSystemColorSchemeSnapshot,
    getServerSystemColorSchemeSnapshot,
  );

  return colorScheme === 'system' ? systemColorScheme : colorScheme;
}

function subscribeToSystemColorScheme(onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {};
  }

  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', onStoreChange);

  return () => {
    query.removeEventListener('change', onStoreChange);
  };
}

function getSystemColorSchemeSnapshot(): VeliResolvedColorScheme {
  if (typeof window === 'undefined') {
    return getServerSystemColorSchemeSnapshot();
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getServerSystemColorSchemeSnapshot(): VeliResolvedColorScheme {
  return 'light';
}
