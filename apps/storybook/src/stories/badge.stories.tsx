import { useEffect, type ComponentProps, type ReactNode } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
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

const accentIntents: BadgeIntent[] = ['magenta', 'indigo', 'teal', 'green', 'lime'];

const appearances: BadgeAppearance[] = ['outline', 'subtle', 'emphasis'];

const enBadgeText = {
  label: 'Label',
  approved: 'Approved',
  rejected: 'Rejected',
  pending: 'Pending',
  statusAriaLabel: 'Status',
  notificationAriaLabel: '5 notifications',
} as const;

const dhivehiBadgeText = {
  label: 'ލޭބަލް',
  approved: 'ފާސްކޮށްފައި',
  rejected: 'ބާތިލްކޮށްފައި',
  pending: 'މަޑުކުރެވިފައި',
  statusAriaLabel: 'ހާލަތު',
  notificationAriaLabel: '5 ނޯޓިފިކޭޝަން',
} as const;

const localizedBadgeText = {
  en: enBadgeText,
  dv: dhivehiBadgeText,
} as const;

const badgeArgText = {
  children: {
    en: enBadgeText.label,
    dv: dhivehiBadgeText.label,
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
  value: ReactNode,
  language: BadgeLanguage,
): ReactNode => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return badgeArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(badgeArgText[key]);

  if (localizedValues.includes(value)) {
    return badgeArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
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

          if (typeof localizedValue === 'string' && currentArgs[key] !== localizedValue) {
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
  args: {
    children: enBadgeText.label,
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
  render: ({ showIcon, size = 'md', children, counter, count, ...args }) => {
    const language = useBadgeLanguage();
    const text = localizedBadgeText[language];
    const isCounter = counter || count != null;

    return (
      <Badge
        {...args}
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
        {size === 'xs' ? undefined : getLocalizedBadgeArgText('children', children, language)}
      </Badge>
    );
  },
};

export const Default: Story = {
  render: () => {
    const text = useBadgeText();

    return (
      <Badge appearance="outline" intent="neutral" leadingIcon={<BadgeIcon size="md" />}>
        {text.label}
      </Badge>
    );
  },
};

export const StatusColors: Story = {
  render: () => {
    const text = useBadgeText();

    return (
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
                  {text.label}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  },
};

export const AccentColors: Story = {
  render: () => {
    const text = useBadgeText();

    return (
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
                  {text.label}
                </Badge>
              ))}
            </div>
          </div>
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
        <Badge appearance="outline" intent="info" size="sm" leadingIcon={<BadgeIcon size="sm" />}>
          {text.label}
        </Badge>
        <Badge appearance="outline" intent="info" size="md" leadingIcon={<BadgeIcon size="md" />}>
          {text.label}
        </Badge>
      </div>
    );
  },
};

export const Counter: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {appearances.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-base-emphasis capitalize">{appearance}</p>
          <div className="flex flex-wrap items-center gap-2">
            {statusIntents.map((intent) => (
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
            {statusIntents.map((intent) => (
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
