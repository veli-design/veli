import * as React from 'react';
import {
  Switch as AriaSwitch,
  SwitchProps as AriaSwitchProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';

const switchVariants = cva(
  'group inline-flex items-center gap-[8px] font-sans text-sm font-medium antialiased transition-colors focus-visible:outline-none disabled:cursor-not-allowed',
  {
    variants: {
      size: {
        sm: 'text-[14px]',
        md: 'text-[16px]',
        lg: 'text-[18px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const trackVariants = cva(
  'relative inline-flex shrink-0 items-center justify-start rounded-full border-2 transition-all duration-200 outline-none select-none',
  {
    variants: {
      size: {
        sm: 'h-[24px] w-[48px]',
        md: 'h-[28px] w-[56px]',
        lg: 'h-[36px] w-[64px]',
      },
      isSelected: {
        false:
          'border-inputs-switch-track-off-border bg-inputs-switch-track-off-bg group-hover:border-inputs-switch-track-off-border-hover',
        true: 'border-transparent bg-inputs-switch-track-on-bg group-hover:bg-inputs-switch-track-on-bg-hover',
      },
      isDisabled: {
        true: 'cursor-not-allowed',
      },
      isFocusVisible: {
        true: 'ring-4 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised',
      },
    },
    compoundVariants: [
      {
        isSelected: false,
        isDisabled: true,
        className:
          'bg-inputs-switch-track-off-bg-disabled border-inputs-switch-track-off-bg-disabled',
      },
      {
        isSelected: true,
        isDisabled: true,
        className: 'bg-inputs-switch-track-on-bg-disabled',
      },
    ],
    defaultVariants: {
      size: 'md',
      isSelected: false,
    },
  },
);

const handleVariants = cva(
  'absolute rounded-full transition-all duration-200 ease-in-out',
  {
    variants: {
      size: {
        sm: 'left-[3px] shadow-sm',
        md: 'left-[3px] shadow-sm',
        lg: 'left-[4px] shadow-sm',
      },
      isSelected: {
        false: '',
        true: '',
      },
      isDisabled: {
        true: '',
      },
      isPressed: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      // Size: SM
      {
        size: 'sm',
        isSelected: false,
        isPressed: false,
        className: 'h-[14px] w-[14px] top-[3px]',
      },
      {
        size: 'sm',
        isSelected: false,
        isPressed: true,
        className: 'h-[12px] w-[12px] top-[4px]',
      },
      {
        size: 'sm',
        isSelected: true,
        isPressed: false,
        className: 'h-[16px] w-[16px] top-[2px] translate-x-[23px]',
      },
      {
        size: 'sm',
        isSelected: true,
        isPressed: true,
        className: 'h-[14px] w-[14px] top-[3px] translate-x-[24px]',
      },
      // Size: MD
      {
        size: 'md',
        isSelected: false,
        isPressed: false,
        className: 'h-[18px] w-[18px] top-[3px]',
      },
      {
        size: 'md',
        isSelected: false,
        isPressed: true,
        className: 'h-[16px] w-[16px] top-[4px]',
      },
      {
        size: 'md',
        isSelected: true,
        isPressed: false,
        className: 'h-[20px] w-[20px] top-[2px] translate-x-[27px]',
      },
      {
        size: 'md',
        isSelected: true,
        isPressed: true,
        className: 'h-[18px] w-[18px] top-[3px] translate-x-[28px]',
      },
      // Size: LG
      {
        size: 'lg',
        isSelected: false,
        isPressed: false,
        className: 'h-[24px] w-[24px] top-[4px]',
      },
      {
        size: 'lg',
        isSelected: false,
        isPressed: true,
        className: 'h-[22px] w-[22px] top-[5px]',
      },
      {
        size: 'lg',
        isSelected: true,
        isPressed: false,
        className: 'h-[28px] w-[28px] top-[2px] translate-x-[26px]',
      },
      {
        size: 'lg',
        isSelected: true,
        isPressed: true,
        className: 'h-[26px] w-[26px] top-[3px] translate-x-[27px]',
      },
      // Colors
      {
        isSelected: false,
        isDisabled: false,
        className:
          'bg-inputs-switch-handle-off-bg group-hover:bg-inputs-switch-track-off-border-hover',
      },
      {
        isSelected: true,
        className: 'bg-inputs-switch-handle-on-bg',
      },
      {
        isDisabled: true,
        isSelected: false,
        className: 'bg-inputs-switch-handle-disabled-bg',
      },
      {
        isDisabled: true,
        isSelected: true,
        className: 'bg-inputs-switch-handle-disabled-bg',
      },
    ],
    defaultVariants: {
      size: 'md',
      isSelected: false,
    },
  },
);

export interface SwitchProps
  extends
    Omit<AriaSwitchProps, 'className' | 'style' | 'children'>,
    VariantProps<typeof switchVariants> {
  children?: React.ReactNode;
}

export function Switch({ size, children, ...props }: SwitchProps) {
  return (
    <AriaSwitch
      {...props}
      className={({ isDisabled }) =>
        switchVariants({
          size,
          className: isDisabled
            ? 'text-text-disabled-disabled'
            : 'text-text-default-default',
        })
      }
    >
      {(state) => (
        <>
          <div
            className={trackVariants({
              size,
              isSelected: state.isSelected,
              isDisabled: state.isDisabled,
              isFocusVisible: state.isFocusVisible,
            })}
          >
            <span
              className={handleVariants({
                size,
                isSelected: state.isSelected,
                isDisabled: state.isDisabled,
                isPressed: state.isPressed,
              })}
            />
          </div>
          {children}
        </>
      )}
    </AriaSwitch>
  );
}
