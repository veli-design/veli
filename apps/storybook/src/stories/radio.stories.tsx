import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';

const meta: Meta<typeof Radio> = {
  title: 'Components/Radio',
  component: Radio,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['md', 'lg'],
    },
    isDisabled: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
  },
  args: {
    size: 'md',
    isDisabled: false,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <RadioGroup aria-label="Default radio group" defaultValue="option-1">
      <Radio {...args} value="option-1">
        Option 1
      </Radio>
      <Radio {...args} value="option-2">
        Option 2
      </Radio>
      <Radio {...args} value="option-3">
        Option 3
      </Radio>
    </RadioGroup>
  ),
};

export const Sizes: Story = {
  parameters: {
    controls: {
      exclude: ['size', 'isDisabled'],
    },
  },
  render: () => (
    <div className="flex flex-col gap-[20px]">
      <RadioGroup aria-label="Medium radio size" defaultValue="md-on">
        <Radio value="md-off" size="md">
          Medium Off
        </Radio>
        <Radio value="md-on" size="md">
          Medium On
        </Radio>
      </RadioGroup>

      <RadioGroup aria-label="Large radio size" defaultValue="lg-on">
        <Radio value="lg-off" size="lg">
          Large Off
        </Radio>
        <Radio value="lg-on" size="lg">
          Large On
        </Radio>
      </RadioGroup>
    </div>
  ),
};

export const DescriptionAndError: Story = {
  render: () => (
    <RadioGroup
      aria-label="Radio description and error examples"
      className="gap-8"
      defaultValue="selected"
    >
      <Radio value="description" description="Description text">
        Label text
      </Radio>
      <Radio value="error" isInvalid errorMessage="Error text">
        Label text
      </Radio>
      <Radio value="selected" isInvalid description="Description text" errorMessage="Error text">
        Label text
      </Radio>
      <Radio
        value="lg"
        size="lg"
        isInvalid
        description="Description text"
        errorMessage="Error text"
      >
        Label text
      </Radio>
    </RadioGroup>
  ),
};

export const Invalid: Story = {
  render: (args) => (
    <RadioGroup aria-label="Invalid radio example" defaultValue="terms">
      <Radio {...args} value="terms">
        Accept terms and conditions
      </Radio>
    </RadioGroup>
  ),
  args: {
    isInvalid: true,
    errorMessage: 'You must accept the terms to continue',
  },
};

export const RootClassName: Story = {
  render: () => (
    <RadioGroup
      aria-label="Radio layout className example"
      className="grid grid-cols-3 gap-[16px]"
      defaultValue="a"
    >
      <Radio className="justify-center" value="a">
        Option A
      </Radio>
      <Radio className="justify-center" value="b">
        Option B
      </Radio>
      <Radio className="justify-center" value="c">
        Option C
      </Radio>
    </RadioGroup>
  ),
};

export const StatesAudit: Story = {
  parameters: {
    controls: {
      exclude: ['size', 'isDisabled'],
    },
  },
  render: () => (
    <div className="grid grid-cols-3 gap-[20px] items-start">
      <div />
      <div className="text-[12px] font-bold uppercase text-text-default-muted">Off</div>
      <div className="text-[12px] font-bold uppercase text-text-default-muted">On</div>

      <div className="text-[12px] font-bold uppercase text-text-default-muted">MD</div>
      <RadioGroup aria-label="Medium off state">
        <Radio value="md-off" size="md" />
      </RadioGroup>
      <RadioGroup aria-label="Medium on state" defaultValue="md-on">
        <Radio value="md-on" size="md" />
      </RadioGroup>

      <div className="text-[12px] font-bold uppercase text-text-default-muted">MD Disabled</div>
      <RadioGroup aria-label="Medium disabled off state">
        <Radio value="md-off-disabled" size="md" isDisabled />
      </RadioGroup>
      <RadioGroup aria-label="Medium disabled on state" defaultValue="md-on-disabled">
        <Radio value="md-on-disabled" size="md" isDisabled />
      </RadioGroup>

      <div className="text-[12px] font-bold uppercase text-text-default-muted">LG</div>
      <RadioGroup aria-label="Large off state">
        <Radio value="lg-off" size="lg" />
      </RadioGroup>
      <RadioGroup aria-label="Large on state" defaultValue="lg-on">
        <Radio value="lg-on" size="lg" />
      </RadioGroup>

      <div className="text-[12px] font-bold uppercase text-text-default-muted">LG Disabled</div>
      <RadioGroup aria-label="Large disabled off state">
        <Radio value="lg-off-disabled" size="lg" isDisabled />
      </RadioGroup>
      <RadioGroup aria-label="Large disabled on state" defaultValue="lg-on-disabled">
        <Radio value="lg-on-disabled" size="lg" isDisabled />
      </RadioGroup>
    </div>
  ),
};
