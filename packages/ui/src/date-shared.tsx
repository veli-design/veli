import {
  DateInput,
  DateSegment,
  type DateSegmentRenderProps,
  type DateValue,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import {
  defaultFieldUnderlineDisabled,
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
} from './field-shared';
import { twMerge } from 'tailwind-merge';

export { fieldRootVariants } from './field-shared';

export const fieldLabelRowVariants = cva('flex items-center justify-between gap-3');

export const fieldLabelVariants = cva('type-body-sm-regular', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-default-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldMetaVariants = cva('type-caption-regular', {
  variants: {
    tone: {
      subtle: 'text-text-default-subtle',
      danger: 'text-text-danger-muted',
    },
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: '',
    },
  },
  compoundVariants: [
    {
      tone: 'danger',
      isDisabled: true,
      className: 'text-text-disabled-disabled',
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
  `relative flex w-full items-center gap-1 rounded-md transition-[background-color,border-color] ${fieldShellFocusRingClassName}`,
  {
    variants: {
      variant: {
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
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg-default hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-gray-alpha-100 focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        variant: 'default',
        isDisabled: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled} bg-gray-alpha-200`,
      },
      {
        variant: 'default',
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} hover:bg-text-input-bg-hover`,
      },
      {
        variant: 'default',
        isDisabled: true,
        isInvalid: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled}`,
      },
      {
        variant: 'default',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className:
          'border-text-input-stroke-default bg-text-input-bg-default hover:border-text-input-stroke-hover hover:bg-text-input-bg-hover focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed focus-within:hover:border-text-input-stroke-pressed focus-within:hover:bg-text-input-bg-pressed has-[span[data-focus-visible]]:bg-text-input-bg-default has-[span[data-focus-visible]]:hover:bg-text-input-bg-default has-[button[data-focus-visible]]:bg-text-input-bg-default has-[button[data-focus-visible]]:hover:bg-text-input-bg-default',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className:
          'border-text-input-stroke-default bg-gray-alpha-100 hover:border-text-input-stroke-hover focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed focus-within:hover:border-text-input-stroke-pressed focus-within:hover:bg-text-input-bg-pressed has-[span[data-focus-visible]]:bg-gray-alpha-100 has-[span[data-focus-visible]]:hover:bg-gray-alpha-100',
      },
      {
        variant: 'outline',
        isDisabled: true,
        className: 'border-text-input-stroke-disabled bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border-text-input-stroke-error bg-text-input-bg-default hover:border-text-input-stroke-error hover:bg-text-input-bg-hover',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border-text-input-stroke-disabled',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-gray-alpha-200',
      },
      {
        variant: 'default',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        variant: 'outline',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className:
          'border-2 border-text-input-stroke-pressed bg-text-input-bg-pressed hover:border-2 hover:border-text-input-stroke-pressed hover:bg-text-input-bg-pressed has-[span[data-focus-visible]]:border-transparent has-[span[data-focus-visible]]:hover:border-transparent has-[span[data-focus-visible]]:bg-text-input-bg-default has-[span[data-focus-visible]]:hover:bg-text-input-bg-default has-[button[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:hover:border-transparent has-[button[data-focus-visible]]:bg-text-input-bg-default has-[button[data-focus-visible]]:hover:bg-text-input-bg-default',
      },
      {
        variant: 'default',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorFocusPressed}`,
      },
      {
        variant: 'outline',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className:
          'border-2 border-text-input-stroke-error hover:border-2 hover:border-text-input-stroke-error has-[span[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:border-transparent',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
      isOpen: false,
    },
  },
);

export type DatePickerGranularity = 'day' | 'hour' | 'minute' | 'second';

function formatDatePickerMonth(value: DateValue, locale: string) {
  return new Intl.DateTimeFormat(locale, { month: 'short' }).format(
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
    const time = new Intl.DateTimeFormat(locale, {
      hour: 'numeric',
      minute: granularity === 'minute' || granularity === 'second' ? 'numeric' : undefined,
      second: granularity === 'second' ? 'numeric' : undefined,
      hour12: hourCycle !== 24,
    }).format(date);

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
  'rounded px-[1px] py-1 tabular-nums outline-none transition-colors data-[type=literal]:px-0',
  {
    variants: {
      size: {
        sm: 'type-body-sm-regular',
        md: 'type-body-sm-regular',
        lg: 'type-body-md-regular',
      },
      isPlaceholder: {
        true: 'text-text-default-inactive',
        false: 'text-text-default-default',
      },
      isDisabled: {
        true: 'text-text-disabled-disabled',
        false: '',
      },
      isFocused: {
        true: 'bg-button-primary-default text-text-primary-inverted',
        false: '',
      },
      isInvalid: {
        true: 'text-text-danger-muted data-[type=literal]:text-text-danger-muted',
        false: '',
      },
      isReadOnly: {
        true: 'cursor-default',
        false: '',
      },
      type: {
        literal: 'px-0 text-text-default-subtle',
        day: '',
        month: '',
        year: '',
        era: '',
        hour: '',
        minute: '',
        second: '',
        dayPeriod: 'uppercase',
        timeZoneName: 'type-caption-12-regular text-text-default-subtle',
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

export function DateSegments({
  className,
  size = 'md',
}: {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <DateInput className={twMerge(dateInputVariants({ size }), className)}>
      {(segment) => (
        <DateSegment
          segment={segment}
          className={(state) => getDateSegmentClassName(state, size)}
        />
      )}
    </DateInput>
  );
}

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
