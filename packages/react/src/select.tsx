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
import { CaretDownIcon, InfoIcon } from '@phosphor-icons/react';
import { twMerge } from 'tailwind-merge';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHelperTone,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  getFieldOptionalLabel,
  outlineFieldStrokeErrorPressed,
  outlineFieldStrokePressed,
  shouldShowFieldOptional,
} from './field-shared.js';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y.js';
import { useVeliLanguage } from './provider.js';
import { assignRef } from './ref.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';

/** Selection key type used by react-aria (`string | number`). */
type Key = string | number;

const selectRootVariants = cva('flex w-full flex-col font-sans antialiased');

const outlineTriggerStrokeRest =
  'shadow-[inset_0_0_0_1px_var(--color-text-input-stroke)] hover:shadow-[inset_0_0_0_1.5px_var(--color-text-input-stroke-hover)]';

const outlineTriggerStrokeError =
  'shadow-[inset_0_0_0_1px_var(--color-text-input-stroke-error)] hover:shadow-[inset_0_0_0_1.5px_var(--color-text-input-stroke-error)]';

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
  'relative flex w-full items-center gap-2 rounded-field text-start outline-none transition-[background-color,box-shadow] duration-normal ease-out motion-reduce:transition-none',
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
        false: 'cursor-pointer',
      },
      isInvalid: {
        true: '',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-raised',
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
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: false,
        className: `${outlineTriggerStrokeRest} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: true,
        className: 'bg-text-input-bg-pressed hover:bg-text-input-bg-pressed',
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: false,
        isFocusVisible: false,
        isOpen: true,
        className: `${outlineFieldStrokePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: true,
        isFocusVisible: false,
        isOpen: false,
        className: `${outlineTriggerStrokeError} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: true,
        isFocusVisible: false,
        isOpen: true,
        className: `${outlineFieldStrokeErrorPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isInvalid: true,
        isFocusVisible: true,
        className: `${outlineFieldStrokeErrorPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        isDisabled: true,
        className: 'bg-text-input-bg-hover',
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

const selectItemDescriptionVariants = cva(
  'truncate type-body-sm-regular text-base-muted group-data-[disabled]:text-disabled',
);

const selectItemSelectionIndicatorVariants = cva(
  'shrink-0 text-icon-base group-data-[disabled]:text-icon-disabled [&:lang(dv)]:-translate-y-1',
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
  'flex shrink-0 items-center justify-center rounded-xs transition-transform duration-normal ease-in-out motion-reduce:transition-none',
  {
    variants: {
      isDisabled: {
        true: 'text-icon-disabled',
        false: 'text-icon-base',
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
  'box-border overflow-hidden rounded-xl border-[0.5px] border-base-muted bg-menu-bg p-1 text-base-strong shadow-md outline-none',
);

const listBoxVariants = cva('max-h-70 overflow-auto outline-none');

const selectItemVariants = cva(
  'group flex min-h-9 w-full cursor-default items-center gap-2 rounded-lg px-4 py-2 text-start text-base-strong outline-none transition-colors duration-normal ease-out motion-reduce:transition-none',
  {
    variants: {
      isFocused: {
        true: 'bg-menu-hover',
        false: '',
      },
      isPressed: {
        true: 'bg-menu-pressed',
        false: '',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-disabled',
        false: '',
      },
    },
    defaultVariants: {
      isFocused: false,
      isPressed: false,
      isDisabled: false,
    },
  },
);

const selectSectionVariants = cva(
  "not-first:before:mx-3 not-first:before:block not-first:before:h-px not-first:before:bg-border-base-subtle not-first:before:content-['']",
);

const selectSectionHeaderVariants = cva('px-4 py-2 type-body-sm-medium text-base-emphasis');

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
  /** Shows a localized Optional caption beside the label. Hidden when `isRequired` is set. */
  isOptional?: boolean;
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
  isOptional = false,
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
      {({ isDisabled, isInvalid, isOpen, isFocusVisible, isRequired }) => {
        const showOptionalLabel = shouldShowFieldOptional(isOptional, isRequired);

        return (
          <>
            {label ||
            infoTooltip ||
            showOptionalLabel ||
            labelIcon ||
            action ||
            (showRequiredIndicator && isRequired) ? (
              <div className="flex w-full items-center gap-2 pb-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {label ? (
                    <Label className={fieldHeaderLabelVariants({ size, isDisabled })}>
                      {label}
                    </Label>
                  ) : null}
                  {infoTooltip ? (
                    <TooltipTrigger>
                      <AriaButton
                        type="button"
                        aria-label={resolvedInfoTooltipAriaLabel}
                        className={fieldHeaderInfoTooltipTriggerVariants({ isDisabled })}
                        isDisabled={isDisabled}
                      >
                        <InfoIcon size={16} aria-hidden />
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
                  {showOptionalLabel ? (
                    <span className={fieldHeaderSupplementaryVariants({ size, isDisabled })}>
                      {getFieldOptionalLabel(languageConfig.language)}
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
              >
                {({ defaultChildren, isPlaceholder, selectedText }) =>
                  isPlaceholder ? defaultChildren : selectedText
                }
              </SelectValue>
              {endContent ? (
                <span className={inlineSlotVariants({ isDisabled })}>{endContent}</span>
              ) : null}
              <span className={indicatorVariants({ isDisabled, isOpen })}>
                {indicator ?? <CaretDownIcon aria-hidden size={20} weight="regular" />}
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

            <div className="empty:hidden [&:not(:empty)]:pt-1">
              <FieldMessage
                isInvalid={isInvalid}
                size={size ?? 'md'}
                description={description}
                descriptionTone={fieldHelperTone(isDisabled)}
                errorMessage={errorMessage}
              />
            </div>
          </>
        );
      }}
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
      {title ? <Header className={selectSectionHeaderVariants()}>{title}</Header> : null}
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
    'Veli UI: SelectItem with complex content requires textValue or aria-label so the option has reliable accessible text.',
  );

  return (
    <AriaListBoxItem
      {...props}
      aria-label={resolvedAriaLabel}
      textValue={resolvedTextValue}
      className={({ isFocused, isPressed, isDisabled }) =>
        twMerge(selectItemVariants({ isFocused, isPressed, isDisabled }), className)
      }
    >
      {({ isSelected }) => (
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {startContent ? (
            <span className="shrink-0 text-icon-base group-data-[disabled]:text-icon-disabled">
              {startContent}
            </span>
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
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
