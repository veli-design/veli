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
  isWeekend(date, 'en-GB') ||
  disabledRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isDisabled: {
      control: 'boolean',
    },
    isReadOnly: {
      control: 'boolean',
    },
    isRequired: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
    showRequiredIndicator: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
  },
  args: {
    label: 'Appointment date',
    description: 'Choose a date from the calendar popover.',
    placeholder: 'Select date',
    variant: 'default',
    size: 'md',
    showRequiredIndicator: true,
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

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => (
    <div className="w-[320px]">
      <DatePicker {...args} />
    </div>
  ),
};

export const PlaceholderAndSelected: Story = {
  render: () => (
    <div className="grid w-[320px] gap-4">
      <DatePicker label="No date selected" placeholder="Select date" />
      <DatePicker label="Date selected" defaultValue={parseDate('2025-04-05')} />
    </div>
  ),
};

/**
 * Showcases all size and variant combinations of the DatePicker component.
 */
export const Sizes: Story = {
  render: () => (
    <div className="grid w-[680px] grid-cols-2 gap-[24px]">
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Default
        </span>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Small (sm)
          </span>
          <DatePicker
            size="sm"
            label="Appointment date"
            defaultValue={parseDate('2026-04-18')}
            description="Helper text"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <DatePicker
            size="md"
            label="Appointment date"
            defaultValue={parseDate('2026-04-18')}
            description="Helper text"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <DatePicker
            size="lg"
            label="Appointment date"
            defaultValue={parseDate('2026-04-18')}
            description="Helper text"
          />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Outline
        </span>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Small (sm)
          </span>
          <DatePicker
            size="sm"
            variant="outline"
            label="Appointment date"
            defaultValue={parseDate('2026-04-18')}
            description="Helper text"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <DatePicker
            size="md"
            variant="outline"
            label="Appointment date"
            defaultValue={parseDate('2026-04-18')}
            description="Helper text"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <DatePicker
            size="lg"
            variant="outline"
            label="Appointment date"
            defaultValue={parseDate('2026-04-18')}
            description="Helper text"
          />
        </div>
      </div>
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
