'use client';

import * as React from 'react';
import { Switch as AriaSwitch, SwitchProps as AriaSwitchProps } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const switchCheckIconSizes = {
  sm: { width: 10, height: 9, viewBox: '-1 -1 15 8.8' },
  md: { width: 12, height: 10, viewBox: '-1 -1 11.5 8.8' },
  lg: { width: 14, height: 14, viewBox: '-1 -1 11.5 8.8' },
} as const;

const switchVariants = cva(
  'group inline-flex items-center gap-2 font-sans antialiased transition-colors focus-visible:outline-none',
  {
    variants: {
      size: {
        sm: 'type-body-sm-medium',
        md: 'type-body-md-medium',
        lg: 'type-body-lg-medium',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-text-disabled-disabled',
        false: 'cursor-pointer text-text-default-default',
      },
    },
    defaultVariants: {
      size: 'md',
      isDisabled: false,
    },
  },
);

const trackVariants = cva(
  'relative inline-flex shrink-0 items-center justify-start rounded-full border-1 transition-all duration-200 outline-none select-none',
  {
    variants: {
      variant: {
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
      isFocusVisible: {
        true: 'ring-2  ring-border-focus ring-offset-2 ring-offset-bg-surface-raised',
      },
    },
    compoundVariants: [
      // Default — off
      {
        variant: 'default',
        isSelected: false,
        isDisabled: false,
        className: 'border-inputs-switch-track-off-border bg-transparent',
      },
      {
        variant: 'default',
        isSelected: false,
        isDisabled: false,
        isHovered: true,
        className: 'border-inputs-switch-track-off-border-hover',
      },
      {
        variant: 'default',
        isSelected: false,
        isDisabled: true,
        className: 'border-inputs-switch-track-off-bg-disabled bg-transparent',
      },
      // Default — on
      {
        variant: 'default',
        isSelected: true,
        isDisabled: false,
        className: 'border-transparent bg-inputs-switch-track-on-bg',
      },
      {
        variant: 'default',
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        className: 'bg-inputs-switch-track-on-bg-hover',
      },
      {
        variant: 'default',
        isSelected: true,
        isDisabled: true,
        className: 'border-transparent bg-inputs-switch-track-off-bg-disabled',
      },
      // Subtle — off
      {
        variant: 'subtle',
        isSelected: false,
        isDisabled: false,
        className: 'border-transparent bg-inputs-switch-track-off-bg',
      },
      {
        variant: 'subtle',
        isSelected: false,
        isDisabled: false,
        isHovered: true,
        className: 'bg-inputs-switch-track-off-bg-hover',
      },
      {
        variant: 'subtle',
        isSelected: false,
        isDisabled: true,
        className: 'border-transparent bg-inputs-switch-track-off-bg-disabled',
      },
      // Subtle — on (same as default on)
      {
        variant: 'subtle',
        isSelected: true,
        isDisabled: false,
        className: 'border-transparent bg-inputs-switch-track-on-bg',
      },
      {
        variant: 'subtle',
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        className: 'bg-inputs-switch-track-on-bg-hover',
      },
      {
        variant: 'subtle',
        isSelected: true,
        isDisabled: true,
        className: 'border-transparent bg-inputs-switch-track-off-bg-disabled',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isSelected: false,
    },
  },
);

const handleVariants = cva(
  'absolute top-1/2 -translate-y-1/2 rounded-full transition-[left,width,height,background-color] duration-200 ease-in-out',
  {
    variants: {
      variant: {
        default: '',
        subtle: '',
      },
      size: {
        sm: '',
        md: '',
        lg: '',
      },
      isSelected: {
        false: 'left-0.5',
        true: '',
      },
      isDisabled: {
        true: '',
        false: '',
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
        className: 'size-3 left-[calc(100%-3*var(--spacing)-1px)]',
      },
      {
        size: 'md',
        isSelected: false,
        className: 'size-3.5',
      },
      {
        size: 'md',
        isSelected: true,
        className: 'size-4 left-[calc(100%-4*var(--spacing)-1px)]',
      },
      {
        size: 'lg',
        isSelected: false,
        className: 'size-4.5',
      },
      {
        size: 'lg',
        isSelected: true,
        className: 'size-5 left-[calc(100%-5*var(--spacing)-1px)]',
      },
      {
        variant: 'default',
        isSelected: false,
        isDisabled: false,
        className: 'bg-inputs-switch-handle-off-bg',
      },
      {
        variant: 'subtle',
        isSelected: false,
        isDisabled: false,
        className: 'bg-inputs-switch-handle-on-bg',
      },
      {
        isSelected: true,
        isDisabled: false,
        className: 'bg-inputs-switch-handle-on-bg',
      },
      {
        variant: 'default',
        isSelected: false,
        isDisabled: true,
        className: 'bg-inputs-switch-handle-disabled-bg',
      },
      {
        variant: 'default',
        isSelected: true,
        isDisabled: true,
        className: 'bg-inputs-switch-handle-on-bg',
      },
      {
        variant: 'subtle',
        isDisabled: true,
        className: 'bg-inputs-switch-handle-on-bg',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isSelected: false,
      isDisabled: false,
    },
  },
);

const checkIconVariants = cva(
  'pointer-events-none absolute top-1/2 flex -translate-y-1/2 items-center justify-center',
  {
    variants: {
      size: {
        sm: 'left-[calc(0.5*var(--spacing)+(100%-3*var(--spacing)-0.5*var(--spacing)-1px-2.5*var(--spacing))/2)]',
        md: 'left-[calc(0.5*var(--spacing)+(100%-4*var(--spacing)-0.5*var(--spacing)-1px-3*var(--spacing))/2)]',
        lg: 'left-[calc(0.5*var(--spacing)+(100%-5*var(--spacing)-0.5*var(--spacing)-1px-3.5*var(--spacing))/2)]',
      },
      isDisabled: {
        true: 'text-inputs-switch-handle-disabled-bg',
        false: 'text-text-default-inverted',
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
    Omit<VariantProps<typeof switchVariants>, 'isDisabled'>,
    Pick<VariantProps<typeof trackVariants>, 'variant'> {
  children?: React.ReactNode;
  className?: string;
}

export function Switch({ size, variant, children, className, ...props }: SwitchProps) {
  const resolvedVariant = variant ?? 'default';

  return (
    <AriaSwitch
      {...props}
      className={({ isDisabled }) =>
        twMerge(
          switchVariants({
            size,
            isDisabled,
          }),
          className,
        )
      }
    >
      {(state) => {
        const resolvedSize = size ?? 'md';
        const checkIcon = switchCheckIconSizes[resolvedSize];
        const showCheckmark = resolvedVariant === 'default' && state.isSelected;

        return (
          <>
            <div
              className={trackVariants({
                variant: resolvedVariant,
                size,
                isSelected: state.isSelected,
                isHovered: state.isDisabled ? false : state.isHovered,
                isDisabled: state.isDisabled,
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
                    viewBox={checkIcon.viewBox}
                    fill="none"
                  >
                    <path d="M0 2.5L3.5 6L9.5 0" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </span>
              ) : null}
              <span
                className={handleVariants({
                  variant: resolvedVariant,
                  size,
                  isSelected: state.isSelected,
                  isDisabled: state.isDisabled,
                })}
              />
            </div>
            {children}
          </>
        );
      }}
    </AriaSwitch>
  );
}
