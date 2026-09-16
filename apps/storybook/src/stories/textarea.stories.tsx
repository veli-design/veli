import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { TextArea } from '@tradenetcorp/veli-ui/textarea';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { WarningCircle } from 'phosphor-react';

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function TextAreaDocsContainer(props: DocsContainerProps) {
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
} as const;

type TextAreaArgTextKey = keyof typeof textareaArgText;
type TextAreaStoryArgs = ComponentProps<typeof TextArea> & {
  showInfoTooltip: boolean;
};

const textareaArgTextKeys = Object.keys(textareaArgText) as TextAreaArgTextKey[];

const getTextAreaPreviewKey = (
  language: TextAreaLanguage,
  defaultValue: TextAreaStoryArgs['defaultValue'],
) => `${language}:${typeof defaultValue === 'string' ? defaultValue : ''}`;

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
      const { description, infoTooltip, infoTooltipAriaLabel, label, placeholder, errorMessage } =
        args;

      useEffect(() => {
        const nextArgs: Partial<Record<TextAreaArgTextKey, string>> = {};
        const currentArgs = {
          description,
          infoTooltip,
          infoTooltipAriaLabel,
          label,
          placeholder,
          errorMessage,
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
        placeholder,
        errorMessage,
        language,
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
      container: TextAreaDocsContainer,
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
    }),
    ...withArgCategory('Content', {
      placeholder: {
        control: 'text',
      },
      defaultValue: {
        control: 'text',
      },
      description: {
        control: 'text',
      },
      maxLength: {
        control: 'number',
      },
      showCharacterCounter: {
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
      isReadOnly: {
        control: 'boolean',
      },
    }),
    ref: { table: { disable: true } },
    className: { table: { disable: true } },
    labelIcon: { control: false, table: { disable: true } },
    ...hiddenNativeTextAreaArgTypes,
  },
  args: {
    appearance: 'default',
    size: 'md',
    label: enFormText.core.label,
    isOptional: true,
    infoTooltip: enFormText.textarea.infoTip,
    infoTooltipAriaLabel: enFormText.textarea.infoTipLabel,
    showInfoTooltip: true,
    placeholder: enFormText.core.placeholder,
    defaultValue: '',
    description: enFormText.core.helperText,
    maxLength: 100,
    showCharacterCounter: true,
    isResizable: true,
    isRequired: false,
    showRequiredIndicator: true,
    isInvalid: false,
    errorMessage: enFormText.textarea.errorMessage,
    isDisabled: false,
    isReadOnly: false,
  },
} satisfies Meta<TextAreaStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useTextAreaLanguage();
    const { showInfoTooltip, ...textareaArgs } = args;

    return (
      <div key={getTextAreaPreviewKey(language, args.defaultValue)} className="w-[320px]">
        <TextArea
          {...textareaArgs}
          label={getLocalizedTextAreaArgText('label', args.label, language)}
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
          errorMessage={getLocalizedTextAreaArgText('errorMessage', args.errorMessage, language)}
        />
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
    const language = useTextAreaLanguage();
    const text = useTextAreaText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Default
          </span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
                {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
              </span>
              <TextArea
                size={size}
                label={text.core.label}
                isOptional
                placeholder={text.core.placeholder}
                description={text.core.helperText}
                maxLength={100}
              />
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-8">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Outline
          </span>
          {(['sm', 'md', 'lg'] as const).map((size) => (
            <div key={size} className="flex flex-col gap-4">
              <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
                {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
              </span>
              <TextArea
                size={size}
                appearance="outline"
                label={text.core.label}
                isOptional
                placeholder={text.core.placeholder}
                description={text.core.helperText}
                maxLength={100}
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
            label={text.core.default}
            isOptional
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
          />
          <TextArea
            label={text.core.invalid}
            isOptional
            placeholder={text.core.placeholder}
            errorMessage={text.textarea.errorMessage}
            maxLength={100}
            isInvalid
          />
          <TextArea
            label={text.core.disabled}
            isOptional
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
            isDisabled
          />
          <TextArea
            label={text.core.readOnly}
            isOptional
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
            isReadOnly
          />
        </div>
        <div className="flex flex-col gap-4">
          <TextArea
            appearance="outline"
            label={text.core.default}
            isOptional
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
          />
          <TextArea
            appearance="outline"
            label={text.core.invalid}
            isOptional
            placeholder={text.core.placeholder}
            errorMessage={text.textarea.errorMessage}
            maxLength={100}
            isInvalid
          />
          <TextArea
            appearance="outline"
            label={text.core.disabled}
            isOptional
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
            isDisabled
          />
          <TextArea
            appearance="outline"
            label={text.core.readOnly}
            isOptional
            placeholder={text.core.placeholder}
            description={text.core.helperText}
            maxLength={100}
            isReadOnly
          />
        </div>
      </div>
    );
  },
};

export const Required: Story = {
  args: {
    isRequired: true,
    isOptional: false,
    showCharacterCounter: false,
    maxLength: undefined,
  },
  render: Default.render,
};

export const LabelIcon: Story = {
  render: (args) => {
    const language = useTextAreaLanguage();
    const { showInfoTooltip, ...textareaArgs } = args;

    return (
      <div key={getTextAreaPreviewKey(language, args.defaultValue)} className="w-[320px]">
        <TextArea
          {...textareaArgs}
          label={getLocalizedTextAreaArgText('label', args.label, language)}
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
          labelIcon={<WarningCircle size={16} />}
          placeholder={getLocalizedTextAreaArgText('placeholder', args.placeholder, language)}
          description={getLocalizedTextAreaArgText('description', args.description, language)}
          errorMessage={getLocalizedTextAreaArgText('errorMessage', args.errorMessage, language)}
        />
      </div>
    );
  },
};

export const NotResizable: Story = {
  args: {
    isResizable: false,
  },
  render: Default.render,
};
