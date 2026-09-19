import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { Avatar } from '@tradenetcorp/veli-ui/avatar';
import { Badge, type BadgeAppearance, type BadgeIntent } from '@tradenetcorp/veli-ui/badge';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Bell, CheckCircle, Clock, FlagBanner, XCircle } from 'phosphor-react';

const statusIntents = [
  'neutral',
  'info',
  'positive',
  'cautious',
  'warning',
  'danger',
] as const satisfies readonly BadgeIntent[];

const accentIntents = [
  'magenta',
  'indigo',
  'brand',
  'green',
  'lime',
] as const satisfies readonly BadgeIntent[];

const allIntents = [...statusIntents, ...accentIntents];

const appearances: BadgeAppearance[] = ['outline', 'subtle', 'emphasis'];

const enBadgeText = {
  children: 'Label',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  statusAriaLabel: 'Status',
  notificationAriaLabel: '5 notifications',
  onlineStatusLabel: 'Online',
  awayStatusLabel: 'Away',
  busyStatusLabel: 'Busy',
  offlineStatusLabel: 'Offline',
  johnDoe: 'John Doe',
  aishaHassan: 'Aisha Hassan',
  michaelChen: 'Michael Chen',
  saraIbrahim: 'Sara Ibrahim',
  intentLabels: {
    neutral: 'Neutral',
    info: 'Info',
    positive: 'Positive',
    cautious: 'Cautious',
    warning: 'Warning',
    danger: 'Danger',
    magenta: 'Magenta',
    indigo: 'Indigo',
    brand: 'Brand',
    green: 'Green',
    lime: 'Lime',
  },
} as const;

const dhivehiBadgeText = {
  children: 'ލޭބަލް',
  approved: 'ފާސްކޮށްފައި',
  rejected: 'ބާތިލްކޮށްފައި',
  pending: 'މަޑުކުރެވިފައި',
  statusAriaLabel: 'ހާލަތު',
  notificationAriaLabel: '5 ނޯޓިފިކޭޝަން',
  onlineStatusLabel: 'އޮންލައިން',
  awayStatusLabel: 'އެވޭ',
  busyStatusLabel: 'ބިޒީ',
  offlineStatusLabel: 'އޮފްލައިން',
  johnDoe: 'ޖޯން ޑޯ',
  aishaHassan: 'އާއިޝަތު ޙަސަން',
  michaelChen: 'މައިކަލް ޗެން',
  saraIbrahim: 'ސާރާ އިބްރާހީމް',
  intentLabels: {
    neutral: 'ނިއުޓްރަލް',
    info: 'އިންފޯ',
    positive: 'ޕޮޒިޓިވް',
    cautious: 'ކޯޝަސް',
    warning: 'ވޯނިންގ',
    danger: 'ޑޭންޖަރ',
    magenta: 'މެޖެންޓާ',
    indigo: 'އިންޑިގޯ',
    brand: 'ބްރޭންޑް',
    green: 'ގްރީން',
    lime: 'ލައިމް',
  },
} as const;

const localizedBadgeText = {
  en: enBadgeText,
  dv: dhivehiBadgeText,
} as const;

const badgeArgText = {
  children: {
    en: enBadgeText.children,
    dv: dhivehiBadgeText.children,
  },
} as const;

type BadgeLanguage = keyof typeof localizedBadgeText;
type BadgeArgTextKey = keyof typeof badgeArgText;
type BadgeStoryArgs = ComponentProps<typeof Badge> & {
  showIcon: boolean;
};

const badgeArgTextKeys = Object.keys(badgeArgText) as BadgeArgTextKey[];

const useBadgeLanguage = (): BadgeLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useBadgeText = () => {
  const language = useBadgeLanguage();

  return localizedBadgeText[language];
};

const getLocalizedBadgeArgText = (
  key: BadgeArgTextKey,
  value: unknown,
  language: BadgeLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return badgeArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(badgeArgText[key]);

  if (localizedValues.includes(value)) {
    return badgeArgText[key][language];
  }

  return value;
};

function BadgeIcon({ size }: { size: 'sm' | 'md' }) {
  return <FlagBanner aria-hidden size={size === 'sm' ? 12 : 16} weight="regular" />;
}

const meta = {
  title: 'Components/Badge',
  component: Badge,
  decorators: [
    (Story, context) => {
      const language: BadgeLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { children } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<BadgeArgTextKey, string>> = {};
        const currentArgs = { children };

        badgeArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedBadgeArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [children, language, updateArgs]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    appearance: {
      control: 'select',
      options: appearances,
    },
    intent: {
      control: 'select',
      options: allIntents,
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
    },
    children: {
      control: 'text',
    },
    showIcon: {
      control: 'boolean',
    },
    counter: {
      control: 'boolean',
    },
    count: {
      control: 'number',
    },
    max: {
      control: 'number',
    },
    leadingIcon: { control: false, table: { disable: true } },
    className: { table: { disable: true } },
    style: { table: { disable: true } },
    id: { table: { disable: true } },
    role: { table: { disable: true } },
    title: { table: { disable: true } },
  },
  args: {
    appearance: 'outline',
    intent: 'neutral',
    size: 'md',
    children: enBadgeText.children,
    showIcon: false,
    counter: false,
    count: undefined,
    max: 99,
  },
} satisfies Meta<BadgeStoryArgs>;

export default meta;
type Story = StoryObj<BadgeStoryArgs>;

export const Default: Story = {
  render: ({ showIcon, size = 'md', intent = 'neutral', counter, count, children, ...args }) => {
    const language = useBadgeLanguage();
    const text = useBadgeText();
    const isCounter = counter || count != null;
    const localizedChildren = getLocalizedBadgeArgText('children', children, language);

    return (
      <Badge
        {...args}
        intent={intent}
        size={size}
        counter={counter}
        count={count}
        aria-label={size === 'xs' ? text.statusAriaLabel : undefined}
        leadingIcon={
          size === 'xs' || !showIcon || isCounter ? undefined : (
            <BadgeIcon size={size === 'sm' ? 'sm' : 'md'} />
          )
        }
      >
        {size === 'xs' ? undefined : localizedChildren}
      </Badge>
    );
  },
};

export const Appearances: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <div className="flex flex-wrap items-center gap-2">
        {appearances.map((appearance) => (
          <Badge key={appearance} appearance={appearance} intent="info">
            {text.children}
          </Badge>
        ))}
      </div>
    );
  },
};

