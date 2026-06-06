'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  Header,
  Label,
  ListBox,
  ListBoxItem as AriaListBoxItem,
  Popover as AriaPopover,
  Section as AriaSection,
  Select as AriaSelect,
  SelectValue,
  type ListBoxItemProps as AriaListBoxItemProps,
  type SectionProps as AriaSectionProps,
  type SelectProps as AriaSelectProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { CaretDown } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import {
  defaultFieldUnderlineDisabled,
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
} from './field-shared';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y';

const selectRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

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

const fieldButtonVariants = cva(
  'relative flex w-full items-center gap-1 rounded-md text-start outline-none transition-[background-color,border-color]',
  {
    variants: {
      variant: {
        default: '',
        outline: 'border hover:border-[1.5px]',
      },
      size: {
        sm: 'h-9 py-2 px-3',
        md: 'h-11 py-3 px-4',
        lg: 'h-13 py-3.5 px-4',
      },
      isDisabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-pointer',
      },
      isInvalid: {
        true: '',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-base',
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
        isFocusVisible: false,
        isOpen: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} bg-text-input-bg-default hover:bg-text-input-bg-hover`,
      },
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        variant: 'default',
        isDisabled: false,
        isInvalid: false,
        isOpen: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
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
        isFocusVisible: false,
        isOpen: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} hover:bg-text-input-bg-hover`,
      },
      {
        variant: 'default',
        isInvalid: true,
        isDisabled: false,
        isFocusVisible: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed} hover:bg-text-input-bg-hover`,
      },
      {
        variant: 'default',
        isInvalid: true,
        isDisabled: false,
        isOpen: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed} hover:bg-text-input-bg-hover`,
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
        isFocusVisible: false,
        isOpen: false,
        className:
          'border-text-input-stroke-default bg-text-input-bg-default hover:border-text-input-stroke-hover hover:bg-text-input-bg-hover',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        isOpen: false,
        className: 'border-transparent hover:border-transparent',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        isOpen: true,
        className: 'border-transparent hover:border-transparent',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: true,
        className:
          'border-2 border-text-input-stroke-pressed bg-text-input-bg-pressed hover:border-2 hover:border-text-input-stroke-pressed hover:bg-text-input-bg-pressed',
      },
      {
        variant: 'outline',
        isDisabled: false,
        isInvalid: true,
        isFocusVisible: false,
        isOpen: true,
        className:
          'border-2 border-text-input-stroke-error hover:border-2 hover:border-text-input-stroke-error',
      },
      {
        variant: 'outline',
        isDisabled: true,
        className: 'border-text-input-stroke-disabled bg-gray-alpha-200',
      },
      {
        variant: 'outline',
        isInvalid: true,
        isDisabled: false,
        className:
          'border-text-input-stroke-error bg-text-input-bg-default hover:border-text-input-stroke-error hover:bg-text-input-bg-hover',
      },
      {
        variant: 'outline',
        isDisabled: true,
        isInvalid: true,
        className: 'border-text-input-stroke-disabled',
      },
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isFocusVisible: false,
      isOpen: false,
    },
  },
);

const selectValueVariants = cva('min-w-0 flex-1 truncate', {
  variants: {
    size: {
      sm: 'type-body-sm-regular',
      md: 'type-body-sm-regular',
      lg: 'type-body-md-regular',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

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
  'flex  shrink-0 items-center justify-center rounded-xs transition-transform',
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

const popoverVariants = cva(
  'box-border overflow-hidden rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised p-1 text-text-default-strong shadow-[0_12px_32px_rgba(15,23,42,0.16)] outline-none',
);

const listBoxVariants = cva('max-h-70 overflow-auto outline-none');

const selectItemVariants = cva(
  'group flex min-h-9 w-full cursor-default items-center gap-2 rounded-lg px-2 py-2 text-start type-body-sm-regular outline-none transition-colors',
  {
    variants: {
      isSelected: {
        true: 'bg-button-primary-subtle-default text-text-default-strong',
        false: 'text-text-default-strong',
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

const selectSectionVariants = cva('py-1 first:pt-0 last:pb-0');

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

export interface SelectProps<T extends object>
  extends
    Omit<
      AriaSelectProps<T>,
      'children' | 'className' | 'style' | 'label' | 'description' | 'errorMessage' | 'items'
    >,
    Omit<
      VariantProps<typeof fieldButtonVariants>,
      'isDisabled' | 'isInvalid' | 'isFocusVisible' | 'isOpen'
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
  variant = 'default',
  size = 'md',
  items,
  children,
  ...props
}: SelectProps<T>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();

  React.useLayoutEffect(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const updateWidth = () => setTriggerWidth(trigger.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(trigger);
    return () => observer.disconnect();
  }, []);

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

          <AriaButton
            ref={triggerRef}
            className={fieldButtonVariants({
              variant,
              size,
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
                  selectValueVariants({ size }),
                  isPlaceholder
                    ? 'text-text-default-inactive'
                    : isDisabled
                      ? 'text-text-disabled-disabled'
                      : 'text-text-default-strong',
                )
              }
            />
            {endContent ? (
              <span className={inlineSlotVariants({ isDisabled })}>{endContent}</span>
            ) : null}
            <span className={indicatorVariants({ isDisabled, isOpen })}>
              {indicator ?? (
                <CaretDown
                  aria-hidden
                  size={20}
                  weight="regular"
                  className="text-icon-default-default"
                />
              )}
            </span>
          </AriaButton>

          <AriaPopover
            offset={4}
            placement="bottom start"
            triggerRef={triggerRef}
            style={
              triggerWidth != null ? { width: triggerWidth, minWidth: triggerWidth } : undefined
            }
            className={popoverVariants()}
          >
            <ListBox items={items} className={listBoxVariants()}>
              {children as React.ReactNode}
            </ListBox>
          </AriaPopover>

          <FieldMessage
            isInvalid={isInvalid}
            description={description}
            errorMessage={errorMessage}
          />
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
        <Header className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-text-default-muted">
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
        <div className="flex min-w-0 flex-1 items-center gap-2">
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
