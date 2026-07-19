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
import {
  getCalendarTodayLabel,
  getDhivehiMonthName,
  getDhivehiWeekdayLabel,
} from './calendar-localization';
import { useVeliLanguage } from './provider';

type CalendarPickerItem = {
  id: number;
  formatted: string;
};

type CalendarWeekdayStyle = NonNullable<CalendarGridProps['weekdayStyle']>;
type CalendarFirstDayOfWeek = NonNullable<AriaCalendarProps<DateValue>['firstDayOfWeek']>;
type CalendarDirection = 'ltr' | 'rtl';

type CalendarPickerSelectProps = {
  'aria-label': string;
  value: number | string;
  onChange: (key: number | string | null) => void;
  items: CalendarPickerItem[];
  lang?: string;
  dir?: 'ltr' | 'rtl';
  labelClassName?: string;
  itemClassName?: string;
  popoverClassName?: string;
};

const calendarHeaderControlClassName = 'flex items-center rounded-lg bg-calendar-bg-month-year';

const calendarHeaderMonthLabelClassName =
  'min-w-0 flex-1 px-1 text-center type-body-sm-medium text-base-strong whitespace-nowrap';

const calendarNumericTextClassName = 'tabular-nums';

const calendarNumericRegularTextClassName = calendarNumericTextClassName;

const calendarHeaderYearLabelClassName = calendarNumericTextClassName;

const calendarYearPickerItemClassName = calendarNumericRegularTextClassName;

const defaultCalendarFirstDayOfWeek: CalendarFirstDayOfWeek = 'sun';

const calendarHeaderIconButtonClassName =
  'shrink-0 rounded-full hover:bg-calendar-day-hover active:bg-calendar-day-hover [&_svg]:text-icon-base-strong';

const calendarPickerPopoverClassName =
  'rounded-xl border border-base-subtle bg-menu-bg p-1 text-base-strong shadow-lg outline-none';

const calendarYearPickerPopoverClassName = 'w-[90px]';

const calendarPickerListBoxClassName = 'max-h-60 overflow-auto outline-none';

