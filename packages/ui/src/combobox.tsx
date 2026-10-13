'use client';

import * as React from 'react';
import {
  Button as AriaButton,
  ButtonContext,
  I18nProvider,
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
import { useLocale } from 'react-aria';
import { cva, type VariantProps } from 'class-variance-authority';
import { CaretDownIcon, CheckIcon, InfoIcon } from '@phosphor-icons/react';
import { twMerge } from 'tailwind-merge';
import { type RefProp } from './ref.js';
import {
  defaultFieldUnderlineError,
  defaultFieldUnderlineErrorFocusPressed,
  defaultFieldUnderlineErrorPressed,
  defaultFieldUnderlineFocusPressed,
  defaultFieldUnderlinePressed,
  defaultFieldUnderlineRest,
  defaultFieldUnderlineShell,
  FieldMessage,
  getFieldOptionalLabel,
  hasRenderableMessage,
  shouldShowFieldOptional,
  outlineFieldStrokeRest,
  outlineFieldStrokeError,
  outlineFieldStrokePressed,
  outlineFieldStrokeErrorPressed,
  outlineFieldStrokeFocusVisibleHide,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
} from './field-shared.js';
import { getTextFromReactNode, normalizeAccessibleText, warnDev } from './a11y.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';

/** Selection key type used by react-aria (`string | number`). */
type Key = string | number;

const comboboxRootVariants = cva('flex w-full flex-col font-sans antialiased');

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

const comboboxOutlineFocusVisibleHide = `${outlineFieldStrokeFocusVisibleHide.input} has-[button[data-focus-visible]]:shadow-none has-[button[data-focus-visible]]:hover:shadow-none`;

const fieldShellVariants = cva(
  'relative flex w-full items-center gap-2 rounded-md transition-[background-color,box-shadow] duration-normal ease-out motion-reduce:transition-none has-[input[data-focus-visible]]:ring-2 has-[input[data-focus-visible]]:ring-border-focus has-[input[data-focus-visible]]:ring-offset-2 has-[input[data-focus-visible]]:ring-offset-bg-surface-raised has-[button[data-focus-visible]]:ring-2 has-[button[data-focus-visible]]:ring-border-focus has-[button[data-focus-visible]]:ring-offset-2 has-[button[data-focus-visible]]:ring-offset-bg-surface-raised forced-colors:outline forced-colors:outline-[CanvasText]',
  {
    variants: {
      appearance: { default: '', outline: '' },
      size: { sm: 'h-9 py-2 px-3', md: 'h-11 py-3 px-4', lg: 'h-13 py-3.5 px-4' },
      isDisabled: { true: 'cursor-not-allowed', false: 'cursor-text' },
      isInvalid: { true: '', false: '' },
      isOpen: { true: '', false: '' },
      isReadOnly: { true: '', false: '' },
    },
    compoundVariants: [
      {
        appearance: 'default',
        isDisabled: false,
        isReadOnly: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineRest} ${defaultFieldUnderlineFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed focus-within:hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'default',
        isDisabled: false,
        isReadOnly: false,
        isInvalid: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineError} ${defaultFieldUnderlineErrorFocusPressed} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isReadOnly: false,
        isInvalid: false,
        className: `${outlineFieldStrokeRest.input} ${comboboxOutlineFocusVisibleHide} bg-text-input-bg hover:bg-text-input-bg-hover focus-within:bg-text-input-bg-pressed has-[input[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:bg-text-input-bg`,
      },
      {
        appearance: 'outline',
        isDisabled: false,
        isReadOnly: false,
        isInvalid: true,
        className: `${outlineFieldStrokeError} ${comboboxOutlineFocusVisibleHide} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      {
        appearance: 'default',
        isOpen: true,
        isDisabled: false,
        isReadOnly: false,
        isInvalid: false,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlinePressed} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed`,
      },
      {
        appearance: 'outline',
        isOpen: true,
        isDisabled: false,
        isReadOnly: false,
        isInvalid: false,
        className: `${outlineFieldStrokePressed} ${comboboxOutlineFocusVisibleHide} bg-text-input-bg-pressed hover:bg-text-input-bg-pressed has-[input[data-focus-visible]]:bg-text-input-bg has-[button[data-focus-visible]]:bg-text-input-bg`,
      },
      {
        appearance: 'default',
        isOpen: true,
        isDisabled: false,
        isReadOnly: false,
        isInvalid: true,
        className: `${defaultFieldUnderlineShell} ${defaultFieldUnderlineErrorPressed}`,
      },
      {
        appearance: 'outline',
        isOpen: true,
        isDisabled: false,
        isReadOnly: false,
        isInvalid: true,
        className: `${outlineFieldStrokeErrorPressed} ${comboboxOutlineFocusVisibleHide} bg-text-input-bg hover:bg-text-input-bg-hover`,
      },
      { isReadOnly: true, className: 'bg-text-input-bg-hover' },
      { isDisabled: true, className: 'bg-text-input-bg-hover' },
    ],
    defaultVariants: {
      appearance: 'default',
      size: 'md',
      isDisabled: false,
      isInvalid: false,
      isOpen: false,
      isReadOnly: false,
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
  'relative z-0 min-w-0 flex-1 border-0 bg-transparent text-base-strong outline-none placeholder:text-base-inactive disabled:text-disabled disabled:placeholder:text-disabled [&:lang(dv)]:!font-[var(--veli-font-dhivehi-faseyha)]',
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
  'relative z-[1] flex shrink-0 items-center justify-center rounded-sm border-0 bg-transparent outline-none transition-colors duration-normal ease-out motion-reduce:transition-none',
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
  'group flex min-h-8 w-full cursor-default items-center gap-2 rounded-lg px-4 py-2 text-start text-base-strong outline-none transition-colors duration-normal ease-out data-[disabled]:pointer-events-none data-[disabled]:text-disabled data-[focused]:bg-menu-hover data-[pressed]:bg-menu-pressed data-[selected]:text-base-strong motion-reduce:transition-none forced-colors:data-[focused]:outline forced-colors:data-[focused]:outline-[Highlight] [&:lang(dv)]:!pt-2.5 [&:lang(dv)]:!pb-1',
);

const itemLabelVariants = cva('wrap-anywhere type-body-sm-regular');

const itemDescriptionVariants = cva('wrap-anywhere type-body-sm-regular text-base-muted');

const itemSelectionIndicatorVariants = cva(
  'shrink-0 text-icon-base group-data-[disabled]:text-icon-disabled [&:lang(dv)]:-translate-y-1',
);

const sectionHeaderVariants = cva('px-4 py-2 wrap-anywhere type-body-sm-medium text-base-emphasis');

const emptyStateVariants = cva(
  'min-w-0 wrap-anywhere px-2 py-2.5 type-body-sm-regular text-base-subtle',
);

const infoTooltipDefaultAriaLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

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
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
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
                <CheckIcon size={16} aria-hidden />
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
    <ListBoxSection
      {...props}
      className={twMerge(
        'relative not-first:before:absolute not-first:before:inset-x-4 not-first:before:top-0 not-first:before:h-px not-first:before:bg-border-base-subtle',
        className,
      )}
    >
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
    Omit<
      VariantProps<typeof fieldShellVariants>,
      'isDisabled' | 'isInvalid' | 'isOpen' | 'isReadOnly'
    >,
    RefProp<HTMLInputElement> {
  children?: React.ReactNode | ((item: T) => React.ReactNode);
  label?: React.ReactNode;
  infoTooltip?: React.ReactNode;
  infoTooltipAriaLabel?: string;
  /** Show localized optional copy. Required fields suppress this marker. */
  isOptional?: boolean;
  /** @deprecated Use isOptional for localized optional copy. Retained for custom supplementary content. */
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
  isOptional = false,
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
  emptyState,
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
  const hasLabel = hasRenderableMessage(label);
  const shellRef = React.useRef<HTMLDivElement>(null);
  const [triggerWidth, setTriggerWidth] = React.useState<number>();
  const { locale, direction } = useLocale();
  const resolvedLang = props.lang ?? locale;
  const language = resolvedLang.toLowerCase().startsWith('dv') ? 'dv' : 'en';
  const resolvedDirection =
    props.dir ?? (props.lang ? (language === 'dv' ? 'rtl' : 'ltr') : direction);
  const portalDirection =
    resolvedDirection === 'rtl' || resolvedDirection === 'ltr' ? resolvedDirection : undefined;
  const resolvedInfoTooltipAriaLabel =
    infoTooltipAriaLabel ?? infoTooltipDefaultAriaLabels[language];
  const resolvedEmptyState =
    emptyState === undefined
      ? language === 'dv'
        ? 'ނަތީޖާއެއް ނުފެނުނު.'
        : 'No matches found.'
      : emptyState;

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
    <I18nProvider locale={resolvedLang}>
      <AriaComboBox
        {...props}
        lang={resolvedLang}
        dir={resolvedDirection}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange as AriaComboBoxProps<T>['onChange']}
        menuTrigger={menuTrigger}
        className={twMerge(comboboxRootVariants(), className)}
      >
        {({ isDisabled, isInvalid, isOpen, isRequired, isReadOnly }) => {
          const showOptionalLabel = shouldShowFieldOptional(isOptional, isRequired);
          const supplementary = showOptionalLabel
            ? getFieldOptionalLabel(language)
            : labelSupplementary;
          return (
            <>
              {hasLabel ||
              infoTooltip ||
              supplementary ||
              labelIcon ||
              action ||
              (showRequiredIndicator && isRequired) ? (
                <div className="flex w-full items-center gap-2 pb-2">
                  <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    {hasLabel ? (
                      <Label
                        className={twMerge(
                          fieldHeaderLabelVariants({ size, isDisabled }),
                          'min-w-0 wrap-anywhere',
                          isDisabled && 'text-base-muted',
                        )}
                      >
                        {label}
                      </Label>
                    ) : null}
                    {infoTooltip ? (
                      <ButtonContext.Provider value={null}>
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
                            lang={resolvedLang}
                            dir={resolvedDirection}
                            style={{ direction: portalDirection }}
                          >
                            {infoTooltip}
                          </Tooltip>
                        </TooltipTrigger>
                      </ButtonContext.Provider>
                    ) : null}
                    {supplementary ? (
                      <span className={fieldHeaderSupplementaryVariants({ size, isDisabled })}>
                        {supplementary}
                      </span>
                    ) : null}
                    {showRequiredIndicator && isRequired ? (
                      <span className={fieldHeaderRequiredIndicatorVariants({ isDisabled })}>
                        *
                      </span>
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
                  isReadOnly,
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
                    <CaretDownIcon
                      aria-hidden
                      size={20}
                      weight="regular"
                      className={twMerge(
                        'transition-transform duration-normal ease-in-out motion-reduce:transition-none text-icon-base',
                        isOpen && 'rotate-180',
                        isDisabled && 'text-icon-disabled',
                        isReadOnly && !isDisabled && 'text-icon-inactive',
                      )}
                    />
                  )}
                </AriaButton>
              </Group>

              <AriaPopover
                offset={4}
                placement="bottom start"
                triggerRef={shellRef}
                lang={resolvedLang}
                dir={resolvedDirection}
                style={{
                  direction: portalDirection,
                  ...(triggerWidth != null ? { width: triggerWidth, minWidth: triggerWidth } : {}),
                }}
                className={popoverVariants()}
              >
                <ListBox
                  dir={resolvedDirection}
                  className={listBoxVariants()}
                  renderEmptyState={() => (
                    <div className={emptyStateVariants()}>{resolvedEmptyState}</div>
                  )}
                >
                  {children}
                </ListBox>
              </AriaPopover>

              <div className="min-w-0 wrap-anywhere empty:hidden [&:not(:empty)]:pt-1">
                <FieldMessage
                  descriptionTone={isDisabled ? 'disabled' : 'muted'}
                  isInvalid={isInvalid}
                  size={size ?? 'md'}
                  description={description}
                  errorMessage={errorMessage}
                />
              </div>
            </>
          );
        }}
      </AriaComboBox>
    </I18nProvider>
  );
}
