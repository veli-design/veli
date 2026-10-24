import { useEffect, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { Input } from '@veli-design/react/input';
import { useVeliLanguage } from '@veli-design/react/provider';
import {
  ArrowRightIcon,
  CalendarBlankIcon,
  CaretDownIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  WarningCircleIcon,
} from '@phosphor-icons/react';

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function InputDocsContainer(props: DocsContainerProps) {
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
    placeholder: 'ޕްލޭސްހޯލްޑަރ',
    helperText: 'އެހީތެރިވެދޭ ލިޔުން',
    default: 'އާދައިގެ',
    invalid: 'ސައްޙަނޫން',
    disabled: 'ބޭނުންނުކުރެވޭ',
    readOnly: 'ކިޔަން އެކަނި',
  },
  input: {
    lockedValue: 'ލޮކްޑް ވެލިއު',
    errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
    infoTip: 'މި ފީލްޑަށް ބޭނުންވާ މަޢުލޫމާތު ބަލާ ލިޔުއްވާ.',
    infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
    action: 'އެކްޝަން',
    email: 'އީމެއިލް',
    password: 'ޕާސްވޯޑް',
    phone: 'ފޯނު ނަންބަރު',
    website: 'ވެބްސައިޓް',
  },
} as const;

const enFormText = {
  core: {
    label: 'Label',
    placeholder: 'Placeholder',
    helperText: 'Helper text',
    default: 'Default',
    invalid: 'Invalid',
    disabled: 'Disabled',
    readOnly: 'Read only',
  },
  input: {
    lockedValue: 'Locked value',
    errorMessage: 'This field needs attention.',
    infoTip: 'Use this field for the requested supporting information.',
    infoTipLabel: 'More information',
    action: 'Action',
    email: 'Email',
    password: 'Password',
    phone: 'Phone number',
    website: 'Website',
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

const useInputText = () => localizedInputText[useInputLanguage()];

const inputArgText = {
  label: {
    en: enFormText.core.label,
    dv: dhivehiFormText.core.label,
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
  errorMessage: {
    en: enFormText.input.errorMessage,
    dv: dhivehiFormText.input.errorMessage,
  },
} as const;

const inputIconOptions = [
  'none',
  'link',
  'search',
  'calendar',
  'caretDown',
  'arrowRight',
  'warning',
] as const;

type InputIconOption = (typeof inputIconOptions)[number];
type InputArgTextKey = keyof typeof inputArgText;
type InputStoryArgs = ComponentProps<typeof Input> & {
  showInfoTooltip: boolean;
  showAction: boolean;
  showLabelIcon: boolean;
  startAddonIcon: InputIconOption;
  startContentIcon: InputIconOption;
  endContentIcon: InputIconOption;
  endAddonIcon: InputIconOption;
};

const inputArgTextKeys = Object.keys(inputArgText) as InputArgTextKey[];

const getInputPreviewKey = (
  language: InputLanguage,
  defaultValue: InputStoryArgs['defaultValue'],
) => `${language}:${typeof defaultValue === 'string' ? defaultValue : ''}`;

const hiddenNativeInputArgTypes = {
  autoCapitalize: { control: false, table: { disable: true } },
  autoComplete: { control: false, table: { disable: true } },
  autoCorrect: { control: false, table: { disable: true } },
  enterKeyHint: { control: false, table: { disable: true } },
  inputMode: { control: false, table: { disable: true } },
  minLength: { control: false, table: { disable: true } },
  pattern: { control: false, table: { disable: true } },
  spellCheck: { control: false, table: { disable: true } },
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

const renderInputIcon = (icon: InputIconOption, size = 20): ReactNode => {
  switch (icon) {
    case 'link':
      return <LinkSimpleIcon size={size} />;
    case 'search':
      return <MagnifyingGlassIcon size={size} />;
    case 'calendar':
      return <CalendarBlankIcon size={size} />;
    case 'caretDown':
      return <CaretDownIcon size={size} />;
    case 'arrowRight':
      return <ArrowRightIcon size={size} />;
    case 'warning':
      return <WarningCircleIcon size={size} />;
    case 'none':
      return undefined;
  }
};

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
      const { description, infoTooltip, infoTooltipAriaLabel, label, placeholder, errorMessage } =
        args;

      useEffect(() => {
        const nextArgs: Partial<Record<InputArgTextKey, string>> = {};
        const currentArgs = {
          description,
          infoTooltip,
          infoTooltipAriaLabel,
          label,
          placeholder,
          errorMessage,
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
      container: InputDocsContainer,
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
      type: {
        control: 'select',
        options: ['text', 'email', 'password', 'search', 'url', 'tel'],
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
      maxLength: {
        control: 'number',
      },
      startAddonIcon: {
        control: 'select',
        options: inputIconOptions,
      },
      startContentIcon: {
        control: 'select',
        options: inputIconOptions,
      },
      endContentIcon: {
        control: 'select',
        options: inputIconOptions,
      },
      endAddonIcon: {
        control: 'select',
        options: inputIconOptions,
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
    action: { control: false, table: { disable: true } },
    labelIcon: { control: false, table: { disable: true } },
    startAddon: { control: false, table: { disable: true } },
    startContent: { control: false, table: { disable: true } },
    endContent: { control: false, table: { disable: true } },
    endAddon: { control: false, table: { disable: true } },
    ...hiddenNativeInputArgTypes,
  },
  args: {
    appearance: 'default',
    size: 'md',
    label: enFormText.core.label,
    isOptional: true,
    infoTooltip: enFormText.input.infoTip,
    infoTooltipAriaLabel: enFormText.input.infoTipLabel,
    showInfoTooltip: true,
    showLabelIcon: false,
    showAction: false,
    type: 'text',
    placeholder: enFormText.core.placeholder,
    defaultValue: '',
    description: enFormText.core.helperText,
    startAddonIcon: 'none',
    startContentIcon: 'none',
    endContentIcon: 'none',
    endAddonIcon: 'none',
    isRequired: false,
    showRequiredIndicator: true,
    isInvalid: false,
    errorMessage: enFormText.input.errorMessage,
    isDisabled: false,
    isReadOnly: false,
  },
} satisfies Meta<InputStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useInputLanguage();
    const {
      endAddonIcon,
      endContentIcon,
      showAction,
      showInfoTooltip,
      showLabelIcon,
      startAddonIcon,
      startContentIcon,
      ...inputArgs
    } = args;

    return (
      <div key={getInputPreviewKey(language, args.defaultValue)} className="w-[320px]">
        <Input
          {...inputArgs}
          label={getLocalizedInputArgText('label', args.label, language)}
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
          labelIcon={showLabelIcon ? <WarningCircleIcon size={16} /> : undefined}
          action={showAction ? localizedInputText[language].input.action : undefined}
          placeholder={getLocalizedInputArgText('placeholder', args.placeholder, language)}
          description={getLocalizedInputArgText('description', args.description, language)}
          errorMessage={getLocalizedInputArgText('errorMessage', args.errorMessage, language)}
          startAddon={renderInputIcon(startAddonIcon, 16)}
          startContent={renderInputIcon(startContentIcon)}
          endContent={renderInputIcon(endContentIcon)}
          endAddon={renderInputIcon(endAddonIcon, 16)}
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
    const language = useInputLanguage();
    const text = useInputText();

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
                <Input
                  size={size}
                  appearance={appearance}
                  label={text.core.label}
                  isOptional
                  placeholder={text.core.placeholder}
                  description={text.core.helperText}
                />
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
    const language = useInputLanguage();
    const text = useInputText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-4">
            <Input
              appearance={appearance}
              label={text.core.default}
              isOptional
              placeholder={text.core.placeholder}
              description={text.core.helperText}
            />
            <Input
              appearance={appearance}
              label={text.core.invalid}
              isOptional
              placeholder={text.core.placeholder}
              errorMessage={text.input.errorMessage}
              isInvalid
            />
            <Input
              appearance={appearance}
              label={text.core.disabled}
              isOptional
              placeholder={text.core.placeholder}
              description={text.core.helperText}
              isDisabled
            />
            <Input
              appearance={appearance}
              label={text.core.readOnly}
              isOptional
              defaultValue={text.input.lockedValue}
              description={text.core.helperText}
              isReadOnly
            />
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

export const Slots: Story = {
  args: {
    showLabelIcon: true,
    showAction: true,
    startAddonIcon: 'search',
    startContentIcon: 'calendar',
    endContentIcon: 'caretDown',
    endAddonIcon: 'arrowRight',
  },
  render: Default.render,
};

export const InputTypes: Story = {
  render: () => {
    const language = useInputLanguage();
    const text = useInputText();

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        <Input label={text.input.email} type="email" placeholder={text.core.placeholder} />
        <Input label={text.input.password} type="password" placeholder={text.core.placeholder} />
        <Input label={text.input.website} type="url" placeholder={text.core.placeholder} />
        <Input label={text.input.phone} type="tel" placeholder={text.core.placeholder} />
      </div>
    );
  },
};
