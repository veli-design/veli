import type { ReactNode } from 'react';
import { I18nProvider } from 'react-aria-components';
import { DatePicker } from '@tradenetcorp/veli-ui/date-picker';

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
