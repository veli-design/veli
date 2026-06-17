import { useEffect } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import {
  type DateValue,
  getLocalTimeZone,
  isWeekend,
  parseDate,
  parseDateTime,
  today,
} from '@internationalized/date';
import { DatePicker } from '@tradenetcorp/veli-ui/date-picker';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const now = today(getLocalTimeZone());
const disabledRanges = [
  [now.add({ days: 2 }), now.add({ days: 4 })],
  [now.add({ days: 9 }), now.add({ days: 10 })],
  [now.add({ days: 16 }), now.add({ days: 18 })],
] as const;

const appointmentUnavailable = (date: DateValue) =>
  isWeekend(date, 'en-GB') ||
  disabledRanges.some(([start, end]) => date.compare(start) >= 0 && date.compare(end) <= 0);

const enDatePickerText = {
  appointmentDate: 'Appointment date',
  chooseDateFromCalendarPopover: 'Choose a date from the calendar popover.',
  selectDate: 'Select date',
  noDateSelected: 'No date selected',
  dateSelected: 'Date selected',
  helperText: 'Helper text',
  dateOnly: 'Date only',
  dateAndMinute: 'Date and minute',
  twentyFourHourFormat: '24 hour format',
  required: 'Required',
  futureDatesOnly: 'Future dates only.',
  minAndMax: 'Min and max',
  selectableForTheNextMonth: 'Selectable for the next month.',
  unavailableDates: 'Unavailable dates',
  weekendsAndBlackoutDatesCannotBeChosen: 'Weekends and blackout dates cannot be chosen.',
  invalid: 'Invalid',
  helperTextHiddenWhileInvalid: 'This helper text is hidden while invalid.',
  pickAppointmentDateWithinAllowedWindow: 'Pick an appointment date within the allowed window.',
  invalidWithoutMessage: 'Invalid without message',
  disabled: 'Disabled',
  readOnly: 'Read only',
} as const;

const dhivehiDatePickerText = {
  appointmentDate: 'އެޕޮއިންޓްމަންޓް ތާރީޚު',
  chooseDateFromCalendarPopover: 'ކަލަންޑަރު ޕޮޕްއޯވަރުން ތާރީޚެއް ޚިޔާރުކުރައްވާ.',
  selectDate: 'ތާރީޚު ޚިޔާރުކުރައްވާ',
  noDateSelected: 'ތާރީޚެއް ޚިޔާރުކުރެވިފައެއް ނުވޭ',
  dateSelected: 'ތާރީޚު ޚިޔާރުކުރެވިއްޖެ',
  helperText: 'އެހީތެރިވެދޭ ލިޔުން',
  dateOnly: 'ތާރީޚު އެކަނި',
  dateAndMinute: 'ތާރީޚާއި މިނެޓު',
  twentyFourHourFormat: '24 ގަޑިއިރުގެ ފޯމެޓް',
  required: 'ފުރިހަމަކުރަންޖެހޭ',
  futureDatesOnly: 'ހަމައެކަނި ކުރިއަށް އޮތް ތާރީޚުތައް.',
  minAndMax: 'މިން އަދި މެކްސް',
  selectableForTheNextMonth: 'ކުރިއަށް އޮތް މަހުގެ ތެރެއިން ޚިޔާރުކުރެވޭނެއެވެ.',
  unavailableDates: 'ލިބެންނެތް ތާރީޚުތައް',
  weekendsAndBlackoutDatesCannotBeChosen:
    'ބަންދު ދުވަސްތަކާއި ބްލެކްއައުޓް ތާރީޚުތައް ޚިޔާރު ނުކުރެވޭނެއެވެ.',
  invalid: 'ސައްޙަނޫން',
  helperTextHiddenWhileInvalid: 'ސައްޙަނޫން ހާލަތެއްގައި މި އެހީތެރިވެދޭ ލިޔުން ނުފެންނާނެއެވެ.',
  pickAppointmentDateWithinAllowedWindow:
    'ހުއްދަކުރެވިފައިވާ މުއްދަތުގެ ތެރެއިން އެޕޮއިންޓްމަންޓް ތާރީޚެއް ޚިޔާރުކުރައްވާ.',
  invalidWithoutMessage: 'މެސެޖަކާ ނުލައި ސައްޙަނޫން',
  disabled: 'ބޭނުންނުކުރެވޭ',
  readOnly: 'ކިޔަން އެކަނި',
} as const;

const localizedDatePickerText = {
  en: enDatePickerText,
  dv: dhivehiDatePickerText,
} as const;

type DatePickerLanguage = keyof typeof localizedDatePickerText;

const useDatePickerLanguage = (): DatePickerLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useDatePickerText = () => {
  const language = useDatePickerLanguage();

  return localizedDatePickerText[language];
};

const datePickerArgText = {
  label: {
    en: enDatePickerText.appointmentDate,
    dv: dhivehiDatePickerText.appointmentDate,
  },
  description: {
    en: enDatePickerText.chooseDateFromCalendarPopover,
    dv: dhivehiDatePickerText.chooseDateFromCalendarPopover,
  },
  placeholder: {
    en: enDatePickerText.selectDate,
    dv: dhivehiDatePickerText.selectDate,
  },
  errorMessage: {
    en: enDatePickerText.pickAppointmentDateWithinAllowedWindow,
    dv: dhivehiDatePickerText.pickAppointmentDateWithinAllowedWindow,
  },
} as const;

