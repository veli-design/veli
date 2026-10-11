import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { BankIcon, InfoIcon, MagnifyingGlassIcon, WalletIcon } from '@phosphor-icons/react';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Select, SelectItem, SelectSection } from '@tradenetcorp/veli-ui/select';

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function SelectDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tryCollapse = () => {
      if (cancelled) {
        return;
      }

      const tableReady = collapsedControlGroups.every(
        (group) =>
          document.querySelector(
            `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
          ) != null,
      );

      if (!tableReady && attempts < 40) {
        attempts += 1;
        requestAnimationFrame(tryCollapse);
        return;
      }

      collapsedControlGroups.forEach(collapseControlGroup);
    };

    tryCollapse();

    return () => {
      cancelled = true;
    };
  }, []);

  return <DocsContainer {...props} />;
}

const selectText = {
  en: {
    label: 'Label',
    chooseAnOption: 'Choose an option',
    helperText: 'Helper text',
    default: 'Default',
    invalid: 'Invalid',
    disabled: 'Disabled',
    selected: 'Selected',
    action: 'Action',
    errorMessage: 'This field needs attention.',
    infoTip: 'Use this select to choose the requested option.',
    infoTipLabel: 'More information',
    account: 'Account',
    countries: {
      malaysia: 'Malaysia',
      singapore: 'Singapore',
      thailand: 'Thailand',
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
      unavailable: 'Unavailable for this profile',
    },
  },
  dv: {
    label: 'ލޭބަލް',
    chooseAnOption: 'އޮޕްޝަނެއް ޚިޔާރުކުރައްވާ',
    helperText: 'އެހީތެރިވެދޭ ލިޔުން',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    selected: 'ޚިޔާރުކުރެވިފައި',
    action: 'އެކްޝަން',
    errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
    infoTip: 'މި ސެލެކްޓުން ބޭނުންވާ އޮޕްޝަން ޚިޔާރުކުރައްވާ.',
    infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
    account: 'އެކައުންޓް',
    countries: {
      malaysia: 'މެލޭޝިއާ',
      singapore: 'ސިންގަޕޫރު',
      thailand: 'ތައިލެންޑް',
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
      unavailable: 'މި ޕްރޮފައިލަށް ނުލިބޭ',
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
  showInfoTooltip: boolean;
  showAction: boolean;
  showLabelIcon: boolean;
  showStartContent: boolean;
};

const selectArgTextKeys = Object.keys(selectArgText) as SelectArgTextKey[];

const withArgCategory = <T extends Record<string, object>>(category: string, argTypes: T) =>
  Object.fromEntries(
    Object.entries(argTypes).map(([name, argType]) => [
      name,
      {
        ...argType,
        table: {
          ...('table' in argType && argType.table && typeof argType.table === 'object'
            ? argType.table
            : {}),
          category,
        },
      },
    ]),
  ) as { [K in keyof T]: T[K] & { table: { category: string } } };

const useSelectLanguage = (): SelectLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useSelectText = () => selectText[useSelectLanguage()];

const getSelectPreviewKey = (
  language: SelectLanguage,
  defaultValue: SelectStoryArgs['defaultValue'],
) => `${language}:${defaultValue == null ? '' : String(defaultValue)}`;

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

const meta = {
  title: 'Components/Select',
  component: Select,
  decorators: [
    (Story, context) => {
      const language: SelectLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { description, errorMessage, infoTooltip, infoTooltipAriaLabel, label, placeholder } =
        args;

      useEffect(() => {
        const nextArgs: Partial<Record<SelectArgTextKey, string>> = {};
        const currentArgs = {
          description,
          errorMessage,
          infoTooltip,
          infoTooltipAriaLabel,
          label,
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
        language,
        placeholder,
        updateArgs,
      ]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
    },
    docs: {
      container: SelectDocsContainer,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      appearance: {
        control: 'select',
        options: ['default', 'outline'],
      },
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
      },
    }),
    ...withArgCategory('Label', {
      label: {
        control: 'text',
      },
      isOptional: {
        control: 'boolean',
      },
      infoTooltip: {
        control: 'text',
      },
      infoTooltipAriaLabel: {
        control: 'text',
      },
      showInfoTooltip: {
        control: 'boolean',
      },
      showLabelIcon: {
        control: 'boolean',
      },
      showAction: {
        control: 'boolean',
      },
    }),
    ...withArgCategory('Content', {
      placeholder: {
        control: 'text',
      },
      defaultValue: {
        control: 'select',
        options: [null, 'malaysia', 'singapore', 'thailand'],
      },
      description: {
        control: 'text',
      },
      showStartContent: {
        control: 'boolean',
      },
    }),
    ...withArgCategory('State', {
      isRequired: {
        control: 'boolean',
      },
      showRequiredIndicator: {
        control: 'boolean',
      },
      isInvalid: {
        control: 'boolean',
      },
      errorMessage: {
        control: 'text',
      },
      isDisabled: {
        control: 'boolean',
      },
    }),
    className: { table: { disable: true } },
    action: { control: false, table: { disable: true } },
    labelIcon: { control: false, table: { disable: true } },
    startContent: { control: false, table: { disable: true } },
    endContent: { control: false, table: { disable: true } },
    indicator: { control: false, table: { disable: true } },
    items: { control: false, table: { disable: true } },
    children: { control: false, table: { disable: true } },
    triggerRef: { control: false, table: { disable: true } },
    value: { control: false, table: { disable: true } },
    onChange: { control: false, table: { disable: true } },
  },
  args: {
    appearance: 'default',
    size: 'md',
    label: selectText.en.label,
    isOptional: true,
    infoTooltip: selectText.en.infoTip,
    infoTooltipAriaLabel: selectText.en.infoTipLabel,
    showInfoTooltip: true,
    showLabelIcon: false,
    showAction: false,
    placeholder: selectText.en.chooseAnOption,
    defaultValue: null,
    description: selectText.en.helperText,
    showStartContent: false,
    isRequired: false,
    showRequiredIndicator: true,
    isInvalid: false,
    errorMessage: selectText.en.errorMessage,
    isDisabled: false,
  },
} satisfies Meta<SelectStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useSelectLanguage();
    const { showAction, showInfoTooltip, showLabelIcon, showStartContent, ...selectArgs } = args;

    return (
      <div key={getSelectPreviewKey(language, args.defaultValue)} className="w-[320px]">
        <Select
          {...selectArgs}
          label={getLocalizedSelectArgText('label', args.label, language)}
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
          labelIcon={showLabelIcon ? <InfoIcon size={16} /> : undefined}
          action={showAction ? selectText[language].action : undefined}
          startContent={showStartContent ? <MagnifyingGlassIcon size={20} /> : undefined}
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
  render: Default.render,
};

export const Sizes: Story = {
  render: () => {
    const language = useSelectLanguage();
    const text = useSelectText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
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
                <Select
                  size={size}
                  appearance={appearance}
                  label={text.label}
                  isOptional
                  placeholder={text.chooseAnOption}
                  description={text.helperText}
                >
                  {renderCountryOptions(text)}
                </Select>
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
    const language = useSelectLanguage();
    const text = useSelectText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-4">
            <Select
              appearance={appearance}
              label={text.default}
              isOptional
              placeholder={text.chooseAnOption}
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
            <Select
              appearance={appearance}
              label={text.selected}
              isOptional
              defaultValue="singapore"
              description={text.helperText}
            >
              {renderCountryOptions(text)}
            </Select>
            <Select
              appearance={appearance}
              label={text.invalid}
              isOptional
              placeholder={text.chooseAnOption}
              errorMessage={text.errorMessage}
              isInvalid
            >
              {renderCountryOptions(text)}
            </Select>
            <Select
              appearance={appearance}
              label={text.disabled}
              isOptional
              placeholder={text.chooseAnOption}
              description={text.helperText}
              isDisabled
            >
              {renderCountryOptions(text)}
            </Select>
          </div>
        ))}
      </div>
    );
  },
};

export const Required: Story = {
  args: {
    isRequired: true,
    isOptional: false,
  },
  render: Default.render,
};

export const Sections: Story = {
  render: () => {
    const language = useSelectLanguage();
    const text = useSelectText();

    return (
      <div key={language} className="w-[320px]">
        <Select label={text.account} placeholder={text.chooseAnOption} defaultValue="cash">
          <SelectSection title={text.sections.popular}>
            <SelectItem
              id="cash"
              description={text.descriptions.immediateSettlement}
              startContent={<WalletIcon size={20} />}
            >
              {text.accounts.cash}
            </SelectItem>
            <SelectItem
              id="margin"
              description={text.descriptions.includesFinancing}
              startContent={<BankIcon size={20} />}
            >
              {text.accounts.margin}
            </SelectItem>
          </SelectSection>
          <SelectSection title={text.sections.other}>
            <SelectItem id="isa">{text.accounts.investmentAccount}</SelectItem>
            <SelectItem id="trust" isDisabled description={text.descriptions.unavailable}>
              {text.accounts.trustAccount}
            </SelectItem>
          </SelectSection>
        </Select>
      </div>
    );
  },
};

export const Slots: Story = {
  args: {
    showLabelIcon: true,
    showAction: true,
    showStartContent: true,
  },
  render: Default.render,
};
