import type { Meta, StoryObj } from '@storybook/react';
import { Info, MagnifyingGlass, WarningCircle } from 'phosphor-react';
import { Select, SelectItem, SelectSection } from '@tradenetcorp/veli-ui/select';

const meta = {
  title: 'Components/Select',
  component: Select,
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

const sizeStoryOptions = (
  <>
    <SelectItem id="malaysia">Malaysia</SelectItem>
    <SelectItem id="singapore">Singapore</SelectItem>
    <SelectItem id="thailand">Thailand</SelectItem>
  </>
);

export const Default: Story = {
  render: (args) => (
    <div className="w-[320px]">
      <Select {...args}>{sizeStoryOptions}</Select>
    </div>
  ),
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => (
    <div className="w-[320px]">
      <Select {...args}>{sizeStoryOptions}</Select>
    </div>
  ),
};

/**
 * Showcases all size variants of the Select component.
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
          <Select size="sm" label="Label" placeholder="Choose an option" description="Helper text">
            {sizeStoryOptions}
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <Select size="md" label="Label" placeholder="Choose an option" description="Helper text">
            {sizeStoryOptions}
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <Select size="lg" label="Label" placeholder="Choose an option" description="Helper text">
            {sizeStoryOptions}
          </Select>
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
          <Select
            size="sm"
            variant="outline"
            label="Label"
            placeholder="Choose an option"
            description="Helper text"
          >
            {sizeStoryOptions}
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <Select
            size="md"
            variant="outline"
            label="Label"
            placeholder="Choose an option"
            description="Helper text"
          >
            {sizeStoryOptions}
          </Select>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <Select
            size="lg"
            variant="outline"
            label="Label"
            placeholder="Choose an option"
            description="Helper text"
          >
            {sizeStoryOptions}
          </Select>
        </div>
      </div>
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
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Default
        </span>
        <Select label="Default" placeholder="Choose a value" description="Helper text">
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
        <Select label="Selected" defaultSelectedKey="b" description="Preselected value">
          <SelectItem id="a">Option A</SelectItem>
          <SelectItem id="b">Option B</SelectItem>
        </Select>
      </div>
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Outline
        </span>
        <Select
          variant="outline"
          label="Default"
          placeholder="Choose a value"
          description="Helper text"
        >
          <SelectItem id="a">Option A</SelectItem>
          <SelectItem id="b">Option B</SelectItem>
        </Select>
        <Select
          variant="outline"
          label="Invalid"
          placeholder="Choose a value"
          isInvalid
          errorMessage="This field needs attention."
        >
          <SelectItem id="a">Option A</SelectItem>
          <SelectItem id="b">Option B</SelectItem>
        </Select>
        <Select
          variant="outline"
          label="Invalid without message"
          placeholder="Choose a value"
          isInvalid
          description="This helper text is hidden while invalid."
        >
          <SelectItem id="a">Option A</SelectItem>
          <SelectItem id="b">Option B</SelectItem>
        </Select>
        <Select variant="outline" label="Disabled" placeholder="Unavailable" isDisabled>
          <SelectItem id="a">Option A</SelectItem>
          <SelectItem id="b">Option B</SelectItem>
        </Select>
        <Select
          variant="outline"
          label="Selected"
          defaultSelectedKey="b"
          description="Preselected value"
        >
          <SelectItem id="a">Option A</SelectItem>
          <SelectItem id="b">Option B</SelectItem>
        </Select>
      </div>
    </div>
  ),
};
