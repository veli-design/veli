'use client';

import { useContext, useMemo } from 'react';
import { today } from '@internationalized/date';
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarStateContext,
  CalendarYearPicker,
  Heading,
  RangeCalendar as AriaRangeCalendar,
  RangeCalendarStateContext,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarHeaderCell,
  ListBox,
  ListBoxItem,
  Popover,
  Select as AriaSelect,
  Text,
  useLocale,
  type CalendarCellRenderProps,
  type CalendarGridProps,
  type CalendarProps as AriaCalendarProps,
  type DateValue,
  type RangeCalendarProps as AriaRangeCalendarProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { CaretDown } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Button } from './button';

type CalendarPickerItem = {
  id: number;
  formatted: string;
};

type CalendarPickerSelectProps = {
  'aria-label': string;
  value: number | string;
  onChange: (key: number | string | null) => void;
  items: CalendarPickerItem[];
  popoverClassName?: string;
};

const calendarHeaderControlClassName = 'flex items-center rounded-lg bg-calendar-bg-month-year';

const calendarHeaderMonthLabelClassName =
  'min-w-0 flex-1 px-1 text-center type-body-sm-medium text-text-default-strong whitespace-nowrap';

const calendarHeaderIconButtonClassName =
  'shrink-0 rounded-full hover:bg-calendar-day-hover active:bg-calendar-day-hover [&_svg]:text-icon-default-strong';

const calendarPickerPopoverClassName =
  'rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised p-1 text-text-default-strong shadow-lg outline-none';

const calendarYearPickerPopoverClassName = 'w-[90px]';

const calendarPickerListBoxClassName = 'max-h-60 overflow-auto outline-none';

