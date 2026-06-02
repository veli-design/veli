import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { ComboBox, ComboBoxItem, ComboBoxSection } from '@tradenetcorp/veli-ui/combobox';
import { CalendarBlank, Info, MagnifyingGlass, WarningCircle } from 'phosphor-react';

type Option = {
  id: string;
  label: string;
};

type ComboBoxPlaygroundArgs = {
  label: string;
  placeholder: string;
  description: string;
  allowsCustomValue: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  items: Option[];
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline';
};

const DEFAULT_OPTIONS: Option[] = [
  { id: 'male', label: "Male'" },
  { id: 'hulhumale', label: "Hulhumale'" },
  { id: 'addu', label: 'Addu City' },
  { id: 'fuvahmulah', label: 'Fuvahmulah City' },
  { id: 'kulhudhuffushi', label: 'Kulhudhuffushi City' },
];

const meta = {
  title: 'Components/ComboBox',
  component: ComboBox,
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
  },
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

const renderComboBoxItems = (item: Option) => <ComboBoxItem>{item.label}</ComboBoxItem>;

export const Default: Story = {
  args: {
    label: 'Location',
    placeholder: 'Search location',
    description: 'Start typing to narrow the list.',
    allowsCustomValue: false,
    isDisabled: false,
    isRequired: false,
    items: DEFAULT_OPTIONS,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    label: { control: 'text' },
    placeholder: { control: 'text' },
    description: { control: 'text' },
    allowsCustomValue: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
    isRequired: { control: 'boolean' },
    items: { control: 'object' },
  },
  render: (rawArgs) => {
    const args = rawArgs as ComboBoxPlaygroundArgs;
    const safeItems = useMemo(() => {
      if (!Array.isArray(args.items) || args.items.length === 0) {
        return DEFAULT_OPTIONS;
      }
      return args.items;
    }, [args.items]);

    const [inputValue, setInputValue] = useState('');
    const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);

    return (
      <div className="flex w-[320px] flex-col gap-3">
        <ComboBox
          variant={args.variant}
          size={args.size}
          label={args.label}
          placeholder={args.placeholder}
          description={args.description}
          allowsCustomValue={args.allowsCustomValue}
          isDisabled={args.isDisabled}
          isRequired={args.isRequired}
          defaultItems={safeItems}
          inputValue={inputValue}
          onInputChange={setInputValue}
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
          startAddon={<MagnifyingGlass size={16} />}
        >
          {renderComboBoxItems}
        </ComboBox>
        <p className="text-xs text-text-default-muted">
          Selected key:{' '}
          <span className="font-medium">{selectedKey ? String(selectedKey) : 'None'}</span>
        </p>
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    label: 'Location',
    placeholder: 'Search location',
    description: 'Start typing to narrow the list.',
    allowsCustomValue: false,
    isDisabled: false,
    isRequired: false,
    items: DEFAULT_OPTIONS,
    variant: 'outline',
  },
  render: (rawArgs) => {
    const args = rawArgs as ComboBoxPlaygroundArgs;
    const safeItems = useMemo(() => {
      if (!Array.isArray(args.items) || args.items.length === 0) {
        return DEFAULT_OPTIONS;
      }
      return args.items;
    }, [args.items]);

    const [inputValue, setInputValue] = useState('');
    const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);

    return (
      <div className="flex w-[320px] flex-col gap-3">
        <ComboBox
          variant={args.variant}
          size={args.size}
          label={args.label}
          placeholder={args.placeholder}
          description={args.description}
          allowsCustomValue={args.allowsCustomValue}
          isDisabled={args.isDisabled}
          isRequired={args.isRequired}
          defaultItems={safeItems}
          inputValue={inputValue}
          onInputChange={setInputValue}
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
          startAddon={<MagnifyingGlass size={16} />}
        >
          {renderComboBoxItems}
        </ComboBox>
      </div>
    );
  },
};

