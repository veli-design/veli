import type { Meta, StoryObj } from '@storybook/react';
import {
  type DateValue,
  getLocalTimeZone,
  isWeekend,
  parseDate,
  parseDateTime,
  today,
} from '@internationalized/date';
import { DatePicker } from '@tradenetcorp/veli-ui/date-picker';

const now = today(getLocalTimeZone());
const disabledRanges = [
  [now.add({ days: 2 }), now.add({ days: 4 })],
  [now.add({ days: 9 }), now.add({ days: 10 })],
  [now.add({ days: 16 }), now.add({ days: 18 })],
] as const;

const appointmentUnavailable = (date: DateValue) =>
  isWeekend(date, 'en-US') ||
  disabledRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    label: 'Appointment date',
    description: 'Choose a date from the field or the calendar popover.',
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <DatePicker {...args} />
    </div>
  ),
};

export const DateAndTime: Story = {
  render: () => (
    <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
      <DatePicker label="Date only" defaultValue={parseDate('2026-04-18')} />
      <DatePicker
        label="Date and minute"
        granularity="minute"
        defaultValue={parseDateTime('2026-04-18T14:30:00')}
      />
      <DatePicker
        label="24 hour format"
        granularity="minute"
        hourCycle={24}
        defaultValue={parseDateTime('2026-04-18T21:10:00')}
      />
    </div>
  ),
};

export const ConstraintsAndValidation: Story = {
  render: () => (
    <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
      <DatePicker label="Required" isRequired minValue={now} description="Future dates only." />
      <DatePicker
        label="Min and max"
        minValue={now}
        maxValue={now.add({ months: 1 })}
        description="Selectable for the next month."
      />
      <DatePicker
        label="Unavailable dates"
        minValue={now}
        maxValue={now.add({ months: 1 })}
        isDateUnavailable={appointmentUnavailable}
        description="Weekends and blackout dates cannot be chosen."
      />
      <DatePicker
        label="Invalid"
        isInvalid
        description="This helper text is hidden while invalid."
        errorMessage="Pick an appointment date within the allowed window."
        defaultValue={parseDate('2026-04-01')}
      />
      <DatePicker
        label="Invalid without message"
        isInvalid
        description="This helper text is hidden while invalid."
        defaultValue={parseDate('2026-04-01')}
      />
    </div>
  ),
};

export const DisabledAndReadOnly: Story = {
  render: () => (
    <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
      <DatePicker label="Disabled" isDisabled defaultValue={parseDate('2026-04-18')} />
      <DatePicker label="Read only" isReadOnly defaultValue={parseDate('2026-04-18')} />
    </div>
  ),
};
