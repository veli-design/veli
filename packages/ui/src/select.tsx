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
import { CaretDown, Info } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import {
  defaultFieldUnderlineDisabled,
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
} from './field-shared';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y';
import { useVeliLanguage } from './provider';
import { assignRef } from './ref';
import { Tooltip, TooltipTrigger } from './tooltip';

/** Selection key type used by react-aria (`string | number`). */
type Key = string | number;

const selectRootVariants = cva('flex w-full flex-col gap-1.5 font-sans antialiased');

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

const fieldButtonVariants = cva(
  'relative flex w-full items-center gap-1 rounded-md text-start outline-none transition-[background-color,border-color] duration-normal ease-out',
  {
    variants: {
      appearance: {
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
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isInvalid: false,
        isOpen: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
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
        isFocusVisible: false,
        isOpen: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        isFocusVisible: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isInvalid: true,
        isDisabled: false,
        isOpen: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
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
        isFocusVisible: false,
        isOpen: false,
        className:
          'border-text-input-stroke bg-text-input-bg hover:border-text-input-stroke-hover hover:bg-text-input-bg-hover',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        isOpen: false,
        className: 'border-transparent hover:border-transparent',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        isOpen: true,
        className: 'border-transparent hover:border-transparent',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: true,
        className:
          'border-2 border-text-input-stroke-pressed bg-text-input-bg-pressed hover:border-2 hover:border-text-input-stroke-pressed hover:bg-text-input-bg-pressed',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: true,
        isFocusVisible: false,
        isOpen: true,
        className:
          'border-2 border-text-input-stroke-error bg-text-input-bg hover:border-2 hover:border-text-input-stroke-error hover:bg-text-input-bg-hover',
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
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isFocusVisible: false,
      isOpen: false,
    },
  },
);

const selectValueVariants = cva('box-border block min-w-0 flex-1 truncate', {
  variants: {
    size: {
      sm: '-my-2 py-2 type-body-sm-regular',
      md: '-my-3 py-3 type-body-sm-regular',
      lg: '-my-3.5 py-3.5 type-body-md-regular',
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const selectItemLabelVariants = cva('truncate type-body-sm-regular');

const selectItemDescriptionVariants = cva('truncate type-caption-regular text-base-subtle');

const selectItemSelectionIndicatorVariants = cva(
  'shrink-0 text-primary-muted [&:lang(dv)]:-translate-y-1',
);

const inlineSlotVariants = cva('flex shrink-0 items-center justify-center', {
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

const indicatorVariants = cva(
  'flex shrink-0 items-center justify-center rounded-xs transition-transform duration-normal ease-in-out',
  {
    variants: {
      isDisabled: {
        true: 'text-disabled',
        false: 'text-base-subtle',
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
  'box-border overflow-hidden rounded-xl border border-base-subtle bg-menu-bg p-1 text-base-strong shadow-md outline-none',
);

const listBoxVariants = cva('max-h-70 overflow-auto outline-none');

const selectItemVariants = cva(
  'group flex min-h-9 w-full cursor-default items-center gap-2 rounded-lg px-2 py-2 text-start outline-none transition-colors duration-normal ease-out',
  {
    variants: {
      isSelected: {
        true: 'bg-button-primary-subtle text-base-strong',
        false: 'text-base-strong',
      },
      isFocused: {
        true: 'bg-button-primary-subtle-hover',
        false: '',
      },
      isDisabled: {
        true: 'pointer-events-none text-disabled',
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

export interface SelectProps<T extends object, K extends Key = Key>
  extends
    Omit<
      AriaSelectProps<T>,
      | 'children'
      | 'className'
      | 'style'
      | 'label'
      | 'description'
      | 'errorMessage'
      | 'items'
      | 'value'
      | 'defaultValue'
      | 'onChange'
    >,
    Omit<
      VariantProps<typeof fieldButtonVariants>,
      'isDisabled' | 'isInvalid' | 'isFocusVisible' | 'isOpen'
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
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  indicator?: React.ReactNode;
  placeholder?: string;
  className?: string;
  items?: Iterable<T>;
  children?: React.ReactNode | ((item: T) => React.ReactNode);
  /** Controlled selected key. Inferred as `string | null` when the form stores strings. */
  value?: K | null;
  /** Uncontrolled initial selected key. */
  defaultValue?: K | null;
  /** Called with the selected key. Typed from `value` / `onChange` for form libraries. */
  onChange?: (value: K | null) => void;
  /** Ref to the focusable trigger button, for form-library focus-on-error. */
  triggerRef?: React.Ref<HTMLButtonElement>;
}

export function Select<T extends object, K extends Key = Key>({
  label,
  infoTooltip,
  infoTooltipAriaLabel,
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
  appearance = 'default',
  size = 'md',
  items,
  children,
  value,
  defaultValue,
  onChange,
  triggerRef: triggerRefProp,
  ...props
}: SelectProps<T, K>) {
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();
  const languageConfig = useVeliLanguage();
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[languageConfig.language];

  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      triggerRef.current = node;
      assignRef(triggerRefProp, node);
    },
    [triggerRefProp],
  );

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
      value={value}
      defaultValue={defaultValue}
      onChange={onChange as AriaSelectProps<T>['onChange']}
      placeholder={placeholder}
      className={twMerge(selectRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isOpen, isFocusVisible, isRequired }) => (
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

          <AriaButton
            ref={setTriggerRef}
            className={fieldButtonVariants({
              appearance,
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
                    ? 'text-base-inactive'
                    : isDisabled
                      ? 'text-disabled'
                      : 'text-base-strong',
                )
              }
            />
            {endContent ? (
              <span className={inlineSlotVariants({ isDisabled })}>{endContent}</span>
            ) : null}
            <span className={indicatorVariants({ isDisabled, isOpen })}>
              {indicator ?? (
                <CaretDown aria-hidden size={20} weight="regular" className="text-icon-base" />
              )}
            </span>
          </AriaButton>

          <AriaPopover
            offset={4}
            placement="bottom start"
            triggerRef={triggerRef}
            lang={languageConfig.lang}
            dir={languageConfig.direction}
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
            size={size ?? 'md'}
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
        <Header className="px-2 py-1 type-caption-semibold uppercase text-base-muted">
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
          {startContent ? <span className="shrink-0 text-base-subtle">{startContent}</span> : null}
          <div className="min-w-0 flex-1">
            {children ? <div className={selectItemLabelVariants()}>{children}</div> : null}
            {description ? (
              <div className={selectItemDescriptionVariants()}>{description}</div>
            ) : null}
          </div>
          {endContent ? <span className="shrink-0">{endContent}</span> : null}
          {isSelected ? (
            <span className={selectItemSelectionIndicatorVariants()}>
              <CheckIcon />
            </span>
          ) : null}
        </div>
      )}
    </AriaListBoxItem>
  );
}
