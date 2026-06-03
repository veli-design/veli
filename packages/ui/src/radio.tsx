'use client';

import * as React from 'react';
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  RadioGroupProps as AriaRadioGroupProps,
  RadioProps as AriaRadioProps,
  Text,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { hasRenderableMessage } from './field-shared';
import { twMerge } from 'tailwind-merge';

const radioGroupVariants = cva('inline-flex flex-col gap-3');

const radioRootVariants = cva('group inline-flex gap-2 font-sans antialiased transition-colors', {
  variants: {
    size: {
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
    },
    hasFieldMessages: {
      true: 'items-start',
      false: 'items-center',
    },
    isDisabled: {
      true: 'cursor-not-allowed text-text-disabled-disabled',
      false: 'cursor-pointer text-text-default-strong',
    },
  },
  defaultVariants: {
    size: 'md',
    hasFieldMessages: false,
    isDisabled: false,
  },
});

const radioControlSlotVariants = cva('flex shrink-0 items-center', {
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

const radioDescriptionVariants = cva('type-body-sm-regular text-text-default-muted', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: '',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const radioErrorVariants = cva('text-text-danger-muted', {
  variants: {
    size: {
      md: 'type-caption-regular',
      lg: 'type-body-sm-regular',
    },
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    isDisabled: false,
  },
});

const controlVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center rounded-full border-solid bg-radio-container-bg transition-colors focus-visible:outline-none',
  {
    variants: {
      size: {
        md: 'size-4',
        lg: 'size-6',
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
        className: '[border-color:var(--color-bg-primary-hover)]',
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
        className: '[border-color:var(--color-bg-primary-hover)]',
      },
      {
        isDisabled: true,
        className: 'border-radio-indicator-disabled-border',
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
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors',
  {
    variants: {
      size: {
        md: '',
        lg: '',
      },
      isPressed: {
        true: '',
        false: '',
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
        size: 'lg',
        isPressed: false,
        className: 'size-3.5',
      },
      {
        size: 'lg',
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
        className: 'bg-radio-indicator-selected-bg',
      },
      {
        isSelected: true,
        isHovered: true,
        isDisabled: false,
        className: 'bg-radio-indicator-selected-bg-hover',
      },
      {
        isSelected: true,
        isDisabled: true,
        className: 'bg-radio-indicator-disabled-bg',
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
  className?: string;
}

export function RadioGroup({ className, ...props }: RadioGroupProps) {
  return <AriaRadioGroup {...props} className={twMerge(radioGroupVariants(), className)} />;
}

export interface RadioProps
  extends
    Omit<AriaRadioProps, 'className' | 'style' | 'children'>,
    Omit<VariantProps<typeof radioRootVariants>, 'isDisabled' | 'hasFieldMessages'> {
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
  const hasDescription = hasRenderableMessage(description);
  const hasErrorMessage = hasRenderableMessage(errorMessage);
  const hasFieldMessages = hasDescription || (Boolean(isInvalid) && hasErrorMessage);

  return (
    <AriaRadio
      {...props}
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
            <span className={radioControlSlotVariants({ size: resolvedSize })}>
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
                {children ? <span>{children}</span> : null}
                {hasDescription ? (
                  <Text
                    slot="description"
                    className={radioDescriptionVariants({ isDisabled: state.isDisabled })}
                  >
                    {description}
                  </Text>
                ) : null}
                {Boolean(isInvalid) && hasErrorMessage ? (
                  <Text
                    slot="errorMessage"
                    className={radioErrorVariants({
                      size: resolvedSize,
                      isDisabled: state.isDisabled,
                    })}
                  >
                    {errorMessage}
                  </Text>
                ) : null}
              </span>
            ) : (
              children
            )}
          </>
        );
      }}
    </AriaRadio>
  );
}
