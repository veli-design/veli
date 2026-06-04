import type { Meta, StoryObj } from '@storybook/react';
import { Checkbox } from '@tradenetcorp/veli-ui/checkbox';

const meta: Meta<typeof Checkbox> = {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['md', 'lg'],
    },
    isIndeterminate: {
      control: 'boolean',
    },
    isDisabled: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
  },
  args: {
    children: 'Checkbox label',
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-8">
        <Checkbox>Off</Checkbox>
        <Checkbox defaultSelected>On</Checkbox>
        <Checkbox isIndeterminate>Indeterminate</Checkbox>
      </div>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Medium (md)
        </span>
        <div className="flex items-center gap-8">
          <Checkbox size="md">Off</Checkbox>
          <Checkbox size="md" defaultSelected>
            On
          </Checkbox>
          <Checkbox size="md" isIndeterminate>
            Indeterminate
          </Checkbox>
        </div>
      </div>
      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Large (lg)
        </span>
        <div className="flex items-center gap-8">
          <Checkbox size="lg">Off</Checkbox>
          <Checkbox size="lg" defaultSelected>
            On
          </Checkbox>
          <Checkbox size="lg" isIndeterminate>
            Indeterminate
          </Checkbox>
        </div>
      </div>
    </div>
  ),
};

export const DescriptionAndError: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <Checkbox description="Description text">Label text</Checkbox>
      <Checkbox isInvalid errorMessage="Error text">
        Label text
      </Checkbox>
      <Checkbox isInvalid description="Description text" errorMessage="Error text">
        Label text
      </Checkbox>
      <Checkbox size="lg" isInvalid description="Description text" errorMessage="Error text">
        Label text
      </Checkbox>
    </div>
  ),
};

export const Invalid: Story = {
  args: {
    children: 'Accept terms and conditions',
    isInvalid: true,
    errorMessage: 'You must accept the terms to continue',
  },
};

export const RootClassName: Story = {
  render: () => (
    <div className="grid gap-[12px]">
      <Checkbox className="ml-[24px]">Indented item</Checkbox>
      <Checkbox className="justify-self-start">Grid item</Checkbox>
    </div>
  ),
};

export const StatesAudit: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-[20px] items-start">
      <div />
      <div className="text-[12px] font-bold uppercase text-text-default-muted">Off</div>
      <div className="text-[12px] font-bold uppercase text-text-default-muted">On</div>
      <div className="text-[12px] font-bold uppercase text-text-default-muted">Indeterminate</div>

      <div className="text-[12px] font-bold uppercase text-text-default-muted">Default</div>
      <Checkbox />
      <Checkbox defaultSelected />
      <Checkbox isIndeterminate />

      <div className="text-[12px] font-bold uppercase text-text-default-muted">Disabled</div>
      <Checkbox isDisabled />
      <Checkbox defaultSelected isDisabled />
      <Checkbox isIndeterminate isDisabled />
    </div>
  ),
};
