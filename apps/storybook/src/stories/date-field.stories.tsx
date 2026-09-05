import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { getLocalTimeZone, parseDate, parseDateTime, today } from '@internationalized/date';
import { DateField } from '@tradenetcorp/veli-ui/date-field';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const now = today(getLocalTimeZone());

const enDateFieldText = {
  appointmentDate: 'Appointment date',
  typeDateSegmentBySegment: 'Type a date segment by segment.',
  helperText: 'Helper text',
  optional: 'Optional',
  dateOnly: 'Date only',
  dateAndMinute: 'Date and minute',
  twentyFourHourFormat: '24 hour format',
  required: 'Required',
  futureDatesOnly: 'Future dates only.',
  minAndMax: 'Min and max',
  selectableForTheNextMonth: 'Selectable for the next month.',
  invalid: 'Invalid',
  helperTextHiddenWhileInvalid: 'This helper text is hidden while invalid.',
  enterAValidServiceDate: 'Enter a valid service date.',
  invalidWithoutMessage: 'Invalid without message',
  disabled: 'Disabled',
  readOnly: 'Read only',
  empty: 'Empty',
  filled: 'Filled',
} as const;

const dhivehiDateFieldText = {
  appointmentDate: 'އެޕޮއިންޓްމަންޓް ތާރީޚު',
  typeDateSegmentBySegment: 'ސެގްމަންޓް އަކުން އަކަށް ތާރީޚެއް ލިޔުއްވާ.',
  helperText: 'އެހީތެރިވެދޭ ލިޔުން',
  optional: 'އިޚްތިޔާރީ',
  dateOnly: 'ތާރީޚު އެކަނި',
  dateAndMinute: 'ތާރީޚާއި މިނެޓު',
  twentyFourHourFormat: '24 ގަޑިއިރުގެ ފޯމެޓް',
  required: 'ފުރިހަމަކުރަންޖެހޭ',
  futureDatesOnly: 'ހަމައެކަނި ކުރިއަށް އޮތް ތާރީޚުތައް.',
  minAndMax: 'މިން އަދި މެކްސް',
  selectableForTheNextMonth: 'ކުރިއަށް އޮތް މަހުގެ ތެރެއިން ޚިޔާރުކުރެވޭނެއެވެ.',
  invalid: 'ސައްޙަނޫން',
  helperTextHiddenWhileInvalid: 'ސައްޙަނޫން ހާލަތެއްގައި މި އެހީތެރިވެދޭ ލިޔުން ނުފެންނާނެއެވެ.',
  enterAValidServiceDate: 'ސައްޙަ ޚިދުމަތު ތާރީޚެއް ލިޔުއްވާ.',
  invalidWithoutMessage: 'މެސެޖަކާ ނުލައި ސައްޙަނޫން',
  disabled: 'ބޭނުންނުކުރެވޭ',
  readOnly: 'ކިޔަން އެކަނި',
  empty: 'ހުސް',
  filled: 'ފުރިހަމަ',
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
    en: enDateFieldText.appointmentDate,
    dv: dhivehiDateFieldText.appointmentDate,
  },
  description: {
    en: enDateFieldText.typeDateSegmentBySegment,
    dv: dhivehiDateFieldText.typeDateSegmentBySegment,
  },
  labelSupplementary: {
    en: enDateFieldText.optional,
    dv: dhivehiDateFieldText.optional,
  },
  errorMessage: {
    en: enDateFieldText.enterAValidServiceDate,
    dv: dhivehiDateFieldText.enterAValidServiceDate,
  },
} as const;

type DateFieldArgTextKey = keyof typeof dateFieldArgText;

