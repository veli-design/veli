import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { Checkbox, CheckboxGroup } from '@tradenetcorp/veli-ui/checkbox';
import { FieldDescription, FieldError, FieldLabel } from '@tradenetcorp/veli-ui/field';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Radio, RadioGroup } from '@tradenetcorp/veli-ui/radio';

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');
  toggle?.click();
};

function FieldDocsContainer(props: DocsContainerProps) {
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

const enFieldText = {
  label: 'Plan',
  description: 'You can change this later.',
  errorMessage: 'Choose a plan to continue.',
  optionBasic: 'Basic',
  optionPro: 'Pro',
  channelsLabel: 'Notification channels',
  channelsDescription: 'Where should we send updates?',
  email: 'Email',
  sms: 'SMS',
  default: 'Default',
  invalid: 'Invalid',
  disabled: 'Disabled',
} as const;

const dvFieldText = {
  label: 'ލޭބަލްގެ ލިޔުން',
  description: 'ތަފްޞީލު ލިޔުން',
  errorMessage: 'މި ފީލްޑަށް ސަމާލުކަމެއް ބޭނުންވެއެވެ.',
  optionBasic: 'އޮޕްޝަން އޭ',
  optionPro: 'އޮޕްޝަން ބީ',
  channelsLabel: 'ލޭބަލްގެ ލިޔުން',
  channelsDescription: 'ތަފްޞީލު ލިޔުން',
  email: 'އޮޕްޝަން 1',
  sms: 'އޮޕްޝަން 2',
  default: 'އާދައިގެ',
  invalid: 'ސައްޙަނޫން',
  disabled: 'ބޭނުންނުކުރެވޭ',
} as const;

const localizedFieldText = {
  en: enFieldText,
  dv: dvFieldText,
} as const;

type FieldLanguage = keyof typeof localizedFieldText;

const fieldArgText = {
  label: { en: enFieldText.label, dv: dvFieldText.label },
  description: { en: enFieldText.description, dv: dvFieldText.description },
  errorMessage: { en: enFieldText.errorMessage, dv: dvFieldText.errorMessage },
  optionBasic: { en: enFieldText.optionBasic, dv: dvFieldText.optionBasic },
  optionPro: { en: enFieldText.optionPro, dv: dvFieldText.optionPro },
} as const;

type FieldArgTextKey = keyof typeof fieldArgText;

const fieldArgTextKeys = Object.keys(fieldArgText) as FieldArgTextKey[];

type FieldStoryArgs = {
  size: NonNullable<ComponentProps<typeof FieldLabel>['size']>;
  label: string;
  description: string;
  errorMessage: string;
  optionBasic: string;
  optionPro: string;
  isInvalid: boolean;
  isDisabled: boolean;
  isRequired: boolean;
  isOptional: boolean;
  showRequiredIndicator: boolean;
  defaultValue: string;
};

const useFieldLanguage = (): FieldLanguage => {
  const { direction } = useVeliLanguage();
  return direction === 'rtl' ? 'dv' : 'en';
};

const useFieldText = () => localizedFieldText[useFieldLanguage()];

const getLocalizedFieldArgText = (
  key: FieldArgTextKey,
  value: unknown,
  language: FieldLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return fieldArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(fieldArgText[key]);
  if (localizedValues.includes(value)) {
    return fieldArgText[key][language];
  }

  return value;
};

const getFieldPreviewKey = (language: FieldLanguage, defaultValue: string) =>
  `${language}:${defaultValue}`;

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

const meta = {
  title: 'Components/Field',
  decorators: [
    (Story, context) => {
      const language: FieldLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs<FieldStoryArgs>();
      const { description, errorMessage, label, optionBasic, optionPro } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<FieldArgTextKey, string>> = {};
        const currentArgs = { description, errorMessage, label, optionBasic, optionPro };

        fieldArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedFieldArgText(key, currentArgs[key], language);
          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [description, errorMessage, label, optionBasic, optionPro, language, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
    },
    docs: {
      container: FieldDocsContainer,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      size: {
        control: 'select',
        options: ['sm', 'md', 'lg'],
      },
    }),
    ...withArgCategory('Label', {
      label: { control: 'text' },
      isOptional: { control: 'boolean' },
      showRequiredIndicator: { control: 'boolean' },
    }),
    ...withArgCategory('Content', {
      description: { control: 'text' },
      optionBasic: { control: 'text' },
      optionPro: { control: 'text' },
      defaultValue: { control: 'text' },
    }),
    ...withArgCategory('State', {
      isRequired: { control: 'boolean' },
      isInvalid: { control: 'boolean' },
      errorMessage: { control: 'text' },
      isDisabled: { control: 'boolean' },
    }),
    className: { table: { disable: true } },
  },
  args: {
    size: 'md',
    label: enFieldText.label,
    description: enFieldText.description,
    errorMessage: enFieldText.errorMessage,
    optionBasic: enFieldText.optionBasic,
    optionPro: enFieldText.optionPro,
    isInvalid: false,
    isDisabled: false,
    isRequired: false,
    isOptional: false,
    showRequiredIndicator: true,
    defaultValue: 'pro',
  },
} satisfies Meta<FieldStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useFieldLanguage();
    const label = getLocalizedFieldArgText('label', args.label, language);
    const description = getLocalizedFieldArgText('description', args.description, language);
    const errorMessage = getLocalizedFieldArgText('errorMessage', args.errorMessage, language);
    const optionBasic = getLocalizedFieldArgText('optionBasic', args.optionBasic, language);
    const optionPro = getLocalizedFieldArgText('optionPro', args.optionPro, language);

    return (
      <div key={getFieldPreviewKey(language, args.defaultValue)} className="w-[320px]">
        <RadioGroup
          className="gap-3"
          defaultValue={args.defaultValue}
          isInvalid={args.isInvalid}
          isDisabled={args.isDisabled}
          isRequired={args.isRequired}
        >
          <FieldLabel
            size={args.size}
            isOptional={args.isOptional}
            showRequiredIndicator={args.showRequiredIndicator}
          >
            {label}
          </FieldLabel>
          {!args.isInvalid ? (
            <FieldDescription size={args.size}>{description}</FieldDescription>
          ) : null}
          <Radio value="basic">{optionBasic}</Radio>
          <Radio value="pro">{optionPro}</Radio>
          {args.isInvalid ? <FieldError size={args.size}>{errorMessage}</FieldError> : null}
        </RadioGroup>
      </div>
    );
  },
};

