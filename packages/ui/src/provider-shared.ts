import * as React from 'react';
import type { RouterProvider } from 'react-aria-components';

export const veliLanguageConfigs = {
  en: {
    language: 'en',
    locale: 'en-GB',
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

type VeliRouterProviderProps = React.ComponentProps<typeof RouterProvider>;

export type VeliRouterConfig = {
  navigate: NonNullable<VeliRouterProviderProps['navigate']>;
  useHref?: VeliRouterProviderProps['useHref'];
};

export interface VeliProviderProps {
  language?: VeliLanguage;
  colorScheme?: VeliColorScheme;
  /** Suppress CSS transitions for one frame while the theme changes. */
  disableTransitionOnChange?: boolean;
  /**
   * Client-side navigate function for React Aria link components.
   * When set, Veli wraps the subtree in React Aria's `RouterProvider`.
   */
  navigate?: VeliRouterProviderProps['navigate'];
  /** Optional href resolver for the configured client-side router. */
  useHref?: VeliRouterProviderProps['useHref'];
  children: React.ReactNode;
  className?: string;
}

export const VeliLanguageContext = React.createContext<VeliLanguageConfig>(veliLanguageConfigs.en);
export const VeliColorSchemeContext = React.createContext<{
  colorScheme: VeliColorScheme;
  resolvedColorScheme: VeliResolvedColorScheme;
}>({
  colorScheme: 'system',
  resolvedColorScheme: 'light',
});
export const VeliRouterContext = React.createContext<VeliRouterConfig | null>(null);

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

export function useVeliRouter() {
  return React.useContext(VeliRouterContext);
}
