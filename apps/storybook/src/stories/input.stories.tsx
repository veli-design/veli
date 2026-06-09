import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Input } from '@tradenetcorp/veli-ui/input';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import {
  ArrowRight,
  CalendarBlank,
  CaretDown,
  MagnifyingGlass,
  WarningCircle,
} from 'phosphor-react';

const dhivehiFormText = {
  core: {
    label: 'ލޭބަލް',
    optional: 'އިޚްތިޔާރީ',
    placeholder: 'ޕްލޭސްހޯލްޑަރ',
    helperText: 'އެހީތެރިވެދޭ ލިޔުން',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    invalidWithoutMessage: 'މެސެޖަކާ ނުލައި ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    readOnly: 'ކިޔަން އެކަނި',
    required: 'ފުރިހަމަކުރަންޖެހޭ',
    gridColumn: 'ގްރިޑް ކޮލަމް',
    constrained: 'ހަނިކުރެވިފައިވާ',
  },
  input: {
    enterValue: 'ވެލިއުއެއް ލިޔުއްވާ',
    disabledValue: 'ބޭނުންނުކުރެވޭ ވެލިއު',
    helperTextHidden: 'ސައްޙަނޫން ހާލަތެއްގައި މި އެހީތެރިވެދޭ ލިޔުން ނުފެންނާނެއެވެ.',
    infoTip: 'މި ފީލްޑަށް ބޭނުންވާ މަޢުލޫމާތު ބަލާ ލިޔުއްވާ.',
    infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
    usesRootWidth: 'ރޫޓް ވިޑްތު ބޭނުންކުރޭ',
    maxWidth: 'އެންމެ ފުޅާމިން',
  },
} as const;

const enFormText = {
  core: {
    label: 'Label',
    optional: 'Optional',
    placeholder: 'Placeholder',
    helperText: 'Helper text',
    default: 'Default',
    invalid: 'Invalid',
    invalidWithoutMessage: 'Invalid without message',
    disabled: 'Disabled',
    readOnly: 'Read only',
    required: 'Required',
    gridColumn: 'Grid column',
    constrained: 'Constrained',
  },
  input: {
    enterValue: 'Enter value',
    disabledValue: 'Disabled value',
    helperTextHidden: 'This helper text is hidden while invalid.',
    infoTip: 'Use this field for the requested supporting information.',
    infoTipLabel: 'More information',
    usesRootWidth: 'Uses the root width',
    maxWidth: 'Max width',
  },
} as const;

const localizedInputText = {
  en: enFormText,
  dv: dhivehiFormText,
} as const;

type InputLanguage = keyof typeof localizedInputText;

const useInputLanguage = (): InputLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useInputText = () => {
  const language = useInputLanguage();

  return localizedInputText[language];
};

const inputArgText = {
  label: {
    en: enFormText.core.label,
    dv: dhivehiFormText.core.label,
  },
  labelSupplementary: {
    en: enFormText.core.optional,
    dv: dhivehiFormText.core.optional,
  },
  infoTooltip: {
    en: enFormText.input.infoTip,
    dv: dhivehiFormText.input.infoTip,
  },
  infoTooltipAriaLabel: {
    en: enFormText.input.infoTipLabel,
    dv: dhivehiFormText.input.infoTipLabel,
  },
  placeholder: {
    en: enFormText.core.placeholder,
    dv: dhivehiFormText.core.placeholder,
  },
  description: {
    en: enFormText.core.helperText,
    dv: dhivehiFormText.core.helperText,
  },
} as const;

type InputArgTextKey = keyof typeof inputArgText;
type InputStoryArgs = ComponentProps<typeof Input> & {
  showOptional: boolean;
  showInfoTooltip: boolean;
};

const inputArgTextKeys = Object.keys(inputArgText) as InputArgTextKey[];

