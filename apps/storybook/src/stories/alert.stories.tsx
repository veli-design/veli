import { useEffect, useState, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { expect, fn, userEvent, within } from '@storybook/test';
import { useArgs } from 'storybook/internal/preview-api';
import {
  CheckCircleIcon,
  ClockIcon,
  InfoIcon,
  WarningIcon,
  WarningCircleIcon,
  WarningOctagonIcon,
} from '@phosphor-icons/react';
import {
  Alert,
  type AlertAppearance,
  type AlertIntent,
  type AlertLayout,
} from '@tradenetcorp/veli-ui/alert';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const intents: AlertIntent[] = ['neutral', 'info', 'positive', 'cautious', 'warning', 'danger'];
const appearances: AlertAppearance[] = ['light', 'highContrast'];
const layouts: AlertLayout[] = ['default', 'stacked', 'compact'];
/** Cap demo width at the desktop sample, and never exceed the viewport. */
const alertDemoWidth = 'w-[min(35rem,calc(100vw-2rem))]';
const alertStackedWidth = 'w-[min(343px,calc(100vw-2rem))]';

const text = {
  en: {
    title: 'Permit review in progress',
    description: 'You will receive an email when your application has been processed.',
    actionLabel: 'Track application',
    secondaryActionLabel: 'Remind me later',
    reset: 'Reset alert',
    default: 'Default',
    urgentAnnouncement: 'Urgent dynamic announcement',
    customLandmark: 'Custom landmark',
    customRegionLabel: 'Custom alert region',
    waitingForApproval: 'Waiting for approval',
    longTitle: 'An important update about your permit application and supporting documents',
    longDescription:
      'Review the information carefully before continuing. The alert grows with its content and reserves a separate space for the close control.',
    longActionLabel: 'Review supporting documents and application details',
  },
  dv: {
    title: 'ޕާމިޓް ރިވިއު ކުރިއަށްދަނީ',
    description: 'އެޕްލިކޭޝަން ޕްރޮސެސްކުރުމުން އީމެއިލް ލިބޭނެއެވެ.',
    actionLabel: 'ޝެޑިއުލް ބައްލަވާ',
    secondaryActionLabel: 'ކުރިއަށް',
    reset: 'އެލާޓް އަލުން ދައްކާ',
    default: 'އާދައިގެ',
    urgentAnnouncement: 'އަވަސް އެނައުންސްމަންޓް',
    customLandmark: 'ކަސްޓަމް ލޭންޑްމާކް',
    customRegionLabel: 'ކަސްޓަމް އެލާޓް ރީޖަން',
    waitingForApproval: 'އެޕްރޫވަލް އިންތިޒާރުކުރަނީ',
    longTitle: 'ތިޔަ ޕާމިޓް އެޕްލިކޭޝަނާއި ގުޅޭ ލިޔެކިޔުންތަކުގެ މުހިންމު އަޕްޑޭޓެއް',
    longDescription:
      'ކުރިއަށްދާންފަހު މަޢުލޫމާތު ސަމާލުކަންބަލާ. އެލާޓް ކޮންޓެންޓްއާ އެކު ބޮޑުވެ، ލައްޕާ ކޮންޓްރޯލަށް ވަކި ޖާގައެއް ރިޒާވްކުރެއެވެ.',
    longActionLabel: 'ގުޅޭ ލިޔެކިޔުންތަކާއި އެޕްލިކޭޝަން ޑިޓޭލް ބައްލަވާ',
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

const getAlertPreviewKey = (language: Language, defaultVisible: boolean | undefined) =>
  `${language}:${defaultVisible === false ? 'hidden' : 'visible'}`;

const collapsedControlGroups = ['Content', 'State'] as const;

function AlertDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const collapse = () => {
      if (cancelled) return;
      if (
        collapsedControlGroups.some(
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
      collapsedControlGroups.forEach((group) =>
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
  neutral: InfoIcon,
  info: InfoIcon,
  positive: CheckCircleIcon,
  cautious: WarningCircleIcon,
  warning: WarningIcon,
  danger: WarningOctagonIcon,
};

function AlertIcon({ intent, custom = false }: { intent: AlertIntent; custom?: boolean }) {
  const Icon = custom ? ClockIcon : icons[intent];
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
  intent = 'neutral',
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
            appearance="fill"
            highContrast={appearance === 'highContrast'}
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
              highContrast={appearance === 'highContrast'}
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

const hiddenHtmlAlertArgTypes = {
  about: { table: { disable: true } },
  accessKey: { table: { disable: true } },
  autoFocus: { table: { disable: true } },
  contentEditable: { table: { disable: true } },
  contextMenu: { table: { disable: true } },
  dangerouslySetInnerHTML: { table: { disable: true } },
  datatype: { table: { disable: true } },
  defaultChecked: { table: { disable: true } },
  defaultValue: { table: { disable: true } },
  dir: { table: { disable: true } },
  draggable: { table: { disable: true } },
  hidden: { table: { disable: true } },
  id: { table: { disable: true } },
  inlist: { table: { disable: true } },
  inputMode: { table: { disable: true } },
  is: { table: { disable: true } },
  itemID: { table: { disable: true } },
  itemProp: { table: { disable: true } },
  itemRef: { table: { disable: true } },
  itemScope: { table: { disable: true } },
  itemType: { table: { disable: true } },
  lang: { table: { disable: true } },
  nonce: { table: { disable: true } },
  placeholder: { table: { disable: true } },
  prefix: { table: { disable: true } },
  property: { table: { disable: true } },
  radioGroup: { table: { disable: true } },
  resource: { table: { disable: true } },
  results: { table: { disable: true } },
  role: { table: { disable: true } },
  security: { table: { disable: true } },
  slot: { table: { disable: true } },
  spellCheck: { table: { disable: true } },
  style: { table: { disable: true } },
  suppressContentEditableWarning: { table: { disable: true } },
  suppressHydrationWarning: { table: { disable: true } },
  tabIndex: { table: { disable: true } },
  translate: { table: { disable: true } },
  typeof: { table: { disable: true } },
  unselectable: { table: { disable: true } },
  vocab: { table: { disable: true } },
} as const;

const meta = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    controls: {
      sort: 'none',
      exclude: /^(on[A-Z]|aria-|data-)/,
    },
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
    intent: 'neutral',
    appearance: 'light',
    layout: 'default',
    live: 'status',
    defaultVisible: true,
    title: '',
    description: '',
    actionLabel: '',
    secondaryActionLabel: '',
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
    ...withArgCategory('Appearance', {
      intent: { control: 'select', options: intents },
      appearance: { control: 'select', options: appearances },
      layout: { control: 'select', options: layouts },
    }),
    ...withArgCategory('Label', {
      title: { control: 'text' },
    }),
    ...withArgCategory('Content', {
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
    ...withArgCategory('State', {
      live: { control: 'select', options: ['status', 'alert'] },
      defaultVisible: { control: 'boolean' },
      isVisible: { control: 'boolean' },
    }),
    children: { table: { disable: true } },
    className: { table: { disable: true } },
    leadingIcon: { control: false, table: { disable: true } },
    onDismiss: { table: { disable: true } },
    onAction: { table: { disable: true } },
    onSecondaryAction: { table: { disable: true } },
    ...hiddenHtmlAlertArgTypes,
  },
} satisfies Meta<AlertStoryArgs>;

export default meta;
type Story = StoryObj<AlertStoryArgs>;

export const Default: Story = {
  render: (args) => {
    const language = useLanguage();
    const [generation, setGeneration] = useState(0);
    const copy = text[language];

    return (
      <div className={`flex ${alertDemoWidth} flex-col items-start gap-4`}>
        <AlertExample
          key={`${getAlertPreviewKey(language, args.defaultVisible)}-${generation}`}
          {...args}
        />
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
  },
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

export const Stacked: Story = {
  args: { layout: 'stacked' },
  render: (args) => {
    const language = useLanguage();

    return (
      <div key={getAlertPreviewKey(language, args.defaultVisible)} className={alertStackedWidth}>
        <AlertExample {...args} />
      </div>
    );
  },
};

export const Compact: Story = {
  args: { layout: 'compact' },
  render: (args) => {
    const language = useLanguage();

    return (
      <div key={getAlertPreviewKey(language, args.defaultVisible)} className={alertDemoWidth}>
        <AlertExample {...args} />
      </div>
    );
  },
};

export const CustomIcon: Story = {
  args: { intent: 'cautious', customIcon: true },
  render: (args) => {
    const language = useLanguage();

    return (
      <div key={getAlertPreviewKey(language, args.defaultVisible)} className={alertDemoWidth}>
        <AlertExample {...args} title={text[language].waitingForApproval} />
      </div>
    );
  },
};

export const LongContent: Story = {
  args: { layout: 'stacked' },
  render: (args) => {
    const language = useLanguage();
    const copy = text[language];

    return (
      <div key={getAlertPreviewKey(language, args.defaultVisible)} className={alertStackedWidth}>
        <AlertExample
          {...args}
          title={copy.longTitle}
          description={copy.longDescription}
          actionLabel={copy.longActionLabel}
        />
      </div>
    );
  },
};

export const AllVariants: Story = {
  parameters: { layout: 'padded' },
  render: (args) => {
    const language = useLanguage();

    return (
      <div key={language} className="flex w-full flex-col items-center gap-8">
        {layouts.map((layout) => (
          <section key={layout} className="flex w-full max-w-full flex-col items-center gap-4">
            <h2 className="type-body-md-medium text-base-emphasis">{layout}</h2>
            {appearances.map((appearance) => (
              <div key={appearance} className="flex w-full max-w-full flex-col items-center gap-4">
                <h3 className="type-body-sm-medium text-base-strong">
                  {appearance === 'highContrast' ? 'High contrast' : 'Default'}
                </h3>
                {intents.map((intent) => (
                  <div
                    key={intent}
                    className={layout === 'stacked' ? alertStackedWidth : alertDemoWidth}
                    data-variant={`${layout}-${appearance}-${intent}`}
                  >
                    <AlertExample
                      {...args}
                      layout={layout}
                      appearance={appearance}
                      intent={intent}
                    />
                  </div>
                ))}
              </div>
            ))}
          </section>
        ))}
      </div>
    );
  },
};

export const States: Story = {
  parameters: { controls: { disable: true } },
  render: () => {
    const language = useLanguage();
    const copy = text[language];

    return (
      <div key={language} className={`flex ${alertDemoWidth} flex-col gap-4`}>
        <Alert live="status">
          <Alert.Title>{copy.default}</Alert.Title>
        </Alert>
        <Alert live="alert">
          <Alert.Title>{copy.urgentAnnouncement}</Alert.Title>
        </Alert>
        <Alert role="region" aria-label={copy.customRegionLabel}>
          <Alert.Title>{copy.customLandmark}</Alert.Title>
        </Alert>
      </div>
    );
  },
};
