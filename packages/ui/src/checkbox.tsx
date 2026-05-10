import * as React from 'react';
import {
  Checkbox as AriaCheckbox,
  CheckboxProps as AriaCheckboxProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';

const checkboxRootVariants = cva(
  'group inline-flex items-center gap-[8px] type-body-sm-medium antialiased text-text-default-default disabled:cursor-not-allowed'
);

const checkboxControlVariants = cva(
  'relative inline-flex size-[16px] shrink-0 items-center justify-center border-2 transition-colors focus-visible:outline-none',
  {
    variants: {
      shape: {
        square: 'rounded-[3px]',
        round: 'rounded-full',
      },
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
        true: 'ring-2 ring-border-focus ring-offset-1 ring-offset-bg-surface-raised',
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
          'bg-inputs-checkbox-container-bg border-inputs-checkbox-container-border-hover',
      },
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: true,
        className:
          'bg-inputs-checkbox-container-bg border-inputs-checkbox-container-border',
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
          'bg-inputs-checkbox-container-border border-inputs-checkbox-container-border',
      },
      {
        isIndeterminate: true,
        isDisabled: true,
        className:
          'bg-inputs-checkbox-container-border border-inputs-checkbox-container-border',
      },
    ],
    defaultVariants: {
      shape: 'square',
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
        true: 'text-inputs-checkbox-indicator-disabled-bg',
        false: 'text-white',
      },
    },
  }
);

export interface CheckboxProps
  extends Omit<AriaCheckboxProps, 'className' | 'style' | 'children'> {
  children?: React.ReactNode;
  shape?: 'square' | 'round';
}

export function Checkbox({
  children,
  shape = 'square',
  isIndeterminate,
  ...props
}: CheckboxProps) {
  return (
    <AriaCheckbox {...props} isIndeterminate={isIndeterminate} className={checkboxRootVariants()}>
      {(state) => {
        const checkedOrIndeterminate = state.isSelected || state.isIndeterminate;
        return (
          <>
            <span
              className={checkboxControlVariants({
                shape,
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
