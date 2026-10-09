import type { Meta, StoryObj } from '@storybook/react';
import * as React from 'react';
import { GearIcon, HouseIcon, SquaresFourIcon, UserIcon } from '@phosphor-icons/react';
import { useVeliLanguage, VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';

const tabsText = {
  en: {
    labels: {
      more: 'More',
      overview: 'Overview',
      services: 'Services',
      pricing: 'Pricing',
      home: 'Home',
      dashboard: 'Dashboard',
      settings: 'Settings',
      profile: 'Profile',
      billing: 'Billing',
      integrations: 'Integrations',
      auditLog: 'Audit log',
      members: 'Members',
    },
    panels: {
      overview: 'Overview section content.',
      services: 'Services section content.',
      pricing: 'Pricing section content.',
      home: 'Home section content.',
      dashboard: 'Dashboard section content.',
      settings: 'Settings section content.',
      profile: 'Profile section content.',
      billing: 'Billing section content.',
      integrations: 'Integrations section content.',
      auditLog: 'Audit log section content.',
      members: 'Members section content.',
    },
  },
  dv: {
    labels: {
      more: 'އިތުރު',
      overview: 'ޚުލާޞާ',
      services: 'ޚިދުމަތްތައް',
      pricing: 'އަގުތައް',
      home: 'ހޯމް',
      dashboard: 'ޑޭޝްބޯޑް',
      settings: 'ސެޓިންގްސް',
      profile: 'ޕްރޮފައިލް',
      billing: 'ބިލިންގ',
      integrations: 'އިންޓަގްރޭޝަންސް',
      auditLog: 'އޮޑިޓް ލޮގް',
      members: 'މެމްބަރުން',
    },
    panels: {
      overview: 'ޚުލާޞާ ސެކްޝަންގެ ކޮންޓެންޓް.',
      services: 'ޚިދުމަތްތައް ސެކްޝަންގެ ކޮންޓެންޓް.',
      pricing: 'އަގުތައް ސެކްޝަންގެ ކޮންޓެންޓް.',
      home: 'ހޯމް ސެކްޝަންގެ ކޮންޓެންޓް.',
      dashboard: 'ޑޭޝްބޯޑް ސެކްޝަންގެ ކޮންޓެންޓް.',
      settings: 'ސެޓިންގްސް ސެކްޝަންގެ ކޮންޓެންޓް.',
      profile: 'ޕްރޮފައިލް ސެކްޝަންގެ ކޮންޓެންޓް.',
      billing: 'ބިލިންގ ސެކްޝަންގެ ކޮންޓެންޓް.',
      integrations: 'އިންޓަގްރޭޝަންސް ސެކްޝަންގެ ކޮންޓެންޓް.',
      auditLog: 'އޮޑިޓް ލޮގް ސެކްޝަންގެ ކޮންޓެންޓް.',
      members: 'މެމްބަރުން ސެކްޝަންގެ ކޮންޓެންޓް.',
    },
  },
} as const;

type TabsLanguage = keyof typeof tabsText;

const useTabsLanguage = (): TabsLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useTabsText = () => {
  const language = useTabsLanguage();

  return tabsText[language];
};

const meta = {
  title: 'Components/Tabs',
  decorators: [
    (Story) => (
      <div className="w-full bg-white px-8 py-6 dark:bg-surface-base">
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
          'Underlined tab navigation built with `react-aria-components`. Supports `sm`, `md`, and `lg` sizes, plus optional `leading` and `trailing` slots on each item for icons or other content.',
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
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Services tabs"
        items={[
          {
            id: 'overview',
            label: text.labels.overview,
            panel: text.panels.overview,
          },
          {
            id: 'services',
            label: text.labels.services,
            panel: text.panels.services,
          },
        ]}
      />
    );
  },
};

/**
 * Small, medium, and large tab sizes.
 */
export const Sizes: Story = {
  render: () => {
    const text = useTabsText();
    const items = [
      {
        id: 'overview',
        label: text.labels.overview,
        panel: text.panels.overview,
      },
      {
        id: 'services',
        label: text.labels.services,
        panel: text.panels.services,
      },
      {
        id: 'pricing',
        label: text.labels.pricing,
        panel: text.panels.pricing,
      },
    ] as const;

    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Small (sm)
          </span>
          <Tabs listAriaLabel="Small tabs" size="sm" items={items} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Medium (md)
          </span>
          <Tabs listAriaLabel="Medium tabs" size="md" items={items} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            Large (lg)
          </span>
          <Tabs listAriaLabel="Large tabs" size="lg" items={items} />
        </div>
      </div>
    );
  },
};

