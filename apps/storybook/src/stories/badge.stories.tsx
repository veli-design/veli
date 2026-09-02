import { type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { Avatar } from '@tradenetcorp/veli-ui/avatar';
import { Badge, type BadgeAppearance, type BadgeIntent } from '@tradenetcorp/veli-ui/badge';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
import { Bell, FlagBanner } from 'phosphor-react';

const statusIntents: BadgeIntent[] = [
  'neutral',
  'info',
  'positive',
  'cautious',
  'warning',
  'danger',
];

const accentIntents: BadgeIntent[] = ['magenta', 'indigo', 'brand', 'green', 'lime'];

const allIntents: BadgeIntent[] = [...statusIntents, ...accentIntents];

const appearances: BadgeAppearance[] = ['outline', 'subtle', 'emphasis'];

const appearanceLabels: Record<BadgeAppearance, string> = {
  outline: 'Outline',
  subtle: 'Subtle',
  emphasis: 'Emphasis',
};

const intentLabels: Record<BadgeIntent, string> = {
  neutral: 'Neutral',
  info: 'Info',
  positive: 'Positive',
  cautious: 'Cautious',
  warning: 'Warning',
  danger: 'Danger',
  magenta: 'Magenta',
  indigo: 'Indigo',
  brand: 'Brand',
  teal: 'Teal',
  green: 'Green',
  lime: 'Lime',
};

const enBadgeText = {
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  statusAriaLabel: 'Status',
  notificationAriaLabel: '5 notifications',
  onlineStatusLabel: 'Online',
  awayStatusLabel: 'Away',
  busyStatusLabel: 'Busy',
  offlineStatusLabel: 'Offline',
} as const;

const dhivehiBadgeText = {
  approved: 'ފާސްކޮށްފައި',
  rejected: 'ބާތިލްކޮށްފައި',
  pending: 'މަޑުކުރެވިފައި',
  statusAriaLabel: 'ހާލަތު',
  notificationAriaLabel: '5 ނޯޓިފިކޭޝަން',
  onlineStatusLabel: 'އޮންލައިން',
  awayStatusLabel: 'އެވޭ',
  busyStatusLabel: 'ބިޒީ',
  offlineStatusLabel: 'އޮފްލައިން',
} as const;

const localizedBadgeText = {
  en: enBadgeText,
  dv: dhivehiBadgeText,
} as const;

type BadgeLanguage = keyof typeof localizedBadgeText;
type BadgeStoryArgs = ComponentProps<typeof Badge> & {
  showIcon: boolean;
};

const useBadgeLanguage = (): BadgeLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useBadgeText = () => {
  const language = useBadgeLanguage();

  return localizedBadgeText[language];
};

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: intentLabels.neutral,
    appearance: 'outline',
    intent: 'neutral',
    size: 'md',
    showIcon: true,
    counter: false,
    count: undefined,
    max: 99,
  },
  argTypes: {
    appearance: {
      control: 'select',
      options: appearances,
    },
    intent: {
      control: 'select',
      options: [...statusIntents, ...accentIntents],
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md'],
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
    children: {
      control: 'text',
    },
  },
} satisfies Meta<BadgeStoryArgs>;

export default meta;
type Story = StoryObj<BadgeStoryArgs>;

function BadgeIcon({ size }: { size: 'sm' | 'md' }) {
  return <FlagBanner aria-hidden size={size === 'sm' ? 12 : 16} weight="regular" />;
}

export const Playground: Story = {
  render: ({ showIcon, size = 'md', intent = 'neutral', counter, count, ...args }) => {
    const text = useBadgeText();
    const isCounter = counter || count != null;

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
        {size === 'xs' ? undefined : intentLabels[intent]}
      </Badge>
    );
  },
};

export const Default: Story = {
  render: () => (
    <Badge appearance="outline" intent="neutral" leadingIcon={<BadgeIcon size="md" />}>
      {intentLabels.neutral}
    </Badge>
  ),
};

