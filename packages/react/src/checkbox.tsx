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
    check: {
      width: 10.9142,
      height: 8.12132,
      viewBox: '0 0 10.9142 8.12132',
      path: 'M0.707107 3.20711L4.20711 6.70711L10.2071 0.707107',
      strokeWidth: 2,
    },
    pressedCheck: {
      width: 10.0411,
      height: 7.47161,
      viewBox: '0 0 10.0411 7.47161',
      path: 'M0.650538 2.95054L3.87054 6.17054L9.39054 0.650538',
      strokeWidth: 1.84,
    },
    indeterminate: { width: 10, height: 4, viewBox: '0 0 10 4' },
  },
  lg: {
    check: {
      width: 13.8149,
      height: 10.6772,
      viewBox: '0 0 13.8149 10.6772',
      path: 'M0.907441 4.19301L5.32849 8.85968L12.9074 0.859681',
      strokeWidth: 2.5,
    },
    pressedCheck: {
      width: 10.4519,
      height: 8.14177,
      viewBox: '0 0 10.4519 8.14177',
      path: 'M0.725953 3.18774L4.04174 6.68774L9.72595 0.687745',
      strokeWidth: 2,
    },
    indeterminate: { width: 13, height: 5, viewBox: '0 0 10 4' },
  },
  xl: {
    check: {
      width: 16.3713,
      height: 12.182,
      viewBox: '0 0 16.3713 12.182',
      path: 'M1.06066 4.81066L6.31066 10.0607L15.3107 1.06066',
      strokeWidth: 3,
    },
    pressedCheck: {
      width: 13.0971,
      height: 9.74558,
      viewBox: '0 0 13.0971 9.74558',
      path: 'M0.848528 3.84853L5.04853 8.04853L12.2485 0.848528',
      strokeWidth: 2.4,
    },
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
        className: 'bg-checkbox-container-bg border-checkbox-container-border-hover',
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
        const check = isPressed ? indicators.pressedCheck : indicators.check;
        const indicatorScaleClass = checkedOrIndeterminate ? 'scale-100' : 'scale-70';

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
                      width={check.width}
                      height={check.height}
                      viewBox={check.viewBox}
                      preserveAspectRatio="none"
                      overflow="visible"
                      fill="none"
                    >
                      <path d={check.path} stroke="currentColor" strokeWidth={check.strokeWidth} />
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
