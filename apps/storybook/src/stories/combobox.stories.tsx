import { useEffect, useMemo, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { ComboBox, ComboBoxItem, ComboBoxSection } from '@tradenetcorp/veli-ui/combobox';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { CalendarBlank, MagnifyingGlass, WarningCircle } from 'phosphor-react';

type Option = {
  id: string;
  label: string;
};

const comboboxText = {
  en: {
    label: 'Location',
    optional: 'Optional',
    placeholder: 'Search location',
    helperText: 'Start typing to narrow the list.',
    chooseLocation: 'Choose a location',
    default: 'Default',
    invalid: 'Invalid',
    invalidWithoutMessage: 'Invalid without message',
    disabled: 'Disabled',
    customValue: 'Custom value',
    gridColumn: 'Grid column',
    constrained: 'Constrained',
    action: 'Browse',
    selectedKey: 'Selected key',
    none: 'None',
    helperTextHidden: 'This helper text is hidden while invalid.',
    errorMessage: 'Please choose a supported location.',
    customValueDescription: 'This variation accepts values outside the provided list.',
    figmaDescription: 'Use the field shell slots to mirror Coral form compositions.',
    groupedDescription: 'Choose from popular and regional locations.',
    infoTip: 'Use this combobox to search and choose a matching option.',
    infoTipLabel: 'More information',
    sections: {
      popular: 'Popular',
      regional: 'Regional',
    },
    locations: {
      male: "Male'",
      hulhumale: "Hulhumale'",
      addu: 'Addu City',
      fuvahmulah: 'Fuvahmulah City',
      kulhudhuffushi: 'Kulhudhuffushi City',
    },
    locationCodes: {
      male: 'MLE',
    },
  },
  dv: {
    label: 'ތަން',
    optional: 'އިޚްތިޔާރީ',
    placeholder: 'ތަނެއް ހޯދާ',
    helperText: 'ބޭނުން ވާ އައިޓަމެއް ސާރޗު ކުރައްވާ',
    chooseLocation: 'ތަނެއް ޚިޔާރުކުރައްވާ',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    invalidWithoutMessage: 'މެސެޖަކާ ނުލައި ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    customValue: 'ކަސްޓަމް ވެލިއު',
    gridColumn: 'ގްރިޑް ކޮލަމް',
    constrained: 'ހަނިކުރެވިފައިވާ',
    action: 'ބްރައުޒް',
    selectedKey: 'ޚިޔާރުކުރި ކީ',
    none: 'ނެތް',
    helperTextHidden: 'ސައްޙަނޫން ހާލަތެއްގައި މި އެހީތެރިވެދޭ ލިޔުން ނުފެންނާނެއެވެ.',
    errorMessage: 'ސައްޙަ ތަނެއް ޚިޔާރުކުރައްވާ.',
    customValueDescription: 'މި ވޭރިއޭޝަންގައި ލިސްޓްގައި ނެތް ވެލިއުއެއް ބަލައިގަނޭ.',
    figmaDescription:
      'ކޯރަލް ފޯމް ކޮމްޕޮޒިޝަންތައް މެޗްކުރުމަށް ފީލްޑް ޝެލް ސްލޮޓްތައް ބޭނުންކުރޭ.',
    groupedDescription: 'މަޝްހޫރު އަދި ރީޖަނަލް ތަންތަނުން ޚިޔާރުކުރައްވާ.',
    infoTip: 'މި ކޮމްބޯބޮކްސްން ތަނެއް ހޯދައި ޚިޔާރުކުރައްވާ.',
    infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
    sections: {
      popular: 'މަޝްހޫރު',
      regional: 'ރީޖަނަލް',
    },
    locations: {
      male: 'މާލެ',
      hulhumale: 'ހުޅުމާލެ',
      addu: 'އައްޑޫ ސިޓީ',
      fuvahmulah: 'ފުވައްމުލައް ސިޓީ',
      kulhudhuffushi: 'ކުޅުދުއްފުށި ސިޓީ',
    },
    locationCodes: {
      male: 'MLE',
    },
  },
} as const;

type ComboBoxText = (typeof comboboxText)[keyof typeof comboboxText];
type ComboBoxLanguage = keyof typeof comboboxText;

const comboboxArgText = {
  label: {
    en: comboboxText.en.label,
    dv: comboboxText.dv.label,
  },
  labelSupplementary: {
    en: comboboxText.en.optional,
    dv: comboboxText.dv.optional,
  },
  infoTooltip: {
    en: comboboxText.en.infoTip,
    dv: comboboxText.dv.infoTip,
  },
  infoTooltipAriaLabel: {
    en: comboboxText.en.infoTipLabel,
    dv: comboboxText.dv.infoTipLabel,
  },
  placeholder: {
    en: comboboxText.en.placeholder,
    dv: comboboxText.dv.placeholder,
  },
  description: {
    en: comboboxText.en.helperText,
    dv: comboboxText.dv.helperText,
  },
  errorMessage: {
    en: comboboxText.en.errorMessage,
    dv: comboboxText.dv.errorMessage,
  },
} as const;

type ComboBoxArgTextKey = keyof typeof comboboxArgText;
type ComboBoxStoryArgs = ComponentProps<typeof ComboBox> & {
  showOptional: boolean;
  showInfoTooltip: boolean;
  allowsCustomValue: boolean;
  items: Option[];
};

type ComboBoxSelectionKey = Exclude<React.Key, bigint>;

const comboboxArgTextKeys = Object.keys(comboboxArgText) as ComboBoxArgTextKey[];

const useComboBoxLanguage = (): ComboBoxLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useComboBoxText = () => {
  const language = useComboBoxLanguage();

  return comboboxText[language];
};

const createOptions = (text: ComboBoxText): Option[] => [
  { id: 'male', label: text.locations.male },
  { id: 'hulhumale', label: text.locations.hulhumale },
  { id: 'addu', label: text.locations.addu },
  { id: 'fuvahmulah', label: text.locations.fuvahmulah },
  { id: 'kulhudhuffushi', label: text.locations.kulhudhuffushi },
];

const DEFAULT_OPTIONS = createOptions(comboboxText.en);

const getLocalizedComboBoxArgText = (
  key: ComboBoxArgTextKey,
  value: unknown,
  language: ComboBoxLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return comboboxArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(comboboxArgText[key]);

  if (localizedValues.includes(value)) {
    return comboboxArgText[key][language];
  }

  return value;
};

const isDefaultOptionSet = (items: unknown): items is Option[] => {
  if (!Array.isArray(items) || items.length !== DEFAULT_OPTIONS.length) {
    return false;
  }

  const localizedDefaults = Object.values(comboboxText).map(createOptions);

  return items.every((item, index) =>
    localizedDefaults.some((options) => {
      const option = options[index];

      return option?.id === item.id && option.label === item.label;
    }),
  );
};

const getSafeItems = (items: unknown, text: ComboBoxText) => {
  if (!Array.isArray(items) || items.length === 0) {
    return createOptions(text);
  }

  if (isDefaultOptionSet(items)) {
    return createOptions(text);
  }

  return items as Option[];
};

const renderComboBoxItems = (item: Option) => <ComboBoxItem>{item.label}</ComboBoxItem>;

function useControlledComboBoxState(items: Option[]) {
  const [inputValue, setInputValue] = useState('');
  const [selectedKey, setSelectedKey] = useState<ComboBoxSelectionKey | null>(null);

  const handleInputChange = (value: string) => {
    setInputValue(value);

    if (value.trim().length === 0) {
      setSelectedKey(null);
      return;
    }

    const selectedItem = items.find((item) => item.id === selectedKey);

    if (selectedItem && selectedItem.label !== value) {
      setSelectedKey(null);
    }
  };

  const handleSelectionChange = (key: ComboBoxSelectionKey | null) => {
    setSelectedKey(key);

    const selectedItem = items.find((item) => item.id === key);

    if (selectedItem) {
      setInputValue(selectedItem.label);
    }
  };

  return {
    inputValue,
    selectedKey,
    handleInputChange,
    handleSelectionChange,
  };
}

const meta = {
  title: 'Components/ComboBox',
  component: ComboBox,
  decorators: [
    (Story, context) => {
      const language: ComboBoxLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const {
        description,
        errorMessage,
        infoTooltip,
        infoTooltipAriaLabel,
        label,
        labelSupplementary,
        placeholder,
      } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<ComboBoxArgTextKey, string>> = {};
        const currentArgs = {
          description,
          errorMessage,
          infoTooltip,
          infoTooltipAriaLabel,
          label,
          labelSupplementary,
          placeholder,
        };

        comboboxArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedComboBoxArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [
        description,
        errorMessage,
        infoTooltip,
        infoTooltipAriaLabel,
        label,
        labelSupplementary,
        language,
        placeholder,
        updateArgs,
      ]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    labelSupplementary: {
      control: 'text',
    },
    infoTooltip: {
      control: 'text',
    },
    infoTooltipAriaLabel: {
      control: 'text',
    },
    placeholder: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    appearance: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    allowsCustomValue: {
      control: 'boolean',
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
    showOptional: {
      control: 'boolean',
    },
    showInfoTooltip: {
      control: 'boolean',
    },
    items: {
      control: 'object',
    },
  },
  args: {
    label: comboboxText.en.label,
    labelSupplementary: comboboxText.en.optional,
    infoTooltip: comboboxText.en.infoTip,
    infoTooltipAriaLabel: comboboxText.en.infoTipLabel,
    placeholder: comboboxText.en.placeholder,
    description: comboboxText.en.helperText,
    errorMessage: comboboxText.en.errorMessage,
    showRequiredIndicator: true,
    showOptional: false,
    showInfoTooltip: false,
    allowsCustomValue: false,
    isDisabled: false,
    isRequired: false,
    items: DEFAULT_OPTIONS,
  },
} satisfies Meta<ComboBoxStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useComboBoxLanguage();
    const text = comboboxText[language];
    const { items, showInfoTooltip, showOptional, ...comboboxArgs } = args;
    const safeItems = useMemo(() => getSafeItems(items, text), [items, text]);
    const { inputValue, selectedKey, handleInputChange, handleSelectionChange } =
      useControlledComboBoxState(safeItems);

    return (
      <div className="flex w-[320px] flex-col gap-3">
        <ComboBox
          {...comboboxArgs}
          label={getLocalizedComboBoxArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedComboBoxArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedComboBoxArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedComboBoxArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedComboBoxArgText('placeholder', args.placeholder, language)}
          description={getLocalizedComboBoxArgText('description', args.description, language)}
          errorMessage={getLocalizedComboBoxArgText('errorMessage', args.errorMessage, language)}
          defaultItems={safeItems}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          selectedKey={selectedKey}
          onSelectionChange={handleSelectionChange}
          startAddon={<MagnifyingGlass size={16} />}
        >
          {renderComboBoxItems}
        </ComboBox>
        <p className="text-xs text-base-muted">
          {text.selectedKey}:{' '}
          <span className="font-medium">{selectedKey ? String(selectedKey) : text.none}</span>
        </p>
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    appearance: 'outline',
  },
  render: (args) => {
    const language = useComboBoxLanguage();
    const text = comboboxText[language];
    const { items, showInfoTooltip, showOptional, ...comboboxArgs } = args;
    const safeItems = useMemo(() => getSafeItems(items, text), [items, text]);
    const { inputValue, selectedKey, handleInputChange, handleSelectionChange } =
      useControlledComboBoxState(safeItems);

    return (
      <div className="flex w-[320px] flex-col gap-3">
        <ComboBox
          {...comboboxArgs}
          label={getLocalizedComboBoxArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedComboBoxArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedComboBoxArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedComboBoxArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedComboBoxArgText('placeholder', args.placeholder, language)}
          description={getLocalizedComboBoxArgText('description', args.description, language)}
          errorMessage={getLocalizedComboBoxArgText('errorMessage', args.errorMessage, language)}
          defaultItems={safeItems}
          inputValue={inputValue}
          onInputChange={handleInputChange}
          selectedKey={selectedKey}
          onSelectionChange={handleSelectionChange}
          startAddon={<MagnifyingGlass size={16} />}
        >
          {renderComboBoxItems}
        </ComboBox>
        <p className="text-xs text-base-muted">
          {text.selectedKey}:{' '}
          <span className="font-medium">{selectedKey ? String(selectedKey) : text.none}</span>
        </p>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const text = useComboBoxText();
    const options = createOptions(text);

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Default
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Small (sm)
            </span>
            <ComboBox
              size="sm"
              label={text.label}
              placeholder={text.placeholder}
              description={text.helperText}
              defaultItems={options}
            >
              {renderComboBoxItems}
            </ComboBox>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Medium (md)
            </span>
            <ComboBox
              size="md"
              label={text.label}
              placeholder={text.placeholder}
              description={text.helperText}
              defaultItems={options}
            >
              {renderComboBoxItems}
            </ComboBox>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Large (lg)
            </span>
            <ComboBox
              size="lg"
              label={text.label}
              placeholder={text.placeholder}
              description={text.helperText}
              defaultItems={options}
            >
              {renderComboBoxItems}
            </ComboBox>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Outline
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Small (sm)
            </span>
            <ComboBox
              size="sm"
              appearance="outline"
              label={text.label}
              placeholder={text.placeholder}
              description={text.helperText}
              defaultItems={options}
            >
              {renderComboBoxItems}
            </ComboBox>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Medium (md)
            </span>
            <ComboBox
              size="md"
              appearance="outline"
              label={text.label}
              placeholder={text.placeholder}
              description={text.helperText}
              defaultItems={options}
            >
              {renderComboBoxItems}
            </ComboBox>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Large (lg)
            </span>
            <ComboBox
              size="lg"
              appearance="outline"
              label={text.label}
              placeholder={text.placeholder}
              description={text.helperText}
              defaultItems={options}
            >
              {renderComboBoxItems}
            </ComboBox>
          </div>
        </div>
      </div>
    );
  },
};

export const RootClassName: Story = {
  render: () => {
    const text = useComboBoxText();
    const options = createOptions(text);

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <ComboBox
          className="w-full"
          label={text.gridColumn}
          placeholder={text.placeholder}
          defaultItems={options}
        >
          {renderComboBoxItems}
        </ComboBox>
        <ComboBox
          className="max-w-[240px]"
          label={text.constrained}
          placeholder={text.placeholder}
          defaultItems={options}
        >
          {renderComboBoxItems}
        </ComboBox>
      </div>
    );
  },
};

export const GroupedSections: Story = {
  render: () => {
    const text = useComboBoxText();
    const [selectedKey, setSelectedKey] = useState<ComboBoxSelectionKey | null>(null);

    return (
      <div className="flex w-[320px] flex-col gap-3">
        <ComboBox
          label={text.label}
          placeholder={text.placeholder}
          description={text.groupedDescription}
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
          startAddon={<MagnifyingGlass size={16} />}
        >
          <ComboBoxSection title={text.sections.popular}>
            <ComboBoxItem id="male">{text.locations.male}</ComboBoxItem>
            <ComboBoxItem id="hulhumale">{text.locations.hulhumale}</ComboBoxItem>
            <ComboBoxItem id="addu">{text.locations.addu}</ComboBoxItem>
          </ComboBoxSection>
          <ComboBoxSection title={text.sections.regional}>
            <ComboBoxItem id="fuvahmulah">{text.locations.fuvahmulah}</ComboBoxItem>
            <ComboBoxItem id="kulhudhuffushi">{text.locations.kulhudhuffushi}</ComboBoxItem>
          </ComboBoxSection>
        </ComboBox>
        <p className="text-xs text-base-muted">
          {text.selectedKey}:{' '}
          <span className="font-medium">{selectedKey ? String(selectedKey) : text.none}</span>
        </p>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const combobox = canvas.getByRole('combobox');
    const trigger = canvas.getByRole('button');

    await userEvent.click(trigger);

    const maleOptionName = page.queryByRole('option', { name: "Male'" })
      ? "Male'"
      : comboboxText.dv.locations.male;
    const targetOptionName = page.queryByRole('option', { name: 'Fuvahmulah City' })
      ? 'Fuvahmulah City'
      : comboboxText.dv.locations.fuvahmulah;

    await expect(page.getByRole('option', { name: maleOptionName })).toBeVisible();
    await expect(page.getByRole('option', { name: targetOptionName })).toBeVisible();

    await userEvent.click(page.getByRole('option', { name: targetOptionName }));

    await expect(combobox).toHaveValue(targetOptionName);
    await expect(canvas.getByText('fuvahmulah')).toBeVisible();

    await userEvent.click(trigger);
    await expect(page.getByRole('option', { name: targetOptionName })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(
      page.getByRole('option', { name: targetOptionName }).querySelector('svg'),
    ).not.toBeNull();
  },
};

export const FigmaExploration: Story = {
  render: () => {
    const text = useComboBoxText();

    return (
      <div className="w-[320px]">
        <ComboBox
          label={text.label}
          labelSupplementary={text.optional}
          infoTooltip={text.infoTip}
          infoTooltipAriaLabel={text.infoTipLabel}
          action={text.action}
          placeholder={text.placeholder}
          description={text.figmaDescription}
          allowsCustomValue
          startAddon={<MagnifyingGlass size={16} />}
          startContent={<CalendarBlank size={16} />}
          endContent={<WarningCircle size={16} />}
        >
          <ComboBoxSection title={text.sections.popular}>
            <ComboBoxItem id="male">
              <span className="inline-flex min-w-0 items-center gap-[6px]">
                <span aria-hidden="true" className="type-caption-medium text-base-subtle">
                  {text.locationCodes.male}
                </span>
                <span>{text.locations.male}</span>
              </span>
            </ComboBoxItem>
            <ComboBoxItem id="hulhumale">{text.locations.hulhumale}</ComboBoxItem>
            <ComboBoxItem id="addu">{text.locations.addu}</ComboBoxItem>
          </ComboBoxSection>
          <ComboBoxSection title={text.sections.regional}>
            <ComboBoxItem id="fuvahmulah">{text.locations.fuvahmulah}</ComboBoxItem>
            <ComboBoxItem id="kulhudhuffushi">{text.locations.kulhudhuffushi}</ComboBoxItem>
          </ComboBoxSection>
        </ComboBox>
      </div>
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const text = useComboBoxText();
    const options = createOptions(text);

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Default
          </span>
          <ComboBox
            label={text.default}
            placeholder={text.chooseLocation}
            description={text.helperText}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            label={text.invalid}
            placeholder={text.chooseLocation}
            isInvalid
            errorMessage={text.errorMessage}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            label={text.invalidWithoutMessage}
            placeholder={text.chooseLocation}
            isInvalid
            description={text.helperTextHidden}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            label={text.disabled}
            placeholder={text.chooseLocation}
            isDisabled
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            label={text.customValue}
            placeholder={text.placeholder}
            allowsCustomValue
            description={text.customValueDescription}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Outline
          </span>
          <ComboBox
            appearance="outline"
            label={text.default}
            placeholder={text.chooseLocation}
            description={text.helperText}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            appearance="outline"
            label={text.invalid}
            placeholder={text.chooseLocation}
            isInvalid
            errorMessage={text.errorMessage}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            appearance="outline"
            label={text.invalidWithoutMessage}
            placeholder={text.chooseLocation}
            isInvalid
            description={text.helperTextHidden}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            appearance="outline"
            label={text.disabled}
            placeholder={text.chooseLocation}
            isDisabled
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
          <ComboBox
            appearance="outline"
            label={text.customValue}
            placeholder={text.placeholder}
            allowsCustomValue
            description={text.customValueDescription}
            defaultItems={options}
          >
            {renderComboBoxItems}
          </ComboBox>
        </div>
      </div>
    );
  },
};
