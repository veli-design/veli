import * as React from 'react';
import {
  Checkbox as AriaCheckbox,
  CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';

const checkboxRootVariants = cva(
  'group inline-flex items-center gap-[8px] font-sans text-[14px] leading-[20px] font-medium antialiased disabled:cursor-not-allowed'
);

const checkboxControlVariants = cva(
  'relative inline-flex size-[16px] shrink-0 items-center justify-center rounded-[3px] border-2 transition-colors focus-visible:outline-none',
  {
    variants: {
      isSelected: {
        true: '',
        false: '',
      },
      isIndeterminate: {
        true: '',
        false: '',
      },
      isHovered: {
        true: '',
        false: '',
      },
      isPressed: {
        true: 'border-[3px]',
        false: 'border-2',
      },
      isDisabled: {
        true: '',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-fg-border-focus ring-offset-1 ring-offset-bg-surface-surface-raised',
        false: '',
      },
    },
    compoundVariants: [
      // Unchecked
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className:
          'bg-inputs-checkbox-container-bg border-inputs-checkbox-container-border',
      },
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: false,
        isHovered: true,
        className:
          'bg-inputs-checkbox-container-bg border-inputs-checkbox-container-border-hover',
      },
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: false,
        isPressed: true,
        className:
          'bg-inputs-checkbox-container-bg border-inputs-checkbox-container-checked-bg',
      },
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: true,
        className:
          'bg-inputs-checkbox-container-bg border-inputs-checkbox-indicator-disabled-border',
      },
      // Checked / indeterminate active
      {
        isSelected: true,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className:
          'bg-inputs-checkbox-container-checked-bg border-inputs-checkbox-container-checked-bg',
      },
      {
        isIndeterminate: true,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className:
          'bg-inputs-checkbox-container-indeterminate-bg border-inputs-checkbox-container-indeterminate-bg',
      },
      {
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        className:
          'bg-inputs-checkbox-container-bg-hover border-inputs-checkbox-container-bg-hover',
      },
      {
        isIndeterminate: true,
        isDisabled: false,
        isHovered: true,
        className:
          'bg-inputs-checkbox-container-bg-hover border-inputs-checkbox-container-bg-hover',
      },
      {
        isSelected: true,
        isDisabled: false,
        isPressed: true,
        className:
          'bg-inputs-checkbox-container-bg-hover border-inputs-checkbox-container-bg-hover',
      },
      {
        isIndeterminate: true,
        isDisabled: false,
        isPressed: true,
        className:
          'bg-inputs-checkbox-container-bg-hover border-inputs-checkbox-container-bg-hover',
      },
      // Disabled selected / indeterminate
      {
        isSelected: true,
        isDisabled: true,
        className:
          'bg-inputs-checkbox-indicator-disabled-bg border-inputs-checkbox-indicator-disabled-bg',
      },
      {
        isIndeterminate: true,
        isDisabled: true,
        className:
          'bg-inputs-checkbox-indicator-disabled-bg border-inputs-checkbox-indicator-disabled-bg',
      },
    ],
    defaultVariants: {
      isSelected: false,
      isIndeterminate: false,
      isHovered: false,
      isPressed: false,
      isDisabled: false,
      isFocusVisible: false,
    },
  }
);

const indicatorVariants = cva(
  'pointer-events-none absolute inset-0 flex items-center justify-center',
  {
    variants: {
      isDisabled: {
        true: 'text-white',
        false: 'text-white',
      },
    },
  }
);

export interface CheckboxProps
  extends Omit<AriaCheckboxProps, 'className' | 'style' | 'children'> {
  children?: React.ReactNode;
}

export function Checkbox({ children, isIndeterminate, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox
      {...props}
      isIndeterminate={isIndeterminate}
      className={(state) =>
        checkboxRootVariants({
          className: state.isDisabled
            ? 'text-fg-text-disabled-disabled'
            : 'text-fg-text-default-default',
        })
      }
    >
      {(state) => {
        const checkedOrIndeterminate = state.isSelected || state.isIndeterminate;
        return (
          <>
            <span
              className={checkboxControlVariants({
                isSelected: state.isSelected,
                isIndeterminate: state.isIndeterminate,
                isHovered: state.isHovered,
                isPressed: state.isPressed,
                isDisabled: state.isDisabled,
                isFocusVisible: state.isFocusVisible,
              })}
            >
              {checkedOrIndeterminate ? (
                <span className={indicatorVariants({ isDisabled: state.isDisabled })}>
                  {state.isIndeterminate ? (
                    <svg
                      aria-hidden="true"
                      width="10"
                      height="2"
                      viewBox="0 0 10 2"
                      fill="none"
                    >
                      <path d="M1 1H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      width={state.isPressed ? '8' : '10'}
                      height={state.isPressed ? '5' : '6'}
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </span>
              ) : null}
            </span>
            {children ? <span>{children}</span> : null}
          </>
        );
      }}
    </AriaCheckbox>
  );
}
