import type { Meta, StoryObj } from '@storybook/react';
import { Info, MagnifyingGlass, WarningCircle } from 'phosphor-react';
import { Select, SelectItem, SelectSection } from '@tradenetcorp/coral-ui/select';

const meta = {
  title: 'Components/Select',
  component: Select,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    isDisabled: {
      control: 'boolean',
    },
    isRequired: {
      control: 'boolean',
    },
    showRequiredIndicator: {
      control: 'boolean',
    },
  },
  args: {
    label: 'Label',
    placeholder: 'Choose an option',
    description: 'Helper text',
    showRequiredIndicator: true,
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <Select {...args}>
        <SelectItem id="malaysia">Malaysia</SelectItem>
        <SelectItem id="singapore">Singapore</SelectItem>
        <SelectItem id="thailand">Thailand</SelectItem>
      </Select>
    </div>
  ),
};

export const RootClassName: Story = {
  render: () => (
    <div className="grid w-[680px] grid-cols-2 gap-[24px]">
      <Select className="w-full" label="Grid column" placeholder="Choose an option">
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
      <Select className="max-w-[240px]" label="Constrained" placeholder="Choose an option">
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
    </div>
  ),
};

export const FigmaExploration: Story = {
  render: () => (
    <div className="w-[320px]">
      <Select
        label="Label"
        labelSupplementary="(Optional)"
        isRequired
        labelIcon={<Info size={12} />}
        action="Action"
        placeholder="Choose an option"
        description="Helper text"
        startContent={<MagnifyingGlass size={16} />}
        endContent={<WarningCircle size={16} />}
      >
        <SelectSection title="Popular">
          <SelectItem id="cash" description="Immediate settlement">
            <span className="inline-flex min-w-0 items-center gap-[6px]">
              <span aria-hidden="true" className="type-caption-12-medium text-text-default-subtle">
                C
              </span>
              <span>Cash</span>
            </span>
          </SelectItem>
          <SelectItem id="margin" description="Includes financing">
            Margin
          </SelectItem>
        </SelectSection>
        <SelectSection title="Other">
          <SelectItem id="isa">Investment account</SelectItem>
          <SelectItem id="trust">Trust account</SelectItem>
        </SelectSection>
      </Select>
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="grid w-[680px] grid-cols-2 gap-[24px]">
      <Select
        label="Default"
        placeholder="Choose a value"
        description="Helper text"
      >
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
      <Select
        label="Invalid"
        placeholder="Choose a value"
        isInvalid
        errorMessage="This field needs attention."
      >
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
      <Select
        label="Invalid without message"
        placeholder="Choose a value"
        isInvalid
        description="This helper text is hidden while invalid."
      >
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
      <Select label="Disabled" placeholder="Unavailable" isDisabled>
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
      <Select
        label="Selected"
        defaultSelectedKey="b"
        description="Preselected value"
      >
        <SelectItem id="a">Option A</SelectItem>
        <SelectItem id="b">Option B</SelectItem>
      </Select>
    </div>
  ),
};