export const StatusColors: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {appearances.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-base-emphasis capitalize">{appearance}</p>
          <div className="flex flex-wrap gap-2">
            {statusIntents.map((intent) => (
              <Badge
                key={`${appearance}-${intent}`}
                appearance={appearance}
                intent={intent}
                leadingIcon={<BadgeIcon size="md" />}
              >
                {intentLabels[intent]}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const AccentColors: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {appearances.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-base-emphasis capitalize">{appearance}</p>
          <div className="flex flex-wrap gap-2">
            {accentIntents.map((intent) => (
              <Badge
                key={`${appearance}-${intent}`}
                appearance={appearance}
                intent={intent}
                leadingIcon={<BadgeIcon size="md" />}
              >
                {intentLabels[intent]}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {(['sm', 'md'] as const).map((size) => (
        <div key={size} className="flex items-center gap-3">
          <span className="type-body-sm-regular w-8 text-base-muted">{size}</span>
          <Badge
            appearance="outline"
            intent="info"
            size={size}
            leadingIcon={<BadgeIcon size={size === 'sm' ? 'sm' : 'md'} />}
          >
            {intentLabels.info}
          </Badge>
        </div>
      ))}
    </div>
  ),
};

export const Counter: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {appearances.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-base-emphasis capitalize">{appearance}</p>
          <div className="flex flex-wrap items-center gap-2">
            {allIntents.map((intent) => (
              <Badge
                key={`${appearance}-${intent}-sm`}
                counter
                appearance={appearance}
                intent={intent}
                size="sm"
              >
                3
              </Badge>
            ))}
            {allIntents.map((intent) => (
              <Badge
                key={`${appearance}-${intent}-md`}
                counter
                appearance={appearance}
                intent={intent}
                size="md"
              >
                12
              </Badge>
            ))}
            <Badge counter appearance={appearance} intent="danger" size="md" count={128} max={99} />
          </div>
        </div>
      ))}
    </div>
  ),
};

export const Count: Story = {
  render: () => (
    <Badge appearance="emphasis" intent="danger" size="sm" count={7}>
      ignored
    </Badge>
  ),
};

export const CounterOnIcon: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <div className="relative inline-flex">
        <Bell aria-hidden size={24} className="text-icon-base" />
        <Badge
          counter
          count={5}
          appearance="emphasis"
          intent="danger"
          size="sm"
          className="absolute -top-1 -end-1"
          aria-label={text.notificationAriaLabel}
        />
      </div>
    );
  },
};

export const StatusDots: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['subtle', 'emphasis'] as const).map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-base-emphasis capitalize">{appearance}</p>
          <div className="flex flex-wrap items-center gap-2">
            {[...statusIntents, ...accentIntents].map((intent) => (
              <Badge
                key={`${appearance}-${intent}`}
                appearance={appearance}
                intent={intent}
                size="xs"
                aria-label={`${appearance} ${intent} status`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  ),
};

export const OnlineStatus: Story = {
  render: () => {
    const text = useBadgeText();

    const presenceUsers = [
      {
        name: 'John Doe',
        initials: 'JD',
        src: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'positive' as const,
        statusLabel: text.onlineStatusLabel,
      },
      {
        name: 'Aisha Hassan',
        initials: 'AH',
        src: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'cautious' as const,
        statusLabel: text.awayStatusLabel,
      },
      {
        name: 'Michael Chen',
        initials: 'MC',
        src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'danger' as const,
        statusLabel: text.busyStatusLabel,
      },
      {
        name: 'Sara Ibrahim',
        initials: 'SI',
        src: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=facearea&facepad=2&w=128&h=128&q=80',
        intent: 'neutral' as const,
        statusLabel: text.offlineStatusLabel,
      },
    ];

    return (
      <ul className="flex w-64 flex-col gap-3">
        {presenceUsers.map(({ name, initials, src, intent, statusLabel }) => (
          <li key={name} className="flex items-center gap-3">
            <div className="relative inline-flex shrink-0">
              <Avatar type="image" src={src} initials={initials} alt={name} size="44" />
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

export const WithoutIcon: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <div className="flex flex-wrap gap-2">
        <Badge appearance="subtle" intent="positive">
          {text.approved}
        </Badge>
        <Badge appearance="emphasis" intent="danger">
          {text.rejected}
        </Badge>
        <Badge appearance="outline" intent="warning">
          {text.pending}
        </Badge>
      </div>
    );
  },
};

export const AllVariants: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className="space-y-8">
      <p className="type-body-sm-regular text-base-muted">
        Use the Veli provider toolbar to compare system, light, and dark themes on base and raised
        surfaces.
      </p>
      {appearances.map((appearance) => (
        <section key={appearance} className="space-y-3">
          <h3 className="type-body-sm-medium text-base-emphasis">{appearanceLabels[appearance]}</h3>
          <div className="overflow-x-auto">
            <table className="border-separate border-spacing-3">
              <thead>
                <tr className="type-body-sm-regular text-base-muted">
                  <th className="text-start font-medium">Intent</th>
                  <th className="min-w-22 text-center font-medium">sm</th>
                  <th className="min-w-24 text-center font-medium">md</th>
                </tr>
              </thead>
              <tbody>
                {allIntents.map((intent) => (
                  <tr key={intent}>
                    <td className="type-body-sm-regular text-base">{intentLabels[intent]}</td>
                    <td className="text-center">
                      <Badge
                        appearance={appearance}
                        intent={intent}
                        size="sm"
                        leadingIcon={<BadgeIcon size="sm" />}
                      >
                        {intentLabels[intent]}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge
                        appearance={appearance}
                        intent={intent}
                        size="md"
                        leadingIcon={<BadgeIcon size="md" />}
                      >
                        {intentLabels[intent]}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  ),
};
