import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@tradenetcorp/coral-ui/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    shape: {
      control: 'select',
      options: ['square', 'round'],
    },
    isIndeterminate: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
  },
  args: {
    children: 'Checkbox label',
    shape: 'square',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Shapes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-8">
        <Checkbox shape="square">Square Off</Checkbox>
        <Checkbox shape="square" defaultSelected>
          Square On
        </Checkbox>
        <Checkbox shape="square" isIndeterminate>
          Square Indeterminate
        </Checkbox>
      </div>
      <div className="flex items-center gap-8">
        <Checkbox shape="round">Round Off</Checkbox>
        <Checkbox shape="round" defaultSelected>
          Round On
        </Checkbox>
        <Checkbox shape="round" isIndeterminate>
          Round Indeterminate
        </Checkbox>
      </div>
    </div>
  ),
};

export const StatesAudit: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-[20px] items-start">
      <div />
      <div className="text-[12px] font-bold uppercase text-gray-400">Off</div>
      <div className="text-[12px] font-bold uppercase text-gray-400">On</div>
      <div className="text-[12px] font-bold uppercase text-gray-400">Indeterminate</div>

      <div className="text-[12px] font-bold uppercase text-gray-400">Square</div>
      <Checkbox shape="square" />
      <Checkbox shape="square" defaultSelected />
      <Checkbox shape="square" isIndeterminate />

      <div className="text-[12px] font-bold uppercase text-gray-400">Square Disabled</div>
      <Checkbox shape="square" isDisabled />
      <Checkbox shape="square" defaultSelected isDisabled />
      <Checkbox shape="square" isIndeterminate isDisabled />

      <div className="text-[12px] font-bold uppercase text-gray-400">Round</div>
      <Checkbox shape="round" />
      <Checkbox shape="round" defaultSelected />
      <Checkbox shape="round" isIndeterminate />

      <div className="text-[12px] font-bold uppercase text-gray-400">Round Disabled</div>
      <Checkbox shape="round" isDisabled />
      <Checkbox shape="round" defaultSelected isDisabled />
      <Checkbox shape="round" isIndeterminate isDisabled />
    </div>
  ),
};
