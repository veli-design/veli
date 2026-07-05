import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Info, MagnifyingGlass, WarningCircle } from 'phosphor-react';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Select, SelectItem, SelectSection } from '@tradenetcorp/veli-ui/select';

const selectText = {
  en: {
    label: 'Label',
    optional: 'Optional',
    chooseAnOption: 'Choose an option',
    helperText: 'Helper text',
    default: 'Default',
    invalid: 'Invalid',
    invalidWithoutMessage: 'Invalid without message',
    disabled: 'Disabled',
    selected: 'Selected',
    gridColumn: 'Grid column',
    constrained: 'Constrained',
    action: 'Action',
    selectedValue: 'Preselected value',
    helperTextHidden: 'This helper text is hidden while invalid.',
    errorMessage: 'This field needs attention.',
    infoTip: 'Use this select to choose the requested option.',
    infoTipLabel: 'More information',
    countries: {
      malaysia: 'Malaysia',
      singapore: 'Singapore',
      thailand: 'Thailand',
    },
    genericOptions: {
      optionA: 'Option A',
      optionB: 'Option B',
      optionC: 'Option C',
    },
    sections: {
      popular: 'Popular',
      other: 'Other',
    },
    accounts: {
      cash: 'Cash',
      margin: 'Margin',
      investmentAccount: 'Investment account',
      trustAccount: 'Trust account',
    },
    descriptions: {
      immediateSettlement: 'Immediate settlement',
      includesFinancing: 'Includes financing',
    },
  },
  dv: {
    label: 'ލޭބަލް',
    optional: 'އިޚްތިޔާރީ',
    chooseAnOption: 'އޮޕްޝަނެއް ޚިޔާރުކުރައްވާ',
    helperText: 'އެހީތެރިވެދޭ ލިޔުން',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    invalidWithoutMessage: 'މެސެޖަކާ ނުލައި ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    selected: 'ޚިޔާރުކުރެވިފައި',
    gridColumn: 'ގްރިޑް ކޮލަމް',
    constrained: 'ހަނިކުރެވިފައިވާ',
    action: 'އެކްޝަން',
    selectedValue: 'ކުރިން ޚިޔާރުކުރެވިފައި',
    helperTextHidden: 'ސައްޙަނޫން ހާލަތެއްގައި މި އެހީތެރިވެދޭ ލިޔުން ނުފެންނާނެއެވެ.',
    errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
    infoTip: 'މި ސެލެކްޓުން ބޭނުންވާ އޮޕްޝަން ޚިޔާރުކުރައްވާ.',
    infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
    countries: {
      malaysia: 'މެލޭޝިއާ',
      singapore: 'ސިންގަޕޫރު',
      thailand: 'ތައިލެންޑް',
    },
    genericOptions: {
      optionA: 'އޮޕްޝަން އޭ',
      optionB: 'އޮޕްޝަން ބީ',
      optionC: 'އޮޕްޝަން ސީ',
    },
    sections: {
      popular: 'މަޝްހޫރު',
      other: 'އެހެނިހެން',
    },
    accounts: {
      cash: 'ކޭޝް',
      margin: 'މާޖިން',
      investmentAccount: 'އިންވެސްޓްމަންޓް އެކައުންޓް',
      trustAccount: 'ޓްރަސްޓް އެކައުންޓް',
    },
    descriptions: {
      immediateSettlement: 'ވަގުތުން ހަމަޖެއްސުން',
      includesFinancing: 'ފައިނޭންސް ހިމެނޭގޮތަށް',
    },
  },
} as const;

type SelectText = (typeof selectText)[keyof typeof selectText];
type SelectLanguage = keyof typeof selectText;

const selectArgText = {
  label: {
    en: selectText.en.label,
    dv: selectText.dv.label,
  },
  labelSupplementary: {
    en: selectText.en.optional,
    dv: selectText.dv.optional,
  },
  infoTooltip: {
    en: selectText.en.infoTip,
    dv: selectText.dv.infoTip,
  },
  infoTooltipAriaLabel: {
    en: selectText.en.infoTipLabel,
    dv: selectText.dv.infoTipLabel,
  },
  placeholder: {
    en: selectText.en.chooseAnOption,
    dv: selectText.dv.chooseAnOption,
  },
  description: {
    en: selectText.en.helperText,
    dv: selectText.dv.helperText,
  },
  errorMessage: {
    en: selectText.en.errorMessage,
    dv: selectText.dv.errorMessage,
  },
} as const;

