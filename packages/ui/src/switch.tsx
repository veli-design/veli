'use client';

import * as React from 'react';
import { Switch as AriaSwitch, SwitchProps as AriaSwitchProps } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { webkitDhivehiTextBaselineClassName } from './typography-shared.js';

// Match Figma's 0.75× (sm/md) and 1.125× (lg) scaling of the shared check path.
const switchCheckIconSizes = {
  sm: { width: 9, height: 6.75 },
  md: { width: 9, height: 6.75 },
  lg: { width: 13.5, height: 10.125 },
} as const;

const switchVariants = cva(
  'group inline-flex min-h-6 max-w-full items-center gap-2 font-sans antialiased focus-visible:outline-none',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: 'cursor-pointer text-base-default',
      },
      isReadOnly: {
        true: 'cursor-default',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const switchLabelVariants = cva(`min-w-0 break-words ${webkitDhivehiTextBaselineClassName}`, {
  variants: {
    size: {
      sm: 'type-body-sm-medium',
      md: 'type-body-sm-medium',
      lg: 'type-body-md-medium',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const trackVariants = cva(
  'relative inline-flex shrink-0 items-center justify-start overflow-hidden rounded-full border-1 transition-transform duration-normal ease-spring outline-none select-none motion-reduce:transition-none motion-reduce:scale-100 forced-colors:forced-color-adjust-none',
  {
    variants: {
      appearance: {
        default: '',
        subtle: '',
      },
      size: {
        sm: 'h-4 w-8',
        md: 'h-5 w-10',
        lg: 'h-6 w-12',
      },
      isSelected: {
        false: '',
        true: '',
      },
      isHovered: {
        true: '',
        false: '',
      },
      isDisabled: {
        true: 'cursor-not-allowed',
      },
      isPressed: {
        true: 'scale-[1.04]',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised forced-colors:outline-solid forced-colors:outline-2 forced-colors:outline-offset-2 forced-colors:outline-[Highlight]',
      },
    },
    compoundVariants: [
      // Default — off
      {
        appearance: 'default',
        isSelected: false,
        isDisabled: false,
        className:
          'border-switch-track-off-border bg-transparent forced-colors:border-[ButtonText] forced-colors:bg-[Canvas]',
      },
      {
        appearance: 'default',
        isSelected: false,
        isDisabled: false,
        isHovered: true,
        className: 'border-switch-track-off-border-hover forced-colors:border-[ButtonText]',
      },
      {
        appearance: 'default',
        isSelected: false,
        isDisabled: true,
        className:
          'border-switch-track-off-bg-disabled bg-transparent forced-colors:border-[GrayText] forced-colors:bg-[Canvas]',
      },
      // Default — on
      {
        appearance: 'default',
        isSelected: true,
        isDisabled: false,
        className:
          'border-transparent bg-switch-track-on-bg forced-colors:border-[Highlight] forced-colors:bg-[Highlight]',
      },
      {
        appearance: 'default',
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        className: 'bg-switch-track-on-bg-hover forced-colors:bg-[Highlight]',
      },
      {
        appearance: 'default',
        isSelected: true,
        isDisabled: true,
        className:
          'border-transparent bg-switch-track-off-bg-disabled forced-colors:border-[GrayText] forced-colors:bg-[GrayText]',
      },
      // Subtle — off
      {
        appearance: 'subtle',
        isSelected: false,
        isDisabled: false,
        className:
          'border-transparent bg-switch-track-off-bg forced-colors:border-[ButtonText] forced-colors:bg-[Canvas]',
      },
      {
        appearance: 'subtle',
        isSelected: false,
        isDisabled: false,
        isHovered: true,
        className: 'bg-switch-track-off-bg-hover forced-colors:bg-[Canvas]',
      },
      {
        appearance: 'subtle',
        isSelected: false,
        isDisabled: true,
        className:
          'border-transparent bg-switch-track-off-bg-disabled forced-colors:border-[GrayText] forced-colors:bg-[GrayText]',
      },
      // Subtle — on (same as default on)
      {
        appearance: 'subtle',
        isSelected: true,
        isDisabled: false,
        className:
          'border-transparent bg-switch-track-on-bg forced-colors:border-[Highlight] forced-colors:bg-[Highlight]',
      },
      {
        appearance: 'subtle',
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        className: 'bg-switch-track-on-bg-hover forced-colors:bg-[Highlight]',
      },
      {
        appearance: 'subtle',
        isSelected: true,
        isDisabled: true,
        className:
          'border-transparent bg-switch-track-off-bg-disabled forced-colors:border-[GrayText] forced-colors:bg-[GrayText]',
      },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isSelected: false,
    },
  },
);

const handleVariants = cva(
  'absolute top-1/2 -translate-y-1/2 rounded-full transition-[inset-inline-start,width,height,scale] duration-normal ease-spring motion-reduce:transition-none motion-reduce:scale-100',
  {
    variants: {
      appearance: {
        default: '',
        subtle: '',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      isSelected: {
        false: '[inset-inline-start:calc(0.5*var(--spacing))]',
        true: '',
      },
      isDisabled: {
        true: '',
        false: '',
      },
      isPressed: {
        true: 'scale-[0.96]',
      },
    },
    compoundVariants: [
      {
        size: 'sm',
        isSelected: false,
        className: 'size-2.5',
      },
      {
        size: 'sm',
        isSelected: true,
        className: 'size-3 [inset-inline-start:calc(100%-3*var(--spacing)-1px)]',
      },
      {
        size: 'md',
        isSelected: false,
        className: 'size-3.5',
      },
      {
        size: 'md',
        isSelected: true,
        className: 'size-4 [inset-inline-start:calc(100%-4*var(--spacing)-1px)]',
      },
      {
        size: 'lg',
        isSelected: false,
        className: 'size-4.5',
      },
      {
        size: 'lg',
        isSelected: true,
        className: 'size-5 [inset-inline-start:calc(100%-5*var(--spacing)-1px)]',
      },
      {
        appearance: 'default',
        isSelected: false,
        isDisabled: false,
        className: 'bg-switch-handle-off-bg forced-colors:bg-[ButtonText]',
      },
      {
        appearance: 'subtle',
        isSelected: false,
        isDisabled: false,
        className: 'bg-switch-handle-on-bg forced-colors:bg-[ButtonText]',
      },
      {
        isSelected: true,
        isDisabled: false,
        className: 'bg-switch-handle-on-bg forced-colors:bg-[HighlightText]',
      },
      {
        appearance: 'default',
        isSelected: false,
        isDisabled: true,
        className: 'bg-switch-handle-disabled-bg forced-colors:bg-[GrayText]',
      },
      {
        appearance: 'default',
        isSelected: true,
        isDisabled: true,
        className: 'bg-switch-handle-on-bg forced-colors:bg-[Canvas]',
      },
      {
        appearance: 'subtle',
        isDisabled: true,
        className: 'bg-switch-handle-on-bg forced-colors:bg-[Canvas]',
      },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isSelected: false,
      isDisabled: false,
    },
  },
);

const checkIconVariants = cva(
  'pointer-events-none absolute start-px top-1/2 flex h-3 -translate-y-1/2 items-center justify-center text-switch-handle-on-bg forced-colors:text-[HighlightText]',
  {
    variants: {
      size: {
        sm: 'w-[calc(4*var(--spacing)-1px)]',
        md: 'w-[calc(5*var(--spacing)-1px)]',
        lg: 'w-[calc(6*var(--spacing)-1px)]',
      },
      isDisabled: {
        true: 'forced-colors:text-[Canvas]',
      },
    },
    defaultVariants: {
      size: 'md',
      isDisabled: false,
    },
  },
);

export interface SwitchProps
  extends
    Omit<AriaSwitchProps, 'className' | 'style' | 'children'>,
    Pick<VariantProps<typeof trackVariants>, 'appearance' | 'size'> {
  children?: React.ReactNode;
  className?: string;
  ref?: React.Ref<HTMLLabelElement>;
}

export function Switch({ size, appearance, children, className, ...props }: SwitchProps) {
  const resolvedAppearance = appearance ?? 'default';
  const resolvedSize = size ?? 'md';

  return (
    <AriaSwitch
      {...props}
      className={({ isDisabled, isReadOnly }) =>
        twMerge(
          switchVariants({
            isDisabled,
            isReadOnly: !isDisabled && isReadOnly,
          }),
          className,
        )
      }
    >
      {(state) => {
        const checkIcon = switchCheckIconSizes[resolvedSize];
        const showCheckmark = resolvedAppearance === 'default' && state.isSelected;
        const isPressed = !state.isDisabled && !state.isReadOnly && state.isPressed;

        return (
          <>
            <span
              aria-hidden="true"
              className={trackVariants({
                appearance: resolvedAppearance,
                size: resolvedSize,
                isSelected: state.isSelected,
                isHovered: state.isDisabled ? false : state.isHovered,
                isDisabled: state.isDisabled,
                isPressed,
                isFocusVisible: state.isFocusVisible,
              })}
            >
              {showCheckmark ? (
                <span
                  className={checkIconVariants({
                    size: resolvedSize,
                    isDisabled: state.isDisabled,
                  })}
                >
                  <svg
                    aria-hidden="true"
                    width={checkIcon.width}
                    height={checkIcon.height}
                    viewBox="-1.25 -1.5 12 9"
                    fill="none"
                  >
                    <path d="M0 2.5L3.5 6L9.5 0" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
              ) : null}
              <span
                className={handleVariants({
                  appearance: resolvedAppearance,
                  size: resolvedSize,
                  isSelected: state.isSelected,
                  isDisabled: state.isDisabled,
                  isPressed,
                })}
              />
            </span>
            {children != null ? (
              <span className={switchLabelVariants({ size: resolvedSize })}>{children}</span>
            ) : null}
          </>
        );
      }}
    </AriaSwitch>
  );
}
