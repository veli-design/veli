import { CoralProvider, getCoralLanguageConfig, useCoralLanguage } from './provider';

export function ProviderTypeExpectations() {
  const currentLanguage = useCoralLanguage();
  const direction: 'ltr' | 'rtl' = currentLanguage.direction;

  return (
    <>
      <CoralProvider>
        <div />
      </CoralProvider>
      <CoralProvider language="en">
        <div />
      </CoralProvider>
      <CoralProvider language="dv">
        <div />
      </CoralProvider>

      {/* @ts-expect-error Coral only supports English and Dhivehi. */}
      <CoralProvider language="ar">
        <div />
      </CoralProvider>

      <span>{direction}</span>
    </>
  );
}

const defaultConfig = getCoralLanguageConfig();
const defaultLanguage: 'en' = defaultConfig.language;
const defaultDirection: 'ltr' = defaultConfig.direction;

const englishConfig = getCoralLanguageConfig('en');
const englishLocale: 'en-US' = englishConfig.locale;
const englishLang: 'en' = englishConfig.lang;
const englishDirection: 'ltr' = englishConfig.direction;

const dhivehiConfig = getCoralLanguageConfig('dv');
const dhivehiLocale: 'dv-MV' = dhivehiConfig.locale;
const dhivehiLang: 'dv' = dhivehiConfig.lang;
const dhivehiDirection: 'rtl' = dhivehiConfig.direction;

// @ts-expect-error Unsupported languages should not resolve config.
getCoralLanguageConfig('ar');

void defaultLanguage;
void defaultDirection;
void englishLocale;
void englishLang;
void englishDirection;
void dhivehiLocale;
void dhivehiLang;
void dhivehiDirection;
