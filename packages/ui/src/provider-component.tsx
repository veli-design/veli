'use client';

import * as React from 'react';
import { I18nProvider, RouterProvider } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import {
  getVeliLanguageConfig,
  VeliColorSchemeContext,
  VeliLanguageContext,
  VeliRouterContext,
  type VeliColorScheme,
  type VeliProviderProps,
  type VeliResolvedColorScheme,
  type VeliRouterConfig,
} from './provider-shared.js';
import { getVeliThemeScript, VELI_COLOR_SCHEME_STORAGE_KEY } from './theme-script.js';

export function VeliProvider({
  language = 'en',
  colorScheme = 'system',
  disableTransitionOnChange = false,
  navigate,
  useHref,
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
  const routerContext = React.useMemo<VeliRouterConfig | null>(
    () => (navigate != null ? { navigate, useHref } : null),
    [navigate, useHref],
  );

  useSyncThemeToDocument(colorScheme, disableTransitionOnChange);

  const content = (
    <div
      lang={config.lang}
      dir={config.direction}
      data-theme={resolvedColorScheme}
      data-color-scheme={colorScheme}
      className={twMerge('scheme-light dark:scheme-dark', isDark && 'dark', className)}
      suppressHydrationWarning
    >
      {children}
    </div>
  );

  return (
    <>
      <script suppressHydrationWarning dangerouslySetInnerHTML={{ __html: getVeliThemeScript() }} />
      <VeliLanguageContext.Provider value={config}>
        <VeliColorSchemeContext.Provider value={colorSchemeContext}>
          <VeliRouterContext.Provider value={routerContext}>
            <I18nProvider locale={config.locale}>
              {navigate != null ? (
                <RouterProvider navigate={navigate} useHref={useHref}>
                  {content}
                </RouterProvider>
              ) : (
                content
              )}
            </I18nProvider>
          </VeliRouterContext.Provider>
        </VeliColorSchemeContext.Provider>
      </VeliLanguageContext.Provider>
    </>
  );
}

function useResolvedColorScheme(colorScheme: VeliColorScheme): VeliResolvedColorScheme {
  const systemColorScheme = React.useSyncExternalStore(
    subscribeToColorScheme,
    getColorSchemeSnapshot,
    () => 'light' as const,
  );

  return colorScheme === 'system' ? systemColorScheme : colorScheme;
}

function subscribeToColorScheme(onStoreChange: () => void) {
  if (typeof window === 'undefined') return () => {};

  const query = window.matchMedia('(prefers-color-scheme: dark)');
  query.addEventListener('change', onStoreChange);

  const handleStorage = (e: StorageEvent) => {
    if (e.key === VELI_COLOR_SCHEME_STORAGE_KEY) onStoreChange();
  };
  window.addEventListener('storage', handleStorage);

  return () => {
    query.removeEventListener('change', onStoreChange);
    window.removeEventListener('storage', handleStorage);
  };
}

function getColorSchemeSnapshot(): VeliResolvedColorScheme {
  try {
    const stored = localStorage.getItem(VELI_COLOR_SCHEME_STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') return stored;
  } catch {
    // localStorage may be blocked
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function useSyncThemeToDocument(colorScheme: VeliColorScheme, disableTransitionOnChange: boolean) {
  React.useLayoutEffect(() => {
    const resolved = colorScheme === 'system' ? getColorSchemeSnapshot() : colorScheme;
    const isDark = resolved === 'dark';
    const root = document.documentElement;

    if (
      root.getAttribute('data-theme') === resolved &&
      root.classList.contains('dark') === isDark
    ) {
      return;
    }

    const reenable = disableTransitionOnChange ? disableAnimations() : null;
    root.classList.toggle('dark', isDark);
    root.setAttribute('data-theme', resolved);
    root.style.colorScheme = resolved;
    reenable?.();
  }, [colorScheme, disableTransitionOnChange]);
}

function disableAnimations(): () => void {
  const style = document.createElement('style');
  style.appendChild(
    document.createTextNode(
      `*,*::before,*::after{transition:none!important;animation:none!important}`,
    ),
  );
  document.head.appendChild(style);

  return () => {
    window.getComputedStyle(document.body);
    setTimeout(() => {
      style.parentNode?.removeChild(style);
    }, 1);
  };
}
