'use client';

import * as React from 'react';
import {
  Group,
  Input as AriaInput,
  TextField as AriaTextField,
  TextFieldProps as AriaTextFieldProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { Info, MagnifyingGlass } from 'phosphor-react';
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
import { twMerge } from 'tailwind-merge';

const searchRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

const skeletonFieldVariants = cva('w-full shrink-0 bg-bg-skeleton', {
  variants: {
    variant: {
      default: 'rounded-md',
      outline: 'rounded-full',
    },
    size: {
      sm: 'h-9',
      md: 'h-11',
      lg: 'h-13',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const fieldShellVariants = cva(
  'relative flex w-full items-center gap-2 transition-[background-color,border-color] has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised',
  {
    variants: {
      variant: {
        default: 'rounded-md',
        outline: 'rounded-full',
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

const leadingIconVariants = cva('relative z-[1] flex shrink-0 items-center justify-center', {
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

const searchPlaceholderDefaults = {
  en: 'Search',
  dv: 'ހޯދާ',
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
    Omit<AriaTextFieldProps, 'children' | 'className' | 'style' | 'spellCheck' | 'type'>,
    Omit<VariantProps<typeof fieldShellVariants>, 'isDisabled' | 'isInvalid' | 'isReadOnly'> {
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  className?: string;
  /** Shape used when `variant="skeleton"`. Defaults to `default`. */
  skeletonVariant?: 'default' | 'outline';
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

export const Search = React.forwardRef<HTMLInputElement, SearchProps>(function Search(
  {
    description,
    errorMessage,
    className,
    variant = 'default',
    skeletonVariant = 'default',
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
    ...props
  },
  ref,
) {
  const languageConfig = useVeliLanguage();
  const resolvedPlaceholder = placeholder ?? searchPlaceholderDefaults[languageConfig.language];
  const iconSize = getSearchIconSize(size);

  if (variant === 'skeleton') {
    return (
      <div className={twMerge(searchRootVariants(), className)} aria-hidden="true">
        <div className={skeletonFieldVariants({ variant: skeletonVariant, size })} />
      </div>
    );
  }

  return (
    <AriaTextField {...props} className={twMerge(searchRootVariants(), className)}>
      {({ isDisabled, isInvalid, isReadOnly }) => (
        <>
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
            <div className={leadingIconVariants({ isDisabled })} aria-hidden>
              <MagnifyingGlass size={iconSize} />
            </div>
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
              type="search"
              className={inputElementVariants({ size, isReadOnly })}
            />
            {isInvalid ? (
              <div className={errorIconVariants({ isDisabled })} aria-hidden>
                <Info size={iconSize} weight="fill" />
              </div>
            ) : null}
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
