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
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
} from './field-shared';
import { useVeliLanguage } from './provider';
import { Tooltip, TooltipTrigger } from './tooltip';
import { webkitDhivehiTextBaselineClassName } from './typography-shared';
import { twMerge } from 'tailwind-merge';

const inputRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

const inputSkeletonRootVariants = cva('flex w-full flex-col items-start font-sans antialiased');

type InputAppearance = VariantProps<typeof fieldShellVariants>['appearance'];
type InputSize = VariantProps<typeof fieldShellVariants>['size'];

const infoTooltipTriggerVariants = cva(
  'inline-flex size-4 shrink-0 items-center justify-center rounded-xs border-0 bg-transparent p-0 outline-none transition-colors duration-normal ease-out focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-raised',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: 'cursor-help text-base-subtle hover:text-base-default',
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
      true: 'text-disabled',
      false: 'text-links',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const skeletonLineVariants = cva('h-2 w-[76px] shrink-0 rounded-[3px] bg-skeleton', {
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

const skeletonFieldVariants = cva('w-full shrink-0 rounded-md bg-skeleton', {
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
  'relative flex w-full items-center gap-1 rounded-md transition-[background-color,border-color] duration-normal ease-out has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised',
  {
    variants: {
      appearance: {
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
        isDisabled: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled} bg-ash-alpha-200`,
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        isInvalid: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled}`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-ash-alpha-200',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        className:
          'border border-text-input-stroke bg-text-input-bg [&:hover:not(:focus-within)]:border-[1.5px] [&:hover:not(:focus-within)]:border-text-input-stroke-hover [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:border-2 focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed has-[input[data-focus-visible]]:border-transparent has-[input[data-focus-visible]]:hover:border-transparent',
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
        isDisabled: true,
        className: 'border border-text-input-stroke-disabled bg-ash-alpha-200',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border border-text-input-stroke-error bg-text-input-bg [&:hover:not(:focus-within)]:border-[1.5px] [&:hover:not(:focus-within)]:border-text-input-stroke-error [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:border-2 focus-within:border-text-input-stroke-error focus-within:bg-text-input-bg',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border border-text-input-stroke-disabled',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-ash-alpha-200',
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
  `relative z-0 min-w-0 flex-1 border-0 bg-transparent text-base-default outline-none placeholder:text-base-inactive disabled:text-disabled ${webkitDhivehiTextBaselineClassName}`,
  {
    variants: {
      size: {
        sm: '-mx-3 -my-2 px-3 py-2 type-body-sm-regular',
        md: '-mx-4 -my-3 px-4 py-3 type-body-sm-regular',
        lg: '-mx-4 -my-3.5 px-4 py-3.5 type-body-md-regular',
      },
      isReadOnly: {
        true: 'text-base-strong',
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
    > {
  appearance?: InputAppearance;
  size?: InputSize;
  defaultValue?: string;
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
    ...props
  },
  ref,
) {
  const languageConfig = useVeliLanguage();
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];
  const inputValueDirection = getInputValueDirection(type);
  const hasSkeletonHeader = Boolean(
    label ||
    infoTooltip ||
    labelSupplementary ||
    labelIcon ||
    action ||
    (showRequiredIndicator && props.isRequired),
  );
  const hasSkeletonFooter = Boolean(description || errorMessage);

  if (appearance === 'skeleton') {
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
                  <Label className={fieldHeaderLabelVariants({ size, isDisabled })}>{label}</Label>
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
                  <span className={fieldHeaderSupplementaryVariants({ size, isDisabled })}>
                    {labelSupplementary}
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
            size={size ?? 'md'}
            description={description}
            errorMessage={errorMessage}
          />
        </>
      )}
    </AriaTextField>
  );
});
