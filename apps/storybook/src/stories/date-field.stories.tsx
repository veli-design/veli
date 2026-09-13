import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { parseDate, parseDateTime } from '@internationalized/date';
import { DateField } from '@tradenetcorp/veli-ui/date-field';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const collapsedControlGroups = ['Content', 'State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function DateFieldDocsContainer(props: DocsContainerProps) {
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

const enDateFieldText = {
  label: 'Label',
  optional: 'Optional',
  helperText: 'Helper text',
  errorMessage: 'Enter a valid service date.',
  default: 'Default',
  invalid: 'Invalid',
  disabled: 'Disabled',
  readOnly: 'Read only',
  dateOnly: 'Date only',
  dateAndMinute: 'Date and minute',
  twentyFourHourFormat: '24 hour format',
} as const;

const dhivehiDateFieldText = {
  label: 'ލޭބަލް',
  optional: 'އިޚްތިޔާރީ',
  helperText: 'އެހީތެރިވެދޭ ލިޔުން',
  errorMessage: 'ސައްޙަ ޚިދުމަތު ތާރީޚެއް ލިޔުއްވާ.',
  default: 'އާދައިގެ',
  invalid: 'ސައްޙަނޫން',
  disabled: 'ބޭނުންނުކުރެވޭ',
  readOnly: 'ކިޔަން އެކަނި',
  dateOnly: 'ތާރީޚު އެކަނި',
  dateAndMinute: 'ތާރީޚާއި މިނެޓު',
  twentyFourHourFormat: '24 ގަޑިއިރުގެ ފޯމެޓް',
} as const;

const localizedDateFieldText = {
  en: enDateFieldText,
  dv: dhivehiDateFieldText,
} as const;

type DateFieldLanguage = keyof typeof localizedDateFieldText;

const useDateFieldLanguage = (): DateFieldLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useDateFieldText = () => {
  const language = useDateFieldLanguage();

  return localizedDateFieldText[language];
};

const dateFieldArgText = {
  label: {
    en: enDateFieldText.label,
    dv: dhivehiDateFieldText.label,
  },
  labelSupplementary: {
    en: enDateFieldText.optional,
    dv: dhivehiDateFieldText.optional,
  },
  description: {
    en: enDateFieldText.helperText,
    dv: dhivehiDateFieldText.helperText,
  },
  errorMessage: {
    en: enDateFieldText.errorMessage,
    dv: dhivehiDateFieldText.errorMessage,
  },
} as const;

type DateFieldArgTextKey = keyof typeof dateFieldArgText;
type DateFieldStoryArgs = ComponentProps<typeof DateField> & {
  showOptional: boolean;
};

const dateFieldArgTextKeys = Object.keys(dateFieldArgText) as DateFieldArgTextKey[];

const getDateFieldPreviewKey = (
  language: DateFieldLanguage,
  defaultValue: DateFieldStoryArgs['defaultValue'],
) => `${language}:${defaultValue == null ? '' : String(defaultValue)}`;

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

const getLocalizedDateFieldArgText = (
  key: DateFieldArgTextKey,
  value: unknown,
  language: DateFieldLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return dateFieldArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(dateFieldArgText[key]);

  if (localizedValues.includes(value)) {
    return dateFieldArgText[key][language];
  }

  return value;
};

const hiddenDateFieldArgTypes = {
  className: { table: { disable: true } },
  inputClassName: { table: { disable: true } },
  value: { control: false, table: { disable: true } },
  defaultValue: { control: false, table: { disable: true } },
  onChange: { control: false, table: { disable: true } },
  placeholderValue: { control: false, table: { disable: true } },
  minValue: { control: false, table: { disable: true } },
  maxValue: { control: false, table: { disable: true } },
  validate: { control: false, table: { disable: true } },
  name: { control: false, table: { disable: true } },
  autoFocus: { control: false, table: { disable: true } },
  hideTimeZone: { control: false, table: { disable: true } },
  shouldForceLeadingZeros: { control: false, table: { disable: true } },
} as const;

const meta = {
  title: 'Components/DateField',
  component: DateField,
  decorators: [
    (Story, context) => {
      const language: DateFieldLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { description, errorMessage, label, labelSupplementary } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<DateFieldArgTextKey, string>> = {};
        const currentArgs = {
          description,
          errorMessage,
          label,
          labelSupplementary,
        };

        dateFieldArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedDateFieldArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [description, errorMessage, label, labelSupplementary, language, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
    },
    docs: {
      container: DateFieldDocsContainer,
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
        table: { type: { summary: 'string' } },
      },
      labelSupplementary: {
        control: 'text',
        table: { type: { summary: 'string' } },
      },
      showOptional: {
        control: 'boolean',
      },
    }),
    ...withArgCategory('Content', {
      description: {
        control: 'text',
        table: { type: { summary: 'string' } },
      },
      granularity: {
        control: 'select',
        options: ['day', 'hour', 'minute', 'second'],
      },
      hourCycle: {
        control: 'select',
        options: [12, 24],
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
        table: { type: { summary: 'string' } },
      },
      isDisabled: {
        control: 'boolean',
      },
      isReadOnly: {
        control: 'boolean',
      },
    }),
    ...hiddenDateFieldArgTypes,
  },
  args: {
    appearance: 'default',
    size: 'md',
    label: enDateFieldText.label,
    labelSupplementary: enDateFieldText.optional,
    showOptional: true,
    description: enDateFieldText.helperText,
    isRequired: false,
    showRequiredIndicator: true,
    isInvalid: false,
    errorMessage: enDateFieldText.errorMessage,
    isDisabled: false,
    isReadOnly: false,
  },
} satisfies Meta<DateFieldStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useDateFieldLanguage();
    const { showOptional, ...dateFieldArgs } = args;

    return (
      <div key={getDateFieldPreviewKey(language, args.defaultValue)} className="w-[320px]">
        <DateField
          {...dateFieldArgs}
          label={getLocalizedDateFieldArgText('label', args.label, language)}
          labelSupplementary={
            showOptional
              ? getLocalizedDateFieldArgText(
                  'labelSupplementary',
                  args.labelSupplementary,
                  language,
                )
              : undefined
          }
          description={getLocalizedDateFieldArgText('description', args.description, language)}
          errorMessage={getLocalizedDateFieldArgText('errorMessage', args.errorMessage, language)}
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
    const language = useDateFieldLanguage();
    const text = useDateFieldText();

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
              <DateField
                size={size}
                label={text.label}
                labelSupplementary={text.optional}
                description={text.helperText}
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
              <DateField
                size={size}
                appearance="outline"
                label={text.label}
                labelSupplementary={text.optional}
                description={text.helperText}
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
    const language = useDateFieldLanguage();
    const text = useDateFieldText();
    const filledValue = parseDate('2026-04-18');

    return (
      <div key={language} className="grid w-[680px] grid-cols-2 gap-[24px]">
        <div className="flex flex-col gap-4">
          <DateField
            label={text.default}
            labelSupplementary={text.optional}
            description={text.helperText}
          />
          <DateField
            label={text.invalid}
            labelSupplementary={text.optional}
            defaultValue={filledValue}
            errorMessage={text.errorMessage}
            isInvalid
          />
          <DateField
            label={text.disabled}
            labelSupplementary={text.optional}
            defaultValue={filledValue}
            description={text.helperText}
            isDisabled
          />
          <DateField
            label={text.readOnly}
            labelSupplementary={text.optional}
            defaultValue={filledValue}
            description={text.helperText}
            isReadOnly
          />
        </div>
        <div className="flex flex-col gap-4">
          <DateField
            appearance="outline"
            label={text.default}
            labelSupplementary={text.optional}
            description={text.helperText}
          />
          <DateField
            appearance="outline"
            label={text.invalid}
            labelSupplementary={text.optional}
            defaultValue={filledValue}
            errorMessage={text.errorMessage}
            isInvalid
          />
          <DateField
            appearance="outline"
            label={text.disabled}
            labelSupplementary={text.optional}
            defaultValue={filledValue}
            description={text.helperText}
            isDisabled
          />
          <DateField
            appearance="outline"
            label={text.readOnly}
            labelSupplementary={text.optional}
            defaultValue={filledValue}
            description={text.helperText}
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
    showOptional: false,
  },
  render: Default.render,
};

export const Granularity: Story = {
  render: () => {
    const language = useDateFieldLanguage();
    const text = useDateFieldText();

    return (
      <div key={language} className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
        <DateField label={text.dateOnly} defaultValue={parseDate('2026-04-18')} />
        <DateField
          label={text.dateAndMinute}
          granularity="minute"
          defaultValue={parseDateTime('2026-04-18T14:30:00')}
        />
        <DateField
          label={text.twentyFourHourFormat}
          granularity="minute"
          hourCycle={24}
          defaultValue={parseDateTime('2026-04-18T21:10:00')}
        />
      </div>
    );
  },
};
