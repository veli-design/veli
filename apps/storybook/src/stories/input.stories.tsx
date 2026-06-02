import type { Meta, StoryObj } from '@storybook/react';
import { Input } from '@tradenetcorp/veli-ui/input';
import {
  ArrowRight,
  CalendarBlank,
  CaretDown,
  Info,
  MagnifyingGlass,
  WarningCircle,
} from 'phosphor-react';

const meta = {
  title: 'Components/Input',
  component: Input,
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
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'url', 'tel'],
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
    showRequiredIndicator: {
      control: 'boolean',
    },
  },
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    description: 'Helper text',
    type: 'text',
    showRequiredIndicator: true,
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <Input {...args} />
    </div>
  ),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => (
    <div className="w-[320px]">
      <Input {...args} />
    </div>
  ),
};

/**
 * Showcases all size variants of the Input component.
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
          <Input size="sm" label="Label" placeholder="Placeholder" description="Helper text" />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <Input size="md" label="Label" placeholder="Placeholder" description="Helper text" />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <Input size="lg" label="Label" placeholder="Placeholder" description="Helper text" />
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
          <Input
            size="sm"
            variant="outline"
            label="Label"
            placeholder="Placeholder"
            description="Helper text"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <Input
            size="md"
            variant="outline"
            label="Label"
            placeholder="Placeholder"
            description="Helper text"
          />
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <Input
            size="lg"
            variant="outline"
            label="Label"
            placeholder="Placeholder"
            description="Helper text"
          />
        </div>
      </div>
    </div>
  ),
};

export const RootClassName: Story = {
  render: () => (
    <div className="grid w-[680px] grid-cols-2 gap-[24px]">
      <Input
        className="w-full"
        label="Grid column"
        placeholder="Uses the root width"
        description="Helper text"
      />
      <Input
        className="max-w-[240px]"
        label="Constrained"
        placeholder="Max width"
        description="Helper text"
      />
    </div>
  ),
};

export const FigmaExploration: Story = {
  render: () => (
    <div className="w-[320px]">
      <Input
        label="Label"
        labelSupplementary="(Optional)"
        isRequired
        labelIcon={<Info size={12} />}
        action="Action"
        placeholder="Placeholder"
        description="Helper text"
        startAddon={<MagnifyingGlass size={16} />}
        startContent={<CalendarBlank size={16} />}
        endContent={
          <span className="flex items-center gap-[4px]">
            <WarningCircle size={16} />
            <CaretDown size={16} />
          </span>
        }
        endAddon={<ArrowRight size={16} />}
      />
    </div>
  ),
};

export const ValidationStates: Story = {
  render: () => (
    <div className="grid w-[680px] grid-cols-2 gap-[24px]">
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Default
        </span>
        <Input
          label="Default"
          placeholder="Enter value"
          description="Helper text"
          startContent={<MagnifyingGlass size={16} />}
        />
        <Input
          label="Invalid"
          placeholder="Enter value"
          isInvalid
          errorMessage="This field needs attention."
        />
        <Input
          label="Invalid without message"
          placeholder="Enter value"
          isInvalid
          description="This helper text is hidden while invalid."
        />
        <Input
          label="Disabled"
          placeholder="Disabled value"
          isDisabled
          startAddon={<MagnifyingGlass size={16} />}
          endAddon={<ArrowRight size={16} />}
        />
        <Input
          label="Read only"
          defaultValue="Locked value"
          isReadOnly
          endContent={<CaretDown size={16} />}
        />
      </div>
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Outline
        </span>
        <Input
          variant="outline"
          label="Default"
          placeholder="Enter value"
          description="Helper text"
          startContent={<MagnifyingGlass size={16} />}
        />
        <Input
          variant="outline"
          label="Invalid"
          placeholder="Enter value"
          isInvalid
          errorMessage="This field needs attention."
        />
        <Input
          variant="outline"
          label="Invalid without message"
          placeholder="Enter value"
          isInvalid
          description="This helper text is hidden while invalid."
        />
        <Input
          variant="outline"
          label="Disabled"
          placeholder="Disabled value"
          isDisabled
          startAddon={<MagnifyingGlass size={16} />}
          endAddon={<ArrowRight size={16} />}
        />
        <Input
          variant="outline"
          label="Read only"
          defaultValue="Locked value"
          isReadOnly
          endContent={<CaretDown size={16} />}
        />
      </div>
    </div>
  ),
};
