import { type DateSegmentRenderProps, type DateValue } from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { getDhivehiMonthName } from './calendar-localization';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
} from './field-shared-variants';
import { webkitDhivehiTextBaselineClassName } from './typography-shared';

export { fieldRootVariants } from './field-shared-variants';

const fieldShellFocusRingClassName =
  'has-[span[data-focus-visible]]:ring-2 has-[span[data-focus-visible]]:ring-border-focus has-[span[data-focus-visible]]:ring-offset-2 has-[span[data-focus-visible]]:ring-offset-bg-surface-raised has-[button[data-focus-visible]]:ring-2 has-[button[data-focus-visible]]:ring-border-focus has-[button[data-focus-visible]]:ring-offset-2 has-[button[data-focus-visible]]:ring-offset-bg-surface-raised';

/**
 * Outline stroke as an inset box-shadow (Figma strokeAlign INSIDE).
 * Rest 1px, hover 1.5px, active/focus-within 2px — outer box never changes.
 * Hide the inner stroke when the keyboard focus ring is shown.
 */
const outlineFieldStrokeRest =
  'shadow-[inset_0_0_0_1px_var(--color-text-input-stroke)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--color-text-input-stroke-hover)] [&:focus-within:not(:has(span[data-focus-visible])):not(:has(button[data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--color-text-input-stroke-pressed)]';

const outlineFieldStrokeError =
  'shadow-[inset_0_0_0_1px_var(--color-text-input-stroke-error)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--color-text-input-stroke-error)] focus-within:shadow-[inset_0_0_0_2px_var(--color-text-input-stroke-error)]';

const outlineFieldStrokePressed =
  'shadow-[inset_0_0_0_2px_var(--color-text-input-stroke-pressed)] hover:shadow-[inset_0_0_0_2px_var(--color-text-input-stroke-pressed)]';

const outlineFieldStrokeErrorPressed =
  'shadow-[inset_0_0_0_2px_var(--color-text-input-stroke-error)] hover:shadow-[inset_0_0_0_2px_var(--color-text-input-stroke-error)]';

const outlineFieldStrokeFocusVisibleHide =
  'has-[span[data-focus-visible]]:shadow-none has-[span[data-focus-visible]]:hover:shadow-none has-[button[data-focus-visible]]:shadow-none has-[button[data-focus-visible]]:hover:shadow-none';

export const fieldShellVariants = cva(
  `relative flex w-full items-center gap-1 rounded-md motion-safe:transition-[background-color,box-shadow] motion-safe:duration-normal motion-safe:ease-out motion-reduce:transition-none ${fieldShellFocusRingClassName}`,
  {
    variants: {
      appearance: {
        default: '',
        outline: '',
      },
      size: {
        sm: 'h-9 py-2 px-3',
        md: 'h-11 py-3 px-4',
        lg: 'h-13 py-3.5 px-4',
      },
      isDisabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-text',
      },
      isInvalid: {
        true: '',
        false: '',
      },
      isReadOnly: {
        true: '',
        false: '',
      },
      isOpen: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        isInvalid: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${outlineFieldStrokeRest} ${outlineFieldStrokeFocusVisibleHide} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed has-[span[data-focus-visible]]:bg-text-input-bg has-[span[data-focus-visible]]:hover:bg-text-input-bg has-[button[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:hover:bg-text-input-bg`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className: `${outlineFieldStrokeError} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg`,
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className: `${outlineFieldStrokePressed} ${outlineFieldStrokeFocusVisibleHide} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed has-[span[data-focus-visible]]:bg-text-input-bg has-[span[data-focus-visible]]:hover:bg-text-input-bg has-[button[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:hover:bg-text-input-bg`,
      },
      {
        appearance: 'default',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorFocusPressed}`,
      },
      {
        appearance: 'outline',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className: `${outlineFieldStrokeErrorPressed} ${outlineFieldStrokeFocusVisibleHide}`,
      },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
      isOpen: false,
    },
  },
);

export type DatePickerGranularity = 'day' | 'hour' | 'minute' | 'second';

type DatePickerIntlLocale = 'en-GB' | 'dv-MV';
type DatePickerTimeFormatterKey =
  | '12-hour'
  | '12-minute'
  | '12-second'
  | '24-hour'
  | '24-minute'
  | '24-second';

const datePickerMonthFormatters = {
  'en-GB': new Intl.DateTimeFormat('en-GB', { month: 'short' }),
  'dv-MV': new Intl.DateTimeFormat('dv-MV', { month: 'short' }),
} as const satisfies Record<DatePickerIntlLocale, Intl.DateTimeFormat>;

const datePickerTimeFormatters = {
  'en-GB': {
    '12-hour': new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: true }),
    '12-minute': new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }),
    '12-second': new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }),
    '24-hour': new Intl.DateTimeFormat('en-GB', { hour: 'numeric', hour12: false }),
    '24-minute': new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }),
    '24-second': new Intl.DateTimeFormat('en-GB', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }),
  },
  'dv-MV': {
    '12-hour': new Intl.DateTimeFormat('dv-MV', { hour: 'numeric', hour12: true }),
    '12-minute': new Intl.DateTimeFormat('dv-MV', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }),
    '12-second': new Intl.DateTimeFormat('dv-MV', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    }),
    '24-hour': new Intl.DateTimeFormat('dv-MV', { hour: 'numeric', hour12: false }),
    '24-minute': new Intl.DateTimeFormat('dv-MV', {
      hour: 'numeric',
      minute: 'numeric',
      hour12: false,
    }),
    '24-second': new Intl.DateTimeFormat('dv-MV', {
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    }),
  },
} as const satisfies Record<
  DatePickerIntlLocale,
  Record<DatePickerTimeFormatterKey, Intl.DateTimeFormat>