const dateFieldArgTextKeys = Object.keys(dateFieldArgText) as DateFieldArgTextKey[];

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
  },
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    labelSupplementary: {
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
    isReadOnly: {
      control: 'boolean',
    },
    isRequired: {
      control: 'boolean',
    },
    isInvalid: {
      control: 'boolean',
    },
    showRequiredIndicator: {
      control: 'boolean',
    },
  },
  args: {
    label: enDateFieldText.appointmentDate,
    description: enDateFieldText.typeDateSegmentBySegment,
    labelSupplementary: enDateFieldText.optional,
    errorMessage: enDateFieldText.enterAValidServiceDate,
    appearance: 'default',
    size: 'md',
    showRequiredIndicator: true,
  },
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useDateFieldLanguage();

    return (
      <div className="w-[320px]">
        <DateField
          {...args}
          label={getLocalizedDateFieldArgText('label', args.label, language)}
          description={getLocalizedDateFieldArgText('description', args.description, language)}
          labelSupplementary={getLocalizedDateFieldArgText(
            'labelSupplementary',
            args.labelSupplementary,
            language,
          )}
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
  render: (args) => {
    const language = useDateFieldLanguage();

    return (
      <div className="w-[320px]">
        <DateField
          {...args}
          label={getLocalizedDateFieldArgText('label', args.label, language)}
          description={getLocalizedDateFieldArgText('description', args.description, language)}
          labelSupplementary={getLocalizedDateFieldArgText(
            'labelSupplementary',
            args.labelSupplementary,
            language,
          )}
          errorMessage={getLocalizedDateFieldArgText('errorMessage', args.errorMessage, language)}
        />
      </div>
    );
  },
};

/**
 * Showcases all size and appearance combinations of the DateField component.
 */
export const Sizes: Story = {
  render: () => {
    const text = useDateFieldText();

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
            <DateField
              size="sm"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Medium (md)
            </span>
            <DateField
              size="md"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Large (lg)
            </span>
            <DateField
              size="lg"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
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
            <DateField
              size="sm"
              appearance="outline"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Medium (md)
            </span>
            <DateField
              size="md"
              appearance="outline"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              Large (lg)
            </span>
            <DateField
              size="lg"
              appearance="outline"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
        </div>
      </div>
    );
  },
};

export const EmptyAndFilled: Story = {
  render: () => {
    const text = useDateFieldText();

    return (
      <div className="grid w-[320px] gap-4">
        <DateField label={text.empty} description={text.helperText} />
        <DateField
          label={text.filled}
          defaultValue={parseDate('2026-04-18')}
          description={text.helperText}
        />
      </div>
    );
  },
};

export const DateAndTime: Story = {
  render: () => {
    const text = useDateFieldText();

    return (
      <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
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

export const ConstraintsAndValidation: Story = {
  render: () => {
    const text = useDateFieldText();

    return (
      <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
        <DateField
          label={text.required}
          isRequired
          minValue={now}
          description={text.futureDatesOnly}
        />
        <DateField
          label={text.minAndMax}
          minValue={now}
          maxValue={now.add({ months: 1 })}
          description={text.selectableForTheNextMonth}
        />
        <DateField
          label={text.invalid}
          isInvalid
          description={text.helperTextHiddenWhileInvalid}
          errorMessage={text.enterAValidServiceDate}
          defaultValue={parseDate('2026-04-01')}
        />
        <DateField
          label={text.invalidWithoutMessage}
          isInvalid
          description={text.helperTextHiddenWhileInvalid}
          defaultValue={parseDate('2026-04-01')}
        />
      </div>
    );
  },
};

export const DisabledAndReadOnly: Story = {
  render: () => {
    const text = useDateFieldText();

    return (
      <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
        <DateField label={text.disabled} isDisabled defaultValue={parseDate('2026-04-18')} />
        <DateField label={text.readOnly} isReadOnly defaultValue={parseDate('2026-04-18')} />
        <DateField
          appearance="outline"
          label={text.disabled}
          isDisabled
          defaultValue={parseDate('2026-04-18')}
        />
        <DateField
          appearance="outline"
          label={text.readOnly}
          isReadOnly
          defaultValue={parseDate('2026-04-18')}
        />
      </div>
    );
  },
};
