import { useState } from 'react';
import {
  type DateValue,
  getLocalTimeZone,
  isWeekend,
  parseDate,
  parseDateTime,
  today,
} from '@internationalized/date';
import { Calendar } from '@tradenetcorp/veli-ui/calendar';
import { DateField } from '@tradenetcorp/veli-ui/date-field';
import { DatePicker } from '@tradenetcorp/veli-ui/date-picker';

const now = today(getLocalTimeZone());
const disabledRanges = [
  [now.add({ days: 4 }), now.add({ days: 7 })],
  [now.add({ days: 12 }), now.add({ days: 14 })],
  [now.add({ days: 24 }), now.add({ days: 27 })],
] as const;

const appointmentUnavailable = (date: DateValue) =>
  isWeekend(date, 'en-US') ||
  disabledRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

export function DateFieldUsageDemo() {
  return (
    <div className="w-[320px]">
      <DateField label="Appointment date" description="Type a date segment by segment." />
    </div>
  );
}

export function CalendarUsageDemo() {
  return <Calendar aria-label="Appointment calendar" />;
}

export function CalendarControlledDemo() {
  const [value, setValue] = useState(parseDate('2026-04-30'));
  const [focusedValue, setFocusedValue] = useState(value);

  return (
    <div className="space-y-3">
      <Calendar
        aria-label="Controlled calendar"
        value={value}
        focusedValue={focusedValue}
        onFocusChange={setFocusedValue}
        onChange={(nextValue) => {
          setValue(nextValue);
          setFocusedValue(nextValue);
        }}
      />
      <p className="text-xs text-slate-500">Selected date: {value.toString()}</p>
    </div>
  );
}

export function CalendarVariantsDemo() {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <div className="space-y-3">
        <CalendarControlledDemo />
        <p className="text-xs text-slate-500">
          Controlled selection with the current chosen date kept in view.
        </p>
      </div>
      <div className="space-y-3">
        <Calendar
          aria-label="Unavailable dates calendar"
          minValue={now}
          maxValue={now.add({ months: 2 })}
          isDateUnavailable={appointmentUnavailable}
        />
        <p className="text-xs text-slate-500">Weekends and blackout ranges are unavailable.</p>
      </div>
    </div>
  );
}

export function DatePickerUsageDemo() {
  return (
    <div className="w-[320px]">
      <DatePicker
        label="Appointment date"
        description="Choose a date from the field or the calendar."
      />
    </div>
  );
}

export function DatePickerVariantsDemo() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DatePicker label="Date only" defaultValue={parseDate('2026-04-18')} />
      <DatePicker
        label="Date and minute"
        granularity="minute"
        defaultValue={parseDateTime('2026-04-18T14:30:00')}
      />
      <DatePicker
        label="Constraints"
        minValue={now}
        maxValue={now.add({ months: 1 })}
        description="Selectable for the next month."
      />
      <DatePicker
        label="Unavailable dates"
        minValue={now}
        maxValue={now.add({ months: 1 })}
        isDateUnavailable={appointmentUnavailable}
        description="Weekends and blackout dates cannot be chosen."
      />
    </div>
  );
}
