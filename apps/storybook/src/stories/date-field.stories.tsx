import type { Meta, StoryObj } from '@storybook/react';
import { parseDate } from '@internationalized/date';
import { DateField } from '@tradenetcorp/coral-ui/date-field';

const meta = {
  title: 'Components/DateField',
  component: DateField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    label: 'Appointment date',
    description: 'Choose a preferred date.',
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <DateField {...args} />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
      <DateField
        label="Required"
        isRequired
        description="This field must be completed."
      />
      <DateField
        label="Invalid"
        isInvalid
        errorMessage="Enter a valid service date."
        defaultValue={parseDate('2026-04-01')}
      />
      <DateField
        label="Invalid without message"
        isInvalid
        description="This helper text is hidden while invalid."
        defaultValue={parseDate('2026-04-01')}
      />
      <DateField
        label="Disabled"
        defaultValue={parseDate('2026-04-18')}
        isDisabled
      />
      <DateField
        label="Read only"
        defaultValue={parseDate('2026-04-18')}
        isReadOnly
      />
    </div>
  ),
};