const getLocalizedInputArgText = (
  key: InputArgTextKey,
  value: unknown,
  language: InputLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return inputArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(inputArgText[key]);

  if (localizedValues.includes(value)) {
    return inputArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/Input',
  component: Input,
  decorators: [
    (Story, context) => {
      const language: InputLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const {
        description,
        infoTooltip,
        infoTooltipAriaLabel,
        label,
        labelSupplementary,
        placeholder,
      } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<InputArgTextKey, string>> = {};
        const currentArgs = {
          description,
          infoTooltip,
          infoTooltipAriaLabel,
          label,
          labelSupplementary,
          placeholder,
        };

        inputArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedInputArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [
        description,
        infoTooltip,
        infoTooltipAriaLabel,
        label,
        labelSupplementary,
        placeholder,
        language,
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
    showOptional: {
      control: 'boolean',
    },
    showInfoTooltip: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
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
    label: enFormText.core.label,
    labelSupplementary: enFormText.core.optional,
    infoTooltip: enFormText.input.infoTip,
    infoTooltipAriaLabel: enFormText.input.infoTipLabel,
    showOptional: true,
    showInfoTooltip: true,
    placeholder: enFormText.core.placeholder,
    description: enFormText.core.helperText,
    type: 'text',
    showRequiredIndicator: true,
  },
} satisfies Meta<InputStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useInputLanguage();
    const { showInfoTooltip, showOptional, ...inputArgs } = args;

    return (
      <div className="w-[320px]">
        <Input
          {...inputArgs}
          label={getLocalizedInputArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedInputArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedInputArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedInputArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedInputArgText('placeholder', args.placeholder, language)}
          description={getLocalizedInputArgText('description', args.description, language)}
        />
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: (args) => {
    const language = useInputLanguage();
    const { showInfoTooltip, showOptional, ...inputArgs } = args;

    return (
      <div className="w-[320px]">
        <Input
          {...inputArgs}
          label={getLocalizedInputArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedInputArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedInputArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedInputArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedInputArgText('placeholder', args.placeholder, language)}
          description={getLocalizedInputArgText('description', args.description, language)}
        />
      </div>
    );
  },
};

/**
 * Showcases all size variants of the Input component.
 */
export const Sizes: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Default
          </span>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Small (sm)
            </span>
            <Input
              size="sm"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Medium (md)
            </span>
            <Input
              size="md"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Large (lg)
            </span>
            <Input
              size="lg"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
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
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Medium (md)
            </span>
            <Input
              size="md"
              variant="outline"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Large (lg)
            </span>
            <Input
              size="lg"
              variant="outline"
              label={text.core.label}
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const RootClassName: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <Input
          className="w-full"
          label={text.core.gridColumn}
          placeholder={text.input.usesRootWidth}
          description={text.core.helperText}
        />
        <Input
          className="max-w-[240px]"
          label={text.core.constrained}
          placeholder={text.input.maxWidth}
          description={text.core.helperText}
        />
      </div>
    );
  },
};

export const FigmaExploration: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="w-[320px]">
        <Input
          label={text.core.label}
          labelSupplementary={text.core.optional}
          infoTooltip={text.input.infoTip}
          infoTooltipAriaLabel={text.input.infoTipLabel}
          isRequired
          action="Action"
          placeholder={text.core.placeholder}
          description={text.core.helperText}
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
    );
  },
};

export const ValidationStates: Story = {
  render: () => {
    const text = useInputText();

    return (
      <div className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Default
          </span>
          <Input
            label={text.core.default}
            placeholder={text.input.enterValue}
            description={text.core.helperText}
            startContent={<MagnifyingGlass size={16} />}
          />
          <Input
            label={text.core.invalid}
            placeholder={text.input.enterValue}
            isInvalid
            errorMessage="This field needs attention."
          />
          <Input
            label={text.core.invalidWithoutMessage}
            placeholder={text.input.enterValue}
            isInvalid
            description={text.input.helperTextHidden}
          />
          <Input
            label={text.core.disabled}
            placeholder={text.input.disabledValue}
            isDisabled
            startAddon={<MagnifyingGlass size={16} />}
            endAddon={<ArrowRight size={16} />}
          />
          <Input
            label={text.core.readOnly}
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
            label={text.core.default}
            placeholder={text.input.enterValue}
            description={text.core.helperText}
            startContent={<MagnifyingGlass size={16} />}
          />
          <Input
            variant="outline"
            label={text.core.invalid}
            placeholder={text.input.enterValue}
            isInvalid
            errorMessage="This field needs attention."
          />
          <Input
            variant="outline"
            label={text.core.invalidWithoutMessage}
            placeholder={text.input.enterValue}
            isInvalid
            description={text.input.helperTextHidden}
          />
          <Input
            variant="outline"
            label={text.core.disabled}
            placeholder={text.input.disabledValue}
            isDisabled
            startAddon={<MagnifyingGlass size={16} />}
            endAddon={<ArrowRight size={16} />}
          />
          <Input
            variant="outline"
            label={text.core.readOnly}
            defaultValue="Locked value"
            isReadOnly
            endContent={<CaretDown size={16} />}
          />
        </div>
      </div>
    );
  },
};
