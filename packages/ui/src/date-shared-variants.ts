import { type DateSegmentRenderProps, type DateValue } from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { getDhivehiMonthName } from './calendar-localization';
import {
  defaultFieldUnderlineDisabled,
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
} from './field-shared-variants';

export { fieldRootVariants } from './field-shared-variants';

export const fieldLabelRowVariants = cva('flex items-center justify-between gap-3');

export const fieldLabelVariants = cva('type-body-sm-regular', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: 'text-base-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldMetaVariants = cva('type-caption-regular', {
  variants: {
    tone: {
      subtle: 'text-base-subtle',
      danger: 'text-danger-muted',
    },
    isDisabled: {
      true: 'text-disabled',
      false: '',
    },
  },
  compoundVariants: [
    {
      tone: 'danger',
      isDisabled: true,
      className: 'text-disabled',
    },
  ],
  defaultVariants: {
    tone: 'subtle',
    isDisabled: false,
  },
});

const fieldShellFocusRingClassName =
  'has-[span[data-focus-visible]]:ring-2 has-[span[data-focus-visible]]:ring-border-focus has-[span[data-focus-visible]]:ring-offset-2 has-[span[data-focus-visible]]:ring-offset-bg-surface-base has-[button[data-focus-visible]]:ring-2 has-[button[data-focus-visible]]:ring-border-focus has-[button[data-focus-visible]]:ring-offset-2 has-[button[data-focus-visible]]:ring-offset-bg-surface-base';

const fieldShellOutlineFocusClassName =
  'has-[span[data-focus-visible]]:border-transparent has-[span[data-focus-visible]]:hover:border-transparent has-[button[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:hover:border-transparent';

export const fieldShellVariants = cva(
  `relative flex w-full items-center gap-1 rounded-md transition-[background-color,border-color] duration-normal ease-out ${fieldShellFocusRingClassName}`,
  {
    variants: {
      appearance: {
        default: '',
        outline: `border hover:border-[1.5px] focus-within:border-2 focus-within:hover:border-2 ${fieldShellOutlineFocusClassName}`,
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
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-ash-alpha-100 focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled} bg-ash-alpha-200`,
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
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled}`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-ash-alpha-200',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className:
          'border-text-input-stroke bg-text-input-bg hover:border-text-input-stroke-hover hover:bg-text-input-bg-hover focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed focus-within:hover:border-text-input-stroke-pressed focus-within:hover:bg-text-input-bg-pressed has-[span[data-focus-visible]]:bg-text-input-bg has-[span[data-focus-visible]]:hover:bg-text-input-bg has-[button[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:hover:bg-text-input-bg',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className:
          'border-text-input-stroke bg-ash-alpha-100 hover:border-text-input-stroke-hover focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed focus-within:hover:border-text-input-stroke-pressed focus-within:hover:bg-text-input-bg-pressed has-[span[data-focus-visible]]:bg-ash-alpha-100 has-[span[data-focus-visible]]:hover:bg-ash-alpha-100',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        className: 'border-text-input-stroke-disabled bg-ash-alpha-200',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border-text-input-stroke-error bg-text-input-bg hover:border-text-input-stroke-error hover:bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border-text-input-stroke-disabled',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-ash-alpha-200',
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
        className:
          'border-2 border-text-input-stroke-pressed bg-text-input-bg-pressed hover:border-2 hover:border-text-input-stroke-pressed hover:bg-text-input-bg-pressed has-[span[data-focus-visible]]:border-transparent has-[span[data-focus-visible]]:hover:border-transparent has-[span[data-focus-visible]]:bg-text-input-bg has-[span[data-focus-visible]]:hover:bg-text-input-bg has-[button[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:hover:border-transparent has-[button[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:hover:bg-text-input-bg',
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
        className:
          'border-2 border-text-input-stroke-error hover:border-2 hover:border-text-input-stroke-error has-[span[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:border-transparent',
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

export const dateInputVariants = cva('flex min-w-0 flex-1 flex-wrap items-center gap-0', {
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
});

const dateSegmentVariants = cva(
  'rounded px-[1px] py-1 tabular-nums outline-none transition-colors duration-normal ease-out data-[type=literal]:px-0',
  {
    variants: {
      size: {
        sm: 'type-body-sm-regular',
        md: 'type-body-sm-regular',
        lg: 'type-body-md-regular',
      },
      isPlaceholder: {
        true: 'text-base-inactive',
        false: 'text-base-default',
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
