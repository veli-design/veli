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
import { CaretDown, Info } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { type RefProp } from './ref.js';
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
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
} from './field-shared.js';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y.js';
import { useVeliLanguage } from './provider.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';

/** Selection key type used by react-aria (`string | number`). */
type Key = string | number;

const comboboxRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

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
  'relative flex w-full items-center gap-1 rounded-md transition-[background-color,border-color] duration-normal ease-out has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised has-[button[data-focus-visible]]:ring-2 has-[button[data-focus-visible]]:ring-border-focus has-[button[data-focus-visible]]:ring-offset-2 has-[button[data-focus-visible]]:ring-offset-bg-surface-raised',
  {
    variants: {
      appearance: {
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
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
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
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        className:
          'border-text-input-stroke bg-text-input-bg hover:border-text-input-stroke-hover hover:bg-text-input-bg-hover focus-within:border-text-input-stroke-pressed focus-within:bg-text-input-bg-pressed focus-within:hover:border-text-input-stroke-pressed focus-within:hover:bg-text-input-bg-pressed has-[input[data-focus-visible]]:bg-text-input-bg has-[input[data-focus-visible]]:hover:bg-text-input-bg has-[button[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:hover:bg-text-input-bg',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        className: 'border-text-input-stroke-disabled bg-ash-alpha-200',
      },
      {
        appearance: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border-text-input-stroke-error bg-text-input-bg hover:border-text-input-stroke-error hover:bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border-text-input-stroke-disabled',
      },
      {
        appearance: 'default',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isOpen: true,
        isDisabled: false,
        isInvalid: false,
        className:
          'border-2 border-text-input-stroke-pressed bg-text-input-bg-pressed hover:border-2 hover:border-text-input-stroke-pressed hover:bg-text-input-bg-pressed has-[input[data-focus-visible]]:border-transparent has-[input[data-focus-visible]]:hover:border-transparent has-[input[data-focus-visible]]:bg-text-input-bg has-[input[data-focus-visible]]:hover:bg-text-input-bg has-[button[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:hover:border-transparent has-[button[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:hover:bg-text-input-bg',
      },
      {
        appearance: 'default',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed}`,
      },
      {
        appearance: 'outline',
        isOpen: true,
        isInvalid: true,
        isDisabled: false,
        className:
          'border-2 border-text-input-stroke-error bg-text-input-bg hover:border-2 hover:border-text-input-stroke-error hover:bg-text-input-bg-hover has-[input[data-focus-visible]]:border-transparent has-[button[data-focus-visible]]:border-transparent',
      },
    ],
    defaultVariants: {
      appearance: 'default',
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
      true: 'text-disabled',
      false: 'text-base-subtle',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const inputElementVariants = cva(
  'relative z-0 min-w-0 flex-1 border-0 bg-transparent text-base-strong outline-none placeholder:text-base-inactive disabled:text-disabled [&:lang(dv)]:!font-[var(--veli-font-dhivehi-faseyha)]',
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
  'relative z-[1] flex shrink-0 items-center justify-center rounded-sm border-0 bg-transparent outline-none transition-colors duration-normal ease-out',
  {
    variants: {
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false:
          'text-base-subtle hover:bg-ash-alpha-100 hover:text-base-default data-[pressed]:bg-ash-alpha-200 data-[open]:bg-ash-alpha-100 data-[open]:text-base-default',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const popoverVariants = cva(
  'box-border overflow-hidden rounded-xl border border-base-subtle bg-menu-bg p-1 text-base-strong shadow-md outline-none',
);

const listBoxVariants = cva('max-h-60 overflow-auto outline-none');

const itemVariants = cva(
  'group flex min-h-8 w-full cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-start text-base-strong outline-none transition-colors duration-normal ease-out data-[disabled]:pointer-events-none data-[disabled]:text-disabled data-[focused]:bg-button-primary-subtle data-[selected]:bg-button-primary-subtle data-[selected]:text-base-strong [&:lang(dv)]:!pt-2.5 [&:lang(dv)]:!pb-1',
);

const itemLabelVariants = cva('truncate type-body-sm-regular');

const itemDescriptionVariants = cva('truncate type-caption-regular text-base-subtle');

const itemSelectionIndicatorVariants = cva(
  'shrink-0 text-primary-muted [&:lang(dv)]:-translate-y-1',
);

const sectionHeaderVariants = cva('px-2 py-1.5 type-caption-medium text-base-muted');

const emptyStateVariants = cva('px-2 py-2.5 type-body-sm-regular text-base-subtle');

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="size-4"
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

export interface ComboBoxItemProps<T extends object = object> extends Omit<
  AriaListBoxItemProps<T>,
  'className' | 'children'
> {
  className?: string;
  children?: AriaListBoxItemProps<T>['children'];
  description?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
}

export function ComboBoxItem<T extends object = object>({
  className,
  children,
  description,
  startContent,
  endContent,
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
      {(renderProps) => {
        const renderedChildren = typeof children === 'function' ? children(renderProps) : children;

        return (
          <div className="flex min-w-0 flex-1 items-center gap-2">
            {startContent ? (
              <span className="shrink-0 text-base-subtle">{startContent}</span>
            ) : null}
            <div className="min-w-0 flex-1">
              {renderedChildren ? (
                <div className={itemLabelVariants()}>{renderedChildren}</div>
              ) : null}
              {description ? <div className={itemDescriptionVariants()}>{description}</div> : null}
            </div>
            {endContent ? <span className="shrink-0">{endContent}</span> : null}
            {renderProps.isSelected ? (
              <span className={itemSelectionIndicatorVariants()}>
                <CheckIcon />
              </span>
            ) : null}
          </div>
        );
      }}
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

export interface ComboBoxProps<T extends object, K extends Key = Key>
  extends
    Omit<
      AriaComboBoxProps<T>,
      | 'children'
      | 'className'
      | 'style'
      | 'placeholder'
      | 'label'
      | 'description'
      | 'errorMessage'
      | 'value'
      | 'defaultValue'
      | 'onChange'
    >,
    Omit<VariantProps<typeof fieldShellVariants>, 'isDisabled' | 'isInvalid' | 'isOpen'>,
    RefProp<HTMLInputElement> {
  children?: React.ReactNode | ((item: T) => React.ReactNode);
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
  placeholder?: string;
  menuTriggerIcon?: React.ReactNode;
  emptyState?: React.ReactNode;
  inputRef?: React.Ref<HTMLInputElement>;
  className?: string;
  /** Controlled selected key. Inferred as `string | null` when the form stores strings. */
  value?: K | null;
  /** Uncontrolled initial selected key. */
  defaultValue?: K | null;
  /** Called with the selected key. Typed from `value` / `onChange` for form libraries. */
  onChange?: (value: K | null) => void;
}

export function ComboBox<T extends object, K extends Key = Key>({
  children,
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
  placeholder,
  menuTriggerIcon,
  emptyState = 'No matches found.',
  inputRef,
  ref,
  className,
  appearance = 'default',
  size = 'md',
  menuTrigger = 'focus',
  value,
  defaultValue,
  onChange,
  ...props
}: ComboBoxProps<T, K>) {
  const resolvedInputRef = inputRef ?? ref;
  const shellRef = React.useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();
  const languageConfig = useVeliLanguage();
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];

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
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as AriaComboBoxProps<T>['onChange']}
      menuTrigger={menuTrigger}
      className={twMerge(comboboxRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isOpen, isRequired }) => (
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
                      className={fieldHeaderInfoTooltipTriggerVariants({ isDisabled })}
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
            ref={shellRef}
            className={fieldShellVariants({
              appearance,
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
                  className={twMerge(
                    'transition-transform duration-normal ease-in-out text-icon-base',
                    isOpen && 'rotate-180',
                  )}
                />
              )}
            </AriaButton>
          </Group>

          <AriaPopover
            offset={4}
            placement="bottom start"
            triggerRef={shellRef}
            lang={languageConfig.lang}
            dir={languageConfig.direction}
            style={
              triggerWidth != null ? { width: triggerWidth, minWidth: triggerWidth } : undefined
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
            size={size ?? 'md'}
            description={description}
            errorMessage={errorMessage}
          />
        </>
      )}
    </AriaComboBox>
  );
}
