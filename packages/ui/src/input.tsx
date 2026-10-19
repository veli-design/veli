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
import { InfoIcon, WarningCircleIcon } from '@phosphor-icons/react';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  fieldInputAutofill,
  getFieldOptionalLabel,
  outlineFieldStrokeError,
  outlineFieldStrokeFocusVisibleHide,
  outlineFieldStrokeRest,
  shouldShowFieldOptional,
} from './field-shared.js';
import { useVeliLanguage } from './provider.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';
import { webkitDhivehiTextBaselineClassName } from './typography-shared.js';
import { twMerge } from 'tailwind-merge';
import { type RefProp } from './ref.js';

const inputRootVariants = cva('flex w-full flex-col font-sans antialiased');

type InputAppearance = VariantProps<typeof fieldShellVariants>['appearance'];
type InputSize = VariantProps<typeof fieldShellVariants>['size'];

const actionVariants = cva('shrink-0 type-body-sm-medium', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: 'text-links',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const fieldShellVariants = cva(
  'relative flex w-full items-center gap-2 rounded-md overflow-hidden transition-[background-color,box-shadow] duration-normal ease-out motion-reduce:transition-none has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised',
  {
    variants: {
      appearance: {
        default: '',
        outline: '',
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
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className: `${outlineFieldStrokeRest.input} ${outlineFieldStrokeFocusVisibleHide.input} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className: `${outlineFieldStrokeError} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg`,
      },
      {
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
    ],
    defaultVariants: {
      appearance: 'default',
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
      true: 'text-disabled',
      false: 'text-base-subtle',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const errorIconVariants = cva('relative z-[1] flex shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-disabled',
      false: 'text-danger-muted',
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
        true: 'text-disabled',
        false: 'text-base-subtle',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const inputElementVariants = cva(
  `relative z-0 min-w-0 flex-1 border-0 bg-transparent text-base-strong outline-none placeholder:text-base-inactive disabled:text-disabled ${fieldInputAutofill} ${webkitDhivehiTextBaselineClassName}`,
  {
    variants: {
      size: {
        sm: '-mx-3 -my-2 px-3 py-2 type-body-sm-regular',
        md: '-mx-4 -my-3 px-4 py-3 type-body-sm-regular',
        lg: '-mx-4 -my-3.5 px-4 py-3.5 type-body-md-regular',
      },
      isLtrValueInRtl: {
        true: 'placeholder-shown:[direction:rtl] [&:not(:placeholder-shown)]:font-sans!',
        false: '',
      },
    },
    defaultVariants: {
      size: 'md',
      isLtrValueInRtl: false,
    },
  },
);

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

const ltrValueInputTypes = new Set(['email', 'password', 'tel', 'url']);

function getInputValueDirection(type: React.InputHTMLAttributes<HTMLInputElement>['type']) {
  return typeof type === 'string' && ltrValueInputTypes.has(type.toLowerCase()) ? 'ltr' : undefined;
}

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
    Omit<AriaTextFieldProps, 'children' | 'className' | 'defaultValue' | 'style' | 'spellCheck'>,
    Omit<
      VariantProps<typeof fieldShellVariants>,
      'appearance' | 'isDisabled' | 'isInvalid' | 'isReadOnly' | 'size'
    >,
    RefProp<HTMLInputElement> {
  appearance?: InputAppearance;
  size?: InputSize;
  defaultValue?: string;
  label?: React.ReactNode;
  infoTooltip?: React.ReactNode;
  infoTooltipAriaLabel?: string;
  /** Shows a localized Optional caption beside the label. Hidden when `isRequired` is set. */
  isOptional?: boolean;
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

export function Input({
  label,
  infoTooltip,
  infoTooltipAriaLabel,
  isOptional = false,
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
  appearance = 'default',
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
  ref,
  ...props
}: InputProps) {
  const languageConfig = useVeliLanguage();
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];
  const inputValueDirection = getInputValueDirection(type);
  return (
    <AriaTextField {...props} className={twMerge(inputRootVariants(), className)}>
      {({ isDisabled, isInvalid, isReadOnly, isRequired }) => {
        const showOptionalLabel = shouldShowFieldOptional(isOptional, isRequired);

        return (
          <>
            {label ||
            infoTooltip ||
            showOptionalLabel ||
            labelIcon ||
            action ||
            (showRequiredIndicator && isRequired) ? (
              <div className="flex w-full items-center gap-2 pb-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {label ? (
                    <Label className={fieldHeaderLabelVariants({ size, isDisabled })}>
                      {label}
                    </Label>
                  ) : null}
                  {infoTooltip ? (
                    <TooltipTrigger>
                      <AriaButton
                        type="button"
                        aria-label={resolvedInfoTooltipAriaLabel}
                        className={fieldHeaderInfoTooltipTriggerVariants({ isDisabled })}
                        isDisabled={isDisabled}
                      >
                        <InfoIcon size={16} aria-hidden />
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
                  {showOptionalLabel ? (
                    <span className={fieldHeaderSupplementaryVariants({ size, isDisabled })}>
                      {getFieldOptionalLabel(languageConfig.language)}
                    </span>
                  ) : null}
                  {showRequiredIndicator && isRequired ? (
                    <span className={fieldHeaderRequiredIndicatorVariants({ isDisabled })}>*</span>
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
                appearance,
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
                dir={inputValueDirection}
                className={inputElementVariants({
                  size,
                  isLtrValueInRtl:
                    inputValueDirection === 'ltr' && languageConfig.direction === 'rtl',
                })}
              />
              {isInvalid ? (
                <div className={errorIconVariants({ isDisabled })} aria-hidden>
                  <WarningCircleIcon size={size === 'lg' ? 20 : 16} weight="fill" />
                </div>
              ) : endContent ? (
                <div className={inlineSlotVariants({ isDisabled })}>{endContent}</div>
              ) : null}
              {endAddon ? (
                <div className={insetSlotVariants({ isDisabled })}>{endAddon}</div>
              ) : null}
            </Group>

            <div className="empty:hidden [&:not(:empty)]:pt-1">
              <FieldMessage
                isInvalid={isInvalid}
                size={size ?? 'md'}
                description={description}
                errorMessage={errorMessage}
              />
            </div>
          </>
        );
      }}
    </AriaTextField>
  );
}
