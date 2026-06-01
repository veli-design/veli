'use client';

import * as React from 'react';
import { I18nProvider } from 'react-aria-components';

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

export interface VeliProviderProps {
  language?: VeliLanguage;
  children: React.ReactNode;
}

const VeliLanguageContext = React.createContext<VeliLanguageConfig>(veliLanguageConfigs.en);

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

export function VeliProvider({ language = 'en', children }: VeliProviderProps) {
  const config = getVeliLanguageConfig(language);

  return (
    <VeliLanguageContext.Provider value={config}>
      <I18nProvider locale={config.locale}>
        <div lang={config.lang} dir={config.direction}>
          {children}
        </div>
      </I18nProvider>
    </VeliLanguageContext.Provider>
  );
}
