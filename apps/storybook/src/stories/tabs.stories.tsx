import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within } from '@storybook/test';
import { GearIcon, HouseIcon, SquaresFourIcon, UserIcon } from '@phosphor-icons/react';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { useVeliLanguage, VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { Tabs, type TabsProps } from '@tradenetcorp/veli-ui/tabs';

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
      disabled: 'Disabled',
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
      disabled: 'Disabled section content.',
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
      disabled: 'ބޭނުންނުކުރެވޭ',
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
      disabled: 'ބޭނުންނުކުރެވޭ ސެކްޝަންގެ ކޮންޓެންޓް.',
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

const withCategory = (category: string, entries: Record<string, object>) =>
  Object.fromEntries(
    Object.entries(entries).map(([key, entry]) => [key, { ...entry, table: { category } }]),
  );

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
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
          'Underlined tab navigation built with `react-aria-components`. Supports `sm`, `md`, and `lg` sizes, leading and trailing slots, optional overflow, and horizontal scroll when the tab bar is narrower than its content.',
      },
    },
  },
  tags: ['autodocs'],
  args: {
    listAriaLabel: 'Service sections',
    size: 'sm',
  },
  argTypes: {
    ...withCategory('Appearance', {
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
      className: { control: 'text' },
      tabListClassName: { control: 'text' },
      tabClassName: { control: 'text' },
      panelClassName: { control: 'text' },
    }),
    ...withCategory('Content', {
      listAriaLabel: { control: 'text' },
      items: { control: false },
      overflowItems: { control: false },
    }),
    ...withCategory('State', {
      selectedKey: { control: false },
      defaultSelectedKey: { control: false },
      onSelectionChange: { control: false },
      isDisabled: { control: 'boolean' },
      keyboardActivation: { control: 'select', options: ['automatic', 'manual'] },
    }),
  },
} satisfies Meta<TabsProps>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default underlined tab navigation.
 */
export const Default: Story = {
  render: (args) => {
    const text = useTabsText();

    return (
      <Tabs
        {...args}
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
 * Trailing Badge counter matching the Figma slot treatment.
 */
export const WithBadgeTrailing: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Inbox tabs"
        items={[
          {
            id: 'overview',
            label: text.labels.overview,
            leading: <HouseIcon size={16} />,
            trailing: <Badge intent="danger" appearance="emphasis" count={2} size="sm" />,
            panel: text.panels.overview,
          },
          {
            id: 'services',
            label: text.labels.services,
            leading: <SquaresFourIcon size={16} />,
            trailing: <Badge intent="danger" appearance="emphasis" count={4} size="sm" />,
            panel: text.panels.services,
          },
          {
            id: 'pricing',
            label: text.labels.pricing,
            leading: <GearIcon size={16} />,
            panel: text.panels.pricing,
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
 * Every size with leading and trailing slots.
 */
export const SizesWithSlots: Story = {
  render: () => {
    const text = useTabsText();
    const items = [
      {
        id: 'overview',
        label: text.labels.overview,
        leading: <HouseIcon size={16} />,
        trailing: <Badge intent="danger" appearance="emphasis" count={2} size="sm" />,
        panel: text.panels.overview,
      },
      {
        id: 'services',
        label: text.labels.services,
        leading: <SquaresFourIcon size={16} />,
        panel: text.panels.services,
      },
      {
        id: 'pricing',
        label: text.labels.pricing,
        leading: <GearIcon size={16} />,
        trailing: <Badge intent="danger" appearance="emphasis" count={1} size="sm" />,
        panel: text.panels.pricing,
      },
    ] as const;

    return (
      <div className="flex flex-col gap-8">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              {size}
            </span>
            <Tabs listAriaLabel={`${size} slotted tabs`} size={size} items={items} />
          </div>
        ))}
      </div>
    );
  },
};

/**
 * Disabled tab and a first-disabled default selection.
 */
export const Disabled: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <div className="flex flex-col gap-8">
        <Tabs
          listAriaLabel="Tabs with a disabled item"
          items={[
            {
              id: 'overview',
              label: text.labels.overview,
              panel: text.panels.overview,
            },
            {
              id: 'services',
              label: text.labels.services,
              isDisabled: true,
              panel: text.panels.services,
            },
            {
              id: 'pricing',
              label: text.labels.pricing,
              panel: text.panels.pricing,
            },
          ]}
        />
        <Tabs
          listAriaLabel="Tabs with the first item disabled"
          items={[
            {
              id: 'disabled',
              label: text.labels.disabled,
              isDisabled: true,
              panel: text.panels.disabled,
            },
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
      </div>
    );
  },
};

/**
 * Controlled selection.
 */
export const Controlled: Story = {
  render: () => {
    const text = useTabsText();
    const [selectedKey, setSelectedKey] = React.useState<string | number>('services');

    return (
      <div className="flex flex-col gap-4">
        <Tabs
          listAriaLabel="Controlled tabs"
          selectedKey={selectedKey}
          onSelectionChange={setSelectedKey}
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
        <p className="type-body-sm-regular text-base-muted">
          Selected: <output data-testid="selected-key">{String(selectedKey)}</output>
        </p>
      </div>
    );
  },
};

/**
 * Uncontrolled initial selection via defaultSelectedKey.
 */
export const DefaultSelectedKey: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Default selected tabs"
        defaultSelectedKey="pricing"
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
 * Overflow with a selected overflow item and a leading icon on that item.
 */
export const OverflowSelected: Story = {
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
        listAriaLabel="Workspace tabs with selected overflow"
        defaultSelectedKey="billing"
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
        overflowItems={[
          {
            id: 'billing',
            label: text.labels.billing,
            leading: <GearIcon size={16} />,
            panel: text.panels.billing,
          },
          {
            id: 'integrations',
            label: text.labels.integrations,
            isDisabled: true,
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
 * Narrow container that scrolls the tab bar horizontally.
 */
export const NarrowScroll: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <div className="w-[220px] max-w-full rounded-lg border border-base-subtle p-3">
        <Tabs
          listAriaLabel="Scrollable tabs"
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
              id: 'members',
              label: text.labels.members,
              panel: text.panels.members,
            },
          ]}
        />
      </div>
    );
  },
};

