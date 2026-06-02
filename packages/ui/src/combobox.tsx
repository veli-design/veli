'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  ComboBox as AriaComboBox,
  Group,
  Header,
  Input as AriaInput,
  Label,
  ListBox,
  ListBoxItem,
  ListBoxSection,
  Popover as AriaPopover,
  type ComboBoxProps as AriaComboBoxProps,
  type ListBoxItemProps as AriaListBoxItemProps,
  type ListBoxSectionProps as AriaListBoxSectionProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { CaretDown } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import {
  defaultFieldUnderlineDisabled,
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineErrorPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
} from './field-shared';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y';

const comboboxRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

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
  'relative flex w-full items-center gap-1 rounded-md transition-[background-color,border-color] has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-base has-[button[data-focus-visible]]:ring-2 has-[button[data-focus-visible]]:ring-border-focus has-[button[data-focus-visible]]:ring-offset-2 has-[button[data-focus-visible]]:ring-offset-bg-surface-base',
  {
    variants: {
      variant: {
        default: '',
        outline:
          'border hover:border-[1.5px] focus-within:border-2 focus-within:hover:border-2 has-[input[data-focus-visible]]:border-transparent has-[input[data-focus-visible]]:hover:border-transparent has-[button[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:hover:border-transparent',
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
      isOpen: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-inputs-text-input-on-white hover:bg-bg-surface-base focus-within:bg-bg-primary-subtle-default focus-within:hover:bg-bg-primary-subtle-default`,
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
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} hover:bg-bg-surface-base`,
      },
      {
        variant: 'default',
        isDisabled: true,
        isInvalid: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineDisabled}`,
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        className:
          'border-inputs-text-input-stroke-default bg-inputs-text-input-on-white hover:border-inputs-text-input-stroke-hover hover:bg-bg-surface-base focus-within:border-inputs-text-input-stroke-pressed focus-within:bg-bg-primary-subtle-default focus-within:hover:border-inputs-text-input-stroke-pressed focus-within:hover:bg-bg-primary-subtle-default has-[input[data-focus-visible]]:bg-inputs-text-input-on-white has-[input[data-focus-visible]]:hover:bg-inputs-text-input-on-white has-[button[data-focus-visible]]:bg-inputs-text-input-on-white has-[button[data-focus-visible]]:hover:bg-inputs-text-input-on-white',
      },
      {
        variant: 'outline',
        isDisabled: true,
        className: 'border-inputs-text-input-stroke-disabled bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border-inputs-text-input-stroke-error bg-inputs-text-input-on-white hover:border-inputs-text-input-stroke-error hover:bg-bg-surface-base',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border-inputs-text-input-stroke-disabled',
      },
      {
        variant: 'default',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-bg-primary-subtle-default hover:bg-bg-primary-subtle-default`,
      },
      {
        variant: 'outline',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className:
          'border-2 border-inputs-text-input-stroke-pressed bg-bg-primary-subtle-default hover:border-2 hover:border-inputs-text-input-stroke-pressed hover:bg-bg-primary-subtle-default has-[input[data-focus-visible]]:border-transparent has-[input[data-focus-visible]]:hover:border-transparent has-[input[data-focus-visible]]:bg-inputs-text-input-on-white has-[input[data-focus-visible]]:hover:bg-inputs-text-input-on-white has-[button[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:hover:border-transparent has-[button[data-focus-visible]]:bg-inputs-text-input-on-white has-[button[data-focus-visible]]:hover:bg-inputs-text-input-on-white',
      },
      {
        variant: 'default',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed}`,
      },
      {
        variant: 'outline',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className:
          'border-2 border-inputs-text-input-stroke-error hover:border-2 hover:border-inputs-text-input-stroke-error has-[input[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:border-transparent',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isOpen: false,
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

const triggerButtonVariants = cva(
  'relative z-[1] flex shrink-0 items-center justify-center rounded-sm border-0 bg-transparent outline-none transition-colors',
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
  },
);

const popoverVariants = cva(
  'box-border overflow-hidden rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised p-1 text-text-default-strong shadow-[0_12px_32px_rgba(15,23,42,0.16)] outline-none',
);

const listBoxVariants = cva('max-h-60 overflow-auto outline-none');

const itemVariants = cva(
  'flex min-h-8 w-full cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-left type-body-sm-regular text-text-default-strong outline-none transition-colors data-[disabled]:pointer-events-none data-[disabled]:text-text-disabled-disabled data-[focused]:bg-button-primary-subtle-default data-[selected]:bg-button-primary-subtle-default data-[selected]:text-text-default-strong',
);

const sectionHeaderVariants = cva(
  'px-2 py-1.5 type-caption-12-medium text-text-default-muted',
);

const emptyStateVariants = cva('px-2 py-2.5 type-body-sm-regular text-text-default-subtle');

export interface ComboBoxItemProps<T extends object = object> extends Omit<
  AriaListBoxItemProps<T>,
  'className'
> {
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
    normalizeAccessibleText(textValue) ?? normalizeAccessibleText(ariaLabel) ?? derivedTextValue;
  const resolvedAriaLabel = normalizeAccessibleText(ariaLabel);

  warnDev(
    Boolean(resolvedTextValue),
    'Coral UI: ComboBoxItem with complex content requires textValue or aria-label so the option has reliable accessible text.',
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

export interface ComboBoxSectionProps<T extends object> extends Omit<
  AriaListBoxSectionProps<T>,
  'className' | 'children'
> {
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
    <ListBoxSection {...props} className={twMerge('py-0.5 first:pt-0 last:pb-0', className)}>
      {title ? <Header className={sectionHeaderVariants()}>{title}</Header> : null}
      {children}
    </ListBoxSection>
  );
}

export interface ComboBoxProps<T extends object>
  extends
    Omit<
      AriaComboBoxProps<T>,
      'children' | 'className' | 'style' | 'placeholder' | 'label' | 'description' | 'errorMessage'
    >,
    Omit<VariantProps<typeof fieldShellVariants>, 'isDisabled' | 'isInvalid' | 'isOpen'> {
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
  className?: string;
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
    className,
    variant = 'default',
    size = 'md',
    menuTrigger = 'focus',
    ...props
  }: ComboBoxProps<T>,
  forwardedRef: React.ForwardedRef<HTMLInputElement>,
) {
  const resolvedInputRef = inputRef ?? forwardedRef;
  const shellRef = React.useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();

  React.useLayoutEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const updateWidth = () => setTriggerWidth(shell.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  return (
    <AriaComboBox
      {...props}
      menuTrigger={menuTrigger}
      className={twMerge(comboboxRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isOpen, isRequired }) => (
        <>
          {label ||
          labelSupplementary ||
          labelIcon ||
          action ||
          (showRequiredIndicator && isRequired) ? (
            <div className="flex w-full items-center gap-2">
              <div className="flex min-w-0 flex-1 items-center gap-1">
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

          <Group
            ref={shellRef}
            className={fieldShellVariants({
              variant,
              size,
              isDisabled,
              isInvalid,
              isOpen,
            })}
            onMouseDown={(event) => focusInputFromShell(event, isDisabled)}
          >
            {startAddon ? (
              <div className={inlineSlotVariants({ isDisabled })}>{startAddon}</div>
            ) : null}
            {startContent ? (
              <div className={inlineSlotVariants({ isDisabled })}>{startContent}</div>
            ) : null}
            <AriaInput
              ref={resolvedInputRef}
              placeholder={placeholder}
              className={inputElementVariants({ size })}
            />
            {endContent ? (
              <div className={inlineSlotVariants({ isDisabled })}>{endContent}</div>
            ) : null}
            <AriaButton className={triggerButtonVariants({ isDisabled })}>
              {menuTriggerIcon ?? (
                <CaretDown
                  aria-hidden
                  size={20}
                  weight="regular"
                  className={twMerge('transition-transform text-icon-default-default', isOpen && 'rotate-180')}
                />
              )}
            </AriaButton>
          </Group>

          <AriaPopover
            offset={4}
            placement="bottom start"
            triggerRef={shellRef}
            style={
              triggerWidth != null
                ? { width: triggerWidth, minWidth: triggerWidth }
                : undefined
            }
            className={popoverVariants()}
          >
            <ListBox
              className={listBoxVariants()}
              renderEmptyState={() => <div className={emptyStateVariants()}>{emptyState}</div>}
            >
              {children}
            </ListBox>
          </AriaPopover>

          <FieldMessage
            isInvalid={isInvalid}
            description={description}
            errorMessage={errorMessage}
          />
        </>
      )}
    </AriaComboBox>
  );
}

export const ComboBox = React.forwardRef(ComboBoxInner) as <T extends object>(
  props: ComboBoxProps<T> & React.RefAttributes<HTMLInputElement>,
) => React.ReactElement | null;
