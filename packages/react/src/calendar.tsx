'use client';

import {
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
  type RefObject,
  type ReactNode,
  type KeyboardEvent,
} from 'react';
import { today } from '@internationalized/date';
import {
  Calendar as AriaCalendar,
  CalendarGridHeader as AriaCalendarGridHeader,
  CalendarStateContext,
  CalendarYearPicker,
  Heading,
  I18nProvider,
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
import {
  CaretDownIcon,
  CaretLeftIcon,
  CaretRightIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';
import { twMerge } from 'tailwind-merge';
import { Button } from './button.js';
import {
  getCalendarTodayLabel,
  getCalendarNavigationLabels,
  getDhivehiMonthName,
  getDhivehiWeekdayLabel,
} from './calendar-localization.js';
import { useVeliLanguage } from './provider.js';

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
  triggerRef?: RefObject<Element | null>;
  isDisabled?: boolean;
};

const calendarHeaderControlClassName = 'flex items-center rounded-lg bg-calendar-bg-month-year';

const calendarHeaderMonthLabelClassName =
  'min-w-0 flex-1 px-0.5 text-center type-body-sm-medium text-base-strong whitespace-normal break-words';

const calendarNumericTextClassName = 'tabular-nums';

const calendarNumericRegularTextClassName = calendarNumericTextClassName;

const calendarHeaderYearLabelClassName = calendarNumericTextClassName;

const calendarYearPickerItemClassName = calendarNumericRegularTextClassName;

const defaultCalendarFirstDayOfWeek: CalendarFirstDayOfWeek = 'sun';

const calendarHeaderIconButtonClassName =
  'shrink-0 rounded-full hover:bg-calendar-day-hover active:bg-calendar-day-hover [&_svg]:text-icon-base-strong';

const calendarPickerPopoverClassName =
  'rounded-xl border border-base-subtle bg-menu-bg p-1 text-base-strong shadow-lg outline-none';

const calendarYearPickerPopoverClassName = 'w-[var(--trigger-width)]';

const calendarPickerListBoxClassName = 'max-h-60 overflow-auto outline-none';

const calendarErrorMessageClassName =
  'flex min-w-0 items-center gap-1.5 px-2 pb-2 pt-2 type-caption-regular text-danger-muted';

const calendarPickerItemVariants = cva(
  'flex min-h-9 w-full cursor-default items-center rounded-lg px-2 py-2 text-start type-body-sm-regular outline-none transition-colors duration-normal ease-out motion-reduce:transition-none',
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
        true: 'cursor-not-allowed text-disabled',
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

function CalendarErrorMessage({ children }: { children: string }) {
  return (
    <Text slot="errorMessage" elementType="div" className={calendarErrorMessageClassName}>
      <WarningCircleIcon
        aria-hidden
        weight="fill"
        className="size-4 shrink-0 text-icon-danger-muted"
      />
      <span className="min-w-0 break-words">{children}</span>
    </Text>
  );
}

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
  triggerRef,
  isDisabled,
}: CalendarPickerSelectProps) {
  const selectedLabel = items.find((item) => item.id === value)?.formatted ?? '';

  return (
    <AriaSelect
      aria-label={ariaLabel}
      isDisabled={isDisabled}
      selectedKey={value}
      onSelectionChange={onChange}
      className="flex items-center gap-2"
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
        <CaretDownIcon aria-hidden weight="regular" className="size-4 shrink-0" />
      </Button>
      <Popover
        offset={4}
        placement="bottom end"
        triggerRef={triggerRef}
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
  'flex w-fit min-w-0 max-w-[min(19.875rem,100%)] flex-col rounded-xl border border-base-subtle bg-calendar-bg p-1 font-sans text-base-default shadow-md',
);

const calendarGridClassName =
  'w-[min(19.25rem,100%)] max-w-full table-fixed border-spacing-0 [&_td]:p-0';

const calendarHeaderCellClassName =
  'w-1/7 px-0 py-2 text-center type-caption-regular text-base-default';

const calendarWeekdayLabelClassName =
  'block truncate no-underline @min-[44px]:overflow-visible @min-[44px]:text-clip';

const calendarDayLabelClassName =
  'inline-flex h-5 min-w-5 items-center justify-center type-body-sm-regular leading-5';

function getDefaultCalendarWeekdayStyle(direction: CalendarDirection): CalendarWeekdayStyle {
  return direction === 'rtl' ? 'long' : 'short';
}

function getCalendarWeekdayLabelClassName() {
  return calendarWeekdayLabelClassName;
}

const cellVariants = cva(
  'mx-auto flex h-11 min-w-6 w-full max-w-11 items-center justify-center type-body-sm-regular forced-color-adjust-none outline-none [-webkit-tap-highlight-color:transparent]',
  {
    variants: {
      cellRadius: {
        full: 'rounded-full',
        rangeStart: 'rounded-s-full rounded-e-none',
        rangeEnd: 'rounded-e-full rounded-s-none',
      },
      isSelected: {
        false: 'text-base-emphasis data-[outside-month]:text-base-subtle',
        true: 'bg-calendar-day-selected text-white data-[invalid]:bg-button-danger forced-colors:bg-[Highlight] forced-colors:text-[HighlightText] forced-colors:data-[invalid]:bg-[Mark]',
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

const subscribeToHydration = () => () => {};
const getHydratedSnapshot = () => true;
const getServerHydrationSnapshot = () => false;

function CalendarLocale({ children }: { children: ReactNode }) {
  const { language } = useVeliLanguage();
  const { locale } = useLocale();
  const hydrated = useSyncExternalStore(
    subscribeToHydration,
    getHydratedSnapshot,
    getServerHydrationSnapshot,
  );
  // WebKit's incomplete dv-MV month data produces "M10", unlike Node's "October".
  // Match server/client Gregorian text during hydration, then restore the native
  // locale (and its RTL keyboard direction). Visible Dhivehi labels are Veli copy.
  return (
    <I18nProvider locale={language === 'dv' && !hydrated ? 'en-GB' : locale}>
      {children}
    </I18nProvider>
  );
}

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
    <CalendarLocale>
      <AriaCalendar
        {...props}
        aria-disabled={props.isDisabled || undefined}
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
        {errorMessage ? <CalendarErrorMessage>{errorMessage}</CalendarErrorMessage> : null}
      </AriaCalendar>
    </CalendarLocale>
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
    <CalendarLocale>
      <AriaRangeCalendar
        {...props}
        aria-disabled={props.isDisabled || undefined}
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
        {errorMessage ? <CalendarErrorMessage>{errorMessage}</CalendarErrorMessage> : null}
      </AriaRangeCalendar>
    </CalendarLocale>
  );
}

// Some WebKit/ICU builds report Dhivehi as LTR even though the grid is RTL.
// Use the same public state actions as React Aria for horizontal arrows only.
function useDhivehiGridKeyboardDirection() {
  const { language } = useVeliLanguage();
  const { direction } = useLocale();
  const calendarState = useContext(CalendarStateContext);
  const rangeState = useContext(RangeCalendarStateContext);
  const state = calendarState ?? rangeState;

  return (event: KeyboardEvent<HTMLDivElement>) => {
    if (language !== 'dv' || direction === 'rtl' || !state) return;
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    event.stopPropagation();
    if (event.key === 'ArrowLeft') state.focusNextDay();
    else state.focusPreviousDay();
  };
}

function CalendarDateGrid({
  gridClassName,
  weekdayStyle,
}: {
  gridClassName?: string;
  weekdayStyle: CalendarWeekdayStyle;
}) {
  const { language } = useVeliLanguage();
  const onKeyDownCapture = useDhivehiGridKeyboardDirection();
  const reactAriaWeekdayStyle =
    language === 'dv' && weekdayStyle === 'narrow' ? 'short' : weekdayStyle;

  return (
    <div className="contents" onKeyDownCapture={onKeyDownCapture}>
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
    </div>
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
  const onKeyDownCapture = useDhivehiGridKeyboardDirection();
  const reactAriaWeekdayStyle =
    language === 'dv' && weekdayStyle === 'narrow' ? 'short' : weekdayStyle;

  return (
    <div className="contents" onKeyDownCapture={onKeyDownCapture}>
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
    </div>
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
    <div data-slot="calendar-today" className="mt-1 border-t border-base-subtle pt-1">
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
  const { direction, lang, language } = useVeliLanguage();
  const calendarState = useContext(CalendarStateContext);
  const rangeCalendarState = useContext(RangeCalendarStateContext);
  const state = calendarState ?? rangeCalendarState;
  const labels = getCalendarNavigationLabels(language);
  const yearTriggerRef = useRef<HTMLDivElement>(null);

  return (
    <header className="flex items-center gap-0.5">
      <div
        className={twMerge(calendarHeaderControlClassName, 'min-w-0 flex-1 justify-between p-0.5')}
      >
        <Button
          slot="previous"
          intent="secondary"
          appearance="ghost"
          size="sm"
          iconOnly
          aria-label={labels.previousMonth}
          className={twMerge(
            calendarHeaderIconButtonClassName,
            'data-[disabled]:[&_svg]:text-icon-disabled',
          )}
        >
          {direction === 'rtl' ? (
            <CaretRightIcon aria-hidden weight="regular" className="size-4 shrink-0" />
          ) : (
            <CaretLeftIcon aria-hidden weight="regular" className="size-4 shrink-0" />
          )}
        </Button>
        <CalendarMonthLabel
          className={twMerge(
            calendarHeaderMonthLabelClassName,
            state?.isDisabled && 'text-disabled',
          )}
        />
        <Button
          slot="next"
          intent="secondary"
          appearance="ghost"
          size="sm"
          iconOnly
          aria-label={labels.nextMonth}
          className={twMerge(
            calendarHeaderIconButtonClassName,
            'data-[disabled]:[&_svg]:text-icon-disabled',
          )}
        >
          {direction === 'rtl' ? (
            <CaretLeftIcon aria-hidden weight="regular" className="size-4 shrink-0" />
          ) : (
            <CaretRightIcon aria-hidden weight="regular" className="size-4 shrink-0" />
          )}
        </Button>
      </div>
      <div
        ref={yearTriggerRef}
        className={twMerge(calendarHeaderControlClassName, 'shrink-0 py-0.5 ps-2 pe-0.5')}
      >
        <CalendarYearPicker>
          {(props) => (
            <CalendarPickerSelect
              {...props}
              aria-label={labels.year}
              isDisabled={state?.isDisabled}
              lang={lang}
              dir={direction}
              labelClassName={calendarHeaderYearLabelClassName}
              itemClassName={calendarYearPickerItemClassName}
              popoverClassName={calendarYearPickerPopoverClassName}
              triggerRef={yearTriggerRef}
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
            <div className="@container">
              <abbr
                aria-label={weekdayFullLabel}
                title={weekdayFullLabel}
                className={getCalendarWeekdayLabelClassName()}
              >
                {weekdayLabel}
              </abbr>
            </div>
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
    <span lang="en" className={twMerge(calendarDayLabelClassName, state.isToday && 'relative')}>
      {state.formattedDate}
      {state.isToday ? (
        <span
          aria-hidden="true"
          className={twMerge(
            'absolute left-1/2 top-full mt-0.5 size-1 -translate-x-1/2 shrink-0 rounded-full',
            todayDotInverted ? 'bg-white' : 'bg-calendar-day-selected',
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
    'flex h-11 w-full items-center justify-center type-body-sm-regular forced-color-adjust-none outline-none [-webkit-tap-highlight-color:transparent]',
    'bg-calendar-day-range text-base-emphasis data-[outside-month]:text-base-subtle',
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
    return 'flex h-11 min-w-6 w-full max-w-11 items-center justify-center';
  }

  return null;
}
