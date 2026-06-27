import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { CheckCircle, Info, WarningCircle } from 'phosphor-react';
import { Alert, type AlertAppearance, type AlertIntent } from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const intents: AlertIntent[] = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'];

const appearances: AlertAppearance[] = ['subtle', 'outline', 'emphasis'];

const enAlertText = {
  title: 'Permit review in progress',
  description: 'You will receive an email when your application has been processed.',
  actionLabel: 'View schedule',
  paymentTitle: 'Payment received',
  paymentDescription: 'Your transaction was completed successfully.',
  documentsTitle: 'Documents expiring soon',
  documentsDescription: 'Renew your licence before the end of this month.',
  submissionTitle: 'Submission failed',
  submissionDescription: 'Check the required fields and try again.',
  maintenanceTitle: 'System maintenance',
  maintenanceDescription: 'Services may be unavailable tonight from 22:00–02:00.',
} as const;

const dhivehiAlertText = {
  title: 'ޕާމިޓް ރިވިއު ކުރިއަށްދަނީ',
  description: 'އެޕްލިކޭޝަން ޕްރޮސެސްކުރުމުން އީމެއިލް ލިބޭނެއެވެ.',
  actionLabel: 'ޝެޑިއުލް ބައްލަވާ',
  paymentTitle: 'ފައިސާ ލިބިއްޖެ',
  paymentDescription: 'ޓްރާންސެކްޝަން ކާމިޔާބުކަމާއެކު ނިމިއްޖެއެވެ.',
  documentsTitle: 'ޑޮކިއުމެންޓްތައް އަލަށް މަޢުލޫމާތު ނުވާނެ',
  documentsDescription: 'މި މަހުގެ ނިމުމުގެ ކުރިން ލައިސެންސް އަލަށް ހިފެހެއްޓުއްވާ.',
  submissionTitle: 'ސަބްމިޓް ނުވެއްޖެ',
  submissionDescription: 'ޖަރޫރީ ފީލްތައް ޗެކްކޮށްލައްވާ އަލުން މަސައްކަތް ކުރައްވާ.',
  maintenanceTitle: 'ސިސްޓަމް މެއިންޓެނަންސް',
  maintenanceDescription: '22:00–02:00 ގެ ތެރޭގައި ސާވިސްތައް ނުލިބޭނެއެވެ.',
} as const;

const localizedAlertText = {
  en: enAlertText,
  dv: dhivehiAlertText,
} as const;

const alertArgText = {
  title: {
    en: enAlertText.title,
    dv: dhivehiAlertText.title,
  },
  description: {
    en: enAlertText.description,
    dv: dhivehiAlertText.description,
  },
  actionLabel: {
    en: enAlertText.actionLabel,
    dv: dhivehiAlertText.actionLabel,
  },
} as const;

type AlertLanguage = keyof typeof localizedAlertText;
type AlertArgTextKey = keyof typeof alertArgText;

type AlertStoryArgs = Omit<ComponentProps<typeof Alert>, 'leadingIcon' | 'children'> & {
  title: string;
  description: string;
  showLeadingIcon: boolean;
  showCloseButton: boolean;
  showActions: boolean;
  actionLabel: string;
};

const alertArgTextKeys = Object.keys(alertArgText) as AlertArgTextKey[];

const useAlertLanguage = (): AlertLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useAlertText = () => {
  const language = useAlertLanguage();

  return localizedAlertText[language];
};

