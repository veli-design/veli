'use client';

import * as React from 'react';
import { CalendarBlankIcon, InfoIcon } from '@phosphor-icons/react';
import {
  Button as AriaButton,
  ButtonContext,
  DatePicker as AriaDatePicker,
  Dialog,
  Group,
  Label,
  Popover,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
} from 'react-aria-components';
import { twMerge } from 'tailwind-merge';
import { Calendar } from './calendar.js';
import { fieldRootVariants, fieldShellVariants } from './date-shared.js';
import { DateSegments } from './date-segments.js';
import {
  FieldMessage,
  fieldHeaderInfoTooltipTriggerVariants,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  getFieldOptionalLabel,
  shouldShowFieldOptional,
} from './field-shared.js';
import { useVeliLanguage } from './provider.js';
import { assignRef } from './ref.js';
import { Tooltip, TooltipTrigger } from './tooltip.js';

type DatePickerSize = 'sm' | 'md' | 'lg';
type DatePickerAppearance = 'default' | 'outline';

const calendarButtonLabels = {
  en: 'Open calendar',
  dv: 'ކަލަންޑަރު ހުޅުވާ',
} as const;

const infoTooltipLabels = {
  en: 'More information',
  dv: 'އިތުރު މަޢުލޫމާތު',
} as const;

const calendarButtonClassName =
  'relative z-[1] flex size-5 shrink-0 items-center justify-center rounded-xs text-icon-base outline-none data-[disabled]:text-icon-disabled data-[focus-visible]:ring-2 data-[focus-visible]:ring-border-focus';

const popoverSurfaceClassName =
  'max-w-[calc(100vw-1rem)] rounded-xl border border-base-subtle bg-calendar-bg p-1 shadow-md outline-none';

const compactCalendarGridClassName =
  'w-[17.125rem] [&_th]:w-[39px] [&_th]:max-w-[39px] [&_td_[role=button]]:size-[39px]';

function focusDateSegmentFromShell(event: React.MouseEvent<HTMLElement>, isDisabled: boolean) {
  if (
    isDisabled ||
    (event.target instanceof Element &&
      event.target.closest('[role="spinbutton"], button, a, [role="button"]'))
  ) {
    return;
  }

  const segment = event.currentTarget.querySelector<HTMLElement>('[role="spinbutton"]');
  if (!segment) return;

  event.preventDefault();
  segment.focus();
}

export interface DatePickerProps<T extends DateValue> extends Omit<
  AriaDatePickerProps<T>,
  'children' | 'className' | 'style'
> {
  appearance?: DatePickerAppearance;
  size?: DatePickerSize;
  label?: React.ReactNode;
  infoTooltip?: React.ReactNode;
  infoTooltipAriaLabel?: string;
  isOptional?: boolean;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  showRequiredIndicator?: boolean;
  calendarButtonLabel?: string;
  showTodayButton?: boolean;
  todayButtonLabel?: string;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
  calendarClassName?: string;
  /** Ref to the focusable trigger button, for form-library focus-on-error. */
  triggerRef?: React.Ref<HTMLButtonElement>;
}

export function DatePicker<T extends DateValue>({
  appearance = 'default',
  size = 'md',
  label,
  infoTooltip,
  infoTooltipAriaLabel,
  isOptional = false,
  description,
  errorMessage,
  showRequiredIndicator = true,
  calendarButtonLabel,
  showTodayButton = true,
  todayButtonLabel,
  className,
  inputClassName,
  popoverClassName,
  calendarClassName,
  name,
  triggerRef: triggerRefProp,
  ...props
}: DatePickerProps<T>) {
  const languageConfig = useVeliLanguage();
  const setTriggerRef = React.useCallback(
    (node: HTMLButtonElement | null) => {
      assignRef(triggerRefProp, node);
    },
    [triggerRefProp],
  );
  return (
    <AriaDatePicker
      {...props}
      name={name}
      lang={languageConfig.lang}
      dir={languageConfig.direction}
      className={twMerge(fieldRootVariants(), 'gap-0', className)}
    >
      {({ isDisabled, isInvalid, isReadOnly, isOpen }) => {
        const showRequired = showRequiredIndicator && Boolean(props.isRequired);
        const showOptional = shouldShowFieldOptional(isOptional, props.isRequired);

        return (
          <>
            {label || infoTooltip || showOptional || showRequired ? (
              <div className="flex w-full items-center gap-2 pb-2">
                <div className="flex min-w-0 flex-1 items-center gap-2">
                  {label ? (
                    <Label className={fieldHeaderLabelVariants({ size, isDisabled })}>
                      {label}
                    </Label>
                  ) : null}
                  {infoTooltip ? (
                    <ButtonContext.Provider value={{}}>
                      <TooltipTrigger>
                        <AriaButton
                          type="button"
                          aria-label={
                            infoTooltipAriaLabel ?? infoTooltipLabels[languageConfig.language]
                          }
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
                    </ButtonContext.Provider>
                  ) : null}
                  {showOptional ? (
                    <span className={fieldHeaderSupplementaryVariants({ size, isDisabled })}>
                      {getFieldOptionalLabel(languageConfig.language)}
                    </span>
                  ) : null}
                  {showRequired ? (
                    <span className={fieldHeaderRequiredIndicatorVariants({ isDisabled })}>*</span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <Group
              className={twMerge(
                fieldShellVariants({ appearance, size, isDisabled, isInvalid, isReadOnly, isOpen }),
                'gap-2',
                inputClassName,
              )}
              onMouseDown={(event) => focusDateSegmentFromShell(event, isDisabled)}
            >
              <DateSegments size={size} />
              <AriaButton
                ref={setTriggerRef}
                slot="button"
                type="button"
                aria-label={calendarButtonLabel ?? calendarButtonLabels[languageConfig.language]}
                isDisabled={isDisabled || isReadOnly}
                className={calendarButtonClassName}
              >
                <CalendarBlankIcon aria-hidden size={20} weight="regular" />
              </AriaButton>
            </Group>

            <div className="empty:hidden [&:not(:empty)]:pt-1">
              <FieldMessage
                isInvalid={isInvalid}
                size={size}
                description={description}
                errorMessage={errorMessage}
              />
            </div>

            <Popover
              offset={4}
              placement="bottom start"
              lang={languageConfig.lang}
              dir={languageConfig.direction}
              className={twMerge(popoverSurfaceClassName, popoverClassName)}
            >
              <Dialog className="outline-none">
                <Calendar
                  showTodayButton={showTodayButton}
                  todayButtonLabel={todayButtonLabel}
                  gridClassName={compactCalendarGridClassName}
                  className={twMerge('border-none p-0 shadow-none', calendarClassName)}
                />
              </Dialog>
            </Popover>
          </>
        );
      }}
    </AriaDatePicker>
  );
}
