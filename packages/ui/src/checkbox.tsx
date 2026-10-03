'use client';

import * as React from 'react';
import {
  Checkbox as AriaCheckbox,
  CheckboxGroup as AriaCheckboxGroup,
  CheckboxGroupProps as AriaCheckboxGroupProps,
  CheckboxProps as AriaCheckboxProps,
  Text,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { FieldMessage } from './field-message';
import { hasRenderableMessage } from './field-shared';
import { webkitDhivehiTextBaselineClassName } from './typography-shared';
import { twMerge } from 'tailwind-merge';

const checkboxIndicatorSizes = {
  md: {
    check: { width: 10, height: 10, viewBox: '-1 -1 11.5 8.8' },
    indeterminate: { width: 10, height: 4, viewBox: '0 0 10 4' },
  },
  lg: {
    check: { width: 15, height: 10, viewBox: '-1 -1 11.5 8.8' },
    indeterminate: { width: 15, height: 6, viewBox: '0 0 10 4' },
  },
} as const;

const checkboxGroupVariants = cva('inline-flex flex-col gap-3');

const checkboxRootVariants = cva('group font-sans antialiased', {
  variants: {
    size: {
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
    },
    hasFieldMessages: {
      true: 'inline-grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-2 gap-y-1',
      false: 'inline-flex items-center gap-2',
    },
    isDisabled: {
      true: 'cursor-not-allowed text-disabled',
      false: 'cursor-pointer text-base-strong',
    },
  },
  defaultVariants: {
    size: 'md',
    hasFieldMessages: false,
    isDisabled: false,
  },
});

const checkboxControlSlotVariants = cva('flex shrink-0 items-center', {
  variants: {
    size: {
      md: 'h-5',
      lg: 'h-6',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const checkboxLabelVariants = cva(`min-w-0 ${webkitDhivehiTextBaselineClassName}`);

const checkboxDescriptionVariants = cva('col-start-2 type-body-sm-regular text-base-muted', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const checkboxErrorVariants = cva('col-start-2 text-danger-muted', {
  variants: {
    size: {
      md: 'type-caption-regular',
      lg: 'type-body-sm-regular',
    },
    isDisabled: {
      true: 'text-disabled',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    isDisabled: false,
  },
});

const checkboxControlVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center transition-colors duration-fast ease-out focus-visible:outline-none',
  {
    variants: {
      size: {
        md: 'size-4 rounded-sm',
        lg: 'size-6 rounded-md',
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
        true: '',
        false: '',
      },
      isDisabled: {
        true: '',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'md',
        isPressed: false,
        className: 'border-2',
      },
      {
        size: 'md',
        isPressed: true,
        className: 'border-[3px]',
      },
      {
        size: 'lg',
        isPressed: false,
        className: 'border-[3px]',
      },
      {
        size: 'lg',
        isPressed: true,
        className: 'border-4',
      },
      // Unchecked
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className: 'bg-checkbox-container-bg border-checkbox-container-border',
      },
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: false,
        isHovered: true,
        isPressed: false,
        className: 'bg-checkbox-container-bg border-checkbox-container-border-hover',
      },
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: false,
        isPressed: true,
        className: 'bg-checkbox-container-bg border-checkbox-container-bg-hover',
      },
      {
        isSelected: false,
        isIndeterminate: false,
        isDisabled: true,
        className: 'bg-checkbox-container-bg border-checkbox-indicator-disabled-border',
      },
      // Checked / indeterminate active
      {
        isSelected: true,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className: 'bg-checkbox-container-checked-bg border-checkbox-container-checked-bg',
      },
      {
        isIndeterminate: true,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className:
          'bg-checkbox-container-indeterminate-bg border-checkbox-container-indeterminate-bg',
      },
      {
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        className: 'bg-checkbox-container-bg-hover border-checkbox-container-bg-hover',
      },
      {
        isIndeterminate: true,
        isDisabled: false,
        isHovered: true,
        className: 'bg-checkbox-container-bg-hover border-checkbox-container-bg-hover',
      },
      {
        isSelected: true,
        isDisabled: false,
        isPressed: true,
        className: 'bg-checkbox-container-bg-hover border-checkbox-container-bg-hover',
      },
      {
        isIndeterminate: true,
        isDisabled: false,
        isPressed: true,
        className: 'bg-checkbox-container-bg-hover border-checkbox-container-bg-hover',
      },
      // Disabled selected / indeterminate
      {
        isSelected: true,
        isDisabled: true,
        className: 'bg-checkbox-indicator-disabled-bg border-checkbox-indicator-disabled-bg',
      },
      {
        isIndeterminate: true,
        isDisabled: true,
        className: 'bg-checkbox-indicator-disabled-bg border-checkbox-indicator-disabled-bg',
      },
    ],
    defaultVariants: {
      size: 'md',
      isSelected: false,
      isIndeterminate: false,
      isHovered: false,
      isPressed: false,
      isDisabled: false,
      isFocusVisible: false,
    },
  },
);

const indicatorVariants = cva(
  'pointer-events-none absolute inset-0 flex items-center justify-center text-base-inverted transition-[transform,opacity] duration-normal ease-out',
  {
    variants: {
      isVisible: {
        true: 'opacity-100',
        false: 'opacity-0',
      },
      isIndeterminate: {
        true: '',
        false: '',
      },
    },
    defaultVariants: {
      isVisible: false,
      isIndeterminate: false,
    },
  },
);

export interface CheckboxGroupProps extends Omit<AriaCheckboxGroupProps, 'className' | 'style'> {
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
}

/** Groups checkboxes under one `string[]` value; each `Checkbox` needs a `value`. */
export function CheckboxGroup({
  description,
  errorMessage,
  className,
  children,
  ...props
}: CheckboxGroupProps) {
  return (
    <AriaCheckboxGroup {...props} className={twMerge(checkboxGroupVariants(), className)}>
      {(renderProps) => (
        <>
          {typeof children === 'function' ? children(renderProps) : children}
          <FieldMessage
            isInvalid={renderProps.isInvalid}
            description={description}
            errorMessage={errorMessage}
          />
        </>
      )}
    </AriaCheckboxGroup>
  );
}

export interface CheckboxProps
  extends
    Omit<AriaCheckboxProps, 'className' | 'style' | 'children'>,
    Omit<VariantProps<typeof checkboxRootVariants>, 'isDisabled' | 'hasFieldMessages'> {
  children?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
}

export function Checkbox({
  size,
  children,
  description,
  errorMessage,
  isIndeterminate,
  isInvalid,
  className,
  ...props
}: CheckboxProps) {
  const hasDescription = hasRenderableMessage(description);
  const hasErrorMessage = hasRenderableMessage(errorMessage);
  const hasFieldMessages = hasDescription || (Boolean(isInvalid) && hasErrorMessage);

  return (
    <AriaCheckbox
      {...props}
      isInvalid={isInvalid}
      isIndeterminate={isIndeterminate}
      className={(state) =>
        twMerge(
          checkboxRootVariants({
            size,
            hasFieldMessages,
            isDisabled: state.isDisabled,
          }),
          className,
        )
      }
    >
      {(state) => {
        const checkedOrIndeterminate = state.isSelected || state.isIndeterminate;
        const isHovered = state.isDisabled ? false : state.isHovered;
        const isPressed = state.isDisabled ? false : state.isPressed;
        const resolvedSize = size ?? 'md';
        const indicators = checkboxIndicatorSizes[resolvedSize];
        const indicatorScaleClass =
          checkedOrIndeterminate && (!isPressed || state.isIndeterminate)
            ? 'scale-100'
            : 'scale-70';

        return (
          <>
            <span
              className={checkboxControlSlotVariants({
                size: resolvedSize,
              })}
            >
              <span
                className={checkboxControlVariants({
                  size: resolvedSize,
                  isSelected: state.isSelected,
                  isIndeterminate: state.isIndeterminate,
                  isHovered,
                  isPressed,
                  isDisabled: state.isDisabled,
                  isFocusVisible: state.isFocusVisible,
                })}
              >
                <span
                  className={twMerge(
                    indicatorVariants({
                      isVisible: checkedOrIndeterminate,
                      isIndeterminate: state.isIndeterminate,
                    }),
                    indicatorScaleClass,
                  )}
                >
                  {state.isIndeterminate ? (
                    <svg
                      aria-hidden="true"
                      width={indicators.indeterminate.width}
                      height={indicators.indeterminate.height}
                      viewBox={indicators.indeterminate.viewBox}
                      fill="none"
                    >
                      <path d="M0 2H10" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  ) : (
                    <svg
                      aria-hidden="true"
                      width={indicators.check.width}
                      height={indicators.check.height}
                      viewBox={indicators.check.viewBox}
                      fill="none"
                    >
                      <path d="M0 2.5L3.5 6L9.5 0" stroke="currentColor" strokeWidth="2" />
                    </svg>
                  )}
                </span>
              </span>
            </span>
            {hasFieldMessages ? (
              <>
                {children ? <span className={checkboxLabelVariants()}>{children}</span> : null}
                {hasDescription ? (
                  <Text
                    slot="description"
                    className={checkboxDescriptionVariants({ isDisabled: state.isDisabled })}
                  >
                    {description}
                  </Text>
                ) : null}
                {Boolean(isInvalid) && hasErrorMessage ? (
                  <Text
                    slot="errorMessage"
                    className={checkboxErrorVariants({
                      size: resolvedSize,
                      isDisabled: state.isDisabled,
                    })}
                  >
                    {errorMessage}
                  </Text>
                ) : null}
              </>
            ) : children ? (
              <span className={checkboxLabelVariants()}>{children}</span>
            ) : null}
          </>
        );
      }}
    </AriaCheckbox>
  );
}
