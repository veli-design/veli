import * as React from 'react';

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

export interface VeliProviderProps {
  language?: VeliLanguage;
  colorScheme?: VeliColorScheme;
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
