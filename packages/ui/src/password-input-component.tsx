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
import {
  CheckCircleIcon,
  CircleIcon,
  EyeIcon,
  EyeSlashIcon,
  InfoIcon,
} from '@phosphor-icons/react';
import {
  arePasswordRequirementsMet,
  resolvePasswordRequirements,
  type PasswordRequirement,
} from './password-input-shared.js';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  hasRenderableMessage,
} from './field-shared.js';
import { useVeliLanguage } from './provider.js';
import { webkitDhivehiTextBaselineClassName } from './typography-shared.js';
import { twMerge } from 'tailwind-merge';
import { type RefProp } from './ref.js';

const underlineActiveTransform = 'after:[transform:translateZ(0)_scaleY(1)]';
const underlineFocusActiveTransform =
  'focus-within:after:[transform:translateZ(0)_scaleY(1)] focus-within:hover:after:[transform:translateZ(0)_scaleY(1)]';

const defaultFieldUnderlineSuccess = `after:bg-border-success-emphasis hover:after:bg-border-success-emphasis ${underlineActiveTransform}`;
const defaultFieldUnderlineSuccessFocus = `focus-within:after:bg-border-success-emphasis focus-within:hover:after:bg-border-success-emphasis ${underlineFocusActiveTransform}`;

/**
 * Outline stroke as an inset box-shadow (Figma strokeAlign INSIDE).
 * Rest 1px, hover 1.5px, active/focus-within 2px — outer box never changes.
 * Hide the inner stroke when the keyboard focus ring is shown.
 */
const outlineFieldStrokeRest =
  'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-default)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-hover)] [&:focus-within:not(:has(input[data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)]';

const outlineFieldStrokeError =
  'shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-error)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-error)] focus-within:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-error)]';

const outlineFieldStrokeSuccess =
  'shadow-[inset_0_0_0_1px_var(--veli-color-border-success-emphasis)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-border-success-emphasis)] focus-within:shadow-[inset_0_0_0_2px_var(--veli-color-border-success-emphasis)]';

const outlineFieldStrokeFocusVisibleHide =
  'has-[input[data-focus-visible]]:shadow-none has-[input[data-focus-visible]]:hover:shadow-none';

const passwordInputRootVariants = cva('flex w-full flex-col font-sans antialiased');

const passwordInputFooterVariants = cva('flex w-full flex-col gap-2 pt-2');

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
  'relative flex w-full items-center gap-1 rounded-md transition-[background-color,box-shadow] duration-normal ease-out motion-reduce:transition-none has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised',
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
      isSuccess: {
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
        isSuccess: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isSuccess: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineSuccess} ${defaultFieldUnderlineSuccessFocus} bg-text-input-bg-success hover:bg-text-input-bg-success focus-within:bg-text-input-bg-success focus-within:hover:bg-text-input-bg-success`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        isSuccess: false,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        isSuccess: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: true,
        isInvalid: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'default',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isSuccess: false,
        className: `${outlineFieldStrokeRest} ${outlineFieldStrokeFocusVisibleHide} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isSuccess: true,
        className: `${outlineFieldStrokeSuccess} ${outlineFieldStrokeFocusVisibleHide} bg-text-input-bg-success`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: true,
        isSuccess: false,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        isSuccess: false,
        className: `${outlineFieldStrokeError} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg`,
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isReadOnly: true,
        className: 'bg-text-input-bg-hover',
      },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
      isSuccess: false,
    },
  },
);

