'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Group,
  Input as AriaInput,
  SearchField as AriaSearchField,
  SearchFieldProps as AriaSearchFieldProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { MagnifyingGlassIcon, WarningCircleIcon, XIcon } from '@phosphor-icons/react';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  fieldHelperTone,
  fieldInputAutofill,
} from './field-shared.js';
import { FieldLabel } from './field.js';
import { useVeliLanguage } from './provider.js';
import { twMerge } from 'tailwind-merge';
import { webkitDhivehiTextBaselineClassName } from './typography-shared.js';
import { assignRef, type RefProp } from './ref.js';

const searchRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

// Paint Figma's inside stroke without changing the field or text geometry.
const outlineStrokeActive =
  '[&:focus-within:not(:has([data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-pressed)]';
const outlineStrokeFocusHide =
  'has-[[data-focus-visible]]:shadow-none has-[[data-focus-visible]]:hover:shadow-none';

const fieldShellVariants = cva(
  'relative flex w-full items-center gap-2 overflow-hidden transition-[background-color,box-shadow] duration-normal ease-out motion-reduce:transition-none has-[button[data-focus-visible]]:ring-2 has-[button[data-focus-visible]]:ring-border-focus has-[button[data-focus-visible]]:ring-offset-2 has-[button[data-focus-visible]]:ring-offset-bg-surface-raised has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised',
  {
    variants: {
      appearance: {
        default: 'rounded-field',
        outline: 'rounded-full',
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
      isFilled: {
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
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
      },
      {
        isReadOnly: true,
        isDisabled: false,
        isInvalid: false,
        className: 'bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isFilled: false,
        className: `shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-default)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-hover)] ${outlineStrokeActive} ${outlineStrokeFocusHide} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isReadOnly: false,
        isFilled: true,
        className: `${outlineStrokeActive} ${outlineStrokeFocusHide} bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className: `shadow-[inset_0_0_0_1px_var(--veli-color-text-input-stroke-error)] [&:hover:not(:focus-within)]:shadow-[inset_0_0_0_1.5px_var(--veli-color-text-input-stroke-error)] [&:focus-within:not(:has([data-focus-visible]))]:shadow-[inset_0_0_0_2px_var(--veli-color-text-input-stroke-error)] ${outlineStrokeFocusHide} bg-text-input-bg [&:hover:not(:focus-within)]:bg-text-input-bg-hover`,
      },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isReadOnly: false,
      isFilled: false,
    },
  },
);

const leadingIconVariants = cva('relative z-[1] flex shrink-0 items-center justify-center', {
  variants: {
    isDisabled: {
      true: 'text-icon-disabled',
      false: 'text-icon-base-muted',
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

const clearButtonVariants = cva(
  'relative z-[1] inline-flex shrink-0 items-center justify-center rounded-xs border-0 bg-transparent p-0 outline-none transition-colors duration-normal ease-out motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-raised',
  {
    variants: {
      size: {
        sm: 'size-4',
        md: 'size-4',
        lg: 'size-5',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: 'cursor-pointer text-icon-base-muted hover:text-base-default',
      },
    },
    defaultVariants: {
      size: 'md',
      isDisabled: false,
    },
  },
);

const inputElementVariants = cva(
  `relative z-0 min-w-0 flex-1 border-0 bg-transparent text-base-strong outline-none placeholder:text-base-inactive disabled:text-disabled ${fieldInputAutofill} [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-decoration]:hidden [&:lang(dv)]:!font-[var(--veli-font-dhivehi-faseyha)] ${webkitDhivehiTextBaselineClassName}`,
  {
    variants: {
      size: {
        sm: 'type-body-sm-regular',
        md: 'type-body-sm-regular',
        lg: 'type-body-md-regular',
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

const searchPlaceholderDefaults = {
  en: 'Search',
  dv: 'ހޯދާ',
} as const;

const searchClearButtonAriaLabels = {
  en: 'Clear search',
  dv: 'ހޯދުން ފޮހެލާ',
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

function getSearchIconSize(size: 'sm' | 'md' | 'lg' | null | undefined) {
  return size === 'lg' ? 20 : 16;
}

export interface SearchProps
  extends
    Omit<AriaSearchFieldProps, 'children' | 'className' | 'style' | 'spellCheck' | 'type'>,
    Omit<
      VariantProps<typeof fieldShellVariants>,
      'isDisabled' | 'isInvalid' | 'isReadOnly' | 'isFilled'
    >,
    RefProp<HTMLInputElement> {
  label?: React.ReactNode;
  showRequiredIndicator?: boolean;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
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

export function Search({
  label,
  showRequiredIndicator = true,
  description,
  errorMessage,
  className,
  appearance = 'default',
  size = 'md',
  autoCapitalize,
  autoComplete = 'off',
  autoCorrect,
  enterKeyHint = 'search',
  inputMode,
  maxLength,
  minLength,
  pattern,
  placeholder,
  spellCheck,
  onClear,
  ref,
  ...props
}: SearchProps) {
  const languageConfig = useVeliLanguage();
  const resolvedPlaceholder = placeholder ?? searchPlaceholderDefaults[languageConfig.language];
  const iconSize = getSearchIconSize(size);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const setInputRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );
  return (
    <AriaSearchField
      {...props}
      onClear={onClear}
      type="search"
      className={twMerge(searchRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isReadOnly, isRequired, isEmpty, state }) => {
        const showClearButton = !isEmpty && !isDisabled && !isReadOnly;

        return (
          <>
            {label || (showRequiredIndicator && isRequired) ? (
              <FieldLabel
                size={size ?? 'md'}
                isDisabled={isDisabled}
                isRequired={isRequired}
                isOptional={false}
                showRequiredIndicator={showRequiredIndicator}
                className="w-full"
              >
                {label}
              </FieldLabel>
            ) : null}
            <Group
              className={fieldShellVariants({
                appearance,
                size,
                isDisabled,
                isInvalid,
                isReadOnly,
                isFilled: !isEmpty,
              })}
              onMouseDown={(event) => focusInputFromShell(event, isDisabled)}
            >
              <div className={leadingIconVariants({ isDisabled })} aria-hidden>
                <MagnifyingGlassIcon size={iconSize} weight="bold" />
              </div>
              <AriaInput
                ref={setInputRef}
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
                type="search"
                className={inputElementVariants({ size, isReadOnly })}
              />
              {showClearButton ? (
                <AriaButton
                  // Keep Veli's clear button in the tab order. SearchField's default
                  // press-start focus transfer interrupts its keyboard activation.
                  slot={null}
                  type="button"
                  aria-label={searchClearButtonAriaLabels[languageConfig.language]}
                  className={clearButtonVariants({ size, isDisabled })}
                  onPress={() => {
                    state.setValue('');
                    onClear?.();
                    inputRef.current?.focus();
                  }}
                >
                  <XIcon size={iconSize} aria-hidden />
                </AriaButton>
              ) : null}
              {isInvalid ? (
                <div className={errorIconVariants({ isDisabled })} aria-hidden>
                  <WarningCircleIcon size={iconSize} weight="fill" />
                </div>
              ) : null}
            </Group>

            <FieldMessage
              isInvalid={isInvalid}
              size={size ?? 'md'}
              description={description}
              descriptionTone={fieldHelperTone(isDisabled)}
              errorMessage={errorMessage}
            />
          </>
        );
      }}
    </AriaSearchField>
  );
}
