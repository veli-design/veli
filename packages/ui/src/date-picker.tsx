import * as React from "react";
import { CalendarBlank } from "phosphor-react";
import {
  DatePicker as AriaDatePicker,
  Dialog,
  FieldError,
  Group,
  Label,
  Popover,
  Text,
  type DatePickerProps as AriaDatePickerProps,
  type DateValue,
} from "react-aria-components";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  DateSegments,
  fieldLabelRowVariants,
  fieldLabelVariants,
  fieldMetaVariants,
  fieldRootVariants,
  fieldShellVariants,
  messageVariants,
} from "./date-shared";

const datePickerWidthClassName = "w-[calc(10*var(--spacing)*7)] max-w-full";

const popoverSurfaceClassName =
  "rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised p-2 shadow-[0_12px_32px_rgba(15,23,42,0.16)] outline-none";

const fieldButtonClassName = "h-9 w-9 min-w-0 shrink-0 self-center rounded-md border-0 px-0";

export interface DatePickerProps<T extends DateValue> extends Omit<
  AriaDatePickerProps<T>,
  "children" | "className" | "style"
> {
  label?: React.ReactNode;
  description?: React.ReactNode;
  errorMessage?: React.ReactNode;
  labelSupplementary?: React.ReactNode;
  showRequiredIndicator?: boolean;
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
  className,
  inputClassName,
  popoverClassName,
  calendarClassName,
  ...props
}: DatePickerProps<T>) {
  const showRequired = showRequiredIndicator && Boolean(props.isRequired);

  return (
    <AriaDatePicker
      {...props}
      className={twMerge(fieldRootVariants(), datePickerWidthClassName, "gap-1", className)}
    >
      {({ isDisabled, isInvalid, isReadOnly }) => (
        <>
          {label || labelSupplementary || showRequired ? (
            <div className={fieldLabelRowVariants()}>
              <div className="flex min-w-0 items-center gap-1.5">
                {label ? (
                  <Label className={fieldLabelVariants({ isDisabled })}>
                    {label}
                  </Label>
                ) : null}
                {labelSupplementary ? (
                  <span className={fieldMetaVariants({ isDisabled })}>
                    {labelSupplementary}
                  </span>
                ) : null}
                {showRequired ? (
                  <span
                    className={fieldMetaVariants({
                      tone: "danger",
                      isDisabled,
                    })}
                  >
                    *
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}

          <Group
            className={twMerge(
              fieldShellVariants({
                isDisabled,
                isInvalid,
                isReadOnly,
              }),
              inputClassName,
            )}
          >
            <DateSegments className="min-w-0 flex-1 flex-nowrap" />
            <Button
              slot="button"
              variant="secondary"
              style="ghost"
              size="xs"
              className={fieldButtonClassName}
            >
              <CalendarBlank aria-hidden className="h-5 w-5 shrink-0" weight="regular" />
            </Button>
          </Group>

          {description ? (
            <Text slot="description" className={messageVariants()}>
              {description}
            </Text>
          ) : null}
          <FieldError className={messageVariants({ tone: "danger" })}>
            {errorMessage}
          </FieldError>

          <Popover
            offset={8}
            className={twMerge(popoverSurfaceClassName, popoverClassName)}
          >
            <Dialog className="outline-none">
              <Calendar
                className={twMerge(
                  "border-none p-0 shadow-none",
                  calendarClassName,
                )}
              />
            </Dialog>
          </Popover>
        </>
      )}
    </AriaDatePicker>
  );
}
