import type { Meta, StoryObj } from '@storybook/react';
import { Badge, type BadgeAppearance, type BadgeIntent } from '@tradenetcorp/veli-ui/badge';
import { Bell, FlagBanner } from 'phosphor-react';

const statusIntents: BadgeIntent[] = [
  'neutral',
  'info',
  'positive',
  'cautious',
  'warning',
  'danger',
];

const accentIntents: BadgeIntent[] = ['pink', 'indigo', 'turquoise', 'green', 'lime'];

const appearances: BadgeAppearance[] = ['outline', 'subtle', 'emphasis'];

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    children: 'Label',
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
} satisfies Meta<typeof Badge & { showIcon: boolean }>;

export default meta;
type Story = StoryObj<typeof meta>;

function BadgeIcon({ size }: { size: 'sm' | 'md' }) {
  return <FlagBanner aria-hidden size={size === 'sm' ? 12 : 16} weight="regular" />;
}

export const Playground: Story = {
  render: ({ showIcon, size = 'md', children, counter, count, ...args }) => {
    const isCounter = counter || count != null;

    return (
      <Badge
        {...args}
        size={size}
        counter={counter}
        count={count}
        aria-label={size === 'xs' ? 'Status' : undefined}
        leadingIcon={
          size === 'xs' || !showIcon || isCounter ? undefined : (
            <BadgeIcon size={size === 'sm' ? 'sm' : 'md'} />
          )
        }
      >
        {size === 'xs' ? undefined : children}
      </Badge>
    );
  },
};

export const Default: Story = {
  render: () => (
    <Badge appearance="outline" intent="neutral" leadingIcon={<BadgeIcon size="md" />}>
      Label
    </Badge>
  ),
};

export const StatusColors: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {appearances.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-text-default-emphasis capitalize">{appearance}</p>
          <div className="flex flex-wrap gap-2">
            {statusIntents.map((intent) => (
              <Badge
                key={`${appearance}-${intent}`}
                appearance={appearance}
                intent={intent}
                leadingIcon={<BadgeIcon size="md" />}
              >
                Label
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
          <p className="type-body-sm-medium text-text-default-emphasis capitalize">{appearance}</p>
          <div className="flex flex-wrap gap-2">
            {accentIntents.map((intent) => (
              <Badge
                key={`${appearance}-${intent}`}
                appearance={appearance}
                intent={intent}
                leadingIcon={<BadgeIcon size="md" />}
              >
                Label
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
      <Badge appearance="outline" intent="info" size="sm" leadingIcon={<BadgeIcon size="sm" />}>
        Label
      </Badge>
      <Badge appearance="outline" intent="info" size="md" leadingIcon={<BadgeIcon size="md" />}>
        Label
      </Badge>
    </div>
  ),
};

export const Counter: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {appearances.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-text-default-emphasis capitalize">{appearance}</p>
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
  render: () => (
    <div className="relative inline-flex">
      <Bell aria-hidden size={24} className="text-icon-default-default" />
      <Badge
        counter
        count={5}
        appearance="emphasis"
        intent="danger"
        size="sm"
        className="absolute -top-1 -right-1"
        aria-label="5 notifications"
      />
    </div>
  ),
};

export const StatusDots: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      {(['subtle', 'emphasis'] as const).map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-body-sm-medium text-text-default-emphasis capitalize">{appearance}</p>
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
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge appearance="subtle" intent="positive">
        Approved
      </Badge>
      <Badge appearance="emphasis" intent="danger">
        Rejected
      </Badge>
      <Badge appearance="outline" intent="warning">
        Pending
      </Badge>
    </div>
  ),
};
