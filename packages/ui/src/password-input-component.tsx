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
import { CheckCircle, Circle, Eye, EyeSlash, Info } from 'phosphor-react';
import {
  arePasswordRequirementsMet,
  resolvePasswordRequirements,
  type PasswordRequirement,
} from './password-input-shared';
import {
  defaultFieldUnderlineDisabled,
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  hasRenderableMessage,
} from './field-shared';
import { useVeliLanguage } from './provider';
import { Tooltip, TooltipTrigger } from './tooltip';
import { twMerge } from 'tailwind-merge';

const underlineActiveTransform = 'after:[transform:translateZ(0)_scaleY(1)]';
const underlineFocusActiveTransform =
  'focus-within:after:[transform:translateZ(0)_scaleY(1)] focus-within:hover:after:[transform:translateZ(0)_scaleY(1)]';

const defaultFieldUnderlineSuccess = `after:bg-border-success-emphasis hover:after:bg-border-success-emphasis ${underlineActiveTransform}`;
const defaultFieldUnderlineSuccessFocus = `focus-within:after:bg-border-success-emphasis focus-within:hover:after:bg-border-success-emphasis ${underlineFocusActiveTransform}`;

const passwordInputRootVariants = cva('flex w-full flex-col font-sans antialiased');

const passwordInputFooterVariants = cva('flex w-full flex-col gap-2 pt-2');

