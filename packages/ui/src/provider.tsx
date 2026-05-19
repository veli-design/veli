"use client";

import * as React from "react";
import { I18nProvider } from "react-aria-components";

const coralLanguageConfigs = {
  en: {
    language: "en",
    locale: "en-US",
    lang: "en",
    direction: "ltr",
  },
  dv: {
    language: "dv",
    locale: "dv-MV",
    lang: "dv",
    direction: "rtl",
  },
} as const;

export type CoralLanguage = keyof typeof coralLanguageConfigs;
export type CoralLanguageConfig =
  (typeof coralLanguageConfigs)[CoralLanguage];
export type CoralDirection = CoralLanguageConfig["direction"];

export interface CoralProviderProps {
  language?: CoralLanguage;
  children: React.ReactNode;
}

const CoralLanguageContext = React.createContext<CoralLanguageConfig>(
  coralLanguageConfigs.en,
);

export function getCoralLanguageConfig(): typeof coralLanguageConfigs.en;
export function getCoralLanguageConfig<TLanguage extends CoralLanguage>(
  language: TLanguage,
): (typeof coralLanguageConfigs)[TLanguage];
export function getCoralLanguageConfig(language: CoralLanguage = "en") {
  return coralLanguageConfigs[language];
}

export function useCoralLanguage() {
  return React.useContext(CoralLanguageContext);
}

export function CoralProvider({
  language = "en",
  children,
}: CoralProviderProps) {
  const config = getCoralLanguageConfig(language);

  return (
    <CoralLanguageContext.Provider value={config}>
      <I18nProvider locale={config.locale}>
        <div
          lang={config.lang}
          dir={config.direction}
          data-coral-language={config.language}
          data-coral-direction={config.direction}
        >
          {children}
        </div>
      </I18nProvider>
    </CoralLanguageContext.Provider>
  );
}
