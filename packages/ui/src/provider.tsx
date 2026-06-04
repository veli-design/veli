'use client';

import * as React from 'react';
import { I18nProvider } from 'react-aria-components';
import { twMerge } from 'tailwind-merge';

const veliLanguageConfigs = {
  en: {
    language: 'en',
    locale: 'en-US',
    lang: 'en',
    direction: 'ltr',
  },
  dv: {
    language: 'dv',
    locale: 'dv-MV',
    lang: 'dv',
    direction: 'rtl',
  },
} as const;

export type VeliLanguage = keyof typeof veliLanguageConfigs;
export type VeliLanguageConfig = (typeof veliLanguageConfigs)[VeliLanguage];
export type VeliDirection = VeliLanguageConfig['direction'];
export type VeliColorScheme = 'light' | 'dark' | 'system';
export type VeliResolvedColorScheme = Exclude<VeliColorScheme, 'system'>;

export interface VeliProviderProps {
  language?: VeliLanguage;
  colorScheme?: VeliColorScheme;
  children: React.ReactNode;
  className?: string;
}

const VeliLanguageContext = React.createContext<VeliLanguageConfig>(veliLanguageConfigs.en);
const VeliColorSchemeContext = React.createContext<{
  colorScheme: VeliColorScheme;
  resolvedColorScheme: VeliResolvedColorScheme;
}>({
  colorScheme: 'system',
  resolvedColorScheme: 'light',
});

export function getVeliLanguageConfig(): typeof veliLanguageConfigs.en;
export function getVeliLanguageConfig<TLanguage extends VeliLanguage>(
  language: TLanguage,
): (typeof veliLanguageConfigs)[TLanguage];
export function getVeliLanguageConfig(language: VeliLanguage = 'en') {
  return veliLanguageConfigs[language];
}

export function useVeliLanguage() {
  return React.useContext(VeliLanguageContext);
}

export function useVeliColorScheme() {
  return React.useContext(VeliColorSchemeContext);
}

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
  const [systemColorScheme, setSystemColorScheme] =
    React.useState<VeliResolvedColorScheme>('light');

  React.useEffect(() => {
    if (colorScheme !== 'system' || typeof window === 'undefined') return;

    const query = window.matchMedia('(prefers-color-scheme: dark)');
    const updateSystemColorScheme = () => {
      setSystemColorScheme(query.matches ? 'dark' : 'light');
    };

    updateSystemColorScheme();
    query.addEventListener('change', updateSystemColorScheme);

    return () => {
      query.removeEventListener('change', updateSystemColorScheme);
    };
  }, [colorScheme]);

  return colorScheme === 'system' ? systemColorScheme : colorScheme;
}
