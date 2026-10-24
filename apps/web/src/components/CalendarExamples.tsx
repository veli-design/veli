import { useState, useSyncExternalStore } from 'react';
import { parseDate, type DateValue } from '@internationalized/date';
import { Calendar, RangeCalendar } from '@veli-design/react/calendar';
import { VeliProvider, type VeliColorScheme } from '@veli-design/react/provider';
import { DocsPreview, DocsPreviewOption } from './DocsPreview';

const initial = parseDate('2026-10-15');
const initialRange = { start: parseDate('2026-10-13'), end: parseDate('2026-10-20') };

export function CalendarUsageDemo() {
  return <Calendar aria-label="Appointment calendar" defaultValue={initial} className="mx-auto" />;
}

export function CalendarControlledDemo() {
  const [value, setValue] = useState<DateValue>(initial);
  const [focusedValue, setFocusedValue] = useState<DateValue>(initial);
  return (
    <div className="w-full min-w-0 max-w-full space-y-3">
      <Calendar
        aria-label="Controlled calendar"
        value={value}
        focusedValue={focusedValue}
        onFocusChange={setFocusedValue}
        onChange={(next) => {
          setValue(next);
          setFocusedValue(next);
        }}
        className="mx-auto"
      />
      <p className="type-caption-regular text-base-muted text-center">
        Selected date: <bdi>{value.toString()}</bdi>
      </p>
    </div>
  );
}

export function CalendarRangeDemo() {
  const [value, setValue] = useState(initialRange);
  return (
    <div className="w-full min-w-0 max-w-full space-y-3">
      <RangeCalendar
        aria-label="Trip dates"
        value={value}
        onChange={setValue}
        showTodayButton
        className="mx-auto"
      />
      <p className="type-caption-regular text-center text-base-muted">
        <bdi>
          {value.start.toString()} – {value.end.toString()}
        </bdi>
      </p>
    </div>
  );
}

export function CalendarVariantsDemo() {
  const [state, setState] = useState('Constrained');
  return (
    <DocsPreview
      codeKey={`calendar-state-${state.toLowerCase()}`}
      controls={
        <DocsPreviewOption
          label="State"
          value={state}
          options={['Constrained', 'Unavailable', 'Disabled', 'Read only']}
          onChange={setState}
        />
      }
    >
      <Calendar
        key={state}
        aria-label="Booking availability calendar"
        defaultValue={initial}
        minValue={state === 'Constrained' ? parseDate('2026-10-12') : undefined}
        maxValue={state === 'Constrained' ? parseDate('2026-10-28') : undefined}
        isDateUnavailable={
          state === 'Unavailable' ? (date) => date.day === 16 || date.day === 23 : undefined
        }
        isDisabled={state === 'Disabled'}
        isReadOnly={state === 'Read only'}
      />
    </DocsPreview>
  );
}

export function CalendarValidationDemo() {
  return (
    <Calendar
      aria-label="Invalid appointment date"
      defaultValue={initial}
      isInvalid
      errorMessage="Pick a date within the allowed window."
      className="mx-auto"
    />
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
export function CalendarRtlDemo() {
  const [language, setLanguage] = useState('Dhivehi');
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );
  return (
    <DocsPreview
      codeKey={`calendar-language-${language === 'Dhivehi' ? 'dv' : 'en'}`}
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
        className="w-full min-w-0"
      >
        <RangeCalendar
          aria-label={language === 'Dhivehi' ? 'ދަތުރު ކުރާ ތާރީޚުތައް' : 'Trip dates'}
          defaultValue={initialRange}
          showTodayButton
          className="mx-auto"
        />
      </VeliProvider>
    </DocsPreview>
  );
}
