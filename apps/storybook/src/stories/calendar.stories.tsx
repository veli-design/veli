import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  type DateValue,
  getLocalTimeZone,
  isWeekend,
  parseDate,
  today,
} from "@internationalized/date";
import { Button } from "@tradenetcorp/coral-ui/button";
import { Calendar } from "@tradenetcorp/coral-ui/calendar";

const now = today(getLocalTimeZone());
const disabledRanges = [
  [now.add({ days: 4 }), now.add({ days: 7 })],
  [now.add({ days: 12 }), now.add({ days: 14 })],
  [now.add({ days: 24 }), now.add({ days: 27 })],
] as const;

const meta = {
  title: "Components/Calendar",
  component: Calendar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta<typeof Calendar>;

export default meta;
type Story = StoryObj<typeof meta>;

const appointmentUnavailable = (date: DateValue) =>
  isWeekend(date, "en-US") ||
  disabledRanges.some(
    ([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0,
  );

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Baseline standalone calendar. Use this when you need an embedded date selector with no selection rules beyond the default React Aria behavior.",
      },
    },
  },
  render: () => <Calendar aria-label="Appointment calendar" />,
};

export const ControlledByExternalState: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Calendar value is owned by React state instead of internal component state. The external controls below can reset or change the selection, which makes the controlled behavior visible.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState(parseDate("2026-04-30"));
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
              const nextValue = parseDate("2026-04-30");
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
          Selected date:{" "}
          <span className="font-semibold">{value.toString()}</span>
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
          "Availability-driven calendar. Use this for booking, scheduling, or service windows where dates outside a valid range, or specific blackout dates, must be blocked.",
      },
    },
  },
  render: () => (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Calendar
          aria-label="Booking availability calendar"
          minValue={now}
          maxValue={now.add({ months: 2 })}
          isDateUnavailable={appointmentUnavailable}
        />
      </div>
      <div>
        <p className="max-w-md text-xs text-slate-500">
          Greyed out: Disabled date
        </p>
        <p className="max-w-md text-xs text-slate-500">
          Struck through: Unavailable date
        </p>
      </div>
    </div>
  ),
};