/**
 * Full-width underline override via tabListClassName.
 */
export const FullWidthUnderline: Story = {
  render: () => {
    const text = useTabsText();

    return (
      <Tabs
        listAriaLabel="Full-width underline tabs"
        tabListClassName="w-full"
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

function TabsKeyboardExample() {
  const text = useTabsText();

  return (
    <Tabs
      listAriaLabel="Keyboard tabs"
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
}

/**
 * Keyboard activation, Home/End, and RTL arrow direction.
 */
export const KeyboardInteractions: Story = {
  render: () => <TabsKeyboardExample />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const text = globals.language === 'dv' ? tabsText.dv : tabsText.en;
    const tabs = canvas.getAllByRole('tab');
    await expect(tabs).toHaveLength(3);

    await userEvent.click(tabs[0]!);
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(text.panels.overview);

    await userEvent.keyboard('{ArrowRight}');
    const afterRight = globals.language === 'dv' ? tabs[0]! : tabs[1]!;
    await expect(afterRight).toHaveFocus();
    if (globals.language !== 'dv') {
      await expect(afterRight).toHaveAttribute('aria-selected', 'true');
      await expect(canvas.getByRole('tabpanel')).toHaveTextContent(text.panels.services);
    }

    await userEvent.keyboard('{End}');
    await expect(tabs[2]).toHaveFocus();
    await userEvent.keyboard('{Home}');
    await expect(tabs[0]).toHaveFocus();

    canvasElement.dataset.tabsKeyboard = 'passed';
  },
};

function TabsOverflowInteractionExample() {
  const text = useTabsText();

  return (
    <div className="min-h-70">
      <Tabs
        listAriaLabel="Overflow interaction tabs"
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
        ]}
      />
    </div>
  );
}

/**
 * Overflow menu selection and localized More label.
 */
export const OverflowInteractions: Story = {
  parameters: {
    docs: {
      story: {
        height: '280px',
      },
    },
  },
  render: () => <TabsOverflowInteractionExample />,
  play: async ({ canvasElement, globals }) => {
    const canvas = within(canvasElement);
    const text = globals.language === 'dv' ? tabsText.dv : tabsText.en;
    const more = canvas.getByRole('button', { name: new RegExp(text.labels.more, 'i') });
    await userEvent.click(more);
    const billing = await within(document.body).findByRole('menuitem', {
      name: text.labels.billing,
    });
    await userEvent.click(billing);
    await expect(canvas.getByRole('tabpanel')).toHaveTextContent(text.panels.billing);
    await expect(more).toHaveTextContent(text.labels.billing);
    canvasElement.dataset.tabsOverflow = 'passed';
  },
};
