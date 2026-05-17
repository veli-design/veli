'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  FieldError,
  Header,
  Label,
  ListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  Section as AriaSection,
  Select as AriaSelect,
  SelectValue,
  Text,
  type ListBoxItemProps as AriaListBoxItemProps,
  type SectionProps as AriaSectionProps,
  type SelectProps as AriaSelectProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y';

const selectRootVariants = cva('flex w-full flex-col gap-[6px] font-sans antialiased');

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

const fieldButtonVariants = cva(
  'flex min-h-[36px] w-full items-center gap-[4px] rounded-[6px] px-[6px] py-[6px] text-left transition-[background-color,box-shadow] outline-none',
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
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-0',
        false: '',
      },
      isOpen: {
        true: 'bg-bg-surface-raised',
        false: '',
      },
    },
    compoundVariants: [
      {
        isDisabled: true,
        isInvalid: true,
        className: 'shadow-[inset_0_-1px_0_0_rgba(0,36,80,0.04)]',
      },
    ],
    defaultVariants: {
      isDisabled: false,
      isInvalid: false,
      isFocusVisible: false,
      isOpen: false,
    },
  },
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

const indicatorVariants = cva(
  'flex h-[24px] w-[24px] shrink-0 items-center justify-center rounded-[2px] transition-transform',
  {
    variants: {
      isDisabled: {
        true: 'text-text-disabled-disabled',
        false: 'text-text-default-subtle',
      },
      isOpen: {
        true: 'rotate-180',
        false: 'rotate-0',
      },
    },
    defaultVariants: {
      isDisabled: false,
      isOpen: false,
    },
  },
);

const messageVariants = cva('type-caption-12-regular', {
  variants: {
    tone: {
      subtle: 'text-text-default-subtle',
      danger: 'text-text-danger-muted',
    },
  },
  defaultVariants: {
    tone: 'subtle',
  },
});

const popoverVariants = cva(
  'min-w-[var(--trigger-width)] overflow-hidden rounded-[12px] border border-border-default-subtle bg-bg-surface-overlay-raised p-[4px] text-text-default-default shadow-[0_12px_32px_rgba(15,23,42,0.16)] outline-none',
);

const listBoxVariants = cva('max-h-[280px] overflow-auto outline-none');

const selectItemVariants = cva(
  'group flex min-h-[36px] w-full cursor-default items-center gap-[8px] rounded-[8px] px-[8px] py-[8px] text-left type-body-sm-regular outline-none transition-colors',
  {
    variants: {
      isSelected: {
        true: 'bg-button-primary-subtle-default text-text-default-default',
        false: 'text-text-default-default',
      },
      isFocused: {
        true: 'bg-button-primary-subtle-hover',
        false: '',
      },
      isDisabled: {
        true: 'pointer-events-none text-text-disabled-disabled',
        false: '',
      },
    },
    defaultVariants: {
      isSelected: false,
      isFocused: false,
      isDisabled: false,
    },
  },
);

const selectSectionVariants = cva('py-[4px] first:pt-0 last:pb-0');

function ChevronDownIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-[16px] w-[16px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4 6.5L8 10L12 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-[16px] w-[16px]"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.5 8.25L6.5 11.25L12.5 5.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface SelectProps<T extends object> extends Omit<
  AriaSelectProps<T>,
  'children' | 'className' | 'style' | 'label' | 'description' | 'errorMessage' | 'items'
> {
  label?: React.ReactNode;
  labelSupplementary?: React.ReactNode;
  labelIcon?: React.ReactNode;
  action?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  showRequiredIndicator?: boolean;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  indicator?: React.ReactNode;
  placeholder?: string;
  className?: string;
  items?: Iterable<T>;
  children?: React.ReactNode | ((item: T) => React.ReactNode);
}

export function Select<T extends object>({
  label,
  labelSupplementary,
  labelIcon,
  action,
  description,
  errorMessage,
  showRequiredIndicator = true,
  startContent,
  endContent,
  indicator,
  placeholder,
  className,
  items,
  children,
  ...props
}: SelectProps<T>) {
  return (
    <AriaSelect
      {...props}
      placeholder={placeholder}
      className={twMerge(selectRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isOpen, isFocusVisible, isRequired }) => (
        <>
          {label ||
          labelSupplementary ||
          labelIcon ||
          action ||
          (showRequiredIndicator && isRequired) ? (
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

          <AriaButton
            className={fieldButtonVariants({
              isDisabled,
              isInvalid,
              isOpen,
              isFocusVisible,
            })}
          >
            {startContent ? (
              <span className={inlineSlotVariants({ isDisabled })}>{startContent}</span>
            ) : null}
            <SelectValue
              className={({ isPlaceholder }) =>
                twMerge(
                  'min-w-0 flex-1 truncate type-body-sm-regular',
                  isPlaceholder
                    ? 'text-text-default-inactive'
                    : isDisabled
                      ? 'text-text-disabled-disabled'
                      : 'text-text-default-default',
                )
              }
            />
            {endContent ? (
              <span className={inlineSlotVariants({ isDisabled })}>{endContent}</span>
            ) : null}
            <span className={indicatorVariants({ isDisabled, isOpen })}>
              {indicator ?? <ChevronDownIcon />}
            </span>
          </AriaButton>

          <AriaPopover offset={4} className={popoverVariants()}>
            <ListBox items={items} className={listBoxVariants()}>
              {children as React.ReactNode}
            </ListBox>
          </AriaPopover>

          {isInvalid ? (
            <FieldError className={messageVariants({ tone: 'danger' })}>{errorMessage}</FieldError>
          ) : description ? (
            <Text slot="description" className={messageVariants({ tone: 'subtle' })}>
              {description}
            </Text>
          ) : null}
        </>
      )}
    </AriaSelect>
  );
}

export interface SelectSectionProps<T extends object> extends Omit<
  AriaSectionProps<T>,
  'className' | 'children'
> {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function SelectSection<T extends object>({
  title,
  className,
  children,
  ...props
}: SelectSectionProps<T>) {
  return (
    <AriaSection {...props} className={twMerge(selectSectionVariants(), className)}>
      {title ? (
        <Header className="px-[8px] py-[4px] text-[12px] font-semibold uppercase tracking-[0.08em] text-text-default-muted">
          {title}
        </Header>
      ) : null}
      {children}
    </AriaSection>
  );
}

export interface SelectItemProps<T extends object = object> extends Omit<
  AriaListBoxItemProps<T>,
  'className' | 'children'
> {
  className?: string;
  children?: React.ReactNode;
  description?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

export function SelectItem<T extends object = object>({
  className,
  children,
  description,
  startContent,
  endContent,
  textValue,
  'aria-label': ariaLabel,
  ...props
}: SelectItemProps<T>) {
  const resolvedTextValue =
    normalizeAccessibleText(textValue) ??
    normalizeAccessibleText(ariaLabel) ??
    getTextFromReactNode(children);
  const resolvedAriaLabel = normalizeAccessibleText(ariaLabel);

  warnDev(
    Boolean(resolvedTextValue),
    'Coral UI: SelectItem with complex content requires textValue or aria-label so the option has reliable accessible text.',
  );

  return (
    <AriaListBoxItem
      {...props}
      aria-label={resolvedAriaLabel}
      textValue={resolvedTextValue}
      className={({ isSelected, isFocused, isDisabled }) =>
        twMerge(selectItemVariants({ isSelected, isFocused, isDisabled }), className)
      }
    >
      {({ isSelected }) => (
        <div className="flex min-w-0 flex-1 items-center gap-[8px]">
          {startContent ? (
            <span className="shrink-0 text-text-default-subtle">{startContent}</span>
          ) : null}
          <div className="min-w-0 flex-1">
            {children ? <div className="truncate">{children}</div> : null}
            {description ? (
              <div className="truncate type-caption-12-regular text-text-default-subtle">
                {description}
              </div>
            ) : null}
          </div>
          {endContent ? <span className="shrink-0">{endContent}</span> : null}
          {isSelected ? (
            <span className="shrink-0 text-text-primary-muted">
              <CheckIcon />
            </span>
          ) : null}
        </div>
      )}
    </AriaListBoxItem>
  );
}
