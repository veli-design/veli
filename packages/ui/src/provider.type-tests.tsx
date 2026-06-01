import { VeliProvider, getVeliLanguageConfig, useVeliLanguage } from './provider';

export function ProviderTypeExpectations() {
  const currentLanguage = useVeliLanguage();
  const direction: 'ltr' | 'rtl' = currentLanguage.direction;

  return (
    <>
      <VeliProvider>
        <div />
      </VeliProvider>
      <VeliProvider language="en">
        <div />
      </VeliProvider>
      <VeliProvider language="dv">
        <div />
      </VeliProvider>

      {/* @ts-expect-error Veli only supports English and Dhivehi. */}
      <VeliProvider language="ar">
        <div />
      </VeliProvider>

      <span>{direction}</span>
    </>
  );
}

const defaultConfig = getVeliLanguageConfig();
const defaultLanguage: 'en' = defaultConfig.language;
const defaultDirection: 'ltr' = defaultConfig.direction;

const englishConfig = getVeliLanguageConfig('en');
const englishLocale: 'en-US' = englishConfig.locale;
const englishLang: 'en' = englishConfig.lang;
const englishDirection: 'ltr' = englishConfig.direction;

const dhivehiConfig = getVeliLanguageConfig('dv');
const dhivehiLocale: 'dv-MV' = dhivehiConfig.locale;
const dhivehiLang: 'dv' = dhivehiConfig.lang;
const dhivehiDirection: 'rtl' = dhivehiConfig.direction;

// @ts-expect-error Unsupported languages should not resolve config.
getVeliLanguageConfig('ar');

void defaultLanguage;
void defaultDirection;
void englishLocale;
void englishLang;
void englishDirection;
void dhivehiLocale;
void dhivehiLang;
void dhivehiDirection;
