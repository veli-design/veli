"use client";

import * as React from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  FieldError,
  Header,
  Input as AriaInput,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover as AriaPopover,
  Text,
  type ComboBoxProps as AriaComboBoxProps,
  type ListBoxItemProps as AriaListBoxItemProps,
  type ListBoxSectionProps as AriaListBoxSectionProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import {
  getTextFromReactNode,
  normalizeAccessibleText,
  warnDev,
} from './a11y';

const comboboxRootVariants = cva('flex w-full flex-col gap-[6px] font-sans antialiased');

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
      isOpen: {
        true: 'ring-2 ring-border-focus ring-offset-0',
        false: '',
      },
    },
    compoundVariants: [
      {
        isDisabled: true,
        isInvalid: true,
        className: 'shadow-[inset_0_-1px_0_0_rgba(0,36,80,0.04)]',
      },
      {
        isOpen: true,
        isInvalid: true,
        className: 'ring-border-focus shadow-[inset_0_-1px_0_0_rgba(192,24,0,1)]',
      },
    ],
    defaultVariants: {
      isDisabled: false,
      isInvalid: false,
      isOpen: false,
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

const triggerButtonVariants = cva(
  'flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-[4px] border-0 bg-transparent outline-none transition-colors',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-text-disabled-disabled',
        false:
          'text-text-default-subtle hover:bg-gray-alpha-100 hover:text-text-default-default data-[pressed]:bg-gray-alpha-200 data-[open]:bg-gray-alpha-100 data-[open]:text-text-default-default',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  }
);

const popoverVariants = cva(
  'box-border overflow-hidden rounded-[10px] border border-border-default-subtle bg-bg-surface-overlay-raised p-[4px] text-text-default-default shadow-[0_12px_32px_rgba(15,23,42,0.16)] outline-none'
);

const listBoxVariants = cva('max-h-60 overflow-auto outline-none');

const itemVariants = cva(
  'flex min-h-[32px] w-full cursor-default items-center gap-[8px] rounded-[8px] px-[8px] py-[6px] text-left type-body-sm-regular outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled-disabled data-[focused]:bg-button-primary-subtle-default data-[selected]:bg-button-primary-subtle-default data-[selected]:text-text-primary-muted'
);

const sectionHeaderVariants = cva(
  'px-[8px] py-[6px] type-caption-12-medium text-text-default-muted'
);

const emptyStateVariants = cva(
  'px-[8px] py-[10px] type-body-sm-regular text-text-default-subtle'
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

function DefaultChevron({ isOpen }: { isOpen: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={twMerge('h-5 w-5 transition-transform', isOpen ? 'rotate-180' : undefined)}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6.5L8 10l4-3.5" />
    </svg>
  );
}

export interface ComboBoxItemProps<T extends object = object>
  extends Omit<AriaListBoxItemProps<T>, 'className'> {
  className?: string;
}

export function ComboBoxItem<T extends object = object>({
  className,
  children,
  textValue,
  'aria-label': ariaLabel,
  ...props
}: ComboBoxItemProps<T>) {
  const derivedTextValue =
    typeof children === 'function' ? undefined : getTextFromReactNode(children);
  const resolvedTextValue =
    normalizeAccessibleText(textValue) ??
    normalizeAccessibleText(ariaLabel) ??
    derivedTextValue;
  const resolvedAriaLabel = normalizeAccessibleText(ariaLabel);

  warnDev(
    Boolean(resolvedTextValue),
    'Coral UI: ComboBoxItem with complex content requires textValue or aria-label so the option has reliable accessible text.'
  );

  return (
    <ListBoxItem
      {...props}
      aria-label={resolvedAriaLabel}
      textValue={resolvedTextValue}
      className={twMerge(itemVariants(), className)}
    >
      {children}
    </ListBoxItem>
  );
}

export interface ComboBoxSectionProps<T extends object>
  extends Omit<AriaListBoxSectionProps<T>, 'className' | 'children'> {
  title?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function ComboBoxSection<T extends object>({
  title,
  className,
  children,
  ...props
}: ComboBoxSectionProps<T>) {
  return (
    <ListBoxSection
      {...props}
      className={twMerge('py-[2px] first:pt-0 last:pb-0', className)}
    >
      {title ? <Header className={sectionHeaderVariants()}>{title}</Header> : null}
      {children}
    </ListBoxSection>
  );
}

export interface ComboBoxProps<T extends object>
  extends Omit<
    AriaComboBoxProps<T>,
    'children' | 'className' | 'style' | 'placeholder' | 'label' | 'description' | 'errorMessage'
  > {
  children?: React.ReactNode | ((item: T) => React.ReactNode);
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
  placeholder?: string;
  menuTriggerIcon?: React.ReactNode;
  emptyState?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
}

function ComboBoxInner<T extends object>(
  {
    children,
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
    placeholder,
    menuTriggerIcon,
    emptyState = 'No matches found.',
    inputRef,
    ...props
  }: ComboBoxProps<T>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>
) {
  const resolvedInputRef = inputRef ?? forwardedRef;

  return (
    <AriaComboBox {...props} className={comboboxRootVariants()}>
      {({ isDisabled, isInvalid, isOpen, isRequired }) => (
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
              isOpen,
            })}
          >
            {startAddon ? (
              <div className={insetSlotVariants({ isDisabled })}>{startAddon}</div>
            ) : null}
            {startContent ? (
              <div className={inlineSlotVariants({ isDisabled })}>{startContent}</div>
            ) : null}
            <AriaInput
              ref={resolvedInputRef}
              placeholder={placeholder}
              className={inputElementVariants()}
            />
            {endContent ? (
              <div className={inlineSlotVariants({ isDisabled })}>{endContent}</div>
            ) : null}
            <AriaButton className={triggerButtonVariants({ isDisabled })}>
              {menuTriggerIcon ?? <DefaultChevron isOpen={isOpen} />}
            </AriaButton>
          </div>

          <AriaPopover
            offset={12}
            placement="bottom start"
            style={{
              width: 'var(--trigger-width)',
              minWidth: 'var(--trigger-width)',
            }}
            className={popoverVariants()}
          >
            <ListBox
              className={listBoxVariants()}
              renderEmptyState={() => <div className={emptyStateVariants()}>{emptyState}</div>}
            >
              {children}
            </ListBox>
          </AriaPopover>

          {isInvalid ? (
            <FieldError className={messageVariants({ tone: 'danger' })}>
              {errorMessage}
            </FieldError>
          ) : description ? (
            <Text slot="description" className={messageVariants({ tone: 'subtle' })}>
              {description}
            </Text>
          ) : null}
        </>
      )}
    </AriaComboBox>
  );
}

export const ComboBox = React.forwardRef(ComboBoxInner) as <T extends object>(
  props: ComboBoxProps<T> & React.RefAttributes<HTMLInputElement>
) => React.ReactElement | null;
