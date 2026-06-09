import type { Meta, StoryObj } from '@storybook/react';
import { Gear, House, SquaresFour, User } from 'phosphor-react';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';

const meta = {
  title: 'Components/Tabs',
  decorators: [
    (Story) => (
      <div className="w-full bg-white px-8 py-6 dark:bg-bg-surface-base">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'padded',
    backgrounds: {
      disable: true,
    },
    docs: {
      description: {
        component:
          'Underlined tab navigation built with `react-aria-components`. Supports optional `leading` and `trailing` slots on each item for icons or other content.',
      },
      story: {
        inline: false,
      },
    },
  },
  tags: ['autodocs'],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default underlined tab navigation.
 */
export const Default: Story = {
  render: () => (
    <Tabs
      listAriaLabel="Services tabs"
      items={[
        {
          id: 'overview',
          label: 'Overview',
          panel: 'Overview section content.',
        },
        {
          id: 'services',
          label: 'Services',
          panel: 'Services section content.',
        },
      ]}
    />
  ),
};

/**
 * Underlined tabs with multiple items.
 */
export const ThreeItems: Story = {
  render: () => (
    <Tabs
      listAriaLabel="Information tabs"
      items={[
        {
          id: 'overview',
          label: 'Overview',
          panel: 'Overview section content.',
        },
        {
          id: 'services',
          label: 'Services',
          panel: 'Services section content.',
        },
        {
          id: 'pricing',
          label: 'Pricing',
          panel: 'Pricing section content.',
        },
      ]}
    />
  ),
};

/**
 * Tabs with a leading icon slot before the label.
 */
export const WithLeadingSlot: Story = {
  render: () => (
    <Tabs
      listAriaLabel="Navigation tabs"
      items={[
        {
          id: 'home',
          label: 'Home',
          leading: <House size={16} />,
          panel: 'Home section content.',
        },
        {
          id: 'dashboard',
          label: 'Dashboard',
          leading: <SquaresFour size={16} />,
          panel: 'Dashboard section content.',
        },
        {
          id: 'settings',
          label: 'Settings',
          leading: <Gear size={16} />,
          panel: 'Settings section content.',
        },
      ]}
    />
  ),
};

/**
 * Tabs with a trailing icon slot after the label.
 */
export const WithTrailingSlot: Story = {
  render: () => (
    <Tabs
      listAriaLabel="Account tabs"
      items={[
        {
          id: 'profile',
          label: 'Profile',
          trailing: <User size={16} />,
          panel: 'Profile section content.',
        },
        {
          id: 'settings',
          label: 'Settings',
          trailing: <Gear size={16} />,
          panel: 'Settings section content.',
        },
      ]}
    />
  ),
};

/**
 * Tabs with overflow items hidden behind a "More" dropdown.
 */
export const WithOverflow: Story = {
  parameters: {
    docs: {
      story: {
        height: '280px',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-70">
        <Story />
      </div>
    ),
  ],
  render: () => (
    <Tabs
      listAriaLabel="Workspace tabs"
      items={[
        {
          id: 'overview',
          label: 'Overview',
          panel: 'Overview section content.',
        },
        {
          id: 'services',
          label: 'Services',
          panel: 'Services section content.',
        },
        {
          id: 'pricing',
          label: 'Pricing',
          panel: 'Pricing section content.',
        },
      ]}
      overflowItems={[
        {
          id: 'billing',
          label: 'Billing',
          panel: 'Billing section content.',
        },
        {
          id: 'integrations',
          label: 'Integrations',
          panel: 'Integrations section content.',
        },
        {
          id: 'audit-log',
          label: 'Audit log',
          panel: 'Audit log section content.',
        },
      ]}
    />
  ),
};

/**
 * Tabs with both leading and trailing slots.
 */
export const WithLeadingAndTrailingSlots: Story = {
  render: () => (
    <Tabs
      listAriaLabel="Workspace tabs"
      items={[
        {
          id: 'overview',
          label: 'Overview',
          leading: <House size={16} />,
          trailing: <SquaresFour size={16} />,
          panel: 'Overview section content.',
        },
        {
          id: 'members',
          label: 'Members',
          leading: <User size={16} />,
          trailing: <Gear size={16} />,
          panel: 'Members section content.',
        },
        {
          id: 'settings',
          label: 'Settings',
          leading: <Gear size={16} />,
          panel: 'Settings section content.',
        },
      ]}
    />
  ),
};
