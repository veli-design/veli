import * as React from "react";
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeaderCell,
  Heading,
  Text,
  useLocale,
  type CalendarCellRenderProps,
  type CalendarGridProps,
  type CalendarProps as AriaCalendarProps,
  type DateValue,
} from "react-aria-components";
import { cva } from "class-variance-authority";
import { twMerge } from "tailwind-merge";
import { Button } from "./button";

const calendarRootVariants = cva(
  "flex w-[calc(10*var(--spacing)*7)] max-w-full flex-col rounded-2xl border border-border-default-subtle bg-bg-surface-overlay-raised p-4 font-sans text-text-default-default shadow-[0_12px_32px_rgba(15,23,42,0.12)] [container-type:inline-size]",
);

const cellVariants = cva(
  "flex aspect-square w-[calc((100cqw/7)-6px)] cursor-pointer items-center justify-center rounded-full type-body-sm-medium forced-color-adjust-none outline-none transition-colors [-webkit-tap-highlight-color:transparent]",
  {
    variants: {
      isSelected: {
        false:
          "text-text-default-default hover:bg-button-secondary-subtle-default active:bg-button-secondary-subtle-hover data-[outside-month]:text-text-default-inactive data-[outside-visible-range]:invisible",
        true: "bg-button-primary-default text-text-default-inverted hover:bg-button-primary-hover active:bg-button-primary-pressed data-[invalid]:bg-button-danger-default forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:data-[invalid]:bg-[Mark]",
      },
      isDisabled: {
        true: "cursor-not-allowed text-text-disabled-disabled forced-colors:text-[GrayText]",
        false: "",
      },
      isUnavailable: {
        true: "text-text-danger-muted line-through decoration-2 decoration-text-danger-muted",
        false: "",
      },
      isFocusVisible: {
        true: "ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-overlay-raised",
        false: "",
      },
      isToday: {
        true: "ring-1 ring-inset ring-border-default-subtle",
        false: "",
      },
    },
    compoundVariants: [
      {
        isSelected: true,
        isToday: true,
        className: "ring-border-focus",
      },
      {
        isSelected: false,
        isDisabled: false,
        isToday: true,
        className: "text-text-default-high-contrast",
      },
    ],
    defaultVariants: {
      isSelected: false,
      isDisabled: false,
      isUnavailable: false,
      isFocusVisible: false,
      isToday: false,
    },
  },
);

export interface CalendarProps<T extends DateValue> extends Omit<
  AriaCalendarProps<T>,
  "children"
> {
  errorMessage?: string;
  className?: string;
  gridClassName?: string;
  weekdayStyle?: CalendarGridProps["weekdayStyle"];
}

export function Calendar<T extends DateValue>({
  errorMessage,
  className,
  gridClassName,
  weekdayStyle = "short",
  ...props
}: CalendarProps<T>) {
  return (
    <AriaCalendar
      {...props}
      className={twMerge(calendarRootVariants(), className)}
    >
      <CalendarHeader />
      <CalendarGrid
        weekdayStyle={weekdayStyle}
        className={twMerge("border-spacing-0", gridClassName)}
      >
        <CalendarGridHeader />
        <CalendarGridBody>
          {(date) => (
            <CalendarCell
              date={date}
              className={(state) => getCalendarCellClassName(state)}
            />
          )}
        </CalendarGridBody>
      </CalendarGrid>
      {errorMessage ? (
        <Text
          slot="errorMessage"
          className="pt-3 type-body-sm-regular text-text-danger-muted"
        >
          {errorMessage}
        </Text>
      ) : null}
    </AriaCalendar>
  );
}

export function CalendarHeader() {
  const { direction } = useLocale();

  return (
    <header className="border-box flex items-center gap-1 px-1 pb-5">
      <Button
        slot="previous"
        variant="secondary"
        style="ghost"
        size="xs"
        aria-label="Previous month"
      >
        {direction === "rtl" ? <ChevronRightIcon /> : <ChevronLeftIcon />}
      </Button>
      <Heading className="mx-2 my-0 flex-1 text-center type-body-md-semibold text-text-default-high-contrast [font-variation-settings:normal]" />
      <Button
        slot="next"
        variant="secondary"
        style="ghost"
        size="xs"
        aria-label="Next month"
      >
        {direction === "rtl" ? <ChevronLeftIcon /> : <ChevronRightIcon />}
      </Button>
    </header>
  );
}

export function CalendarGridHeader() {
  return (
    <AriaCalendarGridHeader>
      {(day) => (
        <CalendarHeaderCell className="pb-1 type-caption-12-semibold text-text-default-muted">
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  );
}

function getCalendarCellClassName(state: CalendarCellRenderProps) {
  return cellVariants({
    isSelected: state.isSelected,
    isDisabled: state.isDisabled,
    isUnavailable: state.isUnavailable,
    isFocusVisible: state.isFocusVisible,
    isToday: state.isToday,
  });
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12.5 5L7.5 10L12.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-[18px] w-[18px]"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M7.5 5L12.5 10L7.5 15"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
