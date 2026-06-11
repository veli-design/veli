import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import {
  type DateValue,
  getLocalTimeZone,
  isWeekend,
  parseDate,
  today,
} from '@internationalized/date';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Calendar, RangeCalendar } from '@tradenetcorp/veli-ui/calendar';

const now = today(getLocalTimeZone());
const disabledRanges = [
  [now.add({ days: 4 }), now.add({ days: 7 })],
  [now.add({ days: 12 }), now.add({ days: 14 })],
  [now.add({ days: 24 }), now.add({ days: 27 })],
] as const;

const appointmentUnavailable = (date: DateValue) =>
  isWeekend(date, 'en-GB') ||
  disabledRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

const meta = {
  title: 'Components/Calendar',
  component: Calendar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isDisabled: {
      control: 'boolean',
    },
    isReadOnly: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
    weekdayStyle: {
      control: 'select',
      options: ['narrow', 'short', 'long'],
    },
    showTodayButton: {
      control: 'boolean',
    },
    todayButtonLabel: {
      control: 'text',
    },
  },
  args: {
    'aria-label': 'Appointment calendar',
    weekdayStyle: 'short',
  },
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => <Calendar {...args} />,
};

export const WithSelectedDate: Story = {
  render: (args) => <Calendar {...args} defaultValue={parseDate('2026-04-18')} />,
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
    const [value, setValue] = useState(parseDate('2026-04-01'));
    const [rangeValue, setRangeValue] = useState({
      start: parseDate('2026-04-10'),
      end: parseDate('2026-04-18'),
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
          <div className="rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised px-3 py-2 text-sm text-text-default-default">
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
          <div className="rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised px-3 py-2 text-sm text-text-default-default">
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
        start: parseDate('2026-04-10'),
        end: parseDate('2026-04-18'),
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
      start: parseDate('2026-04-10'),
      end: parseDate('2026-04-18'),
    });

    return (
      <div className="space-y-3">
        <RangeCalendar aria-label="Controlled trip dates" value={value} onChange={setValue} />
        <div className="rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised px-3 py-2 text-sm text-text-default-default">
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
    const [value, setValue] = useState(parseDate('2026-04-30'));
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
            variant="secondary"
            style="transparent"
            onPress={() => {
              const nextValue = parseDate('2026-04-30');
              setValue(nextValue);
              setFocusedValue(nextValue);
            }}
          >
            Reset to April 30
          </Button>
          <Button
            size="sm"
            variant="secondary"
            style="transparent"
            onPress={() => {
              const nextValue = today(getLocalTimeZone());
              setValue(nextValue);
              setFocusedValue(nextValue);
            }}
          >
            Set to Today
          </Button>
        </div>
        <div className="rounded-xl border border-border-default-subtle bg-bg-surface-overlay-raised px-3 py-2 text-sm text-text-default-default">
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
        <p className="max-w-md text-xs text-text-default-muted">Greyed out: Disabled date</p>
        <p className="max-w-md text-xs text-text-default-muted">Struck through: Unavailable date</p>
      </div>
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Calendar
        aria-label="Invalid calendar"
        isInvalid
        defaultValue={parseDate('2026-04-01')}
        errorMessage="Pick a date within the allowed window."
      />
      <Calendar
        aria-label="Invalid calendar without message"
        isInvalid
        defaultValue={parseDate('2026-04-01')}
      />
    </div>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <Calendar aria-label="Disabled calendar" isDisabled defaultValue={parseDate('2026-04-18')} />
      <Calendar aria-label="Read only calendar" isReadOnly defaultValue={parseDate('2026-04-18')} />
    </div>
  ),
};
