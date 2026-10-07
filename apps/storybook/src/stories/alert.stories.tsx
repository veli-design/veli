import { useEffect, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import { CheckCircle, Clock, Info, Warning, WarningCircle, WarningOctagon } from 'phosphor-react';
import {
  Alert,
  type AlertAppearance,
  type AlertIntent,
  type AlertLayout,
} from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';
import { VeliProvider, useVeliColorScheme, useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const intents: AlertIntent[] = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'];
const appearances: AlertAppearance[] = ['light', 'highContrast'];
const layouts: AlertLayout[] = ['default', 'stacked', 'compact'];
const text = {
  en: {
    title: 'Permit review in progress',
    description: 'You will receive an email when your application has been processed.',
    actionLabel: 'Track application',
    secondaryActionLabel: 'Remind me later',
    reset: 'Reset alert',
    dismissed: 'Alert dismissed.',
    hidden: 'Starts hidden. Reset to show the alert.',
  },
  dv: {
    title: 'ޕާމިޓް ރިވިއު ކުރިއަށްދަނީ',
    description: 'އެޕްލިކޭޝަން ޕްރޮސެސްކުރުމުން އީމެއިލް ލިބޭނެއެވެ.',
    actionLabel: 'ޝެޑިއުލް ބައްލަވާ',
    secondaryActionLabel: 'ކުރިއަށް',
    reset: 'އެލާޓް އަލުން ދައްކާ',
    dismissed: 'އެލާޓް ލެއްޕިއްޖެ.',
    hidden: 'އެލާޓް ފެށެނީ ފޮރުވިފައި. އަލުން ދައްކާ.',
  },
} as const;
type Language = keyof typeof text;
const textKeys = ['title', 'description', 'actionLabel', 'secondaryActionLabel'] as const;
type TextKey = (typeof textKeys)[number];
const useLanguage = (): Language => useVeliLanguage().language;
function localize(key: TextKey, value: string, language: Language) {
  return !value.trim() || Object.values(text).some((copy) => copy[key] === value)
    ? text[language][key]
    : value;
}

function AlertDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const collapse = () => {
      if (cancelled) return;
      const groups = ['Content', 'State'];
      if (
        groups.some(
          (group) =>
            !document.querySelector(
              `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
            ),
        ) &&
        attempts++ < 40
      ) {
        requestAnimationFrame(collapse);
        return;
      }
      groups.forEach((group) =>
        document
          .querySelector<HTMLElement>(`tr[title^="Hide ${group} item"] [tabindex="0"]`)
          ?.click(),
      );
    };
    collapse();
    return () => {
      cancelled = true;
    };
  }, []);
  return <DocsContainer {...props} />;
}

const icons = {
  neutral: Info,
  info: Info,
  positive: CheckCircle,
  cautious: WarningCircle,
  warning: Warning,
  danger: WarningOctagon,
};
function AlertIcon({ intent, custom = false }: { intent: AlertIntent; custom?: boolean }) {
  const Icon = custom ? Clock : icons[intent];
  return <Icon size={20} weight="fill" />;
}

type AlertStoryArgs = ComponentProps<typeof Alert> & {
  title: string;
  description: string;
  actionLabel: string;
  secondaryActionLabel: string;
  showLeadingIcon: boolean;
  customIcon: boolean;
  showDescription: boolean;
  showActions: boolean;
  showSecondaryAction: boolean;
  showCloseButton: boolean;
  onAction: () => void;
  onSecondaryAction: () => void;
};
function AlertExample({
  title,
  description,
  actionLabel,
  secondaryActionLabel,
  showLeadingIcon,
  customIcon,
  showDescription,
  showActions,
  showSecondaryAction,
  showCloseButton,
  onAction,
  onSecondaryAction,
  intent = 'info',
  appearance = 'light',
  layout = 'default',
  ...props
}: AlertStoryArgs) {
  const language = useLanguage();
  return (
    <Alert
      {...props}
      intent={intent}
      appearance={appearance}
      layout={layout}
      leadingIcon={showLeadingIcon ? <AlertIcon intent={intent} custom={customIcon} /> : undefined}
    >
      <Alert.Title>{localize('title', title, language)}</Alert.Title>
      {showDescription && layout !== 'compact' ? (
        <Alert.Description>{localize('description', description, language)}</Alert.Description>
      ) : null}
      {showActions ? (
        <Alert.Actions>
          <Button
            type="button"
            size="sm"
            intent="secondary"
            appearance={appearance === 'light' ? 'fill' : 'transparent'}
            onPress={onAction}
          >
            {localize('actionLabel', actionLabel, language)}
          </Button>
          {showSecondaryAction && layout !== 'compact' ? (
            <Button
              type="button"
              size="sm"
              intent="secondary"
              appearance="ghost"
              onPress={onSecondaryAction}
            >
              {localize('secondaryActionLabel', secondaryActionLabel, language)}
            </Button>
          ) : null}
        </Alert.Actions>
      ) : null}
      {showCloseButton ? <Alert.CloseButton /> : null}
    </Alert>
  );
}
const group = <T extends Record<string, object>>(category: string, fields: T) =>
  Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, { ...value, table: { category } }]),
  );
const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: { sort: 'none' },
    docs: { container: AlertDocsContainer },
  },
  decorators: [
    (Story, context) => {
      const [args, updateArgs] = useArgs();
      const language: Language = context.globals.language === 'dv' ? 'dv' : 'en';
      const { title, description, actionLabel, secondaryActionLabel } = args;
      useEffect(() => {
        const current = { title, description, actionLabel, secondaryActionLabel };
        const next: Partial<Record<TextKey, string>> = {};
        for (const key of textKeys) {
          const value = current[key];
          if (typeof value === 'string') {
            const localized = localize(key, value, language);
            if (value !== localized) next[key] = localized;
          }
        }
        if (Object.keys(next).length) updateArgs(next);
      }, [title, description, actionLabel, secondaryActionLabel, language, updateArgs]);
      return <Story />;
    },
  ],
  args: {
    intent: 'info',
    appearance: 'light',
    layout: 'default',
    live: 'status',
    defaultVisible: true,
    title: text.en.title,
    description: text.en.description,
    actionLabel: text.en.actionLabel,
    secondaryActionLabel: text.en.secondaryActionLabel,
    showLeadingIcon: true,
    customIcon: false,
    showDescription: true,
    showActions: true,
    showSecondaryAction: true,
    showCloseButton: true,
    onAction: fn(),
    onSecondaryAction: fn(),
    onDismiss: fn(),
  },
  argTypes: {
    ...group('Appearance', {
      intent: { control: 'select', options: intents },
      appearance: { control: 'select', options: appearances },
      layout: { control: 'select', options: layouts },
    }),
    ...group('Content', {
      title: { control: 'text' },
      description: { control: 'text' },
      actionLabel: { control: 'text' },
      secondaryActionLabel: { control: 'text' },
      showLeadingIcon: { control: 'boolean' },
      customIcon: { control: 'boolean' },
      showDescription: { control: 'boolean', if: { arg: 'layout', neq: 'compact' } },
      showActions: { control: 'boolean' },
      showSecondaryAction: { control: 'boolean', if: { arg: 'layout', neq: 'compact' } },
      showCloseButton: { control: 'boolean' },
    }),
    ...group('State', {
      live: { control: 'select', options: ['status', 'alert'] },
      defaultVisible: { control: 'boolean' },
      isVisible: { control: 'boolean' },
    }),
    ...Object.fromEntries(
      [
        'children',
        'className',
        'leadingIcon',
        'role',
        'onDismiss',
        'onAction',
        'onSecondaryAction',
      ].map((key) => [key, { table: { disable: true } }]),
    ),
  },
} satisfies Meta<AlertStoryArgs>;
export default meta;
type Story = StoryObj<AlertStoryArgs>;

function PlaygroundExample(args: AlertStoryArgs) {
  const [generation, setGeneration] = useState(0);
  const copy = text[useLanguage()];
  return (
    <div className="flex w-140 max-w-full flex-col items-start gap-4">
      <AlertExample key={`${generation}-${args.defaultVisible}`} {...args} />
      <Button
        type="button"
        size="sm"
        intent="secondary"
        appearance="ghost"
        onPress={() => setGeneration((value) => value + 1)}
      >
        {copy.reset}
      </Button>
    </div>
  );
}
export const Playground: Story = { render: (args) => <PlaygroundExample {...args} /> };
export const Default: Story = {
  render: (args) => (
    <div className="w-140 max-w-full">
      <AlertExample {...args} />
    </div>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const alert = canvas.getByRole('status');
    const buttons = within(alert).getAllByRole('button');
    await userEvent.click(buttons[0]);
    await expect(args.onAction).toHaveBeenCalledOnce();
    await userEvent.click(buttons[1]);
    await expect(args.onSecondaryAction).toHaveBeenCalledOnce();
    await expect(canvas.getByRole('status')).toBeVisible();
  },
};
export const TitleOnly: Story = {
  args: { showDescription: false, showActions: false, showCloseButton: false },
  render: Default.render,
};
export const Stacked: Story = {
  args: { layout: 'stacked' },
  render: (args) => (
    <div className="w-[343px] max-w-[calc(100vw-2rem)]">
      <AlertExample {...args} />
    </div>
  ),
};
export const Compact: Story = { args: { layout: 'compact' }, render: Default.render };
export const CustomIcon: Story = {
  args: { intent: 'cautious', customIcon: true, title: 'Waiting for approval' },
  render: Default.render,
};
export const WithoutIcon: Story = { args: { showLeadingIcon: false }, render: Default.render };
export const OneAction: Story = { args: { showSecondaryAction: false }, render: Default.render };
export const WithoutActions: Story = { args: { showActions: false }, render: Default.render };
export const LongContent: Story = {
  args: {
    layout: 'stacked',
    title: 'An important update about your permit application and supporting documents',
    description:
      'Review the information carefully before continuing. The alert grows with its content and reserves a separate space for the close control.',
    actionLabel: 'Review supporting documents and application details',
  },
  render: Stacked.render,
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: (args) => (
    <div className="flex flex-col items-start gap-8">
      {layouts.map((layout) => (
        <section key={layout} className="flex max-w-full flex-col gap-4">
          <h2 className="type-body-md-medium text-base-emphasis">{layout}</h2>
          {appearances.map((appearance) => (
            <div key={appearance} className="flex max-w-full flex-col gap-4">
              <h3 className="type-body-sm-medium text-base-strong">{appearance}</h3>
              {intents.map((intent) => (
                <div
                  key={intent}
                  className={layout === 'stacked' ? 'w-[343px] max-w-full' : 'w-140 max-w-full'}
                  data-variant={`${layout}-${appearance}-${intent}`}
                >
                  <AlertExample {...args} layout={layout} appearance={appearance} intent={intent} />
                </div>
              ))}
            </div>
          ))}
        </section>
      ))}
    </div>
  ),
};

function DismissalExample({
  controlled = false,
  keepVisible = false,
  ...args
}: AlertStoryArgs & { controlled?: boolean; keepVisible?: boolean }) {
  const copy = text[useLanguage()];
  const [visible, setVisible] = useState(args.defaultVisible ?? true);
  const [generation, setGeneration] = useState(0);
  const [dismissed, setDismissed] = useState(false);
  return (
    <div className="flex w-140 max-w-full flex-col items-start gap-4">
      <AlertExample
        key={generation}
        {...args}
        isVisible={controlled ? visible : undefined}
        onDismiss={() => {
          args.onDismiss?.();
          setDismissed(true);
          if (controlled && !keepVisible) setVisible(false);
        }}
      />
      {dismissed ? <p className="type-body-sm-regular text-base-strong">{copy.dismissed}</p> : null}
      {!args.defaultVisible && !visible ? (
        <p className="type-body-sm-regular text-base-strong">{copy.hidden}</p>
      ) : null}
      <Button
        type="button"
        size="sm"
        intent="secondary"
        appearance="ghost"
        onPress={() => {
          setGeneration((value) => value + 1);
          setVisible(true);
          setDismissed(false);
        }}
      >
        {copy.reset}
      </Button>
    </div>
  );
}
async function dismissAndReset({
  canvasElement,
  args,
}: {
  canvasElement: HTMLElement;
  args: AlertStoryArgs;
}) {
  const canvas = within(canvasElement);
  const close = canvasElement.querySelector<HTMLButtonElement>('[data-slot="alert-close"]')!;
  close.focus();
  await userEvent.keyboard('{Enter}');
  await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  await expect(args.onDismiss).toHaveBeenCalledOnce();
  await userEvent.click(canvas.getByRole('button'));
  await expect(canvas.getByRole('status')).toBeVisible();
  canvasElement.querySelector<HTMLButtonElement>('[data-slot="alert-close"]')!.focus();
  await userEvent.keyboard(' ');
  await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
  await expect(args.onDismiss).toHaveBeenCalledTimes(2);
}
export const Dismissible: Story = {
  render: (args) => <DismissalExample {...args} />,
  play: dismissAndReset,
};
export const ControlledDismissal: Story = {
  render: (args) => <DismissalExample {...args} controlled />,
  play: dismissAndReset,
};
export const ControlledVisibility: Story = {
  render: (args) => <DismissalExample {...args} controlled keepVisible />,
  play: async ({ canvasElement, args }) => {
    await userEvent.click(
      canvasElement.querySelector<HTMLButtonElement>('[data-slot="alert-close"]')!,
    );
    await expect(args.onDismiss).toHaveBeenCalledOnce();
    await expect(within(canvasElement).getByRole('status')).toBeVisible();
  },
};
export const InitiallyHidden: Story = {
  args: { defaultVisible: false },
  render: (args) => <DismissalExample {...args} controlled />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('status')).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole('button'));
    await expect(canvas.getByRole('status')).toBeVisible();
  },
};
export const Announcements: Story = {
  render: () => (
    <div className="flex w-140 max-w-full flex-col gap-4">
      <Alert live="status">
        <Alert.Title>Status banner</Alert.Title>
      </Alert>
      <Alert live="alert">
        <Alert.Title>Urgent dynamic announcement</Alert.Title>
      </Alert>
      <Alert role="region" aria-label="Custom alert region">
        <Alert.Title>Custom landmark</Alert.Title>
      </Alert>
    </div>
  ),
};
function EnglishRtlExample(args: AlertStoryArgs) {
  const { colorScheme } = useVeliColorScheme();
  return (
    <VeliProvider language="en" colorScheme={colorScheme}>
      <div dir="rtl" className="w-140 max-w-full">
        <AlertExample {...args} />
      </div>
    </VeliProvider>
  );
}
export const EnglishRTL: Story = {
  render: (args) => <EnglishRtlExample {...args} />,
};
