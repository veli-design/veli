import { useEffect, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { expect, fn, userEvent, waitFor, within } from '@storybook/test';
import { CheckCircle, Info, WarningCircle } from 'phosphor-react';
import { Alert, type AlertAppearance, type AlertIntent } from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const intents: AlertIntent[] = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'];
const appearances: AlertAppearance[] = ['subtle', 'outline', 'emphasis'];
const alertWidthClassName = 'w-full max-w-[480px]';
const matrixWidthClassName = 'w-full max-w-[520px]';

const enAlertText = {
  title: 'Permit review in progress',
  description: 'You will receive an email when your application has been processed.',
  actionLabel: 'View schedule',
  maintenanceTitle: 'System maintenance',
  maintenanceDescription: 'Services may be unavailable tonight from 22:00–02:00.',
  dismissed: 'Alert dismissed.',
  hide: 'Hide alert',
  show: 'Show alert',
} as const;

const dhivehiAlertText = {
  title: 'ޕާމިޓް ރިވިއު ކުރިއަށްދަނީ',
  description: 'އެޕްލިކޭޝަން ޕްރޮސެސްކުރުމުން އީމެއިލް ލިބޭނެއެވެ.',
  actionLabel: 'ޝެޑިއުލް ބައްލަވާ',
  maintenanceTitle: 'ސިސްޓަމް މެއިންޓެނަންސް',
  maintenanceDescription: '22:00–02:00 ގެ ތެރޭގައި ސާވިސްތައް ނުލިބޭނެއެވެ.',
  dismissed: 'އެލާޓް ލައްޕާލެވިއްޖެ.',
  hide: 'އެލާޓް ނުދައްކަވާ',
  show: 'އެލާޓް ދައްކާ',
} as const;

const localizedAlertText = { en: enAlertText, dv: dhivehiAlertText } as const;
const alertArgText = {
  title: { en: enAlertText.title, dv: dhivehiAlertText.title },
  description: { en: enAlertText.description, dv: dhivehiAlertText.description },
  actionLabel: { en: enAlertText.actionLabel, dv: dhivehiAlertText.actionLabel },
} as const;

type AlertLanguage = keyof typeof localizedAlertText;
type AlertArgTextKey = keyof typeof alertArgText;
type AlertStoryArgs = ComponentProps<typeof Alert> & {
  title: string;
  description: string;
  actionLabel: string;
  showDescription: boolean;
  showLeadingIcon: boolean;
  showCloseButton: boolean;
  showActions: boolean;
};

const alertArgTextKeys = Object.keys(alertArgText) as AlertArgTextKey[];

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

const useAlertLanguage = (): AlertLanguage => {
  const { direction } = useVeliLanguage();
  return direction === 'rtl' ? 'dv' : 'en';
};

const useAlertText = () => localizedAlertText[useAlertLanguage()];

const getLocalizedAlertArgText = (
  key: AlertArgTextKey,
  value: string,
  language: AlertLanguage,
): string => {
  if (value.trim().length === 0) return alertArgText[key][language];
  const localizedValues: readonly string[] = Object.values(alertArgText[key]);
  return localizedValues.includes(value) ? alertArgText[key][language] : value;
};

function AlertLeadingIcon({ intent }: { intent: AlertIntent }) {
  if (intent === 'positive') return <CheckCircle size={20} weight="fill" />;
  if (intent === 'neutral' || intent === 'info') return <Info size={20} weight="fill" />;
  return <WarningCircle size={20} weight="fill" />;
}

function AlertAction({ children }: { children: string }) {
  return (
    <Button size="sm" intent="secondary" appearance="transparent">
      {children}
    </Button>
  );
}

function renderAlert({
  title,
  description,
  actionLabel,
  showDescription,
  showLeadingIcon,
  showCloseButton,
  showActions,
  intent = 'info',
  className,
  onDismiss,
  ...alertProps
}: AlertStoryArgs) {
  const language = useAlertLanguage();
  const localizedTitle = getLocalizedAlertArgText('title', title, language);
  const localizedDescription = getLocalizedAlertArgText('description', description, language);
  const localizedActionLabel = getLocalizedAlertArgText('actionLabel', actionLabel, language);

  return (
    <Alert
      {...alertProps}
      className={`${alertWidthClassName}${className ? ` ${className}` : ''}`}
      intent={intent}
      leadingIcon={showLeadingIcon ? <AlertLeadingIcon intent={intent} /> : undefined}
      onDismiss={showCloseButton ? onDismiss : undefined}
    >
      <Alert.Title>{localizedTitle}</Alert.Title>
      {showDescription ? <Alert.Description>{localizedDescription}</Alert.Description> : null}
      {showActions ? (
        <Alert.Actions>
          <AlertAction>{localizedActionLabel}</AlertAction>
        </Alert.Actions>
      ) : null}
      {showCloseButton ? <Alert.CloseButton /> : null}
    </Alert>
  );
}

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: { layout: 'centered', controls: { sort: 'none' } },
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

        if (Object.keys(nextArgs).length > 0) updateArgs?.(nextArgs);
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
    showDescription: true,
    title: enAlertText.title,
    description: enAlertText.description,
    actionLabel: enAlertText.actionLabel,
    onDismiss: fn(),
  },
  argTypes: {
    ...withArgCategory('Appearance', {
      intent: { control: 'select', options: intents },
      appearance: { control: 'select', options: appearances },
    }),
    ...withArgCategory('Content', {
      title: { control: 'text' },
      description: { control: 'text', if: { arg: 'showDescription', eq: true } },
      showDescription: { control: 'boolean' },
      leadingIcon: { control: false, table: { disable: true } },
      showLeadingIcon: { control: 'boolean' },
      showActions: { control: 'boolean' },
      actionLabel: { control: 'text', if: { arg: 'showActions', eq: true } },
      showCloseButton: { control: 'boolean' },
    }),
    ...withArgCategory('Behavior', {
      live: { control: 'select', options: ['alert', 'status'] },
      isVisible: { control: 'boolean' },
      defaultVisible: { control: 'boolean' },
      onDismiss: { action: 'dismiss' },
    }),
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    role: { table: { disable: true } },
  },
} satisfies Meta<AlertStoryArgs>;