/**
 * Showcases all size variants of the ComboBox component.
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
          <ComboBox
            size="sm"
            label="Label"
            placeholder="Search location"
            description="Helper text"
            defaultItems={DEFAULT_OPTIONS}
          >
            {renderComboBoxItems}
          </ComboBox>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <ComboBox
            size="md"
            label="Label"
            placeholder="Search location"
            description="Helper text"
            defaultItems={DEFAULT_OPTIONS}
          >
            {renderComboBoxItems}
          </ComboBox>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <ComboBox
            size="lg"
            label="Label"
            placeholder="Search location"
            description="Helper text"
            defaultItems={DEFAULT_OPTIONS}
          >
            {renderComboBoxItems}
          </ComboBox>
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
          <ComboBox
            size="sm"
            variant="outline"
            label="Label"
            placeholder="Search location"
            description="Helper text"
            defaultItems={DEFAULT_OPTIONS}
          >
            {renderComboBoxItems}
          </ComboBox>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Medium (md)
          </span>
          <ComboBox
            size="md"
            variant="outline"
            label="Label"
            placeholder="Search location"
            description="Helper text"
            defaultItems={DEFAULT_OPTIONS}
          >
            {renderComboBoxItems}
          </ComboBox>
        </div>
        <div className="flex flex-col gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Large (lg)
          </span>
          <ComboBox
            size="lg"
            variant="outline"
            label="Label"
            placeholder="Search location"
            description="Helper text"
            defaultItems={DEFAULT_OPTIONS}
          >
            {renderComboBoxItems}
          </ComboBox>
        </div>
      </div>
    </div>
  ),
};

export const RootClassName: Story = {
  render: () => (
    <div className="grid w-[680px] grid-cols-2 gap-[24px]">
      <ComboBox
        className="w-full"
        label="Grid column"
        placeholder="Search location"
        defaultItems={DEFAULT_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
      </ComboBox>
      <ComboBox
        className="max-w-[240px]"
        label="Constrained"
        placeholder="Search location"
        defaultItems={DEFAULT_OPTIONS}
      >
        {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
      </ComboBox>
    </div>
  ),
};

export const GroupedSections: Story = {
  render: () => {
    const [selectedKey, setSelectedKey] = useState<React.Key | null>(null);

    return (
      <div className="flex w-[320px] flex-col gap-3">
        <ComboBox
          label="Location"
          placeholder="Search location"
          description="Choose from popular and regional locations."
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
          startAddon={<MagnifyingGlass size={16} />}
        >
          <ComboBoxSection title="Popular">
            <ComboBoxItem id="male">Male'</ComboBoxItem>
            <ComboBoxItem id="hulhumale">Hulhumale'</ComboBoxItem>
            <ComboBoxItem id="addu">Addu City</ComboBoxItem>
          </ComboBoxSection>
          <ComboBoxSection title="Regional">
            <ComboBoxItem id="fuvahmulah">Fuvahmulah City</ComboBoxItem>
            <ComboBoxItem id="kulhudhuffushi">Kulhudhuffushi City</ComboBoxItem>
          </ComboBoxSection>
        </ComboBox>
        <p className="text-xs text-text-default-muted">
          Selected key:{' '}
          <span className="font-medium">{selectedKey ? String(selectedKey) : 'None'}</span>
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const combobox = canvas.getByRole('combobox', { name: 'Location' });
    const trigger = canvas.getByRole('button', { name: 'Show suggestions Location' });

    await userEvent.click(trigger);

    await expect(page.getByText('Popular')).toBeVisible();
    await expect(page.getByText('Regional')).toBeVisible();
    await expect(page.getByRole('option', { name: "Male'" })).toBeVisible();
    await expect(page.getByRole('option', { name: 'Fuvahmulah City' })).toBeVisible();

    await userEvent.click(page.getByRole('option', { name: 'Fuvahmulah City' }));

    await expect(combobox).toHaveValue('Fuvahmulah City');
    await expect(canvas.getByText('fuvahmulah')).toBeVisible();
  },
};

export const FigmaExploration: Story = {
  render: () => (
    <div className="w-[320px]">
      <ComboBox
        label="Location"
        labelSupplementary="(Optional)"
        labelIcon={<Info size={12} />}
        action="Browse"
        placeholder="Search location"
        description="Use the field shell slots to mirror Coral form compositions."
        allowsCustomValue
        startAddon={<MagnifyingGlass size={16} />}
        startContent={<CalendarBlank size={16} />}
        endContent={<WarningCircle size={16} />}
      >
        <ComboBoxSection title="Popular">
          <ComboBoxItem id="male">
            <span className="inline-flex min-w-0 items-center gap-[6px]">
              <span aria-hidden="true" className="type-caption-12-medium text-text-default-subtle">
                MLE
              </span>
              <span>Male'</span>
            </span>
          </ComboBoxItem>
          <ComboBoxItem id="hulhumale">Hulhumale'</ComboBoxItem>
          <ComboBoxItem id="addu">Addu City</ComboBoxItem>
        </ComboBoxSection>
        <ComboBoxSection title="Regional">
          <ComboBoxItem id="fuvahmulah">Fuvahmulah City</ComboBoxItem>
          <ComboBoxItem id="kulhudhuffushi">Kulhudhuffushi City</ComboBoxItem>
        </ComboBoxSection>
      </ComboBox>
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
        <ComboBox
          label="Default"
          placeholder="Choose a location"
          description="Helper text"
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          label="Invalid"
          placeholder="Choose a location"
          isInvalid
          errorMessage="Please choose a supported location."
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          label="Invalid without message"
          placeholder="Choose a location"
          isInvalid
          description="This helper text is hidden while invalid."
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          label="Disabled"
          placeholder="Unavailable"
          isDisabled
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          label="Custom value"
          placeholder="Type any location"
          allowsCustomValue
          description="This variation accepts values outside the provided list."
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
      </div>
      <div className="flex flex-col gap-8">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Outline
        </span>
        <ComboBox
          variant="outline"
          label="Default"
          placeholder="Choose a location"
          description="Helper text"
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          variant="outline"
          label="Invalid"
          placeholder="Choose a location"
          isInvalid
          errorMessage="Please choose a supported location."
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          variant="outline"
          label="Invalid without message"
          placeholder="Choose a location"
          isInvalid
          description="This helper text is hidden while invalid."
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          variant="outline"
          label="Disabled"
          placeholder="Unavailable"
          isDisabled
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <ComboBox
          variant="outline"
          label="Custom value"
          placeholder="Type any location"
          allowsCustomValue
          description="This variation accepts values outside the provided list."
          defaultItems={DEFAULT_OPTIONS}
        >
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
      </div>
    </div>
  ),
};