const calendarPickerItemVariants = cva(
  'flex min-h-9 w-full cursor-default items-center rounded-lg px-2 py-2 text-start type-body-sm-regular outline-none transition-colors',
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

function CalendarPickerSelect({
  'aria-label': ariaLabel,
  value,
  onChange,
  items,
  popoverClassName,
}: CalendarPickerSelectProps) {
  const selectedLabel = items.find((item) => item.id === value)?.formatted ?? '';

  return (
    <AriaSelect
      aria-label={ariaLabel}
      selectedKey={value}
      onSelectionChange={onChange}
      className="flex items-center gap-0.5"
    >
      <span className={calendarHeaderMonthLabelClassName}>{selectedLabel}</span>
      <Button
        variant="secondary"
        style="ghost"
        size="sm"
        iconOnly
        aria-label={ariaLabel}
        className={calendarHeaderIconButtonClassName}
      >
        <CaretDown aria-hidden weight="regular" className="size-4 shrink-0" />
      </Button>
      <Popover
        offset={4}
        placement="bottom end"
        className={twMerge(calendarPickerPopoverClassName, popoverClassName)}
      >
        <ListBox items={items} className={calendarPickerListBoxClassName}>
          {(item: CalendarPickerItem) => (
            <ListBoxItem
              id={item.id}
              textValue={item.formatted}
              className={({ isSelected, isFocused, isDisabled }) =>
                calendarPickerItemVariants({ isSelected, isFocused, isDisabled })
              }
            >
              {item.formatted}
            </ListBoxItem>
          )}
        </ListBox>
      </Popover>
    </AriaSelect>
  );
}

const calendarRootVariants = cva(
  'flex max-w-full flex-col rounded-xl border border-border-default-subtle bg-calendar-bg p-1 font-sans text-text-default-default shadow-md',
);

const cellVariants = cva(
  'flex size-11 items-center justify-center type-body-sm-regular forced-color-adjust-none outline-none transition-colors [-webkit-tap-highlight-color:transparent]',
  {
    variants: {
      cellRadius: {
        full: 'rounded-full',
        rangeStart: 'rounded-s-full rounded-e-none',
        rangeEnd: 'rounded-e-full rounded-s-none',
      },
      isSelected: {
        false:
          'text-text-default-emphasis data-[outside-month]:text-text-default-subtle data-[outside-visible-range]:invisible',
        true: 'bg-calendar-day-selected text-text-primary-inverted data-[invalid]:bg-button-danger-default data-[invalid]:text-text-danger-inverted forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:data-[invalid]:bg-[Mark]',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-text-disabled-disabled forced-colors:text-[GrayText]',
        false: '',
      },
      isUnavailable: {
        true: 'cursor-not-allowed',
        false: '',
      },
      isFocusVisible: {
        true: 'ring-2 ring-border-focus ring-offset-2 ring-offset-calendar-bg',
        false: '',
      },
    },
    compoundVariants: [
      {
        isSelected: false,
        isDisabled: false,
        isUnavailable: false,
        className: 'cursor-pointer hover:bg-calendar-day-hover active:bg-calendar-day-hover',
      },
      {
        isSelected: true,
        isDisabled: false,
        isUnavailable: false,
        className: 'cursor-pointer',
      },
      {
        isDisabled: false,
        isUnavailable: true,
        className:
          'text-text-danger-default line-through decoration-2 decoration-text-danger-default',
      },
    ],
    defaultVariants: {
      cellRadius: 'full',
      isSelected: false,
      isDisabled: false,
      isUnavailable: false,
      isFocusVisible: false,
    },
  },
);

export interface CalendarProps<T extends DateValue> extends Omit<AriaCalendarProps<T>, 'children'> {
  errorMessage?: string;
  className?: string;
  gridClassName?: string;
  weekdayStyle?: CalendarGridProps['weekdayStyle'];
  showTodayButton?: boolean;
  todayButtonLabel?: string;
}

export function Calendar<T extends DateValue>({
  errorMessage,
  className,
  gridClassName,
  weekdayStyle = 'short',
  showTodayButton = false,
  todayButtonLabel = 'Today',
  ...props
}: CalendarProps<T>) {
  return (
    <AriaCalendar {...props} className={twMerge(calendarRootVariants(), className)}>
      <CalendarHeader />
      <CalendarDateGrid gridClassName={gridClassName} weekdayStyle={weekdayStyle} />
      {showTodayButton ? <CalendarTodayButton label={todayButtonLabel} /> : null}
      {errorMessage ? (
        <Text slot="errorMessage" className="pt-3 type-body-sm-regular text-text-danger-muted">
          {errorMessage}
        </Text>
      ) : null}
    </AriaCalendar>
  );
}

export interface RangeCalendarProps<T extends DateValue> extends Omit<
  AriaRangeCalendarProps<T>,
  'children'
> {
  errorMessage?: string;
  className?: string;
  gridClassName?: string;
  weekdayStyle?: CalendarGridProps['weekdayStyle'];
  showTodayButton?: boolean;
  todayButtonLabel?: string;
}

export function RangeCalendar<T extends DateValue>({
  errorMessage,
  className,
  gridClassName,
  weekdayStyle = 'short',
  showTodayButton = false,
  todayButtonLabel = 'Today',
  ...props
}: RangeCalendarProps<T>) {
  return (
    <AriaRangeCalendar {...props} className={twMerge(calendarRootVariants(), className)}>
      <CalendarHeader />
      <CalendarRangeGrid gridClassName={gridClassName} weekdayStyle={weekdayStyle} />
      {showTodayButton ? <CalendarTodayButton label={todayButtonLabel} /> : null}
      {errorMessage ? (
        <Text slot="errorMessage" className="pt-3 type-body-sm-regular text-text-danger-muted">
          {errorMessage}
        </Text>
      ) : null}
    </AriaRangeCalendar>
  );
}

function CalendarDateGrid({
  gridClassName,
  weekdayStyle = 'short',
}: {
  gridClassName?: string;
  weekdayStyle?: CalendarGridProps['weekdayStyle'];
}) {
  return (
    <CalendarGrid
      weekdayStyle={weekdayStyle}
      className={twMerge('border-spacing-0', gridClassName)}
    >
      <CalendarGridHeader />
      <CalendarGridBody>
        {(date) => (
          <CalendarCell date={date} className={(state) => getCalendarCellClassName(state)}>
            {(state) => <CalendarDayLabel state={state} todayDotInverted={state.isSelected} />}
          </CalendarCell>
        )}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

function CalendarRangeGrid({
  gridClassName,
  weekdayStyle = 'short',
}: {
  gridClassName?: string;
  weekdayStyle?: CalendarGridProps['weekdayStyle'];
}) {
  return (
    <CalendarGrid
      weekdayStyle={weekdayStyle}
      className={twMerge('border-spacing-0 [&_td]:p-0', gridClassName)}
    >
      <CalendarGridHeader />
      <CalendarGridBody>
        {(date) => (
          <CalendarCell date={date} className={(state) => getRangeCalendarCellClassName(state)}>
            {(state) => {
              const innerClassName = getRangeCalendarCellInnerClassName(state);
              const label = (
                <CalendarDayLabel
                  state={state}
                  todayDotInverted={
                    state.isSelected && (state.isSelectionStart || state.isSelectionEnd)
                  }
                />
              );

              return innerClassName ? <span className={innerClassName}>{label}</span> : label;
            }}
          </CalendarCell>
        )}
      </CalendarGridBody>
    </CalendarGrid>
  );
}

function CalendarMonthLabel({ className }: { className?: string }) {
  const { locale } = useLocale();
  const calendarState = useContext(CalendarStateContext);
  const rangeCalendarState = useContext(RangeCalendarStateContext);
  const state = calendarState ?? rangeCalendarState;

  const label = useMemo(() => {
    if (!state) {
      return '';
    }

    const startDate = state.visibleRange.start;
    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      calendar: startDate.calendar.identifier,
      timeZone: state.timeZone,
    }).format(startDate.toDate(state.timeZone));
  }, [locale, state]);

  if (!state) {
    return null;
  }

  return <Heading className={className}>{label}</Heading>;
}

function CalendarTodayButton({ label }: { label: string }) {
  const calendarState = useContext(CalendarStateContext);
  const rangeCalendarState = useContext(RangeCalendarStateContext);
  const state = calendarState ?? rangeCalendarState;

  const todayDate = useMemo(() => (state ? today(state.timeZone) : null), [state]);

  const isTodayButtonDisabled =
    !state ||
    state.isDisabled ||
    todayDate == null ||
    state.isInvalid(todayDate) ||
    state.isCellUnavailable(todayDate);

  if (!state) {
    return null;
  }

  return (
    <div className="border-t border-border-default-subtle px-0.5 pt-1">
      <Button
        slot={null}
        variant="primary"
        style="ghost"
        size="sm"
        className="w-full"
        isDisabled={isTodayButtonDisabled}
        onPress={() => {
          if (!todayDate || state.isInvalid(todayDate) || state.isCellUnavailable(todayDate)) {
            return;
          }

          state.setFocusedDate(todayDate);

          if (state.isReadOnly) {
            return;
          }

          if (calendarState) {
            calendarState.setValue(todayDate);
            return;
          }

          rangeCalendarState?.setValue({ start: todayDate, end: todayDate });
        }}
      >
        {label}
      </Button>
    </div>
  );
}

export function CalendarHeader() {
  const { direction } = useLocale();

  return (
    <header className="flex items-center gap-0.5 px-0.5 py-0.5">
      <div className={twMerge(calendarHeaderControlClassName, 'min-w-0 flex-1 gap-0.5 px-1 py-1')}>
        <Button
          slot="previous"
          variant="secondary"
          style="ghost"
          size="sm"
          iconOnly
          aria-label="Previous month"
          className={calendarHeaderIconButtonClassName}
        >
          {direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
        </Button>
        <CalendarMonthLabel className={calendarHeaderMonthLabelClassName} />
        <Button
          slot="next"
          variant="secondary"
          style="ghost"
          size="sm"
          iconOnly
          aria-label="Next month"
          className={calendarHeaderIconButtonClassName}
        >
          {direction === 'rtl' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </Button>
      </div>
      <div className={twMerge(calendarHeaderControlClassName, 'shrink-0 gap-0.5 px-1 py-1')}>
        <CalendarYearPicker>
          {(props) => (
            <CalendarPickerSelect
              {...props}
              popoverClassName={calendarYearPickerPopoverClassName}
            />
          )}
        </CalendarYearPicker>
      </div>
    </header>
  );
}

export function CalendarGridHeader() {
  return (
    <AriaCalendarGridHeader>
      {(day) => (
        <CalendarHeaderCell className="py-2 type-caption-regular text-text-default-default">
          {day}
        </CalendarHeaderCell>
      )}
    </AriaCalendarGridHeader>
  );
}

function getCalendarCellClassName(state: CalendarCellRenderProps) {
  return cellVariants(getCellVariantState(state));
}

function getCellVariantState(state: CalendarCellRenderProps) {
  return {
    isSelected: state.isSelected,
    isDisabled: state.isDisabled,
    isUnavailable: state.isUnavailable,
    isFocusVisible: state.isFocusVisible,
  };
}

function CalendarDayLabel({
  state,
  todayDotInverted,
}: {
  state: CalendarCellRenderProps;
  todayDotInverted: boolean;
}) {
  if (!state.isToday) {
    return state.formattedDate;
  }

  return (
    <span className="relative inline-block">
      {state.formattedDate}
      <span
        aria-hidden="true"
        className={twMerge(
          'absolute start-1/2 top-full mt-0.5 size-1 -translate-x-1/2 shrink-0 rounded-full',
          todayDotInverted ? 'bg-text-primary-inverted' : 'bg-calendar-day-selected',
        )}
      />
    </span>
  );
}

function getRangeCalendarCellClassName(state: CalendarCellRenderProps) {
  if (!state.isSelected) {
    return getCalendarCellClassName(state);
  }

  const isSingleDayRange = state.isSelectionStart && state.isSelectionEnd;

  return twMerge(
    'flex h-11 w-full items-center justify-center type-body-sm-regular forced-color-adjust-none outline-none transition-colors [-webkit-tap-highlight-color:transparent]',
    'bg-calendar-day-range text-text-default-emphasis data-[outside-month]:text-text-default-subtle data-[outside-visible-range]:invisible',
    isSingleDayRange && 'rounded-full',
    state.isSelectionStart && !state.isSelectionEnd && 'rounded-s-full',
    state.isSelectionEnd && !state.isSelectionStart && 'rounded-e-full',
    !state.isSelectionStart && !state.isSelectionEnd && 'rounded-none',
    state.isDisabled &&
      'cursor-not-allowed text-text-disabled-disabled forced-colors:text-[GrayText]',
    !state.isDisabled &&
      !state.isUnavailable &&
      'cursor-pointer hover:bg-calendar-day-range-hover active:bg-calendar-day-range-hover',
    state.isFocusVisible && 'ring-2 ring-border-focus ring-offset-2 ring-offset-calendar-bg',
  );
}

function getRangeCalendarCellInnerClassName(state: CalendarCellRenderProps) {
  if (state.isSelected && (state.isSelectionStart || state.isSelectionEnd)) {
    const isSingleDayRange = state.isSelectionStart && state.isSelectionEnd;

    return cellVariants({
      ...getCellVariantState(state),
      isSelected: true,
      cellRadius: isSingleDayRange ? 'full' : state.isSelectionStart ? 'rangeStart' : 'rangeEnd',
    });
  }

  if (state.isSelected) {
    return 'flex size-11 items-center justify-center';
  }

  return null;
}

function ChevronLeftIcon() {
  return (
    <svg
      aria-hidden="true"
      className="size-4"
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
      className="size-4"
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
