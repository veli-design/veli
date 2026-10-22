import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { type DateValue, parseDate, parseDateTime } from '@internationalized/date';
import { DatePicker, type DatePickerProps } from '@tradenetcorp/veli-ui/date-picker';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const collapsedControlGroups = ['Content', 'State'] as const;

function DatePickerDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tryCollapse = () => {
      if (cancelled) return;

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

      collapsedControlGroups.forEach((group) => {
        const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
        row?.querySelector<HTMLElement>('[tabindex="0"]')?.click();
      });
    };

    tryCollapse();

    return () => {
      cancelled = true;
    };
  }, []);

  return <DocsContainer {...props} />;
}

function StoryDatePicker<T extends DateValue>(props: DatePickerProps<T>) {
  return <DatePicker {...props} className="w-[282px] max-w-full" />;
}

const enDatePickerText = {
  appointmentDate: 'Appointment date',
  chooseDateFromCalendarPopover: 'Choose a date from the calendar popover.',
  infoTip: 'Type a date or choose one from the calendar.',
  infoTipLabel: 'More information',
  default: 'Default',
  helperText: 'Helper text',
  dateOnly: 'Date only',
  dateAndMinute: 'Date and minute',
  twentyFourHourFormat: '24 hour format',
  required: 'Required',
  invalid: 'Invalid',
  pickAppointmentDateWithinAllowedWindow: 'Pick an appointment date within the allowed window.',
  disabled: 'Disabled',
  readOnly: 'Read only',
} as const;

const dhivehiDatePickerText = {
  appointmentDate: 'އެޕޮއިންޓްމަންޓް ތާރީޚު',
  chooseDateFromCalendarPopover: 'ކަލަންޑަރު ޕޮޕްއޯވަރުން ތާރީޚެއް ޚިޔާރުކުރައްވާ.',
  infoTip: 'ތާރީޚު ލިޔުއްވާ ނުވަތަ ކަލަންޑަރުން ޚިޔާރުކުރައްވާ.',
  infoTipLabel: 'އިތުރު މަޢުލޫމާތު',
  default: 'ޑީފޯލްޓް',
  helperText: 'އެހީތެރިވެދޭ ލިޔުން',
  dateOnly: 'ތާރީޚު އެކަނި',
  dateAndMinute: 'ތާރީޚާއި މިނެޓު',
  twentyFourHourFormat: '24 ގަޑިއިރުގެ ފޯމެޓް',
  required: 'ފުރިހަމަކުރަންޖެހޭ',
  invalid: 'ސައްޙަނޫން',
  pickAppointmentDateWithinAllowedWindow:
    'ހުއްދަކުރެވިފައިވާ މުއްދަތުގެ ތެރެއިން އެޕޮއިންޓްމަންޓް ތާރީޚެއް ޚިޔާރުކުރައްވާ.',
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
  infoTooltip: {
    en: enDatePickerText.infoTip,
    dv: dhivehiDatePickerText.infoTip,
  },
  infoTooltipAriaLabel: {
    en: enDatePickerText.infoTipLabel,
    dv: dhivehiDatePickerText.infoTipLabel,
  },
  errorMessage: {
    en: enDatePickerText.pickAppointmentDateWithinAllowedWindow,
    dv: dhivehiDatePickerText.pickAppointmentDateWithinAllowedWindow,
  },
} as const;

type DatePickerArgTextKey = keyof typeof datePickerArgText;
type DatePickerStoryArgs = ComponentProps<typeof DatePicker> & {
  showInfoTooltip: boolean;
};

const datePickerArgTextKeys = Object.keys(datePickerArgText) as DatePickerArgTextKey[];

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

