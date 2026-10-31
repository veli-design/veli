import { useState, useSyncExternalStore, type ReactNode } from 'react';
import { parseDate } from '@internationalized/date';
import { VeliProvider, type VeliColorScheme } from '@veli-design/react/provider';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';
import { I18nProvider } from 'react-aria-components';
import { DatePicker } from '@veli-design/react/date-picker';

/** Match Storybook / VeliProvider `language="en"` → `en-GB` date segments. */
function DocsEnGbLocale({ children }: { children: ReactNode }) {
  return <I18nProvider locale="en-GB">{children}</I18nProvider>;
}

export function DatePickerUsageDemo() {
  return (
    <DocsEnGbLocale>
      <div className="w-full min-w-0 max-w-[284px]">
        <DatePicker
          label="Appointment date"
          isOptional
          infoTooltip="Type a date or choose one from the calendar."
          description="Type a date or choose one from the calendar."
        />
      </div>
    </DocsEnGbLocale>
  );
}

export function DatePickerAppearancesDemo() {
  return (
    <DocsEnGbLocale>
      <div className="flex w-full min-w-0 flex-wrap gap-4">
        <div className="min-w-0 w-[284px] max-w-full">
          <DatePicker label="Default" />
        </div>
        <div className="min-w-0 w-[284px] max-w-full">
          <DatePicker appearance="outline" label="Outline" />
        </div>
      </div>
    </DocsEnGbLocale>
  );
}

export function DatePickerValidationDemo() {
  return (
    <DocsEnGbLocale>
      <div className="w-full min-w-0 max-w-[284px]">
        <DatePicker label="Service date" isInvalid errorMessage="Enter a valid service date." />
      </div>
    </DocsEnGbLocale>
  );
}

function subscribeToDocsTheme(callback: () => void) {
  window.addEventListener('veli:color-scheme-change', callback);
  return () => window.removeEventListener('veli:color-scheme-change', callback);
}
function getDocsColorScheme(): VeliColorScheme {
  const value = document.documentElement.dataset.colorScheme;
  return value === 'light' || value === 'dark' ? value : 'system';
}

export function DatePickerRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );
  return (
    <DocsPreview
      codeKey={`date-picker-language-${language === 'Dhivehi' ? 'dv' : 'en'}`}
      controls={
        <DocsPreviewOption
          label="Language"
          value={language}
          options={['English', 'Dhivehi']}
          onChange={setLanguage}
        />
      }
    >
      <VeliProvider
        language={language === 'Dhivehi' ? 'dv' : 'en'}
        colorScheme={colorScheme}
        className="w-full min-w-0 max-w-[282px]"
      >
        <DatePicker
          label={language === 'Dhivehi' ? 'އެޕޮއިންޓްމަންޓް ތާރީޚު' : 'Appointment date'}
          description={language === 'Dhivehi' ? 'އެހީތެރިވެދޭ ލިޔުން' : 'Helper text'}
          defaultValue={parseDate('2026-10-15')}
          isOptional
        />
      </VeliProvider>
    </DocsPreview>
  );
}