type DatePickerArgTextKey = keyof typeof datePickerArgText;

const datePickerArgTextKeys = Object.keys(datePickerArgText) as DatePickerArgTextKey[];

const getLocalizedDatePickerArgText = (
  key: DatePickerArgTextKey,
  value: unknown,
  language: DatePickerLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return datePickerArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(datePickerArgText[key]);

  if (localizedValues.includes(value)) {
    return datePickerArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/DatePicker',
  component: DatePicker,
  decorators: [
    (Story, context) => {
      const language: DatePickerLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { description, errorMessage, label, placeholder } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<DatePickerArgTextKey, string>> = {};
        const currentArgs = {
          description,
          errorMessage,
          label,
          placeholder,
        };

        datePickerArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedDatePickerArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [description, errorMessage, label, placeholder, language, updateArgs]);

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
    placeholder: {
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
    label: enDatePickerText.appointmentDate,
    description: enDatePickerText.chooseDateFromCalendarPopover,
    placeholder: enDatePickerText.selectDate,
    errorMessage: enDatePickerText.pickAppointmentDateWithinAllowedWindow,
    appearance: 'default',
    size: 'md',
    showRequiredIndicator: true,
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useDatePickerLanguage();

    return (
      <div className="w-[320px]">
        <DatePicker
          {...args}
          label={getLocalizedDatePickerArgText('label', args.label, language)}
          description={getLocalizedDatePickerArgText('description', args.description, language)}
          placeholder={getLocalizedDatePickerArgText('placeholder', args.placeholder, language)}
          errorMessage={getLocalizedDatePickerArgText('errorMessage', args.errorMessage, language)}
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
    const language = useDatePickerLanguage();

    return (
      <div className="w-[320px]">
        <DatePicker
          {...args}
          label={getLocalizedDatePickerArgText('label', args.label, language)}
          description={getLocalizedDatePickerArgText('description', args.description, language)}
          placeholder={getLocalizedDatePickerArgText('placeholder', args.placeholder, language)}
          errorMessage={getLocalizedDatePickerArgText('errorMessage', args.errorMessage, language)}
        />
      </div>
    );
  },
};

export const PlaceholderAndSelected: Story = {
  render: () => {
    const text = useDatePickerText();

    return (
      <div className="grid w-[320px] gap-4">
        <DatePicker label={text.noDateSelected} placeholder={text.selectDate} />
        <DatePicker label={text.dateSelected} defaultValue={parseDate('2025-04-05')} />
      </div>
    );
  },
};

/**
 * Showcases all size and appearance combinations of the DatePicker component.
 */
export const Sizes: Story = {
  render: () => {
    const text = useDatePickerText();

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
            <DatePicker
              size="sm"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Medium (md)
            </span>
            <DatePicker
              size="md"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Large (lg)
            </span>
            <DatePicker
              size="lg"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
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
            <DatePicker
              size="sm"
              appearance="outline"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Medium (md)
            </span>
            <DatePicker
              size="md"
              appearance="outline"
              label={text.appointmentDate}
              defaultValue={parseDate('2026-04-18')}
              description={text.helperText}
            />
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              Large (lg)
            </span>
            <DatePicker
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

export const DateAndTime: Story = {
  render: () => {
    const text = useDatePickerText();

    return (
      <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
        <DatePicker label={text.dateOnly} defaultValue={parseDate('2026-04-18')} />
        <DatePicker
          label={text.dateAndMinute}
          granularity="minute"
          defaultValue={parseDateTime('2026-04-18T14:30:00')}
        />
        <DatePicker
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
    const text = useDatePickerText();

    return (
      <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
        <DatePicker
          label={text.required}
          isRequired
          minValue={now}
          description={text.futureDatesOnly}
        />
        <DatePicker
          label={text.minAndMax}
          minValue={now}
          maxValue={now.add({ months: 1 })}
          description={text.selectableForTheNextMonth}
        />
        <DatePicker
          label={text.unavailableDates}
          minValue={now}
          maxValue={now.add({ months: 1 })}
          isDateUnavailable={appointmentUnavailable}
          description={text.weekendsAndBlackoutDatesCannotBeChosen}
        />
        <DatePicker
          label={text.invalid}
          isInvalid
          description={text.helperTextHiddenWhileInvalid}
          errorMessage={text.pickAppointmentDateWithinAllowedWindow}
          defaultValue={parseDate('2026-04-01')}
        />
        <DatePicker
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
    const text = useDatePickerText();

    return (
      <div className="grid w-[760px] grid-cols-1 gap-4 md:grid-cols-2">
        <DatePicker label={text.disabled} isDisabled defaultValue={parseDate('2026-04-18')} />
        <DatePicker label={text.readOnly} isReadOnly defaultValue={parseDate('2026-04-18')} />
      </div>
    );
  },
};