export const CheckboxGroupLabel: Story = {
  name: 'CheckboxGroup',
  render: () => {
    const language = useFieldLanguage();
    const text = useFieldText();

    return (
      <div key={language} className="w-[320px]">
        <CheckboxGroup className="gap-3" defaultValue={['email']}>
          <FieldLabel>{text.channelsLabel}</FieldLabel>
          <FieldDescription>{text.channelsDescription}</FieldDescription>
          <Checkbox value="email">{text.email}</Checkbox>
          <Checkbox value="sms">{text.sms}</Checkbox>
        </CheckboxGroup>
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const language = useFieldLanguage();
    const text = useFieldText();

    return (
      <div key={language} className="flex w-[320px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.default}
          </span>
          <RadioGroup className="gap-3" defaultValue="pro">
            <FieldLabel>{text.label}</FieldLabel>
            <FieldDescription>{text.description}</FieldDescription>
            <Radio value="basic">{text.optionBasic}</Radio>
            <Radio value="pro">{text.optionPro}</Radio>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.invalid}
          </span>
          <RadioGroup className="gap-3" isInvalid>
            <FieldLabel>{text.label}</FieldLabel>
            <Radio value="basic">{text.optionBasic}</Radio>
            <Radio value="pro">{text.optionPro}</Radio>
            <FieldError>{text.errorMessage}</FieldError>
          </RadioGroup>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.disabled}
          </span>
          <RadioGroup className="gap-3" defaultValue="pro" isDisabled>
            <FieldLabel>{text.label}</FieldLabel>
            <FieldDescription>{text.description}</FieldDescription>
            <Radio value="basic">{text.optionBasic}</Radio>
            <Radio value="pro">{text.optionPro}</Radio>
          </RadioGroup>
        </div>
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const language = useFieldLanguage();
    const text = useFieldText();

    return (
      <div key={language} className="flex w-[320px] flex-col gap-8">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
            </span>
            <RadioGroup className="gap-3" defaultValue="pro">
              <FieldLabel size={size}>{text.label}</FieldLabel>
              <FieldDescription size={size}>{text.description}</FieldDescription>
              <Radio value="basic">{text.optionBasic}</Radio>
              <Radio value="pro">{text.optionPro}</Radio>
            </RadioGroup>
          </div>
        ))}
      </div>
    );
  },
};
