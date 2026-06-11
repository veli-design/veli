'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Group,
  Input as AriaInput,
  Label,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info } from 'phosphor-react';
import {
  defaultFieldUnderlineDisabled,
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
} from './field-shared';
import { useVeliLanguage } from './provider';
import { Tooltip, TooltipTrigger } from './tooltip';
import { twMerge } from 'tailwind-merge';

const inputRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

const inputSkeletonRootVariants = cva('flex w-full flex-col items-start font-sans antialiased');

const headerLabelVariants = cva('type-body-sm-medium', {
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

const headerMetaVariants = cva('type-caption-regular', {
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

const infoTooltipTriggerVariants = cva(
  'inline-flex size-4 shrink-0 items-center justify-center rounded-xs border-0 bg-transparent p-0 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-raised',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-text-disabled-disabled',
        false: 'cursor-help text-text-default-subtle hover:text-text-default-default',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

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

const skeletonLineVariants = cva('h-2 w-[76px] shrink-0 rounded-[3px] bg-bg-skeleton', {
  variants: {
    size: {
      sm: 'h-2',
      md: 'h-2',
      lg: 'h-3',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const skeletonFieldVariants = cva('w-full shrink-0 rounded-md bg-bg-skeleton', {
  variants: {
    size: {
      sm: 'h-9',
      md: 'h-11',
      lg: 'h-13',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const fieldShellVariants = cva(
  'relative flex w-full items-center gap-1 rounded-md transition-[background-color,border-color] has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised',
  {
    variants: {
      variant: {
        default: '',
        outline: '',
        skeleton: '',
      },
      size: {
        sm: 'h-9 py-2 px-3',
        md: 'h-11 py-3 px-4',
        lg: 'h-13 py-3.5 px-4',
      },
      isDisabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-text',
      },
      isInvalid: {
        true: '',
        false: '',
      },
      isReadOnly: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg-default hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        variant: 'default',
        isDisabled: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled} bg-gray-alpha-200`,
      },
      {
        variant: 'default',
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg-default hover:bg-text-input-bg-hover`,
      },
      {
        variant: 'default',
        isDisabled: true,
        isInvalid: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled}`,
      },
      {
        variant: 'default',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className:
          'border border-text-input-stroke-default bg-text-input-bg-default [&:hover:not(:focus-within)]:border-[1.5px] [&:hover:not(:focus-within)]:border-text-input-stroke-hover [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:border-2 focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed has-[input[data-focus-visible]]:border-transparent has-[input[data-focus-visible]]:hover:border-transparent',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        variant: 'outline',
        isDisabled: true,
        className: 'border border-text-input-stroke-disabled bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border border-text-input-stroke-error bg-text-input-bg-default [&:hover:not(:focus-within)]:border-[1.5px] [&:hover:not(:focus-within)]:border-text-input-stroke-error [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:border-2 focus-within:border-text-input-stroke-error focus-within:bg-text-input-bg-default',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border border-text-input-stroke-disabled',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-gray-alpha-200',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
    },
  },
);

const inlineSlotVariants = cva('relative z-[1] flex shrink-0 items-center justify-center', {
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

const errorIconVariants = cva('relative z-[1] flex shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: 'text-text-danger-muted',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const insetSlotVariants = cva(
  'relative z-[1] flex shrink-0 items-center justify-center rounded-xs',
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
  },
);

const inputElementVariants = cva(
  'relative z-0 min-w-0 flex-1 border-0 bg-transparent text-text-default-default outline-none placeholder:text-text-default-inactive disabled:text-text-disabled-disabled [&:lang(dv)]:!font-[var(--font-dhivehi-faseyha)]',
  {
    variants: {
      size: {
        sm: '-mx-3 -my-2 px-3 py-2 type-body-sm-regular [&:lang(dv)]:!h-9 [&:lang(dv)]:!text-[14px] [&:lang(dv)]:!leading-5 [&:lang(dv)]:!pt-3 [&:lang(dv)]:!pb-1',
        md: '-mx-4 -my-3 px-4 py-3 type-body-sm-regular [&:lang(dv)]:!h-11 [&:lang(dv)]:!text-[16px] [&:lang(dv)]:!leading-5 [&:lang(dv)]:!pt-4 [&:lang(dv)]:!pb-2',
        lg: '-mx-4 -my-3.5 px-4 py-3.5 type-body-md-regular [&:lang(dv)]:!h-13 [&:lang(dv)]:!text-[17px] [&:lang(dv)]:!leading-6 [&:lang(dv)]:!pt-[18px] [&:lang(dv)]:!pb-2.5',
      },
      isReadOnly: {
        true: 'text-text-default-strong',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      isReadOnly: false,
    },
  },
);

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

function focusInputFromShell(event: React.MouseEvent<HTMLElement>, isDisabled: boolean) {
  if (isDisabled) return;

  const input = event.currentTarget.querySelector('input');
  if (!input) return;

  const target = event.target as HTMLElement;
  if (target === input || target.closest('input, textarea, button, a, select, [role="button"]')) {
    return;
  }

  event.preventDefault();
  input.focus();
}

export interface InputProps
  extends
    Omit<AriaTextFieldProps, 'children' | 'className' | 'style' | 'spellCheck'>,
    Omit<VariantProps<typeof fieldShellVariants>, 'isDisabled' | 'isInvalid' | 'isReadOnly'> {
  label?: React.ReactNode;
  infoTooltip?: React.ReactNode;
  infoTooltipAriaLabel?: string;
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
  className?: string;
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
    infoTooltip,
    infoTooltipAriaLabel,
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
    className,
    variant = 'default',
    size = 'md',
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
  ref,
) {
  const languageConfig = useVeliLanguage();
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];
  const hasSkeletonHeader = Boolean(
    label ||
    infoTooltip ||
    labelSupplementary ||
    labelIcon ||
    action ||
    (showRequiredIndicator && props.isRequired),
  );
  const hasSkeletonFooter = Boolean(description || errorMessage);

  if (variant === 'skeleton') {
    return (
      <div className={twMerge(inputSkeletonRootVariants(), className)} aria-hidden="true">
        {hasSkeletonHeader ? (
          <div className="flex w-full items-center pb-2">
            <div className={skeletonLineVariants({ size })} />
          </div>
        ) : null}
        <div className={skeletonFieldVariants({ size })} />
        {hasSkeletonFooter ? (
          <div className="flex w-full items-center pt-1">
            <div className={skeletonLineVariants({ size })} />
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <AriaTextField {...props} className={twMerge(inputRootVariants(), className)}>
      {({ isDisabled, isInvalid, isReadOnly, isRequired }) => (
        <>
          {label ||
          infoTooltip ||
          labelSupplementary ||
          labelIcon ||
          action ||
          (showRequiredIndicator && isRequired) ? (
            <div className="flex w-full items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                {label ? (
                  <Label className={headerLabelVariants({ isDisabled })}>{label}</Label>
                ) : null}
                {infoTooltip ? (
                  <TooltipTrigger>
                    <AriaButton
                      type="button"
                      aria-label={resolvedInfoTooltipAriaLabel}
                      className={infoTooltipTriggerVariants({ isDisabled })}
                      isDisabled={isDisabled}
                    >
                      <Info size={16} aria-hidden />
                    </AriaButton>
                    <Tooltip
                      placement="top"
                      lang={languageConfig.lang}
                      dir={languageConfig.direction}
                    >
                      {infoTooltip}
                    </Tooltip>
                  </TooltipTrigger>
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

          <Group
            className={fieldShellVariants({
              variant,
              size,
              isDisabled,
              isInvalid,
              isReadOnly,
            })}
            onMouseDown={(event) => focusInputFromShell(event, isDisabled)}
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
              className={inputElementVariants({ size, isReadOnly })}
            />
            {endContent ? (
              <div className={inlineSlotVariants({ isDisabled })}>{endContent}</div>
            ) : null}
            {isInvalid ? (
              <div className={errorIconVariants({ isDisabled })} aria-hidden>
                <Info size={size === 'lg' ? 20 : 16} weight="fill" />
              </div>
            ) : null}
            {endAddon ? <div className={insetSlotVariants({ isDisabled })}>{endAddon}</div> : null}
          </Group>

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
