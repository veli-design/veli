import { parseDate, type CalendarDate, type DateValue } from '@internationalized/date';

/**
 * Collects unique, non-empty messages from form-library errors: strings,
 * `{ message }` objects (React Hook Form errors, Standard Schema issues from
 * Zod / Valibot / ArkType), and arrays of either.
 */
export function getErrorMessages(errors: unknown): string[] {
  const messages = new Set<string>();

  const visit = (error: unknown) => {
    if (typeof error === 'string') {
      if (error !== '') {
        messages.add(error);
      }
      return;
    }

    if (Array.isArray(error)) {
      error.forEach(visit);
      return;
    }

    if (error != null && typeof error === 'object' && 'message' in error) {
      visit((error as { message?: unknown }).message);
    }
  };

  visit(errors);
  return Array.from(messages);
}

/** First message from {@link getErrorMessages}, for a field's `errorMessage` prop. */
export function toErrorMessage(errors: unknown): string | undefined {
  return getErrorMessages(errors)[0];
}

/**
 * Converts an ISO `yyyy-MM-dd` string to a `CalendarDate` for `DateField` /
 * `DatePicker`. Returns `null` for empty or unparseable input.
 */
export function isoDateToDateValue(value: string | null | undefined): CalendarDate | null {
  if (value == null || value === '') {
    return null;
  }

  try {
    return parseDate(value);
  } catch {
    return null;
  }
}

/**
 * Converts a `DateValue` to an ISO `yyyy-MM-dd` (or date-time) string for
 * form libraries that store dates as strings.
 */
export function dateValueToIsoDate(value: DateValue | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  return value.toString();
}
