import { DateField } from '@veli-design/react/date-field';
import { DocsEnGbLocale } from './DocsEnGbLocale';

export function DateFieldUsageDemo() {
  return (
    <DocsEnGbLocale>
      <div className="w-[320px]">
        <DateField
          label="Appointment date"
          isOptional
          description="Type a date segment by segment."
        />
      </div>
    </DocsEnGbLocale>
  );
}

export function DateFieldAppearancesDemo() {
  return (
    <DocsEnGbLocale>
      <div className="grid gap-4 md:grid-cols-2">
        <DateField label="Default" />
        <DateField appearance="outline" label="Outline" />
      </div>
    </DocsEnGbLocale>
  );
}

export function DateFieldValidationDemo() {
  return (
    <DocsEnGbLocale>
      <div className="w-[320px]">
        <DateField label="Service date" isInvalid errorMessage="Enter a valid service date." />
      </div>
    </DocsEnGbLocale>
  );
}