type PasswordInputAppearance = VariantProps<typeof fieldShellVariants>['appearance'];
type PasswordInputSize = VariantProps<typeof fieldShellVariants>['size'];

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
        true: 'text-disabled',
        false: 'text-base-subtle',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const visibilityToggleVariants = cva(
  'relative z-[1] inline-flex shrink-0 items-center justify-center rounded-xs border-0 bg-transparent p-0 outline-none transition-colors duration-normal ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-raised',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: 'cursor-pointer text-icon-base-muted hover:text-base-default',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const inputElementVariants = cva(
  `relative z-0 min-w-0 flex-1 border-0 bg-transparent text-base-strong outline-none placeholder:text-base-inactive disabled:text-disabled ${webkitDhivehiTextBaselineClassName}`,
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
  'absolute inset-0 motion-safe:origin-center motion-safe:transition-[transform,opacity] motion-safe:duration-normal motion-safe:ease-out motion-reduce:transition-none',
  {
    variants: {
      isMet: {
        true: 'motion-safe:scale-75 motion-safe:opacity-0',
        false: 'scale-100 opacity-100',
      },
      isDisabled: {
        true: 'text-disabled',
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
        true: 'motion-safe:scale-100 motion-safe:opacity-100 motion-safe:duration-slow motion-safe:ease-spring',
        false:
          'motion-safe:scale-[0.65] motion-safe:opacity-0 motion-safe:duration-normal motion-safe:ease-out',
      },
      isDisabled: {
        true: 'text-disabled',
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
  'motion-safe:transition-colors motion-safe:duration-normal motion-safe:ease-out motion-reduce:transition-none',
  {
    variants: {
      size: {
        sm: 'type-caption-regular',
        md: 'type-caption-regular',
        lg: 'type-body-sm-regular',
      },
      isMet: {
        true: 'text-success-muted',
        false: 'text-danger-muted',
      },
      isDisabled: {
        true: 'text-disabled',
        false: '',
      },
    },
    compoundVariants: [
      {
        isMet: true,
        isDisabled: true,
        className: 'text-disabled',
      },
      {
        isMet: false,
        isDisabled: true,
        className: 'text-disabled',
      },
    ],
    defaultVariants: {
      size: 'md',
      isMet: false,
      isDisabled: false,
    },
  },
);

const feedbackTextVariants = cva('[&:lang(dv)]:relative [&:lang(dv)]:top-0.5', {
  variants: {
    size: {
      sm: 'type-caption-regular',
      md: 'type-caption-regular',
      lg: 'type-body-sm-regular',
    },
    tone: {
      success: 'text-success-muted',
      danger: 'text-danger-muted',
    },
    isDisabled: {
      true: 'text-disabled',
      false: '',
    },
  },
  defaultVariants: {
    size: 'md',
    tone: 'danger',
    isDisabled: false,
  },
});

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
      <CircleIcon
        size={PASSWORD_REQUIREMENT_ICON_SIZE}
        className={requirementIndicatorEmptyVariants({ isMet, isDisabled })}
      />
      <CheckCircleIcon
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
  size: 'sm' | 'md' | 'lg';
  isDisabled: boolean;
}

function PasswordRequirementsList({
  requirements,
  value,
  size,
  isDisabled,
}: PasswordRequirementsListProps) {
  return (
    <div className="flex flex-col gap-2">
      {requirements.map((requirement) => {
        const isMet = requirement.test(value);

        return (
          <div key={requirement.id} className="flex items-center gap-2">
            <PasswordRequirementIndicator isMet={isMet} isDisabled={isDisabled} />
            <span className={requirementTextVariants({ size, isMet, isDisabled })}>
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
  size: 'sm' | 'md' | 'lg';
  isDisabled: boolean;
  children: React.ReactNode;
}

function PasswordFeedbackMessage({
  tone,
  size,
  isDisabled,
  children,
}: PasswordFeedbackMessageProps) {
  return (
    <div className="flex items-center gap-2">
      {tone === 'success' ? (
        <CheckCircleIcon
          size={16}
          weight="fill"
          aria-hidden
          className={isDisabled ? 'text-disabled' : 'text-icon-success-subtle'}
        />
      ) : (
        <CircleIcon
          size={16}
          aria-hidden
          className={isDisabled ? 'text-disabled' : 'text-icon-danger-subtle'}
        />
      )}
      <span className={feedbackTextVariants({ size, tone, isDisabled })}>{children}</span>
    </div>
  );
}

export interface PasswordInputProps
  extends
    Omit<AriaTextFieldProps, 'children' | 'className' | 'style' | 'spellCheck' | 'type'>,
    Omit<
      VariantProps<typeof fieldShellVariants>,
      'appearance' | 'isDisabled' | 'isInvalid' | 'isReadOnly' | 'isSuccess' | 'size'
    >,
    RefProp<HTMLInputElement> {
  appearance?: PasswordInputAppearance;
  size?: PasswordInputSize;
  label?: React.ReactNode;
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

export function PasswordInput({
  label,
  labelIcon,
  action,
  description,
  errorMessage,
  showRequiredIndicator = true,
  isRequired = true,
  startAddon,
  startContent,
  className,
  appearance = 'default',
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
  ref,
  ...props
}: PasswordInputProps) {
  const languageConfig = useVeliLanguage();
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
  const resolvedSize = size ?? 'md';
  const iconSize = getPasswordIconSize(resolvedSize);
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

  return (
    <AriaTextField
      {...props}
      isRequired={isRequired}
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
            {label || labelIcon || action || (showRequiredIndicator && isRequired) ? (
              <div className="flex w-full items-center gap-2 pb-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {label ? (
                    <Label className={fieldHeaderLabelVariants({ size, isDisabled })}>
                      {label}
                    </Label>
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
              dir="ltr"
              className={fieldShellVariants({
                appearance,
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
                  <InfoIcon size={iconSize} weight="fill" />
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
                    <EyeSlashIcon size={PASSWORD_VISIBILITY_ICON_SIZE} aria-hidden />
                  ) : (
                    <EyeIcon size={PASSWORD_VISIBILITY_ICON_SIZE} aria-hidden />
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
                    size={resolvedSize}
                    isDisabled={isDisabled}
                  />
                ) : null}
                {showFeedback ? (
                  <PasswordFeedbackMessage
                    tone={feedbackTone}
                    size={resolvedSize}
                    isDisabled={isDisabled}
                  >
                    {feedbackMessage}
                  </PasswordFeedbackMessage>
                ) : null}
                {showStandardMessage ? (
                  <FieldMessage
                    isInvalid={isInvalid}
                    size={resolvedSize}
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
}