const passwordInputSkeletonRootVariants = cva(
  'flex w-full flex-col items-start font-sans antialiased',
);

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
      isSuccess: {
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
        isSuccess: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg-default hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isSuccess: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineSuccess} ${defaultFieldUnderlineSuccessFocus} bg-text-input-bg-success hover:bg-text-input-bg-success focus-within:bg-text-input-bg-success focus-within:hover:bg-text-input-bg-success`,
      },
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        isSuccess: false,
        className: 'bg-text-input-bg-hover',
      },
      {
        variant: 'default',
        isDisabled: true,
        isSuccess: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled} bg-gray-alpha-200`,
      },
      {
        variant: 'default',
        isInvalid: true,
        isDisabled: false,
        isSuccess: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg-default hover:bg-text-input-bg-hover`,
      },
      {
        variant: 'default',
        isDisabled: true,
        isInvalid: true,
        isSuccess: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled}`,
      },
      {
        variant: 'default',
        isDisabled: true,
        isReadOnly: true,
        isSuccess: false,
        className: 'bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isSuccess: false,
        className:
          'border border-text-input-stroke-default bg-text-input-bg-default [&:hover:not(:focus-within)]:border-[1.5px] [&:hover:not(:focus-within)]:border-text-input-stroke-hover [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:border-2 focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed has-[input[data-focus-visible]]:border-transparent has-[input[data-focus-visible]]:hover:border-transparent',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isSuccess: true,
        className:
          'border border-border-success-emphasis bg-text-input-bg-success [&:hover:not(:focus-within)]:border-[1.5px] [&:hover:not(:focus-within)]:border-border-success-emphasis focus-within:border-2 focus-within:border-border-success-emphasis focus-within:bg-text-input-bg-success has-[input[data-focus-visible]]:border-transparent has-[input[data-focus-visible]]:hover:border-transparent',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        isSuccess: false,
        className: 'bg-text-input-bg-hover',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isSuccess: false,
        className: 'border border-text-input-stroke-disabled bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isInvalid: true,
        isDisabled: false,
        isSuccess: false,
        className:
          'border border-text-input-stroke-error bg-text-input-bg-default [&:hover:not(:focus-within)]:border-[1.5px] [&:hover:not(:focus-within)]:border-text-input-stroke-error [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:border-2 focus-within:border-text-input-stroke-error focus-within:bg-text-input-bg-default',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isInvalid: true,
        isSuccess: false,
        className: 'border border-text-input-stroke-disabled',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isReadOnly: true,
        isSuccess: false,
        className: 'bg-gray-alpha-200',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
      isSuccess: false,
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
      false: 'text-icon-danger-muted',
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

const visibilityToggleVariants = cva(
  'relative z-[1] inline-flex shrink-0 items-center justify-center rounded-xs border-0 bg-transparent p-0 outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-raised',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-text-disabled-disabled',
        false: 'cursor-pointer text-icon-default-muted hover:text-text-default-default',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const inputElementVariants = cva(
  'relative z-0 min-w-0 flex-1 border-0 bg-transparent text-text-default-strong outline-none placeholder:text-text-default-inactive disabled:text-text-disabled-disabled',
  {
    variants: {
      size: {
        sm: '-mx-3 -my-2 px-3 py-2 type-body-sm-regular',
        md: '-mx-4 -my-3 px-4 py-3 type-body-sm-regular',
        lg: '-mx-4 -my-3.5 px-4 py-3.5 type-body-md-regular',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
);

const PASSWORD_REQUIREMENT_ICON_SIZE = 16;

const requirementIndicatorShellVariants = cva(
  'relative flex size-4 shrink-0 items-center justify-center',
);

const requirementIndicatorEmptyVariants = cva(
  'absolute inset-0 motion-safe:origin-center motion-safe:transition-[transform,opacity] motion-safe:duration-200 motion-safe:ease-out motion-reduce:transition-none',
  {
    variants: {
      isMet: {
        true: 'motion-safe:scale-75 motion-safe:opacity-0',
        false: 'scale-100 opacity-100',
      },
      isDisabled: {
        true: 'text-text-disabled-disabled',
        false: 'text-icon-danger-subtle',
      },
    },
    defaultVariants: {
      isMet: false,
      isDisabled: false,
    },
  },
);

const requirementIndicatorCheckedVariants = cva(
  'absolute inset-0 motion-safe:origin-center motion-safe:transition-[transform,opacity] motion-reduce:transition-none',
  {
    variants: {
      isMet: {
        true: 'motion-safe:scale-100 motion-safe:opacity-100 motion-safe:duration-300 motion-safe:ease-[cubic-bezier(0.34,1.56,0.64,1)]',
        false:
          'motion-safe:scale-[0.65] motion-safe:opacity-0 motion-safe:duration-200 motion-safe:ease-out',
      },
      isDisabled: {
        true: 'text-text-disabled-disabled',
        false: 'text-icon-success-subtle',
      },
    },
    defaultVariants: {
      isMet: false,
      isDisabled: false,
    },
  },
);

const requirementTextVariants = cva(
  'type-caption-regular motion-safe:transition-colors motion-safe:duration-200 motion-reduce:transition-none',
  {
    variants: {
      isMet: {
        true: 'text-text-success-muted',
        false: 'text-text-danger-muted',
      },
      isDisabled: {
        true: 'text-text-disabled-disabled',
        false: '',
      },
    },
    compoundVariants: [
      {
        isMet: true,
        isDisabled: true,
        className: 'text-text-disabled-disabled',
      },
      {
        isMet: false,
        isDisabled: true,
        className: 'text-text-disabled-disabled',
      },
    ],
    defaultVariants: {
      isMet: false,
      isDisabled: false,
    },
  },
);

const feedbackTextVariants = cva('type-caption-regular', {
  variants: {
    tone: {
      success: 'text-text-success-muted',
      danger: 'text-text-danger-muted',
    },
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: '',
    },
  },
  defaultVariants: {
    tone: 'danger',
    isDisabled: false,
  },
});

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

const visibilityToggleDefaultAriaLabels = {
  en: {
    show: 'Show password',
    hide: 'Hide password',
  },
  dv: {
    show: 'ޕާސްވޯޑް ދައްކާ',
    hide: 'ޕާސްވޯޑް ފޮރުވާ',
  },
} as const;

const passwordPlaceholderDefaults = {
  en: 'Enter Password',
  dv: 'ޕާސްވޯޑް ލިޔުއްވާ',
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

const PASSWORD_VISIBILITY_ICON_SIZE = 20;

function getPasswordIconSize(size: 'sm' | 'md' | 'lg' | null | undefined) {
  return size === 'lg' ? 20 : 16;
}

interface PasswordRequirementIndicatorProps {
  isMet: boolean;
  isDisabled: boolean;
}

function PasswordRequirementIndicator({ isMet, isDisabled }: PasswordRequirementIndicatorProps) {
  return (
    <span className={requirementIndicatorShellVariants()} aria-hidden>
      <Circle
        size={PASSWORD_REQUIREMENT_ICON_SIZE}
        className={requirementIndicatorEmptyVariants({ isMet, isDisabled })}
      />
      <CheckCircle
        size={PASSWORD_REQUIREMENT_ICON_SIZE}
        weight="fill"
        className={requirementIndicatorCheckedVariants({ isMet, isDisabled })}
      />
    </span>
  );
}

interface PasswordRequirementsListProps {
  requirements: PasswordRequirement[];
  value: string;
  isDisabled: boolean;
}

function PasswordRequirementsList({
  requirements,
  value,
  isDisabled,
}: PasswordRequirementsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {requirements.map((requirement) => {
        const isMet = requirement.test(value);

        return (
          <div key={requirement.id} className="flex items-center gap-2">
            <PasswordRequirementIndicator isMet={isMet} isDisabled={isDisabled} />
            <span className={requirementTextVariants({ isMet, isDisabled })}>
              {requirement.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

interface PasswordFeedbackMessageProps {
  tone: 'success' | 'danger';
  isDisabled: boolean;
  children: React.ReactNode;
}

function PasswordFeedbackMessage({ tone, isDisabled, children }: PasswordFeedbackMessageProps) {
  return (
    <div className="flex items-center gap-2">
      {tone === 'success' ? (
        <CheckCircle
          size={16}
          weight="fill"
          aria-hidden
          className={isDisabled ? 'text-text-disabled-disabled' : 'text-icon-success-subtle'}
        />
      ) : (
        <Circle
          size={16}
          aria-hidden
          className={isDisabled ? 'text-text-disabled-disabled' : 'text-icon-danger-subtle'}
        />
      )}
      <span className={feedbackTextVariants({ tone, isDisabled })}>{children}</span>
    </div>
  );
}

export interface PasswordInputProps
  extends
    Omit<AriaTextFieldProps, 'children' | 'className' | 'style' | 'spellCheck' | 'type'>,
    Omit<
      VariantProps<typeof fieldShellVariants>,
      'isDisabled' | 'isInvalid' | 'isReadOnly' | 'isSuccess'
    > {
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
  /** When `true`, renders the built-in password requirement checklist. */
  requirements?: PasswordRequirement[] | boolean;
  /** Shows the requirement checklist before the user types. */
  showRequirementsWhenEmpty?: boolean;
  /** Applies the success field styling from the design system. */
  isSuccess?: boolean;
  /** Inline feedback below the field, e.g. password match or mismatch messages. */
  feedbackMessage?: React.ReactNode;
  feedbackTone?: 'success' | 'danger';
  /** Hides the visibility toggle button. Defaults to `true`. */
  showVisibilityToggle?: boolean;
  defaultRevealed?: boolean;
  isRevealed?: boolean;
  onRevealedChange?: (isRevealed: boolean) => void;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  function PasswordInput(
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
      className,
      variant = 'default',
      size = 'md',
      autoCapitalize,
      autoComplete = 'current-password',
      autoCorrect,
      enterKeyHint,
      inputMode,
      maxLength,
      minLength,
      pattern,
      placeholder,
      spellCheck,
      requirements,
      showRequirementsWhenEmpty = false,
      isSuccess = false,
      feedbackMessage,
      feedbackTone = 'danger',
      showVisibilityToggle = true,
      defaultRevealed = false,
      isRevealed,
      onRevealedChange,
      onChange,
      value,
      defaultValue,
      ...props
    },
    ref,
  ) {
    const languageConfig = useVeliLanguage();
    const resolvedInfoTooltipAriaLabel =
      infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];
    const resolvedPlaceholder = placeholder ?? passwordPlaceholderDefaults[languageConfig.language];
    const resolvedRequirements = React.useMemo(
      () => resolvePasswordRequirements(requirements, languageConfig.language),
      [languageConfig.language, requirements],
    );
    const [uncontrolledRevealed, setUncontrolledRevealed] = React.useState(defaultRevealed);
    const [uncontrolledValue, setUncontrolledValue] = React.useState(String(defaultValue ?? ''));
    const isRevealedControlled = isRevealed !== undefined;
    const revealed = isRevealedControlled ? isRevealed : uncontrolledRevealed;
    const passwordValue = value === undefined ? uncontrolledValue : String(value);
    const iconSize = getPasswordIconSize(size);
    const visibilityLabels = visibilityToggleDefaultAriaLabels[languageConfig.language];

    const setRevealed = React.useCallback(
      (nextRevealed: boolean) => {
        if (!isRevealedControlled) {
          setUncontrolledRevealed(nextRevealed);
        }

        onRevealedChange?.(nextRevealed);
      },
      [isRevealedControlled, onRevealedChange],
    );

    const handleChange = React.useCallback(
      (nextValue: string) => {
        if (value === undefined) {
          setUncontrolledValue(nextValue);
        }

        onChange?.(nextValue);
      },
      [onChange, value],
    );

    const hasSkeletonHeader = Boolean(
      label ||
      infoTooltip ||
      labelSupplementary ||
      labelIcon ||
      action ||
      (showRequiredIndicator && props.isRequired),
    );
    const hasSkeletonFooter = Boolean(
      description || errorMessage || feedbackMessage || resolvedRequirements,
    );

    if (variant === 'skeleton') {
      return (
        <div className={twMerge(passwordInputSkeletonRootVariants(), className)} aria-hidden="true">
          {hasSkeletonHeader ? (
            <div className="flex w-full items-center pb-2">
              <div className={skeletonLineVariants({ size })} />
            </div>
          ) : null}
          <div className={skeletonFieldVariants({ size })} />
          {hasSkeletonFooter ? (
            <div className="flex w-full items-center pt-2">
              <div className={skeletonLineVariants({ size })} />
            </div>
          ) : null}
        </div>
      );
    }

    return (
      <AriaTextField
        {...props}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        className={twMerge(passwordInputRootVariants(), className)}
      >
        {({ isDisabled, isInvalid, isReadOnly, isRequired }) => {
          const shouldShowRequirements =
            resolvedRequirements !== undefined &&
            (showRequirementsWhenEmpty || passwordValue.length > 0);
          const allRequirementsMet =
            resolvedRequirements !== undefined &&
            arePasswordRequirementsMet(resolvedRequirements, passwordValue);
          const showSuccessState =
            isSuccess ||
            feedbackTone === 'success' ||
            (shouldShowRequirements && allRequirementsMet && passwordValue.length > 0);
          const resolvedSuccess = showSuccessState && !isInvalid && !isDisabled;
          const showFeedback = hasRenderableMessage(feedbackMessage);
          const showStandardMessage = !shouldShowRequirements && !showFeedback;

          return (
            <>
              {label ||
              infoTooltip ||
              labelSupplementary ||
              labelIcon ||
              action ||
              (showRequiredIndicator && isRequired) ? (
                <div className="flex w-full items-center gap-2 pb-2">
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
                dir="ltr"
                className={fieldShellVariants({
                  variant,
                  size,
                  isDisabled,
                  isInvalid,
                  isReadOnly,
                  isSuccess: resolvedSuccess,
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
                  placeholder={resolvedPlaceholder}
                  spellCheck={spellCheck}
                  type={revealed ? 'text' : 'password'}
                  dir="ltr"
                  className={inputElementVariants({ size })}
                />
                {isInvalid ? (
                  <div className={errorIconVariants({ isDisabled })} aria-hidden>
                    <Info size={iconSize} weight="fill" />
                  </div>
                ) : showVisibilityToggle ? (
                  <AriaButton
                    type="button"
                    aria-label={revealed ? visibilityLabels.hide : visibilityLabels.show}
                    aria-pressed={revealed}
                    isDisabled={isDisabled}
                    className={visibilityToggleVariants({ isDisabled })}
                    onPress={() => setRevealed(!revealed)}
                  >
                    {revealed ? (
                      <EyeSlash size={PASSWORD_VISIBILITY_ICON_SIZE} aria-hidden />
                    ) : (
                      <Eye size={PASSWORD_VISIBILITY_ICON_SIZE} aria-hidden />
                    )}
                  </AriaButton>
                ) : null}
              </Group>

              {(shouldShowRequirements && resolvedRequirements) ||
              showFeedback ||
              showStandardMessage ? (
                <div className={passwordInputFooterVariants()}>
                  {shouldShowRequirements && resolvedRequirements ? (
                    <PasswordRequirementsList
                      requirements={resolvedRequirements}
                      value={passwordValue}
                      isDisabled={isDisabled}
                    />
                  ) : null}
                  {showFeedback ? (
                    <PasswordFeedbackMessage tone={feedbackTone} isDisabled={isDisabled}>
                      {feedbackMessage}
                    </PasswordFeedbackMessage>
                  ) : null}
                  {showStandardMessage ? (
                    <FieldMessage
                      isInvalid={isInvalid}
                      description={description}
                      errorMessage={errorMessage}
                    />
                  ) : null}
                </div>
              ) : null}
            </>
          );
        }}
      </AriaTextField>
    );
  },
);