type SelectArgTextKey = keyof typeof selectArgText;
type SelectStoryArgs = ComponentProps<typeof Select> & {
  showOptional: boolean;
  showInfoTooltip: boolean;
};

const selectArgTextKeys = Object.keys(selectArgText) as SelectArgTextKey[];

const useSelectLanguage = (): SelectLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useSelectText = () => {
  const language = useSelectLanguage();

  return selectText[language];
};

const getLocalizedSelectArgText = (
  key: SelectArgTextKey,
  value: unknown,
  language: SelectLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return selectArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(selectArgText[key]);

  if (localizedValues.includes(value)) {
    return selectArgText[key][language];
  }

  return value;
};

const renderCountryOptions = (text: SelectText) => (
  <>
    <SelectItem id="malaysia">{text.countries.malaysia}</SelectItem>
    <SelectItem id="singapore">{text.countries.singapore}</SelectItem>
    <SelectItem id="thailand">{text.countries.thailand}</SelectItem>
  </>
);

const renderGenericOptions = (text: SelectText) => (
  <>
    <SelectItem id="a">{text.genericOptions.optionA}</SelectItem>
    <SelectItem id="b">{text.genericOptions.optionB}</SelectItem>
  </>
);

const meta = {
  title: 'Components/Select',
  component: Select,
  decorators: [
    (Story, context) => {
      const language: SelectLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
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
        const nextArgs: Partial<Record<SelectArgTextKey, string>> = {};
        const currentArgs = {
          description,
          errorMessage,
          infoTooltip,
          infoTooltipAriaLabel,
          label,
          labelSupplementary,
          placeholder,
        };

        selectArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedSelectArgText(key, currentArgs[key], language);

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
  },
  args: {
    label: selectText.en.label,
    labelSupplementary: selectText.en.optional,
    infoTooltip: selectText.en.infoTip,
    infoTooltipAriaLabel: selectText.en.infoTipLabel,
    placeholder: selectText.en.chooseAnOption,
    description: selectText.en.helperText,
    errorMessage: selectText.en.errorMessage,
    showRequiredIndicator: true,
    showOptional: false,
    showInfoTooltip: false,
  },
} satisfies Meta<SelectStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useSelectLanguage();
    const { showInfoTooltip, showOptional, ...selectArgs } = args;

    return (
      <div className="w-[320px]">
        <Select
          {...selectArgs}
          label={getLocalizedSelectArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedSelectArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedSelectArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedSelectArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedSelectArgText('placeholder', args.placeholder, language)}
          description={getLocalizedSelectArgText('description', args.description, language)}
          errorMessage={getLocalizedSelectArgText('errorMessage', args.errorMessage, language)}
        >
          {renderCountryOptions(selectText[language])}
        </Select>
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    appearance: 'outline',
  },
  render: (args) => {
    const language = useSelectLanguage();
    const { showInfoTooltip, showOptional, ...selectArgs } = args;

    return (
      <div className="w-[320px]">
        <Select
          {...selectArgs}
          label={getLocalizedSelectArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedSelectArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedSelectArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedSelectArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedSelectArgText('placeholder', args.placeholder, language)}
          description={getLocalizedSelectArgText('description', args.description, language)}
          errorMessage={getLocalizedSelectArgText('errorMessage', args.errorMessage, language)}
        >
          {renderCountryOptions(selectText[language])}
        </Select>
      </div>
    );
  },
};

/**
 * Showcases all size variants of the Select component.
 */
