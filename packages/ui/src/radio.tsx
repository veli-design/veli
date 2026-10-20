'use client';

import * as React from 'react';
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  RadioProps as AriaRadioProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { FieldMessage } from './field-message.js';
import { hasRenderableMessage } from './field-shared.js';
import { twMerge } from 'tailwind-merge';

const radioGroupVariants = cva('inline-flex max-w-full flex-col gap-3');

const radioRootVariants = cva(
  'group relative inline-flex min-h-6 max-w-full gap-2 wrap-anywhere font-sans antialiased',
  {
    variants: {
      size: {
        md: 'type-body-sm-regular',
        lg: 'type-body-md-regular',
        xl: 'type-body-lg-regular pe-2',
      },
      hasFieldMessages: {
        true: 'items-start',
        false: 'items-center',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: 'cursor-pointer text-base-strong',
      },
    },
    compoundVariants: [{ size: 'xl', hasFieldMessages: false, className: 'items-start' }],
    defaultVariants: {
      size: 'md',
      hasFieldMessages: false,
      isDisabled: false,
    },
  },
);

const radioControlSlotVariants = cva('flex shrink-0 items-center', {
  variants: {
    size: {
      md: 'h-5',
      lg: 'h-7',
      xl: 'h-7',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const radioLabelVariants = cva('min-w-0 wrap-anywhere');

const radioDescriptionVariants = cva('text-base-muted', {
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

const radioErrorVariants = cva('text-danger-muted', {
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

const controlVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full border-solid bg-radio-container-bg transition-[border-width] duration-fast ease-out motion-reduce:transition-none forced-colors:forced-color-adjust-none forced-colors:border-[ButtonText] forced-colors:bg-[Canvas] focus-visible:outline-none',
  {
    variants: {
      size: {
        md: 'size-4',
        lg: 'size-6',
        xl: 'size-6',
      },
      isSelected: {
        true: '',
        false: '',
      },
      isHovered: {
        true: '',
        false: '',
      },
      isPressed: {
        true: 'ease-spring',
        false: 'ease-out',
      },
      isDisabled: {
        true: '',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised forced-colors:outline-solid forced-colors:outline-2 forced-colors:outline-offset-2 forced-colors:outline-[Highlight]',
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
        className: 'border-3',
      },
      {
        size: 'lg',
        isPressed: false,
        className: 'border-3',
      },
      {
        size: ['lg', 'xl'],
        isPressed: true,
        className: 'border-4',
      },
      {
        size: 'xl',
        isPressed: false,
        isDisabled: false,
        className: 'border-3',
      },
      {
        size: 'xl',
        isSelected: false,
        isDisabled: true,
        className: 'border-3',
      },
      {
        size: 'xl',
        isSelected: true,
        isDisabled: true,
        className: 'border-2',
      },
      {
        isSelected: false,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className: 'border-radio-container-off-border',
      },
      {
        isSelected: false,
        isDisabled: false,
        isHovered: true,
        isPressed: false,
        className: 'border-radio-container-off-border-hover',
      },
      {
        isSelected: false,
        isDisabled: false,
        isPressed: true,
        className: 'border-radio-container-off-border-hover',
      },
      {
        isSelected: true,
        isDisabled: false,
        isHovered: false,
        isPressed: false,
        className: 'border-radio-container-selected-border',
      },
      {
        isSelected: true,
        isDisabled: false,
        isHovered: true,
        isPressed: false,
        className: 'border-radio-container-selected-border-hover',
      },
      {
        isSelected: true,
        isDisabled: false,
        isPressed: true,
        className: 'border-radio-container-selected-border-hover',
      },
      {
        isDisabled: true,
        className: 'border-radio-indicator-disabled-border forced-colors:border-[GrayText]',
      },
    ],
    defaultVariants: {
      size: 'md',
      isSelected: false,
      isHovered: false,
      isPressed: false,
      isDisabled: false,
      isFocusVisible: false,
    },
  },
);

const indicatorVariants = cva(
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-[width,height] duration-fast ease-out motion-reduce:transition-none',
  {
    variants: {
      size: {
        md: '',
        lg: '',
        xl: '',
      },
      isPressed: {
        true: 'ease-spring',
        false: 'ease-out',
      },
      isSelected: {
        true: '',
        false: '',
      },
      isHovered: {
        true: '',
        false: '',
      },
      isDisabled: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        size: 'md',
        isPressed: false,
        className: 'size-2',
      },
      {
        size: 'md',
        isPressed: true,
        className: 'size-1.5',
      },
      {
        size: ['lg', 'xl'],
        isPressed: false,
        className: 'size-3.5',
      },
      {
        size: ['lg', 'xl'],
        isPressed: true,
        className: 'size-2.5',
      },
      {
        isSelected: false,
        isDisabled: false,
        className: 'bg-transparent',
      },
      {
        isSelected: false,
        isDisabled: true,
        className: 'bg-transparent',
      },
      {
        isSelected: true,
        isHovered: false,
        isDisabled: false,
        className: 'bg-radio-indicator-selected-bg forced-colors:bg-[Highlight]',
      },
      {
        isSelected: true,
        isHovered: true,
        isDisabled: false,
        className: 'bg-radio-indicator-selected-bg-hover forced-colors:bg-[Highlight]',
      },
      {
        isSelected: true,
        isPressed: true,
        isDisabled: false,
        className: 'bg-radio-indicator-selected-bg-hover forced-colors:bg-[Highlight]',
      },
      {
        isSelected: true,
        isDisabled: true,
        className: 'bg-radio-indicator-disabled-bg forced-colors:bg-[GrayText]',
      },
    ],
    defaultVariants: {
      size: 'md',
      isPressed: false,
      isSelected: false,
      isHovered: false,
      isDisabled: false,
    },
  },
);

export interface RadioGroupProps extends Omit<AriaRadioGroupProps, 'className' | 'style'> {
  ref?: React.Ref<HTMLDivElement>;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
}

export function RadioGroup({
  description,
  errorMessage,
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup {...props} className={twMerge(radioGroupVariants(), className)}>
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
    </AriaRadioGroup>
  );
}

export interface RadioProps
  extends
    Omit<AriaRadioProps, 'className' | 'style' | 'children'>,
    Omit<VariantProps<typeof radioRootVariants>, 'isDisabled' | 'hasFieldMessages'> {
  ref?: React.Ref<HTMLLabelElement>;
  children?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  isInvalid?: boolean;
  className?: string;
}

export function Radio({
  size = 'md',
  children,
  description,
  errorMessage,
  isInvalid,
  className,
  ...props
}: RadioProps) {
  const messageId = React.useId();
  const labelId = `${messageId}-label`;
  const descriptionId = `${messageId}-description`;
  const errorId = `${messageId}-error`;
  const hasDescription = hasRenderableMessage(description);
  const hasErrorMessage = hasRenderableMessage(errorMessage);
  const hasFieldMessages = hasDescription || (Boolean(isInvalid) && hasErrorMessage);

  return (
    <AriaRadio
      {...props}
      aria-labelledby={
        props['aria-labelledby'] ??
        (props['aria-label'] ? undefined : hasRenderableMessage(children) ? labelId : undefined)
      }
      aria-describedby={
        [
          props['aria-describedby'],
          hasDescription ? descriptionId : undefined,
          Boolean(isInvalid) && hasErrorMessage ? errorId : undefined,
        ]
          .filter(Boolean)
          .join(' ') || undefined
      }
      className={(state) =>
        twMerge(
          radioRootVariants({
            size,
            hasFieldMessages,
            isDisabled: state.isDisabled,
          }),
          className,
        )
      }
    >
      {(state) => {
        const isHovered = state.isDisabled ? false : state.isHovered;
        const isPressed = state.isDisabled ? false : state.isPressed;
        const resolvedSize = size ?? 'md';

        return (
          <>
            <span
              aria-hidden="true"
              className={radioControlSlotVariants({
                size: resolvedSize,
              })}
            >
              <span
                className={controlVariants({
                  size: resolvedSize,
                  isSelected: state.isSelected,
                  isHovered,
                  isPressed,
                  isDisabled: state.isDisabled,
                  isFocusVisible: state.isFocusVisible,
                })}
              >
                <span
                  className={indicatorVariants({
                    size: resolvedSize,
                    isPressed,
                    isSelected: state.isSelected,
                    isHovered,
                    isDisabled: state.isDisabled,
                  })}
                />
              </span>
            </span>
            {hasFieldMessages ? (
              <span className="flex min-w-0 flex-col gap-1">
                {hasRenderableMessage(children) ? (
                  <span id={labelId} className={radioLabelVariants()}>
                    {children}
                  </span>
                ) : null}
                {hasDescription ? (
                  <span
                    id={descriptionId}
                    className={radioDescriptionVariants({
                      size: resolvedSize,
                      isDisabled: state.isDisabled,
                    })}
                  >
                    {description}
                  </span>
                ) : null}
                {Boolean(isInvalid) && hasErrorMessage ? (
                  <span
                    id={errorId}
                    className={radioErrorVariants({
                      size: resolvedSize,
                      isDisabled: state.isDisabled,
                    })}
                  >
                    {errorMessage}
                  </span>
                ) : null}
              </span>
            ) : hasRenderableMessage(children) ? (
              <span id={labelId} className={radioLabelVariants()}>
                {children}
              </span>
            ) : null}
          </>
        );
      }}
    </AriaRadio>
  );
}
