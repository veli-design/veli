import * as React from 'react';
import {
  DateInput,
  DateSegment,
  type DateSegmentRenderProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

export const fieldRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

export const fieldLabelRowVariants = cva('flex items-center justify-between gap-3');

export const fieldLabelVariants = cva('text-[14px] leading-[20px]', {
  variants: {
    isDisabled: {
      true: 'text-fg-text-disabled-disabled',
      false: 'text-fg-text-default-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

export const fieldMetaVariants = cva('text-[12px] leading-[16px] tracking-[0.01em]', {
  variants: {
    tone: {
      subtle: 'text-fg-text-default-subtle',
      danger: 'text-fg-text-danger-muted',
    },
    isDisabled: {
      true: 'text-fg-text-disabled-disabled',
      false: '',
    },
  },
  compoundVariants: [
    {
      tone: 'danger',
      isDisabled: true,
      className: 'text-fg-text-disabled-disabled',
    },
  ],
  defaultVariants: {
    tone: 'subtle',
    isDisabled: false,
  },
});

export const fieldShellVariants = cva(
  'flex min-h-[36px] w-full items-center gap-[4px] rounded-[6px] px-[6px] py-[6px] transition-[background-color,box-shadow] focus-within:ring-2 focus-within:ring-fg-border-focus focus-within:ring-offset-0',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed bg-gray-alpha-200 shadow-[inset_0_-1px_0_0_rgba(0,36,80,0.04)]',
        false:
          'bg-bg-input-on-white shadow-[inset_0_-1px_0_0_rgba(4,32,66,0.2)] hover:shadow-[inset_0_-1px_0_0_rgba(14,21,29,0.22)]',
      },
      isInvalid: {
        true: 'shadow-[inset_0_-1px_0_0_rgba(192,24,0,1)]',
        false: '',
      },
      isReadOnly: {
        true: 'bg-gray-alpha-100',
        false: '',
      },
    },
    compoundVariants: [
      {
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-gray-alpha-200',
      },
      {
        isDisabled: true,
        isInvalid: true,
        className: 'shadow-[inset_0_-1px_0_0_rgba(0,36,80,0.04)]',
      },
    ],
    defaultVariants: {
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
    },
  }
);

export const dateInputVariants = cva('flex min-w-0 flex-1 flex-wrap items-center gap-0');

const dateSegmentVariants = cva(
  'rounded px-[1px] py-1 text-[14px] leading-[20px] tabular-nums outline-none transition-colors data-[type=literal]:px-0',
  {
    variants: {
      isPlaceholder: {
        true: 'text-fg-text-default-inactive',
        false: 'text-fg-text-default-default',
      },
      isDisabled: {
        true: 'text-fg-text-disabled-disabled',
        false: '',
      },
      isFocused: {
        true: 'bg-bg-button-primary-default text-white',
        false: '',
      },
      isInvalid: {
        true: 'text-fg-text-danger-muted data-[type=literal]:text-fg-text-danger-muted',
        false: '',
      },
      isReadOnly: {
        true: 'cursor-default',
        false: '',
      },
      type: {
        literal: 'px-0 text-fg-text-default-subtle',
        day: '',
        month: '',
        year: '',
        era: '',
        hour: '',
        minute: '',
        second: '',
        dayPeriod: 'uppercase',
        timeZoneName: 'text-[12px] leading-[16px] tracking-[0.01em] text-fg-text-default-subtle',
      },
    },
    defaultVariants: {
      isPlaceholder: false,
      isDisabled: false,
      isFocused: false,
      isInvalid: false,
      isReadOnly: false,
    },
  }
);

export const messageVariants = cva('text-[12px] leading-[16px] tracking-[0.01em]', {
  variants: {
    tone: {
      subtle: 'text-fg-text-default-subtle',
      danger: 'text-fg-text-danger-muted',
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
});

export function DateSegments({ className }: { className?: string }) {
  return (
    <DateInput className={twMerge(dateInputVariants(), className)}>
      {(segment) => (
        <DateSegment
          segment={segment}
          className={(state) => getDateSegmentClassName(state)}
        />
      )}
    </DateInput>
  );
}

export function getDateSegmentClassName(state: DateSegmentRenderProps) {
  return dateSegmentVariants({
    isPlaceholder: state.isPlaceholder,
    isDisabled: state.isDisabled,
    isFocused: state.isFocused,
    isInvalid: state.isInvalid,
    isReadOnly: state.isReadOnly,
    type: state.type,
  });
}
