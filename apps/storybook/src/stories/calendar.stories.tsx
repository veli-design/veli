import { useEffect, useState } from 'react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { expect, userEvent, within } from '@storybook/test';
import type { Meta, StoryObj } from '@storybook/react';
import {
  type DateValue,
  getLocalTimeZone,
  isWeekend,
  parseDate,
  today,
} from '@internationalized/date';
import { DatePicker } from '@tradenetcorp/veli-ui/date-picker';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Calendar, RangeCalendar } from '@tradenetcorp/veli-ui/calendar';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const now = parseDate('2026-10-12');
const disabledRanges = [
  [now.add({ days: 4 }), now.add({ days: 7 })],
  [now.add({ days: 12 }), now.add({ days: 14 })],
  [now.add({ days: 24 }), now.add({ days: 27 })],
] as const;

const appointmentUnavailable = (date: DateValue) =>
  isWeekend(date, 'en-GB') ||
  disabledRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

const dhivehiDateText = {
  pickDateWithinAllowedWindow: 'ހުއްދަކުރެވިފައިވާ މުއްދަތުގެ ތެރެއިން ތާރީޚެއް ޚިޔާރުކުރައްވާ.',
};

const calendarText = {
  en: {
    label: 'Appointment calendar',
    error: 'Pick a date within the allowed window.',
    today: 'Today',
  },
  dv: {
    label: 'އެޕޮއިންޓްމަންޓް ކަލަންޑަރު',
    error: dhivehiDateText.pickDateWithinAllowedWindow,
    today: 'މިއަދު',
  },
} as const;

function CalendarDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const collapse = () => {
      if (cancelled) return;
      const groups = ['Content', 'State'];
      if (
        groups.some(
          (group) =>
            !document.querySelector(
              `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
            ),
        ) &&
        attempts++ < 40
      ) {
        requestAnimationFrame(collapse);
        return;
      }
      groups.forEach((group) =>
        document
          .querySelector<HTMLElement>(`tr[title^="Hide ${group} item"] [tabindex="0"]`)
          ?.click(),
      );
    };
    collapse();
    return () => {
      cancelled = true;
    };
  }, []);
  return <DocsContainer {...props} />;
}

const group = <T extends Record<string, object>>(category: string, fields: T) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, { ...value, table: { category } }]),
  );

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
    docs: { container: CalendarDocsContainer },
  },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const [args, updateArgs] = useArgs();
      const language = context.globals.language === 'dv' ? 'dv' : 'en';
      const label = args['aria-label'];
      const { errorMessage, todayButtonLabel } = args;
      useEffect(() => {
        const next: Record<string, string> = {};
        for (const [prop, key, value] of [
          ['aria-label', 'label', label],
          ['errorMessage', 'error', errorMessage],
          ['todayButtonLabel', 'today', todayButtonLabel],
        ] as const) {
          if (
            typeof value === 'string' &&
            Object.values(calendarText).some((copy) => copy[key] === value) &&
            value !== calendarText[language][key]
          )
            next[prop] = calendarText[language][key];
        }
        if (Object.keys(next).length) updateArgs(next);
      }, [label, errorMessage, todayButtonLabel, language, updateArgs]);
      return (<div className="min-w-0 max-w-full [&_[role=application]]:mx-auto"><Story /></div>);
    },
  ],
  argTypes: {
    ...group('Appearance', {
      firstDayOfWeek: {
        control: 'select',
        options: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
      },
      weekdayStyle: { control: 'select', options: ['narrow', 'short', 'long'] },
      showTodayButton: { control: 'boolean' },
    }),
    ...group('Content', {
      'aria-label': { control: 'text' },
      todayButtonLabel: { control: 'text', if: { arg: 'showTodayButton' } },
    }),
    ...group('State', {
      isDisabled: { control: 'boolean' },
      isReadOnly: { control: 'boolean' },
      isInvalid: { control: 'boolean' },
      errorMessage: { control: 'text', if: { arg: 'isInvalid' } },
    }),
    ...Object.fromEntries(
      [
        'className',
        'gridClassName',
        'children',
        'value',
        'defaultValue',
        'onChange',
        'focusedValue',
        'defaultFocusedValue',
        'onFocusChange',
        'minValue',
        'maxValue',
        'isDateUnavailable',
        'visibleDuration',
        'pageBehavior',
        'selectionAlignment',
        'autoFocus',
        'onFocus',
        'onBlur',
        'onFocusChange',
        'onKeyDown',
        'onKeyUp',
        'createCalendar',
      ].map((key) => [key, { control: false, table: { disable: true } }]),
    ),
  },
  args: {
    'aria-label': calendarText.en.label,
    defaultFocusedValue: parseDate('2026-10-15'),
    firstDayOfWeek: 'sun',
    showTodayButton: false,
    isDisabled: false,
    isReadOnly: false,
    isInvalid: false,
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const { language } = useVeliLanguage();
    return (
      <Calendar
        key={`${language}:${args.defaultFocusedValue}`}
        {...args}
        errorMessage={
          args.isInvalid ? args.errorMessage || calendarText[language].error : undefined
        }
      />
    );
  },
};

export const Default: Story = { render: Playground.render };

export const WithSelectedDate: Story = {
  render: (args) => <Calendar {...args} defaultValue={parseDate('2026-10-18')} />,
};

export const WithTodayButton: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Enable the built-in Today button with `showTodayButton`. It focuses today and selects it in single-date mode, or sets a single-day range in range mode.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(parseDate('2026-10-01'));
    const [rangeValue, setRangeValue] = useState({
      start: parseDate('2026-10-10'),
      end: parseDate('2026-10-18'),
    });

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <Calendar
            aria-label="Single date calendar"
            showTodayButton
            value={value}
            onChange={setValue}
          />
          <div className="rounded-xl border border-base-subtle bg-surface-overlay-raised px-3 py-2 text-sm text-base">
            Selected date: <span className="font-semibold">{value.toString()}</span>
          </div>
        </div>
        <div className="space-y-3">
          <RangeCalendar
            aria-label="Range calendar"
            showTodayButton
            value={rangeValue}
            onChange={setRangeValue}
          />
          <div className="rounded-xl border border-base-subtle bg-surface-overlay-raised px-3 py-2 text-sm text-base">
            Selected range:{' '}
            <span className="font-semibold">
              {rangeValue.start.toString()} – {rangeValue.end.toString()}
            </span>
          </div>
        </div>
      </div>
    );
  },
};

export const DateRange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Select a start and end date. Range endpoints use the primary fill; dates in between use a subtle band.',
      },
    },
  },
  render: () => (
    <RangeCalendar
      aria-label="Trip dates"
      defaultValue={{
        start: parseDate('2026-10-10'),
        end: parseDate('2026-10-18'),
      }}
    />
  ),
};

export const ControlledDateRange: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Range selection owned by React state. Useful for booking flows where the selected window is shown elsewhere in the UI.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState({
      start: parseDate('2026-10-10'),
      end: parseDate('2026-10-18'),
    });

    return (
      <div className="space-y-3">
        <RangeCalendar aria-label="Controlled trip dates" value={value} onChange={setValue} />
        <div className="rounded-xl border border-base-subtle bg-surface-overlay-raised px-3 py-2 text-sm text-base">
          Selected range:{' '}
          <span className="font-semibold">
            {value.start.toString()} – {value.end.toString()}
          </span>
        </div>
      </div>
    );
  },
};

export const ControlledByExternalState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Calendar value is owned by React state instead of internal component state. The external controls below can reset or change the selection, which makes the controlled behavior visible.',
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(parseDate('2026-10-30'));
    const [focusedValue, setFocusedValue] = useState(value);

    return (
      <div className="space-y-3">
        <Calendar
          aria-label="Controlled calendar"
          value={value}
          focusedValue={focusedValue}
          onFocusChange={setFocusedValue}
          onChange={(nextValue) => {
            setValue(nextValue);
            setFocusedValue(nextValue);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            intent="secondary"
            appearance="transparent"
            onPress={() => {
              const nextValue = parseDate('2026-10-30');
              setValue(nextValue);
              setFocusedValue(nextValue);
            }}
          >
            Reset to October 30
          </Button>
          <Button
            size="sm"
            intent="secondary"
            appearance="transparent"
            onPress={() => {
              const nextValue = today(getLocalTimeZone());
              setValue(nextValue);
              setFocusedValue(nextValue);
            }}
          >
            Set to Today
          </Button>
        </div>
        <div className="rounded-xl border border-base-subtle bg-surface-overlay-raised px-3 py-2 text-sm text-base">
          Selected date: <span className="font-semibold">{value.toString()}</span>
        </div>
      </div>
    );
  },
};

export const ConstraintsAndUnavailableDates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Availability-driven calendar. Use this for booking, scheduling, or service windows where dates outside a valid range, or specific blackout dates, must be blocked.',
      },
    },
  },
  render: () => (
    <div className="space-y-3">
      <Calendar
        aria-label="Booking availability calendar"
        minValue={now}
        maxValue={now.add({ months: 2 })}
        isDateUnavailable={appointmentUnavailable}
      />
      <div>
        <p className="max-w-md text-xs text-base-muted">Greyed out: Disabled date</p>
        <p className="max-w-md text-xs text-base-muted">Struck through: Unavailable date</p>
      </div>
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => {
    const { direction } = useVeliLanguage();
    const errorMessage =
      direction === 'rtl'
        ? dhivehiDateText.pickDateWithinAllowedWindow
        : 'Pick a date within the allowed window.';

    return (
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Calendar
          aria-label="Invalid calendar"
          isInvalid
          defaultValue={parseDate('2026-10-01')}
          errorMessage={errorMessage}
        />
        <Calendar
          aria-label="Invalid calendar without message"
          isInvalid
          defaultValue={parseDate('2026-10-01')}
        />
      </div>
    );
  },
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Calendar aria-label="Disabled calendar" isDisabled defaultValue={parseDate('2026-10-18')} />
      <Calendar aria-label="Read only calendar" isReadOnly defaultValue={parseDate('2026-10-18')} />
    </div>
  ),
};

/** A padded container, rather than Storybook's intrinsic centered canvas. */
export const Responsive: Story = {
  parameters: { layout: 'fullscreen' },
  render: () => <ResponsiveCalendars />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const single = within(canvas.getByRole('application', { name: /^Mobile single date/ }));
    await userEvent.click(
      single.getAllByRole('button').find((button) => button.textContent === '15')!,
    );
    await expect(canvas.getByTestId('single-value')).toHaveTextContent('2026-10-15');
    const range = within(canvas.getByRole('application', { name: /^Mobile date range/ }));
    await userEvent.click(
      range.getAllByRole('button').find((button) => button.textContent === '13')!,
    );
    await userEvent.click(
      range.getAllByRole('button').find((button) => button.textContent === '20')!,
    );
    await expect(canvas.getByTestId('range-value')).toHaveTextContent('2026-10-13 – 2026-10-20');
  },
};

function ResponsiveCalendars() {
  const [value, setValue] = useState<DateValue | null>(parseDate('2026-10-15'));
  const [range, setRange] = useState<{ start: DateValue; end: DateValue } | null>({
    start: parseDate('2026-10-13'),
    end: parseDate('2026-10-20'),
  });
  return (
    <div className="w-full min-w-0 space-y-6 p-4" data-testid="responsive-calendars">
      <div className="min-w-0">
        <Calendar
          aria-label="Mobile single date"
          value={value}
          onChange={setValue}
          showTodayButton
        />
        <p className="type-caption-regular" data-testid="single-value">
          {value?.toString() ?? 'None'}
        </p>
      </div>
      <div className="min-w-0">
        <RangeCalendar
          aria-label="Mobile date range"
          value={range}
          onChange={setRange}
          showTodayButton
        />
        <p className="type-caption-regular" data-testid="range-value">
          {range ? `${range.start} – ${range.end}` : 'None'}
        </p>
      </div>
      <div className="flex min-w-0 justify-start">
        <DatePicker
          label="Start-edge picker"
          defaultValue={parseDate('2026-10-15')}
          showTodayButton
        />
      </div>
      <div className="flex min-w-0 justify-end">
        <DatePicker
          label="End-edge picker"
          defaultValue={parseDate('2026-10-15')}
          showTodayButton
        />
      </div>
    </div>
  );
}

export const SixWeekMonth: Story = {
  render: () => (
    <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
      <Calendar aria-label="Six week single date" defaultValue={parseDate('2026-08-15')} />
      <RangeCalendar
        aria-label="Six week range"
        defaultValue={{ start: parseDate('2026-08-29'), end: parseDate('2026-09-03') }}
      />
    </div>
  ),
};

export const WeekdayAndWeekStart: Story = {
  args: { firstDayOfWeek: 'mon', weekdayStyle: 'narrow' },
  render: (args) => (
    <Calendar
      {...args}
      firstDayOfWeek={args.firstDayOfWeek ?? 'mon'}
      weekdayStyle={args.weekdayStyle ?? 'narrow'}
    />
  ),
};

export const Customization: Story = {
  args: {
    showTodayButton: true,
    todayButtonLabel: 'Choose today',
    className: 'shadow-none',
    gridClassName: 'w-[17.5rem]',
  },
  render: (args) => <Calendar {...args} />,
};

export const RangeStates: Story = {
  render: () => {
    const { language } = useVeliLanguage();
    const value = { start: parseDate('2026-10-13'), end: parseDate('2026-10-20') };
    return (
      <div className="grid min-w-0 grid-cols-1 gap-6 md:grid-cols-2">
        <RangeCalendar
          aria-label="Invalid range"
          defaultValue={value}
          isInvalid
          errorMessage={
            language === 'dv'
              ? dhivehiDateText.pickDateWithinAllowedWindow
              : 'Pick a date within the allowed window.'
          }
        />
        <RangeCalendar
          aria-label="Disabled range"
          defaultValue={value}
          isDisabled
          showTodayButton
        />
        <RangeCalendar
          aria-label="Read only range"
          defaultValue={value}
          isReadOnly
          showTodayButton
        />
        <RangeCalendar
          aria-label="Single day range"
          defaultValue={{ start: value.start, end: value.start }}
        />
        <RangeCalendar
          aria-label="Constrained range"
          defaultFocusedValue={now}
          minValue={now}
          maxValue={now.add({ months: 2 })}
          isDateUnavailable={appointmentUnavailable}
          showTodayButton
        />
        <RangeCalendar
          aria-label="Non contiguous range"
          defaultFocusedValue={now}
          isDateUnavailable={appointmentUnavailable}
          allowsNonContiguousRanges
        />
      </div>
    );
  },
};

export const TodayOutsideAllowedWindow: Story = {
  render: () => (
    <Calendar
      aria-label="Today unavailable"
      defaultFocusedValue={now}
      minValue={parseDate('2026-10-01')}
      maxValue={parseDate('2026-10-31')}
      isDateUnavailable={() => true}
      showTodayButton
    />
  ),
};

// This example follows the current local date so the combined Today states are visible.
export const TodayIndicatorStates: Story = {
  render: () => {
    const current = today(getLocalTimeZone());
    return (
      <div className="flex max-w-full flex-wrap items-start justify-center gap-6">
        <div className="min-w-0 max-w-full space-y-3">
          <p className="type-caption-regular text-base-muted">Today, unselected</p>
          <Calendar aria-label="Today unselected" defaultFocusedValue={current} />
        </div>
        <div className="min-w-0 max-w-full space-y-3">
          <p className="type-caption-regular text-base-muted">Today, selected</p>
          <Calendar aria-label="Today selected" defaultValue={current} />
        </div>
        <div className="min-w-0 max-w-full space-y-3">
          <p className="type-caption-regular text-base-muted">Today, selected in a range</p>
          <RangeCalendar
            aria-label="Today selected in range"
            defaultValue={{ start: current, end: current }}
          />
        </div>
      </div>
    );
  },
};
