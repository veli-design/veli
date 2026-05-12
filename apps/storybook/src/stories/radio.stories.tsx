import type { Meta, StoryObj } from '@storybook/react';
import { Radio, RadioGroup } from '@tradenetcorp/coral-ui/radio';

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
      options: ['sm', 'md'],
    },
    isDisabled: {
      control: 'boolean',
    },
  },
  args: {
    size: 'sm',
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
      <RadioGroup aria-label="Small radio size" defaultValue="sm-on">
        <Radio value="sm-off" size="sm">
          Small Off
        </Radio>
        <Radio value="sm-on" size="sm">
          Small On
        </Radio>
      </RadioGroup>

      <RadioGroup aria-label="Medium radio size" defaultValue="md-on">
        <Radio value="md-off" size="md">
          Medium Off
        </Radio>
        <Radio value="md-on" size="md">
          Medium On
        </Radio>
      </RadioGroup>
    </div>
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

      <div className="text-[12px] font-bold uppercase text-text-default-muted">SM</div>
      <RadioGroup aria-label="Small off state">
        <Radio value="sm-off" size="sm" />
      </RadioGroup>
      <RadioGroup aria-label="Small on state" defaultValue="sm-on">
        <Radio value="sm-on" size="sm" />
      </RadioGroup>

      <div className="text-[12px] font-bold uppercase text-text-default-muted">SM Disabled</div>
      <RadioGroup aria-label="Small disabled off state">
        <Radio value="sm-off-disabled" size="sm" isDisabled />
      </RadioGroup>
      <RadioGroup aria-label="Small disabled on state" defaultValue="sm-on-disabled">
        <Radio value="sm-on-disabled" size="sm" isDisabled />
      </RadioGroup>

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
    </div>
  ),
};