export default meta;
type Story = StoryObj<AlertStoryArgs>;

export const Playground: Story = { render: (args) => renderAlert(args) };

export const Default: Story = {
  render: () => {
    const text = useAlertText();
    return (
      <Alert
        className={alertWidthClassName}
        intent="info"
        leadingIcon={<Info size={20} weight="fill" />}
      >
        <Alert.Title>{text.title}</Alert.Title>
        <Alert.Description>{text.description}</Alert.Description>
        <Alert.Actions>
          <AlertAction>{text.actionLabel}</AlertAction>
        </Alert.Actions>
      </Alert>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(canvas.getByRole('button')).toHaveTextContent(/View schedule|ޝެޑިއުލް/);
  },
};

export const TitleOnly: Story = {
  render: () => {
    const text = useAlertText();
    return (
      <Alert
        className={alertWidthClassName}
        intent="info"
        leadingIcon={<Info size={20} weight="fill" />}
      >
        <Alert.Title>{text.title}</Alert.Title>
        <Alert.Actions>
          <AlertAction>{text.actionLabel}</AlertAction>
        </Alert.Actions>
      </Alert>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(canvas.queryByText(/You will receive|އެޕްލިކޭޝަން/)).toBeNull();
  },
};

export const AllAppearances: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const text = useAlertText();
    return (
      <div className={`flex ${matrixWidthClassName} flex-col gap-8`}>
        {appearances.map((appearance) => (
          <section key={appearance} className="space-y-3">
            <p className="type-body-sm-medium text-base-emphasis capitalize">{appearance}</p>
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
                  <Alert.Actions>
                    <AlertAction>{text.actionLabel}</AlertAction>
                  </Alert.Actions>
                  <Alert.CloseButton />
                </Alert>
              ))}
            </div>
          </section>
        ))}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getAllByRole('status')).toHaveLength(18);
  },
};

export const ContentCombinations: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const text = useAlertText();
    return (
      <div className="grid w-full max-w-[960px] grid-cols-1 gap-4 md:grid-cols-2">
        {[false, true].flatMap((showLeadingIcon) =>
          [false, true].flatMap((showActions) =>
            [false, true].map((showCloseButton) => (
              <div
                key={`${showLeadingIcon}-${showActions}-${showCloseButton}`}
                className="space-y-2"
              >
                <p className="type-caption-medium text-base-muted">
                  Icon {showLeadingIcon ? 'on' : 'off'} · Actions {showActions ? 'on' : 'off'} ·
                  Close {showCloseButton ? 'on' : 'off'}
                </p>
                <Alert
                  className="w-full"
                  intent="info"
                  leadingIcon={showLeadingIcon ? <Info size={20} weight="fill" /> : undefined}
                  onDismiss={showCloseButton ? () => undefined : undefined}
                >
                  <Alert.Title>{text.title}</Alert.Title>
                  <Alert.Description>{text.description}</Alert.Description>
                  {showActions ? (
                    <Alert.Actions>
                      <AlertAction>{text.actionLabel}</AlertAction>
                    </Alert.Actions>
                  ) : null}
                  {showCloseButton ? <Alert.CloseButton /> : null}
                </Alert>
              </div>
            )),
          ),
        )}
      </div>
    );
  },
};