const hiddenDatePickerArgTypes = {
  className: { table: { disable: true } },
  inputClassName: { table: { disable: true } },
  popoverClassName: { table: { disable: true } },
  calendarClassName: { table: { disable: true } },
  value: { control: false, table: { disable: true } },
  defaultValue: { control: false, table: { disable: true } },
  onChange: { control: false, table: { disable: true } },
  placeholderValue: { control: false, table: { disable: true } },
  minValue: { control: false, table: { disable: true } },
  maxValue: { control: false, table: { disable: true } },
  isDateUnavailable: { control: false, table: { disable: true } },
  validate: { control: false, table: { disable: true } },
  name: { control: false, table: { disable: true } },
  autoFocus: { control: false, table: { disable: true } },
  hideTimeZone: { control: false, table: { disable: true } },
  shouldForceLeadingZeros: { control: false, table: { disable: true } },
  shouldCloseOnSelect: { control: false, table: { disable: true } },
} as const;

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
      const { description, errorMessage, infoTooltip, infoTooltipAriaLabel, label } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<DatePickerArgTextKey, string>> = {};
        const currentArgs = {
          description,
          errorMessage,
          label,
          infoTooltip,
          infoTooltipAriaLabel,
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
      }, [
        description,
        errorMessage,
        infoTooltip,
        infoTooltipAriaLabel,
        label,
        language,
        updateArgs,
      ]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
    docs: { container: DatePickerDocsContainer },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      appearance: { control: 'select', options: ['default', 'outline'] },
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
    }),
    ...withArgCategory('Label', {
      label: { control: 'text', table: { type: { summary: 'string' } } },
      isOptional: { control: 'boolean' },
      infoTooltip: { control: 'text', table: { type: { summary: 'string' } } },
      infoTooltipAriaLabel: { control: 'text', table: { type: { summary: 'string' } } },
      showInfoTooltip: { control: 'boolean' },
    }),
    ...withArgCategory('Content', {
      description: { control: 'text', table: { type: { summary: 'string' } } },
      granularity: { control: 'select', options: ['day', 'hour', 'minute', 'second'] },
      hourCycle: { control: 'select', options: [12, 24] },
    }),
    ...withArgCategory('Calendar', {
      showTodayButton: { control: 'boolean' },
      calendarButtonLabel: { control: 'text' },
      todayButtonLabel: { control: 'text' },
    }),
    ...withArgCategory('State', {
      isRequired: { control: 'boolean' },
      showRequiredIndicator: { control: 'boolean' },
      isInvalid: { control: 'boolean' },
      errorMessage: { control: 'text', table: { type: { summary: 'string' } } },
      isDisabled: { control: 'boolean' },
      isReadOnly: { control: 'boolean' },
    }),
    ...hiddenDatePickerArgTypes,
  },
  args: {
    appearance: 'default',
    size: 'md',
    label: enDatePickerText.appointmentDate,
    isOptional: true,
    description: enDatePickerText.chooseDateFromCalendarPopover,
    infoTooltip: enDatePickerText.infoTip,
    infoTooltipAriaLabel: enDatePickerText.infoTipLabel,
    showInfoTooltip: true,
    errorMessage: enDatePickerText.pickAppointmentDateWithinAllowedWindow,
    showRequiredIndicator: true,
    showTodayButton: true,
  },
} satisfies Meta<DatePickerStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => {
    const language = useDatePickerLanguage();
    const { showInfoTooltip, ...datePickerArgs } = args;

    return (
      <div className="w-[282px] max-w-full">
        <StoryDatePicker
          {...datePickerArgs}
          label={getLocalizedDatePickerArgText('label', args.label, language)}
          description={getLocalizedDatePickerArgText('description', args.description, language)}
          infoTooltip={
            showInfoTooltip
              ? getLocalizedDatePickerArgText('infoTooltip', args.infoTooltip, language)
              : undefined
          }
          infoTooltipAriaLabel={getLocalizedDatePickerArgText(
            'infoTooltipAriaLabel',
            args.infoTooltipAriaLabel,
            language,
          )}
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
  render: Playground.render,
};

export const Sizes: Story = {
  render: () => {
    const text = useDatePickerText();

    return (
      <div className="grid w-[588px] max-w-full grid-cols-1 gap-6 sm:grid-cols-2">
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
                <StoryDatePicker
                  appearance={appearance}
                  size={size}
                  label={text.appointmentDate}
                  isOptional
                  description={text.helperText}
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
    const text = useDatePickerText();
    const filledValue = parseDate('2026-04-18');

    return (
      <div className="grid w-[588px] max-w-full grid-cols-1 gap-6 sm:grid-cols-2">
        {(['default', 'outline'] as const).map((appearance) => (
          <div key={appearance} className="flex flex-col gap-4">
            <StoryDatePicker
              appearance={appearance}
              label={text.default}
              isOptional
              description={text.helperText}
            />
            <StoryDatePicker
              appearance={appearance}
              label={text.invalid}
              isOptional
              defaultValue={filledValue}
              errorMessage={text.pickAppointmentDateWithinAllowedWindow}
              isInvalid
            />
            <StoryDatePicker
              appearance={appearance}
              label={text.disabled}
              isOptional
              defaultValue={filledValue}
              description={text.helperText}
              isDisabled
            />
            <StoryDatePicker
              appearance={appearance}
              label={text.readOnly}
              isOptional
              defaultValue={filledValue}
              description={text.helperText}
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
  render: Playground.render,
};

export const Granularity: Story = {
  render: () => {
    const text = useDatePickerText();

    return (
      <div className="grid w-[588px] max-w-full grid-cols-1 gap-4 sm:grid-cols-2">
        <StoryDatePicker label={text.dateOnly} defaultValue={parseDate('2026-04-18')} />
        <StoryDatePicker
          label={text.dateAndMinute}
          granularity="minute"
          defaultValue={parseDateTime('2026-04-18T14:30:00')}
        />
        <StoryDatePicker
          label={text.twentyFourHourFormat}
          granularity="minute"
          hourCycle={24}
          defaultValue={parseDateTime('2026-04-18T21:10:00')}
        />
      </div>
    );
  },
};

/** All supported resting states at each Figma appearance/size. Hover, focus and active are interactive. */
export const StateMatrix: Story = {
  name: 'States and sizes',
  parameters: { layout: 'fullscreen' },
  render: () => {
    const text = useDatePickerText();
    return (
      <div
        className="grid min-w-0 grid-cols-1 gap-8 p-4 md:grid-cols-2"
        data-testid="date-picker-changelog"
      >
        {(['default', 'outline'] as const).flatMap((appearance) =>
          (['sm', 'md', 'lg'] as const).map((size) => (
            <div key={`${appearance}-${size}`} className="min-w-0 space-y-5">
              <p className="type-caption-regular text-base-muted">
                {appearance} / {size}
              </p>
              {(['empty', 'filled', 'invalid', 'disabled', 'read-only'] as const).map((state) => (
                <div key={state} data-testid={`picker-${appearance}-${size}-${state}`}>
                  <StoryDatePicker
                    appearance={appearance}
                    size={size}
                    label={text.appointmentDate}
                    infoTooltip={text.infoTip}
                    description={text.helperText}
                    defaultValue={state === 'empty' ? undefined : parseDate('2026-10-15')}
                    placeholderValue={parseDate('2026-10-15')}
                    isOptional={state !== 'invalid'}
                    isRequired={state === 'invalid' || state === 'disabled'}
                    isInvalid={state === 'invalid'}
                    errorMessage={text.pickAppointmentDateWithinAllowedWindow}
                    isDisabled={state === 'disabled'}
                    isReadOnly={state === 'read-only'}
                  />
                </div>
              ))}
            </div>
          )),
        )}
      </div>
    );
  },
};

export const ConstraintsAndToday: Story = {
  render: () => {
    const text = useDatePickerText();
    return (
      <StoryDatePicker
        label={text.appointmentDate}
        name="appointment"
        defaultValue={parseDate('2026-10-15')}
        minValue={parseDate('2026-10-12')}
        maxValue={parseDate('2026-10-28')}
        isDateUnavailable={(date) => date.day === 16}
        shouldCloseOnSelect={false}
        description={text.pickAppointmentDateWithinAllowedWindow}
      />
    );
  },
};
