'use client';

import * as React from 'react';
import { CalendarBlank } from 'phosphor-react';
import {
  Button as AriaButton,
  DatePicker as AriaDatePicker,
  Dialog,
  Label,
  Popover,
  useLocale,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
} from 'react-aria-components';
import { type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';
import { Calendar } from './calendar';
import { formatDatePickerValue } from './date-shared';
import {
  FieldMessage,
  fieldHeaderLabelVariants,
  fieldHeaderRequiredIndicatorVariants,
  fieldHeaderSupplementaryVariants,
  fieldRootVariants,
  fieldTriggerButtonVariants,
  fieldTriggerIndicatorVariants,
  fieldTriggerValueVariants,
} from './field-shared';
import { useVeliLanguage } from './provider';

const popoverSurfaceClassName =
  'rounded-xl border border-base-subtle bg-calendar-bg p-2 shadow-md outline-none';

export interface DatePickerProps<T extends DateValue>
  extends
    Omit<AriaDatePickerProps<T>, 'children' | 'className' | 'style'>,
    Omit<
      VariantProps<typeof fieldTriggerButtonVariants>,
      'isDisabled' | 'isInvalid' | 'isFocusVisible' | 'isOpen'
    > {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  labelSupplementary?: React.ReactNode;
  showRequiredIndicator?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  popoverClassName?: string;
  calendarClassName?: string;
}

export function DatePicker<T extends DateValue>({
  label,
  description,
  errorMessage,
  labelSupplementary,
  showRequiredIndicator = true,
  placeholder = 'Select date',
  className,
  inputClassName,
  popoverClassName,
  calendarClassName,
  appearance = 'default',
  size = 'md',
  granularity = 'day',
  hourCycle,
  ...props
}: DatePickerProps<T>) {
  const { locale } = useLocale();
  const languageConfig = useVeliLanguage();
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const showRequired = showRequiredIndicator && Boolean(props.isRequired);

  return (
    <AriaDatePicker
      {...props}
      granularity={granularity}
      hourCycle={hourCycle}
      className={twMerge(fieldRootVariants(), className)}
    >
      {({ isDisabled, isInvalid, isReadOnly, isOpen, isFocusVisible, state }) => {
        const displayValue = state.value
          ? formatDatePickerValue(state.value, locale, { granularity, hourCycle })
          : null;

        return (
          <>
            {label || labelSupplementary || showRequired ? (
              <div className="flex w-full items-center gap-2">
                <div className="flex min-w-0 flex-1 items-center gap-1">
                  {label ? (
                    <Label className={fieldHeaderLabelVariants({ size, isDisabled })}>
                      {label}
                    </Label>
                  ) : null}
                  {labelSupplementary ? (
                    <span className={fieldHeaderSupplementaryVariants({ size, isDisabled })}>
                      {labelSupplementary}
                    </span>
                  ) : null}
                  {showRequired ? (
                    <span className={fieldHeaderRequiredIndicatorVariants({ isDisabled })}>*</span>
                  ) : null}
                </div>
              </div>
            ) : null}

            <AriaButton
              ref={triggerRef}
              slot="button"
              className={twMerge(
                fieldTriggerButtonVariants({
                  appearance,
                  size,
                  isDisabled,
                  isInvalid,
                  isOpen,
                  isFocusVisible,
                }),
                isReadOnly && !isDisabled && 'bg-ash-alpha-100',
                inputClassName,
              )}
            >
              <span
                className={twMerge(
                  fieldTriggerValueVariants({ size }),
                  !displayValue
                    ? 'text-base-inactive'
                    : isDisabled
                      ? 'text-disabled'
                      : 'text-base-strong',
                )}
              >
                {displayValue ?? placeholder}
              </span>
              <span className={fieldTriggerIndicatorVariants({ isDisabled, isOpen: false })}>
                <CalendarBlank aria-hidden size={20} weight="regular" className="text-icon-base" />
              </span>
            </AriaButton>

            <FieldMessage
              isInvalid={isInvalid}
              size={size ?? 'md'}
              description={description}
              errorMessage={errorMessage}
            />

            <Popover
              offset={4}
              placement="bottom start"
              triggerRef={triggerRef}
              lang={languageConfig.lang}
              dir={languageConfig.direction}
              className={twMerge(popoverSurfaceClassName, popoverClassName)}
            >
              <Dialog className="outline-none">
                <Calendar className={twMerge('border-none p-0 shadow-none', calendarClassName)} />
              </Dialog>
            </Popover>
          </>
        );
      }}
    </AriaDatePicker>
  );
}
