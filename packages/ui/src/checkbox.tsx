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
import { FieldMessage } from './field-message.js';
import { hasRenderableMessage } from './field-shared.js';
import { webkitDhivehiTextBaselineClassName } from './typography-shared.js';
import { twMerge } from 'tailwind-merge';

const checkboxIndicatorSizes = {
  md: {
    check: { width: 10, height: 10, viewBox: '-1 -1 11.5 8.8' },
    indeterminate: { width: 10, height: 4, viewBox: '0 0 10 4' },
  },
  lg: {
    check: { width: 12, height: 8, viewBox: '-1 -1 11.5 8.8' },
    indeterminate: { width: 13, height: 5, viewBox: '0 0 10 4' },
  },
  xl: {
    check: { width: 14.25, height: 9, viewBox: '-1 -1 11.5 8.8' },
    indeterminate: { width: 15, height: 6, viewBox: '0 0 10 4' },
  },
} as const;

const checkboxGroupVariants = cva(
  'inline-flex flex-col gap-3 [&>[slot=description]]:text-base-muted',
);

const checkboxRootVariants = cva('group relative font-sans antialiased', {
  variants: {
    size: {
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
      xl: 'type-body-lg-regular',
    },
    hasFieldMessages: {
      true: 'inline-grid max-w-full grid-cols-[auto_minmax(0,1fr)] items-center gap-x-3 gap-y-1',
      false: 'inline-flex max-w-full items-center gap-3',
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

const checkboxControlSlotVariants = cva('flex shrink-0 self-start items-center', {
  variants: {
    size: {
      md: 'h-5',
      lg: 'h-6',
      xl: 'h-7',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const checkboxLabelVariants = cva(`min-w-0 wrap-anywhere ${webkitDhivehiTextBaselineClassName}`);

const checkboxDescriptionVariants = cva('col-start-2 min-w-0 wrap-anywhere text-base-muted', {
  variants: {
    size: {
      md: 'type-body-sm-regular',
      lg: 'type-body-sm-regular',
      xl: 'type-body-md-regular',
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

const checkboxErrorVariants = cva('col-start-2 min-w-0 wrap-anywhere text-danger-muted', {
  variants: {
    size: {
      md: 'type-caption-regular',
      lg: 'type-body-sm-regular',
      xl: 'type-body-md-regular',
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
  'relative inline-flex shrink-0 items-center justify-center transition-colors duration-fast ease-out motion-reduce:transition-none focus-visible:outline-none',
  {
    variants: {
      size: {
        md: 'size-4 rounded-sm',
        lg: 'size-5 rounded-md',
        xl: 'size-6 rounded-md',
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
      {
        size: 'xl',
        isPressed: false,
        className: 'border-[3px]',
      },
      {
        size: 'xl',
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
  'pointer-events-none absolute inset-0 flex items-center justify-center text-white transition-[transform,opacity] duration-normal ease-out motion-reduce:transition-none',
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
          {renderProps.isInvalid ? (
            <span role="alert">
              <FieldMessage
                isInvalid={renderProps.isInvalid}
                description={description}
                errorMessage={errorMessage}
              />
            </span>
          ) : (
            <FieldMessage
              isInvalid={renderProps.isInvalid}
              description={description}
              errorMessage={errorMessage}
            />
          )}
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
  onClick,
  onPress,
  ...props
}: CheckboxProps) {
  const pressHandled = React.useRef(false);
  const labelId = React.useId();
  const descriptionId = React.useId();
  const errorId = React.useId();
  const hasDescription = hasRenderableMessage(description);
  const hasErrorMessage = hasRenderableMessage(errorMessage);
  const hasLabel = hasRenderableMessage(children);
  const hasFieldMessages = hasDescription || (Boolean(isInvalid) && hasErrorMessage);
  const describedBy =
    [
      props['aria-describedby'],
      hasDescription ? descriptionId : undefined,
      isInvalid && hasErrorMessage ? errorId : undefined,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  return (
    <AriaCheckbox
      {...props}
      onPress={(event) => {
        pressHandled.current = true;
        onPress?.(event);
      }}
      onClick={(event) => {
        onClick?.(event);
        const input = event.currentTarget.querySelector<HTMLInputElement>('input[type="checkbox"]');
        if (
          !input ||
          event.target === input ||
          input.disabled ||
          input.getAttribute('aria-readonly') === 'true'
        ) {
          pressHandled.current = false;
          return;
        }
        queueMicrotask(() => {
          if (!pressHandled.current && input.isConnected) input.click();
          pressHandled.current = false;
        });
      }}
      aria-labelledby={
        props['aria-labelledby'] ?? (hasLabel && !props['aria-label'] ? labelId : undefined)
      }
      aria-describedby={describedBy}
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
                {hasLabel ? (
                  <span id={labelId} className={checkboxLabelVariants()}>
                    {children}
                  </span>
                ) : null}
                {hasDescription ? (
                  <Text
                    id={descriptionId}
                    slot="description"
                    className={checkboxDescriptionVariants({
                      size: resolvedSize,
                      isDisabled: state.isDisabled,
                    })}
                  >
                    {description}
                  </Text>
                ) : null}
                {Boolean(isInvalid) && hasErrorMessage ? (
                  <Text
                    id={errorId}
                    slot="errorMessage"
                    role="alert"
                    className={checkboxErrorVariants({
                      size: resolvedSize,
                      isDisabled: state.isDisabled,
                    })}
                  >
                    {errorMessage}
                  </Text>
                ) : null}
              </>
            ) : hasLabel ? (
              <span id={labelId} className={checkboxLabelVariants()}>
                {children}
              </span>
            ) : null}
          </>
        );
      }}
    </AriaCheckbox>
  );
}
