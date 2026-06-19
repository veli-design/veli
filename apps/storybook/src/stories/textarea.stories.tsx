import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { TextArea } from '@tradenetcorp/veli-ui/textarea';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const dhivehiFormText = {
  core: {
    label: 'ލޭބަލް',
    optional: 'އިޚްތިޔާރީ',
    placeholder: 'ލިޔުއްވާ',
    helperText: 'އެހީތެރިވެދޭ ލިޔުން',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    readOnly: 'ކިޔަން އެކަނި',
    required: 'ފުރިހަމަކުރަންޖެހޭ',
  },
  textarea: {
    infoTip: 'މި ފީލްޑަށް ބޭނުންވާ މަޢުލޫމާތު ބަލާ ލިޔުއްވާ.',
    infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
    errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
    filledValue: 'ލިޔުވި ލިޔުން',
    disabledValue: 'ބޭނުންނުކުރެވޭ ލިޔުން',
    lockedValue: 'ލޮކްޑް ލިޔުން',
  },
} as const;

const enFormText = {
  core: {
    label: 'Label',
    optional: 'Optional',
    placeholder: 'Text',
    helperText: 'Helper text',
    default: 'Default',
    invalid: 'Invalid',
    disabled: 'Disabled',
    readOnly: 'Read only',
    required: 'Required',
  },
  textarea: {
    infoTip: 'Use this field for the requested supporting information.',
    infoTipLabel: 'More information',
    errorMessage: 'This field needs attention.',
    filledValue: 'Entered text',
    disabledValue: 'Disabled text',
    lockedValue: 'Locked text',
  },
} as const;

const localizedTextAreaText = {
  en: enFormText,
  dv: dhivehiFormText,
} as const;

type TextAreaLanguage = keyof typeof localizedTextAreaText;

const useTextAreaLanguage = (): TextAreaLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useTextAreaText = () => {
  const language = useTextAreaLanguage();

  return localizedTextAreaText[language];
};

const textareaArgText = {
  label: {
    en: enFormText.core.label,
    dv: dhivehiFormText.core.label,
  },
  labelSupplementary: {
    en: enFormText.core.optional,
    dv: dhivehiFormText.core.optional,
  },
  infoTooltip: {
    en: enFormText.textarea.infoTip,
    dv: dhivehiFormText.textarea.infoTip,
  },
  infoTooltipAriaLabel: {
    en: enFormText.textarea.infoTipLabel,
    dv: dhivehiFormText.textarea.infoTipLabel,
  },
  placeholder: {
    en: enFormText.core.placeholder,
    dv: dhivehiFormText.core.placeholder,
  },
  description: {
    en: enFormText.core.helperText,
    dv: dhivehiFormText.core.helperText,
  },
  errorMessage: {
    en: enFormText.textarea.errorMessage,
    dv: dhivehiFormText.textarea.errorMessage,
  },
  defaultValue: {
    en: enFormText.textarea.filledValue,
    dv: dhivehiFormText.textarea.filledValue,
  },
} as const;

type TextAreaArgTextKey = keyof typeof textareaArgText;
type TextAreaStoryArgs = ComponentProps<typeof TextArea> & {
  showOptional: boolean;
  showInfoTooltip: boolean;
};

const textareaArgTextKeys = Object.keys(textareaArgText) as TextAreaArgTextKey[];

const hiddenNativeTextAreaArgTypes = {
  autoCapitalize: { control: false, table: { disable: true } },
  autoComplete: { control: false, table: { disable: true } },
  autoCorrect: { control: false, table: { disable: true } },
  enterKeyHint: { control: false, table: { disable: true } },
  inputMode: { control: false, table: { disable: true } },
  minLength: { control: false, table: { disable: true } },
  rows: { control: false, table: { disable: true } },
  spellCheck: { control: false, table: { disable: true } },
  wrap: { control: false, table: { disable: true } },
} as const;