const calendarPickerItemVariants = cva(
  'flex min-h-9 w-full cursor-default items-center rounded-lg px-2 py-2 text-start type-body-sm-regular outline-none transition-colors duration-normal ease-out',
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

function CalendarPickerSelect({
  'aria-label': ariaLabel,
  value,
  onChange,
  items,
  lang,
  dir,
  labelClassName,
  itemClassName,
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
      <span className={twMerge(calendarHeaderMonthLabelClassName, labelClassName)}>
        {selectedLabel}
      </span>
      <Button
        intent="secondary"
        appearance="ghost"
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
        lang={lang}
        dir={dir}
        className={twMerge(calendarPickerPopoverClassName, popoverClassName)}
      >
        <ListBox items={items} className={calendarPickerListBoxClassName}>
          {(item: CalendarPickerItem) => (
            <ListBoxItem
              id={item.id}
              textValue={item.formatted}
              className={({ isSelected, isFocused, isDisabled }) =>
                twMerge(
                  calendarPickerItemVariants({ isSelected, isFocused, isDisabled }),
                  itemClassName,
                )
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
  'flex max-w-full flex-col rounded-xl border border-base-subtle bg-calendar-bg p-1 font-sans text-base-default shadow-md',
);

const calendarGridClassName = 'w-[19.25rem] table-fixed border-spacing-0';

const calendarHeaderCellClassName =
  'w-11 max-w-11 overflow-hidden px-0 py-2 text-center type-caption-regular text-base-default';

const calendarWeekdayLabelClassName = 'block truncate no-underline';

const calendarDayLabelClassName = twMerge(
  'inline-flex h-5 min-w-5 items-center justify-center leading-5',
  calendarNumericRegularTextClassName,
);

function getDefaultCalendarWeekdayStyle(direction: CalendarDirection): CalendarWeekdayStyle {
  return direction === 'rtl' ? 'long' : 'narrow';
}

function getCalendarWeekdayLabelClassName() {
  return calendarWeekdayLabelClassName;
}

const cellVariants = cva(
  'flex size-11 items-center justify-center type-body-sm-regular forced-color-adjust-none outline-none transition-colors duration-normal ease-out [-webkit-tap-highlight-color:transparent]',
  {
    variants: {
      cellRadius: {
        full: 'rounded-full',
        rangeStart: 'rounded-s-full rounded-e-none',
        rangeEnd: 'rounded-e-full rounded-s-none',
      },
      isSelected: {
        false:
          'text-base-emphasis data-[outside-month]:text-base-subtle data-[outside-visible-range]:invisible',
        true: 'bg-calendar-day-selected text-primary-inverted data-[invalid]:bg-button-danger data-[invalid]:text-danger-inverted forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:data-[invalid]:bg-[Mark]',
      },
      isDisabled: {
        true: 'cursor-not-allowed text-disabled forced-colors:text-[GrayText]',
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
        className: 'text-danger line-through decoration-2 decoration-text-danger',
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
  weekdayStyle,
  firstDayOfWeek = defaultCalendarFirstDayOfWeek,
  showTodayButton = false,
  todayButtonLabel,
  ...props
}: CalendarProps<T>) {
  const languageConfig = useVeliLanguage();
  const resolvedWeekdayStyle =
    weekdayStyle ?? getDefaultCalendarWeekdayStyle(languageConfig.direction);

  return (
    <AriaCalendar
      {...props}
      firstDayOfWeek={firstDayOfWeek}
      lang={languageConfig.lang}
      dir={languageConfig.direction}
      className={twMerge(calendarRootVariants(), className)}
    >
      <CalendarHeader />
      <CalendarDateGrid gridClassName={gridClassName} weekdayStyle={resolvedWeekdayStyle} />
      {showTodayButton ? (
        <CalendarTodayButton
          label={todayButtonLabel ?? getCalendarTodayLabel(languageConfig.language)}
        />
      ) : null}
      {errorMessage ? (
        <Text slot="errorMessage" className="pt-3 type-caption-regular text-danger-muted">
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
  weekdayStyle,
  firstDayOfWeek = defaultCalendarFirstDayOfWeek,
  showTodayButton = false,
  todayButtonLabel,
  ...props
}: RangeCalendarProps<T>) {
  const languageConfig = useVeliLanguage();
  const resolvedWeekdayStyle =
    weekdayStyle ?? getDefaultCalendarWeekdayStyle(languageConfig.direction);

  return (
    <AriaRangeCalendar
      {...props}
      firstDayOfWeek={firstDayOfWeek}
      lang={languageConfig.lang}
      dir={languageConfig.direction}
      className={twMerge(calendarRootVariants(), className)}
    >
      <CalendarHeader />
      <CalendarRangeGrid gridClassName={gridClassName} weekdayStyle={resolvedWeekdayStyle} />
      {showTodayButton ? (
        <CalendarTodayButton
          label={todayButtonLabel ?? getCalendarTodayLabel(languageConfig.language)}
        />
      ) : null}
      {errorMessage ? (
        <Text slot="errorMessage" className="pt-3 type-caption-regular text-danger-muted">
          {errorMessage}
        </Text>
      ) : null}
    </AriaRangeCalendar>
  );
}

function CalendarDateGrid({
  gridClassName,
  weekdayStyle,
}: {
  gridClassName?: string;
  weekdayStyle: CalendarWeekdayStyle;
}) {
  const { language } = useVeliLanguage();
  const reactAriaWeekdayStyle =
    language === 'dv' && weekdayStyle === 'narrow' ? 'short' : weekdayStyle;

  return (
    <CalendarGrid
      weekdayStyle={reactAriaWeekdayStyle}
      className={twMerge(calendarGridClassName, gridClassName)}
    >
      <CalendarGridHeader weekdayStyle={weekdayStyle} />
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
  weekdayStyle,
}: {
  gridClassName?: string;
  weekdayStyle: CalendarWeekdayStyle;
}) {
  const { language } = useVeliLanguage();
  const reactAriaWeekdayStyle =
    language === 'dv' && weekdayStyle === 'narrow' ? 'short' : weekdayStyle;

  return (
    <CalendarGrid
      weekdayStyle={reactAriaWeekdayStyle}
      className={twMerge(calendarGridClassName, '[&_td]:p-0', gridClassName)}
    >
      <CalendarGridHeader weekdayStyle={weekdayStyle} />
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
  const { language } = useVeliLanguage();
  const calendarState = useContext(CalendarStateContext);
  const rangeCalendarState = useContext(RangeCalendarStateContext);
  const state = calendarState ?? rangeCalendarState;
  const startDate = state?.visibleRange.start;
  const timeZone = state?.timeZone;
  const label = useMemo(() => {
    if (!startDate || !timeZone) {
      return '';
    }

    if (language === 'dv') {
      return getDhivehiMonthName(startDate.month);
    }

    return new Intl.DateTimeFormat(locale, {
      month: 'long',
      calendar: startDate.calendar.identifier,
      timeZone,
    }).format(startDate.toDate(timeZone));
  }, [language, locale, startDate, timeZone]);

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
    <div className="border-t border-base-subtle px-0.5 pt-1">
      <Button
        slot={null}
        intent="primary"
        appearance="ghost"
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
  const { direction, lang } = useVeliLanguage();

  return (
    <header className="flex items-center gap-0.5 px-0.5 py-0.5">
      <div className={twMerge(calendarHeaderControlClassName, 'min-w-0 flex-1 gap-0.5 px-1 py-1')}>
        <Button
          slot="previous"
          intent="secondary"
          appearance="ghost"
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
          intent="secondary"
          appearance="ghost"
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
              lang={lang}
              dir={direction}
              labelClassName={calendarHeaderYearLabelClassName}
              itemClassName={calendarYearPickerItemClassName}
              popoverClassName={calendarYearPickerPopoverClassName}
            />
          )}
        </CalendarYearPicker>
      </div>
    </header>
  );
}

export function CalendarGridHeader({ weekdayStyle }: { weekdayStyle?: CalendarWeekdayStyle }) {
  const { direction, language } = useVeliLanguage();
  const resolvedWeekdayStyle = weekdayStyle ?? getDefaultCalendarWeekdayStyle(direction);

  return (
    <AriaCalendarGridHeader>
      {(day) => {
        const weekdayLabel =
          language === 'dv' ? getDhivehiWeekdayLabel(day, resolvedWeekdayStyle) : day;
        const weekdayFullLabel =
          language === 'dv' ? getDhivehiWeekdayLabel(day, 'long') : undefined;

        return (
          <CalendarHeaderCell className={calendarHeaderCellClassName}>
            <abbr
              aria-label={weekdayFullLabel}
              title={weekdayFullLabel}
              className={getCalendarWeekdayLabelClassName()}
            >
              {weekdayLabel}
            </abbr>
          </CalendarHeaderCell>
        );
      }}
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
  return (
    <span className={twMerge(calendarDayLabelClassName, state.isToday && 'relative')}>
      {state.formattedDate}
      {state.isToday ? (
        <span
          aria-hidden="true"
          className={twMerge(
            'absolute left-1/2 top-full mt-0.5 size-1 -translate-x-1/2 shrink-0 rounded-full',
            todayDotInverted ? 'bg-text-primary-inverted' : 'bg-calendar-day-selected',
          )}
        />
      ) : null}
    </span>
  );
}

function getRangeCalendarCellClassName(state: CalendarCellRenderProps) {
  if (!state.isSelected) {
    return getCalendarCellClassName(state);
  }

  const isSingleDayRange = state.isSelectionStart && state.isSelectionEnd;

  return twMerge(
    'flex h-11 w-full items-center justify-center type-body-sm-regular forced-color-adjust-none outline-none transition-colors duration-normal ease-out [-webkit-tap-highlight-color:transparent]',
    'bg-calendar-day-range text-base-emphasis data-[outside-month]:text-base-subtle data-[outside-visible-range]:invisible',
    isSingleDayRange && 'rounded-full',
    state.isSelectionStart && !state.isSelectionEnd && 'rounded-s-full',
    state.isSelectionEnd && !state.isSelectionStart && 'rounded-e-full',
    !state.isSelectionStart && !state.isSelectionEnd && 'rounded-none',
    state.isDisabled && 'cursor-not-allowed text-disabled forced-colors:text-[GrayText]',
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