export const Intents: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <div className="flex flex-wrap items-center gap-2">
        {allIntents.map((intent) => (
          <Badge key={intent} appearance="outline" intent={intent}>
            {text.intentLabels[intent]}
          </Badge>
        ))}
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <div className="flex flex-col gap-3">
        {(['sm', 'md'] as const).map((size) => (
          <div key={size} className="flex items-center gap-3">
            <span className="type-body-sm-regular w-8 text-base-muted">{size}</span>
            <Badge appearance="emphasis" intent="info" size={size}>
              {text.children}
            </Badge>
            <Badge appearance="subtle" intent="danger" size={size}>
              {text.children}
            </Badge>
          </div>
        ))}
      </div>
    );
  },
};

export const Counter: Story = {
  render: () => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Badge intent="danger" counter count={5} />
        <Badge intent="info" counter count={42} size="sm" />
        <Badge intent="neutral" counter count={128} max={99} />
        <Badge count={7} appearance="emphasis" intent="danger" size="sm" />
      </div>
    );
  },
};

export const StatusDots: Story = {
  render: () => {
    const text = useBadgeText();
    const labels = [
      text.onlineStatusLabel,
      text.awayStatusLabel,
      text.busyStatusLabel,
      text.offlineStatusLabel,
    ] as const;
    const intents = ['positive', 'cautious', 'danger', 'neutral'] as const;

    return (
      <div className="flex flex-wrap items-center gap-2">
        {intents.map((intent, index) => (
          <Badge
            key={intent}
            appearance="emphasis"
            intent={intent}
            size="xs"
            aria-label={labels[index]}
          />
        ))}
      </div>
    );
  },
};

export const WithLeadingIcon: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <div className="flex flex-wrap gap-2">
        <Badge
          appearance="subtle"
          intent="positive"
          leadingIcon={<CheckCircle aria-hidden size={16} weight="regular" />}
        >
          {text.approved}
        </Badge>
        <Badge
          appearance="emphasis"
          intent="danger"
          leadingIcon={<XCircle aria-hidden size={16} weight="regular" />}
        >
          {text.rejected}
        </Badge>
        <Badge
          appearance="outline"
          intent="warning"
          leadingIcon={<Clock aria-hidden size={16} weight="regular" />}
        >
          {text.pending}
        </Badge>
      </div>
    );
  },
};

export const CounterOnIcon: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <div className="relative inline-flex">
        <Button
          iconOnly
          intent="secondary"
          appearance="transparent"
          size="md"
          aria-label={text.notificationAriaLabel}
        >
          <Bell aria-hidden size={20} weight="regular" />
        </Button>
        <Badge
          counter
          count={5}
          appearance="emphasis"
          intent="danger"
          size="sm"
          className="absolute -top-0.5 -end-0.5"
          aria-hidden
        />
      </div>
    );
  },
};

export const OnlineStatusExample: Story = {
  render: () => {
    const text = useBadgeText();

    const presenceUsers = [
      {
        name: text.johnDoe,
        src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'positive' as const,
        statusLabel: text.onlineStatusLabel,
      },
      {
        name: text.aishaHassan,
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'cautious' as const,
        statusLabel: text.awayStatusLabel,
      },
      {
        name: text.michaelChen,
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'danger' as const,
        statusLabel: text.busyStatusLabel,
      },
      {
        name: text.saraIbrahim,
        src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'neutral' as const,
        statusLabel: text.offlineStatusLabel,
      },
    ];

    return (
      <ul className="flex w-64 flex-col gap-3">
        {presenceUsers.map(({ name, src, intent, statusLabel }) => (
          <li key={name} className="flex items-center gap-3">
            <div className="relative inline-flex shrink-0">
              <Avatar type="image" src={src} initials={name} alt={name} size="44" />
              <Badge
                appearance="emphasis"
                intent={intent}
                size="xs"
                className="absolute bottom-0.5 end-0.5 ring-2 ring-bg-surface-base"
                aria-label={statusLabel}
              />
            </div>
            <div className="min-w-0">
              <p className="type-body-sm-medium truncate text-base">{name}</p>
              <p className="type-caption-regular text-base-muted">{statusLabel}</p>
            </div>
          </li>
        ))}
      </ul>
    );
  },
};