/**
 * Underlined tabs with multiple items.
 */
export const ThreeItems: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Information tabs"
        items={[
          {
            id: 'overview',
            label: text.labels.overview,
            panel: text.panels.overview,
          },
          {
            id: 'services',
            label: text.labels.services,
            panel: text.panels.services,
          },
          {
            id: 'pricing',
            label: text.labels.pricing,
            panel: text.panels.pricing,
          },
        ]}
      />
    );
  },
};

/**
 * Tabs with a leading icon slot before the label.
 */
export const WithLeadingSlot: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Navigation tabs"
        items={[
          {
            id: 'home',
            label: text.labels.home,
            leading: <HouseIcon size={16} />,
            panel: text.panels.home,
          },
          {
            id: 'dashboard',
            label: text.labels.dashboard,
            leading: <SquaresFourIcon size={16} />,
            panel: text.panels.dashboard,
          },
          {
            id: 'settings',
            label: text.labels.settings,
            leading: <GearIcon size={16} />,
            panel: text.panels.settings,
          },
        ]}
      />
    );
  },
};

/**
 * Tabs with a trailing icon slot after the label.
 */
export const WithTrailingSlot: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Account tabs"
        items={[
          {
            id: 'profile',
            label: text.labels.profile,
            trailing: <UserIcon size={16} />,
            panel: text.panels.profile,
          },
          {
            id: 'settings',
            label: text.labels.settings,
            trailing: <GearIcon size={16} />,
            panel: text.panels.settings,
          },
        ]}
      />
    );
  },
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
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Workspace tabs"
        items={[
          {
            id: 'overview',
            label: text.labels.overview,
            panel: text.panels.overview,
          },
          {
            id: 'services',
            label: text.labels.services,
            panel: text.panels.services,
          },
          {
            id: 'pricing',
            label: text.labels.pricing,
            panel: text.panels.pricing,
          },
        ]}
        overflowItems={[
          {
            id: 'billing',
            label: text.labels.billing,
            panel: text.panels.billing,
          },
          {
            id: 'integrations',
            label: text.labels.integrations,
            panel: text.panels.integrations,
          },
          {
            id: 'audit-log',
            label: text.labels.auditLog,
            panel: text.panels.auditLog,
          },
        ]}
      />
    );
  },
};

/**
 * Tabs with both leading and trailing slots.
 */
export const WithLeadingAndTrailingSlots: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Workspace tabs"
        items={[
          {
            id: 'overview',
            label: text.labels.overview,
            leading: <HouseIcon size={16} />,
            trailing: <SquaresFourIcon size={16} />,
            panel: text.panels.overview,
          },
          {
            id: 'members',
            label: text.labels.members,
            leading: <UserIcon size={16} />,
            trailing: <GearIcon size={16} />,
            panel: text.panels.members,
          },
          {
            id: 'settings',
            label: text.labels.settings,
            leading: <GearIcon size={16} />,
            panel: text.panels.settings,
          },
        ]}
      />
    );
  },
};

/**
 * Route-style tabs with hrefs. Selection is controlled in story state; the
 * provider navigate callback intercepts navigation so Storybook does not leave
 * the page.
 */
export const NavigationTabs: Story = {
  render: () => {
    const text = useTabsText();
    const [selectedKey, setSelectedKey] = React.useState<string | number>('/overview');
    const navigate = React.useCallback((href: string) => {
      setSelectedKey(href);
    }, []);

    return (
      <VeliProvider navigate={navigate}>
        <div className="flex flex-col gap-4">
          <Tabs
            listAriaLabel="Section navigation"
            selectedKey={selectedKey}
            onSelectionChange={setSelectedKey}
            items={[
              {
                id: '/overview',
                label: text.labels.overview,
                href: '/overview',
              },
              {
                id: '/services',
                label: text.labels.services,
                href: '/services',
              },
              {
                id: '/pricing',
                label: text.labels.pricing,
                href: '/pricing',
              },
            ]}
          />
          <p className="type-body-md-regular text-base-default">
            {selectedKey === '/overview'
              ? text.panels.overview
              : selectedKey === '/services'
                ? text.panels.services
                : text.panels.pricing}
          </p>
        </div>
      </VeliProvider>
    );
  },
};