export const Sizes: Story = {
  render: () => {
    const text = useSelectText();

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
            <Select
              size="sm"
              label={text.label}
              placeholder={text.chooseAnOption}
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Medium (md)
            </span>
            <Select
              size="md"
              label={text.label}
              placeholder={text.chooseAnOption}
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Large (lg)
            </span>
            <Select
              size="lg"
              label={text.label}
              placeholder={text.chooseAnOption}
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
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
            <Select
              size="sm"
              appearance="outline"
              label={text.label}
              placeholder={text.chooseAnOption}
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Medium (md)
            </span>
            <Select
              size="md"
              appearance="outline"
              label={text.label}
              placeholder={text.chooseAnOption}
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Large (lg)
            </span>
            <Select
              size="lg"
              appearance="outline"
              label={text.label}
              placeholder={text.chooseAnOption}
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
          </div>
        </div>
      </div>
    );
  },
};

export const RootClassName: Story = {
  render: () => {
    const text = useSelectText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <Select className="w-full" label={text.gridColumn} placeholder={text.chooseAnOption}>
          {renderGenericOptions(text)}
        </Select>
        <Select
          className="max-w-[240px]"
          label={text.constrained}
          placeholder={text.chooseAnOption}
        >
          {renderGenericOptions(text)}
        </Select>
      </div>
    );
  },
};

export const FigmaExploration: Story = {
  render: () => {
    const text = useSelectText();

    return (
      <div className="w-[320px]">
        <Select
          label={text.label}
          labelSupplementary={text.optional}
          infoTooltip={text.infoTip}
          infoTooltipAriaLabel={text.infoTipLabel}
          isRequired
          labelIcon={<Info size={12} />}
          action={text.action}
          placeholder={text.chooseAnOption}
          description={text.helperText}
          startContent={<MagnifyingGlass size={16} />}
          endContent={<WarningCircle size={16} />}
        >
          <SelectSection title={text.sections.popular}>
            <SelectItem id="cash" description={text.descriptions.immediateSettlement}>
              <span className="inline-flex min-w-0 items-center gap-[6px]">
                <span aria-hidden="true" className="type-caption-medium text-base-subtle">
                  C
                </span>
                <span>{text.accounts.cash}</span>
              </span>
            </SelectItem>
            <SelectItem id="margin" description={text.descriptions.includesFinancing}>
              {text.accounts.margin}
            </SelectItem>
          </SelectSection>
          <SelectSection title={text.sections.other}>
            <SelectItem id="isa">{text.accounts.investmentAccount}</SelectItem>
            <SelectItem id="trust">{text.accounts.trustAccount}</SelectItem>
          </SelectSection>
        </Select>
      </div>
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const text = useSelectText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Default
          </span>
          <Select
            label={text.default}
            placeholder={text.chooseAnOption}
            description={text.helperText}
          >
            {renderGenericOptions(text)}
          </Select>
          <Select
            label={text.invalid}
            placeholder={text.chooseAnOption}
            isInvalid
            errorMessage={text.errorMessage}
          >
            {renderGenericOptions(text)}
          </Select>
          <Select
            label={text.invalidWithoutMessage}
            placeholder={text.chooseAnOption}
            isInvalid
            description={text.helperTextHidden}
          >
            {renderGenericOptions(text)}
          </Select>
          <Select label={text.disabled} placeholder={text.chooseAnOption} isDisabled>
            {renderGenericOptions(text)}
          </Select>
          <Select label={text.selected} defaultSelectedKey="b" description={text.selectedValue}>
            {renderGenericOptions(text)}
          </Select>
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Outline
          </span>
          <Select
            appearance="outline"
            label={text.default}
            placeholder={text.chooseAnOption}
            description={text.helperText}
          >
            {renderGenericOptions(text)}
          </Select>
          <Select
            appearance="outline"
            label={text.invalid}
            placeholder={text.chooseAnOption}
            isInvalid
            errorMessage={text.errorMessage}
          >
            {renderGenericOptions(text)}
          </Select>
          <Select
            appearance="outline"
            label={text.invalidWithoutMessage}
            placeholder={text.chooseAnOption}
            isInvalid
            description={text.helperTextHidden}
          >
            {renderGenericOptions(text)}
          </Select>
          <Select
            appearance="outline"
            label={text.disabled}
            placeholder={text.chooseAnOption}
            isDisabled
          >
            {renderGenericOptions(text)}
          </Select>
          <Select
            appearance="outline"
            label={text.selected}
            defaultSelectedKey="b"
            description={text.selectedValue}
          >
            {renderGenericOptions(text)}
          </Select>
        </div>
      </div>
    );
  },
};
