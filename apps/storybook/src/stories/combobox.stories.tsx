import { useEffect, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { expect, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { Button } from '@tradenetcorp/veli-ui/button';
import { ComboBox, ComboBoxItem, ComboBoxSection } from '@tradenetcorp/veli-ui/combobox';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const collapsedControlGroups = [
  'Content',
  'State',
  'Composition',
  'Selection and collection',
] as const;

function ComboBoxDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const collapseGroups = () => {
      if (cancelled) return;
      const ready = collapsedControlGroups.every(
        (group) =>
          document.querySelector(
            `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
          ) != null,
      );
      if (!ready && attempts++ < 40) {
        requestAnimationFrame(collapseGroups);
        return;
      }
      collapsedControlGroups.forEach((group) =>
        document
          .querySelector(`tr[title^="Hide ${group} item"]`)
          ?.querySelector<HTMLElement>('[tabindex="0"]')
          ?.click(),
      );
    };
    collapseGroups();
    return () => {
      cancelled = true;
    };
  }, []);
  return <DocsContainer {...props} />;
}

const comboboxText = {
  en: {
    label: 'Location',
    placeholder: 'Search location',
    helperText: 'Start typing to narrow the list.',
    selected: 'Selected',
    invalid: 'Invalid',
    disabled: 'Disabled',
    readOnly: 'Read only',
    customValue: 'Custom value',
    empty: 'No options',
    errorMessage: 'Please choose a supported location.',
    infoTooltip: 'Search and choose a matching location.',
    infoTooltipAriaLabel: 'More information',
    popular: 'Popular',
    regional: 'Regional',
    reset: 'Reset',
    selectedKey: 'Selected key',
    noSelection: 'None',
    locations: {
      male: "Male'",
      hulhumale: "Hulhumale'",
      addu: 'Addu City',
      fuvahmulah: 'Fuvahmulah City',
      kulhudhuffushi: 'Kulhudhuffushi City',
    },
  },
  dv: {
    label: 'ތަން',
    placeholder: 'ތަނެއް ހޯދާ',
    helperText: 'ބޭނުން ވާ އައިޓަމެއް ސާރޗު ކުރައްވާ',
    selected: 'ޚިޔާރުކުރެވިފައި',
    invalid: 'ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    readOnly: 'ކިޔަމަށް އެކަނި',
    customValue: 'ކަސްޓަމް ވެލިއު',
    empty: 'އޮޕްޝަނެއް ނެތް',
    errorMessage: 'ސައްޙަ ތަނެއް ޚިޔާރުކުރައްވާ.',
    infoTooltip: 'ތަނެއް ހޯދައި ޚިޔާރުކުރައްވާ.',
    infoTooltipAriaLabel: 'އިތުރު މަޢުލޫމާތު',
    popular: 'މަޝްހޫރު',
    regional: 'ރީޖަނަލް',
    reset: 'އަލުން ފަށާ',
    selectedKey: 'ޚިޔާރުކުރެވުނު ކީ',
    noSelection: 'ނެތް',
    locations: {
      male: 'މާލެ',
      hulhumale: 'ހުޅުމާލެ',
      addu: 'އައްޑޫ ސިޓީ',
      fuvahmulah: 'ފުވައްމުލައް ސިޓީ',
      kulhudhuffushi: 'ކުޅުދުއްފުށި ސިޓީ',
    },
  },
} as const;

type ComboBoxLanguage = keyof typeof comboboxText;
type ComboBoxText = (typeof comboboxText)[ComboBoxLanguage];
type LocationItem = { id: string; name: string };
type ComboBoxStoryArgs = ComponentProps<typeof ComboBox<LocationItem>> & {
  showInfoTooltip: boolean;
};

const argTextKeys = [
  'label',
  'placeholder',
  'description',
  'errorMessage',
  'infoTooltip',
  'infoTooltipAriaLabel',
] as const;
type ArgTextKey = (typeof argTextKeys)[number];
const argText = (key: ArgTextKey, language: ComboBoxLanguage) =>
  key === 'description' ? comboboxText[language].helperText : comboboxText[language][key];
const localize = (key: ArgTextKey, value: unknown, language: ComboBoxLanguage) => {
  if (typeof value !== 'string' || value.trim().length === 0) return argText(key, language);
  return value === argText(key, 'en') || value === argText(key, 'dv')
    ? argText(key, language)
    : value;
};
const withArgCategory = <T extends Record<string, object>>(category: string, argTypes: T) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [name, { ...argType, table: { category } }]),
  ) as { [K in keyof T]: T[K] & { table: { category: string } } };
const useComboBoxLanguage = (): ComboBoxLanguage => useVeliLanguage().language;
const locationItems = (text: ComboBoxText): LocationItem[] =>
  Object.entries(text.locations).map(([id, name]) => ({ id, name }));
const renderOptions = (text: ComboBoxText) =>
  Object.entries(text.locations).map(([id, label]) => (
    <ComboBoxItem key={id} id={id}>
      {label}
    </ComboBoxItem>
  ));

const meta = {
  title: 'Components/ComboBox',
  component: ComboBox,
  decorators: [
    (Story, context) => {
      const language: ComboBoxLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { label, placeholder, description, errorMessage, infoTooltip, infoTooltipAriaLabel } =
        args;
      useEffect(() => {
        const current = {
          label,
          placeholder,
          description,
          errorMessage,
          infoTooltip,
          infoTooltipAriaLabel,
        };
        const next: Partial<Record<ArgTextKey, string>> = {};
        argTextKeys.forEach((key) => {
          const value = localize(key, current[key], language);
          if (value !== current[key]) next[key] = value;
        });
        if (Object.keys(next).length > 0) updateArgs(next);
      }, [
        label,
        placeholder,
        description,
        errorMessage,
        infoTooltip,
        infoTooltipAriaLabel,
        language,
        updateArgs,
      ]);
      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
    docs: { container: ComboBoxDocsContainer },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      appearance: { control: 'select', options: ['default', 'outline'] },
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
    }),
    ...withArgCategory('Label', {
      label: { control: 'text' },
      isOptional: { control: 'boolean' },
      infoTooltip: { control: 'text' },
      infoTooltipAriaLabel: { control: 'text' },
      showInfoTooltip: { control: 'boolean' },
    }),
    ...withArgCategory('Content', {
      placeholder: { control: 'text' },
      description: { control: 'text' },
      defaultValue: {
        control: 'select',
        options: [null, 'male', 'hulhumale', 'addu', 'fuvahmulah', 'kulhudhuffushi'],
      },
      menuTrigger: { control: 'select', options: ['focus', 'input', 'manual'] },
      allowsCustomValue: { control: 'boolean' },
      emptyState: { control: 'text' },
    }),
    ...withArgCategory('State', {
      isRequired: { control: 'boolean' },
      showRequiredIndicator: { control: 'boolean' },
      isInvalid: { control: 'boolean' },
      errorMessage: { control: 'text' },
      isDisabled: { control: 'boolean' },
      isReadOnly: { control: 'boolean' },
    }),
    ...withArgCategory('Composition', {
      labelSupplementary: { control: false, description: 'Custom label text.' },
      action: { control: false, description: 'Independent header action.' },
      labelIcon: { control: false, description: 'Label icon.' },
      startAddon: { control: false, description: 'Leading accessory.' },
      startContent: { control: false, description: 'Leading inline content.' },
      endContent: { control: false, description: 'Trailing inline content.' },
      menuTriggerIcon: { control: false, description: 'Custom disclosure icon.' },
      inputRef: { control: false, description: 'Inner input ref.' },
    }),
    ...withArgCategory('Selection and collection', {
      value: { control: false, description: 'Controlled selected key; see Controlled.' },
      onChange: { control: false, description: 'Selected-key callback; see Controlled.' },
      items: { control: false, description: 'Controlled, caller-filtered items; see Controlled.' },
      defaultItems: { control: false, description: 'Uncontrolled collection; see Default.' },
      inputValue: { control: false, description: 'Controlled search text; see Controlled.' },
      onInputChange: { control: false, description: 'Search-text callback; see Controlled.' },
      children: {
        control: false,
        description: 'Options, sections, or a collection item renderer.',
      },
    }),
    className: { table: { disable: true } },
    ref: {
      control: false,
      description: 'Inner input ref; inputRef takes precedence if both are set.',
    },
  },
  args: {
    appearance: 'default',
    size: 'md',
    label: comboboxText.en.label,
    isOptional: true,
    infoTooltip: comboboxText.en.infoTooltip,
    infoTooltipAriaLabel: comboboxText.en.infoTooltipAriaLabel,
    showInfoTooltip: true,
    placeholder: comboboxText.en.placeholder,
    description: comboboxText.en.helperText,
    defaultValue: null,
    menuTrigger: 'focus',
    allowsCustomValue: false,
    isRequired: false,
    showRequiredIndicator: true,
    isInvalid: false,
    errorMessage: comboboxText.en.errorMessage,
    isDisabled: false,
    isReadOnly: false,
  },
} satisfies Meta<ComboBoxStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useComboBoxLanguage();
    const text = comboboxText[language];
    const { showInfoTooltip, ...comboboxArgs } = args;
    return (
      <div key={`${language}:${args.defaultValue ?? ''}`} className="w-[min(320px,90vw)]">
        <ComboBox
          {...comboboxArgs}
          label={localize('label', args.label, language)}
          placeholder={localize('placeholder', args.placeholder, language)}
          description={localize('description', args.description, language)}
          errorMessage={localize('errorMessage', args.errorMessage, language)}
          infoTooltip={
            showInfoTooltip ? localize('infoTooltip', args.infoTooltip, language) : undefined
          }
          infoTooltipAriaLabel={localize(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          defaultItems={locationItems(text)}
        >
          {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
        </ComboBox>
      </div>
    );
  },
};

export const Outline: Story = { args: { appearance: 'outline' }, render: Default.render };

export const Sizes: Story = {
  render: () => {
    const language = useComboBoxLanguage();
    const text = comboboxText[language];
    return (
      <div key={language} className="grid w-[min(680px,90vw)] grid-cols-1 gap-6 sm:grid-cols-2">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-8">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              {appearance === 'default' ? 'Default' : 'Outline'}
            </span>
            {(['sm', 'md', 'lg'] as const).map((size) => (
              <div key={size} className="flex flex-col gap-4">
                <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
                  {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
                </span>
                <ComboBox
                  size={size}
                  appearance={appearance}
                  label={text.label}
                  isOptional
                  placeholder={text.placeholder}
                  description={text.helperText}
                >
                  {renderOptions(text)}
                </ComboBox>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const language = useComboBoxLanguage();
    const text = comboboxText[language];
    return (
      <div key={language} className="grid w-[min(680px,90vw)] grid-cols-1 gap-6 sm:grid-cols-2">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-4">
            <ComboBox
              appearance={appearance}
              label={text.selected}
              defaultValue="male"
              description={text.helperText}
            >
              {renderOptions(text)}
            </ComboBox>
            <ComboBox
              appearance={appearance}
              label={text.invalid}
              placeholder={text.placeholder}
              isInvalid
              description={text.helperText}
              errorMessage={text.errorMessage}
            >
              {renderOptions(text)}
            </ComboBox>
            <ComboBox
              appearance={appearance}
              label={text.disabled}
              isDisabled
              description={text.helperText}
            >
              {renderOptions(text)}
            </ComboBox>
            <ComboBox
              appearance={appearance}
              label={text.readOnly}
              isReadOnly
              defaultValue="male"
              description={text.helperText}
            >
              {renderOptions(text)}
            </ComboBox>
            <ComboBox
              appearance={appearance}
              label={text.customValue}
              allowsCustomValue
              placeholder={text.placeholder}
            >
              {renderOptions(text)}
            </ComboBox>
            <ComboBox appearance={appearance} label={text.empty} allowsEmptyCollection>
              {null}
            </ComboBox>
          </div>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole('combobox');
    for (const index of [2, 8]) await expect(inputs[index]).toBeDisabled();
    for (const index of [3, 9]) {
      const input = inputs[index];
      await expect(input).toHaveAttribute('readonly');
      const value = (input as HTMLInputElement).value;
      await userEvent.click(input);
      await userEvent.keyboard('{ArrowDown}');
      await expect(input).toHaveAttribute('aria-expanded', 'false');
      await expect(input).toHaveValue(value);
    }
    for (const index of [1, 7]) await expect(inputs[index]).toHaveAttribute('aria-invalid', 'true');
    const input = inputs[0];
    const page = within(canvasElement.ownerDocument.body);
    const trigger = within(input.parentElement!).getByRole('button');
    const targetName = input.closest('[lang]')?.getAttribute('lang')?.startsWith('dv')
      ? comboboxText.dv.locations.fuvahmulah
      : comboboxText.en.locations.fuvahmulah;
    await userEvent.click(trigger);
    await userEvent.click(await page.findByRole('option', { name: targetName }));
    await expect(input).toHaveValue(targetName);
    await userEvent.clear(input);
    await userEvent.type(input, targetName);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(input).toHaveValue(targetName);
    await userEvent.keyboard('{Escape}');
    await userEvent.click(canvasElement);
  },
};

export const Required: Story = {
  args: { isRequired: true, isOptional: false },
  render: Default.render,
};

export const Sections: Story = {
  render: () => {
    const language = useComboBoxLanguage();
    const text = comboboxText[language];
    return (
      <div key={language} className="w-[min(320px,90vw)]">
        <ComboBox
          label={text.label}
          placeholder={text.placeholder}
          description={text.helperText}
          defaultValue="male"
        >
          <ComboBoxSection title={text.popular}>
            <ComboBoxItem id="male">{text.locations.male}</ComboBoxItem>
            <ComboBoxItem id="hulhumale">{text.locations.hulhumale}</ComboBoxItem>
            <ComboBoxItem id="addu">{text.locations.addu}</ComboBoxItem>
          </ComboBoxSection>
          <ComboBoxSection title={text.regional}>
            <ComboBoxItem id="fuvahmulah">{text.locations.fuvahmulah}</ComboBoxItem>
            <ComboBoxItem id="kulhudhuffushi" isDisabled>
              {text.locations.kulhudhuffushi}
            </ComboBoxItem>
          </ComboBoxSection>
        </ComboBox>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox');
    const trigger = canvas.getByRole('button');
    const targetName = input.closest('[lang]')?.getAttribute('lang')?.startsWith('dv')
      ? comboboxText.dv.locations.fuvahmulah
      : comboboxText.en.locations.fuvahmulah;
    await userEvent.click(trigger);
    await userEvent.click(await page.findByRole('option', { name: targetName }));
    await expect(input).toHaveValue(targetName);
    await userEvent.click(trigger);
    const selected = await page.findByRole('option', { name: targetName });
    await expect(selected).toHaveAttribute('aria-selected', 'true');
    await expect(selected.querySelector('svg')).not.toBeNull();
    await userEvent.keyboard('{Escape}');
  },
};

function ControlledComboBox({ text }: { text: ComboBoxText }) {
  const [value, setValue] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const locations = locationItems(text);
  return (
    <div className="flex w-[min(320px,90vw)] flex-col gap-4">
      <ComboBox
        label={text.label}
        placeholder={text.placeholder}
        description={text.helperText}
        value={value}
        onChange={(key) => {
          setValue(key);
          setInputValue(locations.find((item) => item.id === key)?.name ?? '');
        }}
        items={locations.filter((item) =>
          item.name.toLocaleLowerCase().includes(inputValue.toLocaleLowerCase()),
        )}
        inputValue={inputValue}
        onInputChange={(query) => {
          setInputValue(query);
          setValue(null);
        }}
      >
        {(item) => <ComboBoxItem>{item.name}</ComboBoxItem>}
      </ComboBox>
      <p className="type-body-sm-regular text-base-default">
        {text.selectedKey}: <output data-testid="selected-key">{value ?? text.noSelection}</output>
      </p>
      <Button
        appearance="ghost"
        size="sm"
        onPress={() => {
          setValue(null);
          setInputValue('');
        }}
      >
        {text.reset}
      </Button>
    </div>
  );
}

export const Controlled: Story = {
  render: () => {
    const language = useComboBoxLanguage();
    return <ControlledComboBox key={language} text={comboboxText[language]} />;
  },
  play: async ({ canvasElement, globals }) => {
    const text = comboboxText[globals.language === 'dv' ? 'dv' : 'en'];
    const canvas = within(canvasElement);
    const page = within(canvasElement.ownerDocument.body);
    const input = canvas.getByRole('combobox');
    await userEvent.click(input);
    await userEvent.type(input, text.locations.fuvahmulah);
    await expect(
      await page.findByRole('option', { name: text.locations.fuvahmulah }),
    ).toBeVisible();
    await expect(page.getAllByRole('option')).toHaveLength(1);
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect(input).toHaveValue(text.locations.fuvahmulah);
    await expect(canvas.getByTestId('selected-key')).toHaveTextContent('fuvahmulah');
    await userEvent.click(canvas.getByRole('button', { name: text.reset }));
    await expect(input).toHaveValue('');
    await expect(canvas.getByTestId('selected-key')).toHaveTextContent(text.noSelection);
    await expect(input).toHaveAttribute('aria-expanded', 'false');
  },
};