const getLocalizedAlertArgText = (
  key: AlertArgTextKey,
  value: string,
  language: AlertLanguage,
): string => {
  if (value.trim().length === 0) {
    return alertArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(alertArgText[key]);

  if (localizedValues.includes(value)) {
    return alertArgText[key][language];
  }

  return value;
};

function AlertLeadingIcon({ intent }: { intent: AlertIntent }) {
  if (intent === 'positive') {
    return <CheckCircle size={20} weight="fill" />;
  }

  if (intent === 'neutral' || intent === 'info') {
    return <Info size={20} weight="fill" />;
  }

  return <WarningCircle size={20} weight="fill" />;
}

function renderAlert({
  title,
  description,
  showLeadingIcon,
  showCloseButton,
  showActions,
  actionLabel,
  intent = 'info',
  onDismiss,
  ...args
}: AlertStoryArgs) {
  const language = useAlertLanguage();
  const localizedTitle = getLocalizedAlertArgText('title', title, language);
  const localizedDescription = getLocalizedAlertArgText('description', description, language);
  const localizedActionLabel = getLocalizedAlertArgText('actionLabel', actionLabel, language);

  return (
    <Alert
      {...args}
      className="w-[480px]"
      intent={intent}
      leadingIcon={showLeadingIcon ? <AlertLeadingIcon intent={intent} /> : undefined}
      onDismiss={showCloseButton ? onDismiss : undefined}
    >
      <Alert.Title>{localizedTitle}</Alert.Title>
      <Alert.Description>{localizedDescription}</Alert.Description>
      {showActions ? (
        <Alert.Actions>
          <Button size="sm" intent="secondary" appearance="transparent">
            {localizedActionLabel}
          </Button>
        </Alert.Actions>
      ) : null}
      {showCloseButton ? <Alert.CloseButton /> : null}
    </Alert>
  );
}

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language: AlertLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { title, description, actionLabel } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<AlertArgTextKey, string>> = {};
        const currentArgs = { title, description, actionLabel };

        alertArgTextKeys.forEach((key) => {
          const value = currentArgs[key];
          const localizedValue =
            typeof value === 'string' ? getLocalizedAlertArgText(key, value, language) : value;

          if (typeof localizedValue === 'string' && currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [actionLabel, description, language, title, updateArgs]);

      return <Story />;
    },
  ],
  args: {
    intent: 'info',
    appearance: 'subtle',
    live: 'status',
    defaultVisible: true,
    showLeadingIcon: true,
    showCloseButton: false,
    showActions: false,
    title: enAlertText.title,
    description: enAlertText.description,
    actionLabel: enAlertText.actionLabel,
  },
  argTypes: {
    intent: {
      control: 'select',
      options: intents,
    },
    appearance: {
      control: 'select',
      options: appearances,
    },
    live: {
      control: 'select',
      options: ['alert', 'status'],
    },
    defaultVisible: {
      control: 'boolean',
    },
    isVisible: {
      control: 'boolean',
    },
    showLeadingIcon: {
      control: 'boolean',
    },
    showCloseButton: {
      control: 'boolean',
    },
    showActions: {
      control: 'boolean',
    },
    title: {
      control: 'text',
    },
    description: {
      control: 'text',
    },
    actionLabel: {
      control: 'text',
    },
    onDismiss: {
      table: { disable: true },
    },
    leadingIcon: {
      table: { disable: true },
    },
    children: {
      table: { disable: true },
    },
    className: {
      table: { disable: true },
    },
    role: {
      table: { disable: true },
    },
  },
} satisfies Meta<AlertStoryArgs>;

export default meta;
type Story = StoryObj<AlertStoryArgs>;

export const Playground: Story = {
  render: (args) => renderAlert(args),
};

export const Default: Story = {
  render: () => {
    const text = useAlertText();

    return (
      <Alert className="w-[480px]" intent="info" leadingIcon={<Info size={20} weight="fill" />}>
        <Alert.Title>{text.title}</Alert.Title>
        <Alert.Description>{text.description}</Alert.Description>
      </Alert>
    );
  },
};

export const TitleOnly: Story = {
  render: () => {
    const text = useAlertText();

    return (
      <Alert className="w-120" intent="info" leadingIcon={<Info size={20} weight="fill" />}>
        <Alert.Title>{text.title}</Alert.Title>
      </Alert>
    );
  },
};

export const AllAppearances: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => {
    const text = useAlertText();

    return (
      <div className="flex w-full max-w-130 flex-col gap-8">
        {appearances.map((appearance) => (
          <div key={appearance} className="space-y-3">
            <p className="type-body-sm-medium text-text-default-emphasis capitalize">
              {appearance}
            </p>
            <div className="flex flex-col gap-3">
              {intents.map((intent) => (
                <Alert
                  key={`${appearance}-${intent}`}
                  appearance={appearance}
                  intent={intent}
                  leadingIcon={<AlertLeadingIcon intent={intent} />}
                >
                  <Alert.Title>{text.title}</Alert.Title>
                  <Alert.Description>{text.description}</Alert.Description>
                </Alert>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const Dismissible: Story = {
  render: () => {
    const text = useAlertText();

    return (
      <Alert
        className="w-[480px]"
        intent="info"
        leadingIcon={<Info size={20} weight="fill" />}
        onDismiss={() => undefined}
      >
        <Alert.Title>{text.maintenanceTitle}</Alert.Title>
        <Alert.Description>{text.maintenanceDescription}</Alert.Description>
        <Alert.Actions>
          <Button size="sm" intent="secondary" appearance="transparent">
            {text.actionLabel}
          </Button>
        </Alert.Actions>
        <Alert.CloseButton />
      </Alert>
    );
  },
};
