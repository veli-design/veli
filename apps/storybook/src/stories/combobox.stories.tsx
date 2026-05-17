import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import {
  ComboBox,
  ComboBoxItem,
  ComboBoxSection,
} from '@tradenetcorp/coral-ui/combobox';
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
} satisfies Meta<typeof ComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

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
          {(item) => <ComboBoxItem>{item.label}</ComboBoxItem>}
        </ComboBox>
        <p className="text-xs text-text-default-muted">
          Selected key: <span className="font-medium">{selectedKey ? String(selectedKey) : 'None'}</span>
        </p>
      </div>
    );
  },
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
          Selected key: <span className="font-medium">{selectedKey ? String(selectedKey) : 'None'}</span>
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
  ),
};