export const Responsive: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const text = useAlertText();
    return (
      <div className="w-full max-w-[320px]">
        <Alert intent="warning" leadingIcon={<WarningCircle size={20} weight="fill" />}>
          <Alert.Title>{text.maintenanceTitle}</Alert.Title>
          <Alert.Description>{text.maintenanceDescription}</Alert.Description>
          <Alert.Actions>
            <AlertAction>{text.actionLabel}</AlertAction>
          </Alert.Actions>
          <Alert.CloseButton />
        </Alert>
      </div>
    );
  },
};

export const Dismissible: Story = {
  render: () => {
    const text = useAlertText();
    const [dismissed, setDismissed] = useState(false);
    const [resetKey, setResetKey] = useState(0);
    return (
      <div className="flex flex-col items-start gap-3">
        <Alert
          key={resetKey}
          className={alertWidthClassName}
          intent="info"
          leadingIcon={<Info size={20} weight="fill" />}
          onDismiss={() => setDismissed(true)}
        >
          <Alert.Title>{text.maintenanceTitle}</Alert.Title>
          <Alert.Description>{text.maintenanceDescription}</Alert.Description>
          <Alert.Actions>
            <AlertAction>{text.actionLabel}</AlertAction>
          </Alert.Actions>
          <Alert.CloseButton />
        </Alert>
        {dismissed ? (
          <Button
            size="sm"
            intent="secondary"
            appearance="transparent"
            onPress={() => {
              setDismissed(false);
              setResetKey((key) => key + 1);
            }}
          >
            {text.show}
          </Button>
        ) : null}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const closeButton = canvas.getByRole('button', { name: /Dismiss alert|އެލާޓް ލައްޕާ/ });
    closeButton.focus();
    await expect(closeButton).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(canvas.queryByRole('status')).toBeNull());
    await expect(canvas.getByRole('button', { name: /Show alert|އެލާޓް ދައްކާ/ })).toBeVisible();
  },
};

export const ControlledVisibility: Story = {
  render: () => {
    const text = useAlertText();
    const [visible, setVisible] = useState(true);
    const [dismissals, setDismissals] = useState(0);
    return (
      <div className="flex flex-col items-start gap-3">
        <Button
          size="sm"
          intent="secondary"
          appearance="transparent"
          onPress={() => setVisible((value) => !value)}
        >
          {visible ? text.hide : text.show}
        </Button>
        <p>Dismiss callbacks: {dismissals}</p>
        <Alert
          className={alertWidthClassName}
          isVisible={visible}
          intent="info"
          leadingIcon={<Info size={20} weight="fill" />}
          onDismiss={() => setDismissals((count) => count + 1)}
        >
          <Alert.Title>{text.title}</Alert.Title>
          <Alert.Description>{text.description}</Alert.Description>
          <Alert.CloseButton />
        </Alert>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const closeButton = canvas.getByRole('button', { name: /Dismiss alert|އެލާޓް ލައްޕާ/ });
    await userEvent.click(closeButton);
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(canvas.getByText('Dismiss callbacks: 1')).toBeVisible();
    await userEvent.click(canvas.getByRole('button', { name: /Hide alert|އެލާޓް ނުދައްކަވާ/ }));
    await waitFor(() => expect(canvas.queryByRole('status')).toBeNull());
  },
};

export const LiveRegions: Story = {
  render: () => (
    <div className="flex w-full max-w-[480px] flex-col gap-3">
      <Alert live="status">
        <Alert.Title>Status banner</Alert.Title>
      </Alert>
      <Alert live="alert">
        <Alert.Title>Dynamic announcement</Alert.Title>
      </Alert>
      <Alert role="region" aria-label="Custom alert region">
        <Alert.Title>Custom landmark</Alert.Title>
      </Alert>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('status')).toBeVisible();
    await expect(canvas.getByRole('alert')).toBeVisible();
    await expect(canvas.getByRole('region', { name: 'Custom alert region' })).toBeVisible();
  },
};