const getLocalizedTextAreaArgText = (
  key: TextAreaArgTextKey,
  value: unknown,
  language: TextAreaLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return textareaArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(textareaArgText[key]);

  if (localizedValues.includes(value)) {
    return textareaArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/TextArea',
  component: TextArea,
  decorators: [
    (Story, context) => {
      const language: TextAreaLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const {
        description,
        infoTooltip,
        infoTooltipAriaLabel,
        label,
        labelSupplementary,
        placeholder,
        errorMessage,
        defaultValue,
      } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<TextAreaArgTextKey, string>> = {};
        const currentArgs = {
          description,
          infoTooltip,
          infoTooltipAriaLabel,
          label,
          labelSupplementary,
          placeholder,
          errorMessage,
          defaultValue,
        };

        textareaArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedTextAreaArgText(key, currentArgs[key], language);

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
        errorMessage,
        defaultValue,
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
    showCharacterCounter: {
      control: 'boolean',
    },
    placeholder: {
      control: 'text',
    },
    defaultValue: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    errorMessage: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'skeleton'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    maxLength: {
      control: 'number',
    },
    isDisabled: {
      control: 'boolean',
    },
    isInvalid: {
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
    isResizable: {
      control: 'boolean',
    },
    minHeight: {
      control: 'number',
    },
    maxHeight: {
      control: 'number',
    },
    ...hiddenNativeTextAreaArgTypes,
  },
  args: {
    label: enFormText.core.label,
    labelSupplementary: enFormText.core.optional,
    infoTooltip: enFormText.textarea.infoTip,
    infoTooltipAriaLabel: enFormText.textarea.infoTipLabel,
    showOptional: true,
    showInfoTooltip: true,
    showCharacterCounter: true,
    placeholder: enFormText.core.placeholder,
    description: enFormText.core.helperText,
    errorMessage: enFormText.textarea.errorMessage,
    maxLength: 100,
    defaultValue: enFormText.textarea.filledValue,
    isInvalid: false,
    isDisabled: false,
    isReadOnly: false,
    isRequired: false,
    showRequiredIndicator: true,
    isResizable: true,
  },
} satisfies Meta<TextAreaStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useTextAreaLanguage();
    const { showInfoTooltip, showOptional, ...textareaArgs } = args;

    return (
      <div key={language} className="w-[320px]">
        <TextArea
          {...textareaArgs}
          label={getLocalizedTextAreaArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedTextAreaArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedTextAreaArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedTextAreaArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedTextAreaArgText('placeholder', args.placeholder, language)}
          defaultValue={getLocalizedTextAreaArgText('defaultValue', args.defaultValue, language)}
          description={getLocalizedTextAreaArgText('description', args.description, language)}
          errorMessage={getLocalizedTextAreaArgText('errorMessage', args.errorMessage, language)}
        />
      </div>
    );
  },
};

export const Outline: Story = {
  args: {
    variant: 'outline',
  },
  render: Default.render,
};

export const Resizable: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Drag the corner grip to resize vertically. The native browser handle is hidden; only the design-system grip is shown.',
      },
    },
  },
  render: (args) => {
    const language = useTextAreaLanguage();
    const { showInfoTooltip, showOptional, ...textareaArgs } = args;

    return (
      <div key={language} className="w-[320px]">
        <TextArea
          {...textareaArgs}
          label={getLocalizedTextAreaArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedTextAreaArgText('labelSupplementary', args.labelSupplementary, language)
              : undefined
          }
          infoTooltip={
            showInfoTooltip
              ? getLocalizedTextAreaArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedTextAreaArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
          placeholder={getLocalizedTextAreaArgText('placeholder', args.placeholder, language)}
          description={getLocalizedTextAreaArgText('description', args.description, language)}
          maxHeight={320}
          defaultValue=""
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const language = useTextAreaLanguage();
    const text = useTextAreaText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Default
          </span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
              </span>
              <TextArea
                size={size}
                label={text.core.label}
                labelSupplementary={text.core.optional}
                placeholder={text.core.placeholder}
                description={text.core.helperText}
                maxLength={100}
                defaultValue={text.textarea.filledValue}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
            Outline
          </span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
                {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
              </span>
              <TextArea
                size={size}
                variant="outline"
                label={text.core.label}
                labelSupplementary={text.core.optional}
                placeholder={text.core.placeholder}
                description={text.core.helperText}
                maxLength={100}
                defaultValue={text.textarea.filledValue}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const language = useTextAreaLanguage();
    const text = useTextAreaText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-4">
          <TextArea
            label={text.core.label}
            labelSupplementary={text.core.optional}
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
            defaultValue={text.textarea.filledValue}
          />
          <TextArea
            label={text.core.invalid}
            labelSupplementary={text.core.optional}
            placeholder={text.core.placeholder}
            errorMessage={text.textarea.errorMessage}
            maxLength={100}
            defaultValue={text.textarea.filledValue}
            isInvalid
          />
          <TextArea
            label={text.core.disabled}
            labelSupplementary={text.core.optional}
            description={text.core.helperText}
            maxLength={100}
            defaultValue={text.textarea.disabledValue}
            isDisabled
          />
          <TextArea
            label={text.core.readOnly}
            labelSupplementary={text.core.optional}
            description={text.core.helperText}
            maxLength={100}
            defaultValue={text.textarea.lockedValue}
            isReadOnly
          />
        </div>
        <div className="flex flex-col gap-4">
          <TextArea
            variant="outline"
            label={text.core.label}
            labelSupplementary={text.core.optional}
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
            defaultValue={text.textarea.filledValue}
          />
          <TextArea
            variant="outline"
            label={text.core.invalid}
            labelSupplementary={text.core.optional}
            placeholder={text.core.placeholder}
            errorMessage={text.textarea.errorMessage}
            maxLength={100}
            defaultValue={text.textarea.filledValue}
            isInvalid
          />
          <TextArea
            variant="outline"
            label={text.core.disabled}
            labelSupplementary={text.core.optional}
            description={text.core.helperText}
            maxLength={100}
            defaultValue={text.textarea.disabledValue}
            isDisabled
          />
          <TextArea
            variant="outline"
            label={text.core.readOnly}
            labelSupplementary={text.core.optional}
            description={text.core.helperText}
            maxLength={100}
            defaultValue={text.textarea.lockedValue}
            isReadOnly
          />
        </div>
      </div>
    );
  },
};

export const Skeleton: Story = {
  render: () => (
    <div className="flex w-[320px] flex-col gap-8">
      <TextArea
        variant="skeleton"
        size="sm"
        label="Label"
        description="Helper text"
        maxLength={100}
      />
      <TextArea
        variant="skeleton"
        size="md"
        label="Label"
        description="Helper text"
        maxLength={100}
      />
      <TextArea
        variant="skeleton"
        size="lg"
        label="Label"
        description="Helper text"
        maxLength={100}
      />
    </div>
  ),
};