>;

function getDatePickerIntlLocale(locale: string): DatePickerIntlLocale {
  return locale.startsWith('dv') ? 'dv-MV' : 'en-GB';
}

function getDatePickerTimeFormatterKey(
  granularity: DatePickerGranularity,
  hourCycle: 12 | 24,
): DatePickerTimeFormatterKey {
  const cycle = hourCycle === 24 ? '24' : '12';

  if (granularity === 'second') {
    return `${cycle}-second`;
  }

  if (granularity === 'minute') {
    return `${cycle}-minute`;
  }

  return `${cycle}-hour`;
}

function formatDatePickerMonth(value: DateValue, locale: string) {
  if (locale.startsWith('dv')) {
    return getDhivehiMonthName(value.month);
  }

  return datePickerMonthFormatters[getDatePickerIntlLocale(locale)].format(
    new Date(2020, value.month - 1, value.day),
  );
}

export function formatDatePickerValue(
  value: DateValue,
  locale: string,
  options?: {
    granularity?: DatePickerGranularity;
    hourCycle?: 12 | 24;
  },
): string {
  const granularity = options?.granularity ?? 'day';
  const hourCycle = options?.hourCycle ?? 12;
  const month = formatDatePickerMonth(value, locale);
  let formatted = `${value.day} ${month} ${value.year}`;

  if (granularity !== 'day' && 'hour' in value) {
    const date = new Date(
      value.year,
      value.month - 1,
      value.day,
      value.hour,
      'minute' in value ? value.minute : 0,
      'second' in value ? value.second : 0,
    );
    const time =
      datePickerTimeFormatters[getDatePickerIntlLocale(locale)][
        getDatePickerTimeFormatterKey(granularity, hourCycle)
      ].format(date);

    formatted = `${formatted}, ${time}`;
  }

  return formatted;
}

export const dateInputVariants = cva(
  `flex min-w-0 flex-1 flex-wrap items-center gap-0 ${webkitDhivehiTextBaselineClassName}`,
  {
    variants: {
      size: {
        sm: '-mx-3 -my-2 px-3 py-2',
        md: '-mx-4 -my-3 px-4 py-3',
        lg: '-mx-4 -my-3.5 px-4 py-3.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const dateSegmentVariants = cva(
  'rounded px-[1px] py-1 tabular-nums outline-none motion-safe:transition-colors motion-safe:duration-normal motion-safe:ease-out motion-reduce:transition-none data-[type=literal]:px-0',
  {
    variants: {
      size: {
        sm: 'type-body-sm-regular',
        md: 'type-body-sm-regular',
        lg: 'type-body-md-regular',
      },
      isPlaceholder: {
        true: 'text-base-inactive',
        false: '',
      },
      isDisabled: {
        true: 'text-disabled',
        false: '',
      },
      isFocused: {
        true: 'bg-button-primary text-primary-inverted',
        false: '',
      },
      isInvalid: {
        true: 'text-danger-muted data-[type=literal]:text-danger-muted',
        false: '',
      },
      isReadOnly: {
        true: 'cursor-default',
        false: '',
      },
      type: {
        literal: 'px-0 text-base-subtle',
        day: '',
        month: '',
        year: '',
        era: '',
        hour: '',
        minute: '',
        second: '',
        dayPeriod: 'uppercase',
        timeZoneName: 'type-caption-12-regular text-base-subtle',
      },
    },
    compoundVariants: [
      {
        isPlaceholder: false,
        isDisabled: false,
        isFocused: false,
        isInvalid: false,
        isReadOnly: false,
        className: 'text-base-default',
      },
      {
        isPlaceholder: false,
        isDisabled: false,
        isFocused: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'text-base-strong',
      },
    ],
    defaultVariants: {
      size: 'md',
      isPlaceholder: false,
      isDisabled: false,
      isFocused: false,
      isInvalid: false,
      isReadOnly: false,
    },
  },
);

export function getDateSegmentClassName(
  state: DateSegmentRenderProps,
  size: 'sm' | 'md' | 'lg' = 'md',
) {
  return dateSegmentVariants({
    size,
    isPlaceholder: state.isPlaceholder,
    isDisabled: state.isDisabled,
    isFocused: state.isFocused,
    isInvalid: state.isInvalid,
    isReadOnly: state.isReadOnly,
    type: state.type,
  });
}
