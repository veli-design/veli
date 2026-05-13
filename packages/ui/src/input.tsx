"use client";

import * as React from 'react';
import {
  Input as AriaInput,
  Label,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { FieldMessage } from './field-shared';

const inputRootVariants = cva('flex w-full flex-col gap-[6px] font-sans antialiased');

const headerLabelVariants = cva('type-body-sm-regular', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-default-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const headerMetaVariants = cva('type-caption-12-regular', {
  variants: {
    tone: {
      subtle: 'text-text-default-subtle',
      danger: 'text-text-danger-muted',
    },
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: '',
    },
  },
  compoundVariants: [
    {
      tone: 'danger',
      isDisabled: true,
      className: 'text-text-disabled-disabled',
    },
  ],
  defaultVariants: {
    tone: 'subtle',
    isDisabled: false,
  },
});

const actionVariants = cva('shrink-0 type-body-sm-medium', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-links-default',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const fieldShellVariants = cva(
  'flex min-h-[36px] w-full items-center gap-[4px] rounded-[6px] px-[6px] py-[6px] transition-[background-color,box-shadow] focus-within:ring-2 focus-within:ring-border-focus focus-within:ring-offset-0',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed bg-gray-alpha-200 shadow-[inset_0_-1px_0_0_rgba(0,36,80,0.04)]',
        false:
          'bg-bg-input-on-white shadow-[inset_0_-1px_0_0_rgba(4,32,66,0.2)] hover:shadow-[inset_0_-1px_0_0_rgba(14,21,29,0.22)]',
      },
      isInvalid: {
        true: 'shadow-[inset_0_-1px_0_0_rgba(192,24,0,1)]',
        false: '',
      },
      isReadOnly: {
        true: 'bg-gray-alpha-100',
        false: '',
      },
    },
    compoundVariants: [
      {
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-gray-alpha-200',
      },
      {
        isDisabled: true,
        isInvalid: true,
        className: 'shadow-[inset_0_-1px_0_0_rgba(0,36,80,0.04)]',
      },
    ],
    defaultVariants: {
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
    },
  }
);

const inlineSlotVariants = cva('flex shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-default-subtle',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const insetSlotVariants = cva(
  'flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[2px] bg-gray-alpha-200',
  {
    variants: {
      isDisabled: {
        true: 'text-text-disabled-disabled',
        false: 'text-text-default-subtle',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  }
);

const inputElementVariants = cva(
  'min-w-0 flex-1 border-0 bg-transparent p-0 type-body-sm-regular text-text-default-default outline-none placeholder:text-text-default-inactive disabled:text-text-disabled-disabled'
);

export interface InputProps
  extends Omit<AriaTextFieldProps, 'children' | 'className' | 'style' | 'spellCheck'> {
  label?: React.ReactNode;
  labelSupplementary?: React.ReactNode;
  labelIcon?: React.ReactNode;
  action?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  showRequiredIndicator?: boolean;
  startAddon?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  endAddon?: React.ReactNode;
  autoCapitalize?: React.InputHTMLAttributes<HTMLInputElement>['autoCapitalize'];
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete'];
  autoCorrect?: React.InputHTMLAttributes<HTMLInputElement>['autoCorrect'];
  enterKeyHint?: React.InputHTMLAttributes<HTMLInputElement>['enterKeyHint'];
  inputMode?: React.InputHTMLAttributes<HTMLInputElement>['inputMode'];
  maxLength?: React.InputHTMLAttributes<HTMLInputElement>['maxLength'];
  minLength?: React.InputHTMLAttributes<HTMLInputElement>['minLength'];
  pattern?: React.InputHTMLAttributes<HTMLInputElement>['pattern'];
  placeholder?: string;
  spellCheck?: React.InputHTMLAttributes<HTMLInputElement>['spellCheck'];
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    label,
    labelSupplementary,
    labelIcon,
    action,
    description,
    errorMessage,
    showRequiredIndicator = true,
    startAddon,
    startContent,
    endContent,
    endAddon,
    autoCapitalize,
    autoComplete,
    autoCorrect,
    enterKeyHint,
    inputMode,
    maxLength,
    minLength,
    pattern,
    placeholder,
    spellCheck,
    type = 'text',
    ...props
  },
  ref
) {
  return (
    <AriaTextField {...props} className={inputRootVariants()}>
      {({ isDisabled, isInvalid, isReadOnly, isRequired }) => (
        <>
          {label || labelSupplementary || labelIcon || action || (showRequiredIndicator && isRequired) ? (
            <div className="flex w-full items-center gap-[8px]">
              <div className="flex min-w-0 flex-1 items-center gap-[4px]">
                {label ? (
                  <Label className={headerLabelVariants({ isDisabled })}>{label}</Label>
                ) : null}
                {labelSupplementary ? (
                  <span className={headerMetaVariants({ tone: 'subtle', isDisabled })}>
                    {labelSupplementary}
                  </span>
                ) : null}
                {showRequiredIndicator && isRequired ? (
                  <span className={headerMetaVariants({ tone: 'danger', isDisabled })}>*</span>
                ) : null}
                {labelIcon ? (
                  <span className={inlineSlotVariants({ isDisabled })}>{labelIcon}</span>
                ) : null}
              </div>
              {action ? <div className={actionVariants({ isDisabled })}>{action}</div> : null}
            </div>
          ) : null}

          <div
            className={fieldShellVariants({
              isDisabled,
              isInvalid,
              isReadOnly,
            })}
          >
            {startAddon ? (
              <div className={insetSlotVariants({ isDisabled })}>{startAddon}</div>
            ) : null}
            {startContent ? (
              <div className={inlineSlotVariants({ isDisabled })}>{startContent}</div>
            ) : null}
            <AriaInput
              ref={ref}
              autoCapitalize={autoCapitalize}
              autoComplete={autoComplete}
              autoCorrect={autoCorrect}
              enterKeyHint={enterKeyHint}
              inputMode={inputMode}
              maxLength={maxLength}
              minLength={minLength}
              pattern={pattern}
              placeholder={placeholder}
              spellCheck={spellCheck}
              type={type}
              className={inputElementVariants()}
            />
            {endContent ? (
              <div className={inlineSlotVariants({ isDisabled })}>{endContent}</div>
            ) : null}
            {endAddon ? <div className={insetSlotVariants({ isDisabled })}>{endAddon}</div> : null}
          </div>

          <FieldMessage
            isInvalid={isInvalid}
            description={description}
            errorMessage={errorMessage}
          />
        </>
      )}
    </AriaTextField>
  );
});
