import * as React from 'react';
import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { DocsContainer, type DocsContainerProps } from '@storybook/blocks';
import { useArgs } from 'storybook/internal/preview-api';
import { GearIcon, HouseIcon, SquaresFourIcon } from '@phosphor-icons/react';
import { Badge } from '@tradenetcorp/veli-ui/badge';
import { useVeliLanguage, VeliProvider } from '@tradenetcorp/veli-ui/provider';
import { Tabs } from '@tradenetcorp/veli-ui/tabs';

const collapsedControlGroups = ['State'] as const;

const collapseControlGroup = (group: string) => {
  const row = document.querySelector(`tr[title^="Hide ${group} item"]`);
  const toggle = row?.querySelector<HTMLElement>('[tabindex="0"]');

  toggle?.click();
};

function TabsDocsContainer(props: DocsContainerProps) {
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    const tryCollapse = () => {
      if (cancelled) {
        return;
      }

      const tableReady = collapsedControlGroups.every(
        (group) =>
          document.querySelector(
            `tr[title^="Hide ${group} item"], tr[title^="Show ${group} item"]`,
          ) != null,
      );

      if (!tableReady && attempts < 40) {
        attempts += 1;
        requestAnimationFrame(tryCollapse);
        return;
      }

      collapsedControlGroups.forEach(collapseControlGroup);
    };

    tryCollapse();

    return () => {
      cancelled = true;
    };
  }, []);

  return <DocsContainer {...props} />;
}

const enTabsText = {
  listAriaLabel: 'Service sections',
  default: 'Default',
  disabled: 'Disabled',
  overview: 'Overview',
  services: 'Services',
  pricing: 'Pricing',
  home: 'Home',
  settings: 'Settings',
  billing: 'Billing',
  integrations: 'Integrations',
  auditLog: 'Audit log',
  members: 'Members',
  panels: {
    overview: 'Overview section content.',
    services: 'Services section content.',
    pricing: 'Pricing section content.',
    home: 'Home section content.',
    settings: 'Settings section content.',
    billing: 'Billing section content.',
    integrations: 'Integrations section content.',
    auditLog: 'Audit log section content.',
    members: 'Members section content.',
  },
} as const;

const dhivehiTabsText = {
  listAriaLabel: 'ޚިދުމަތް ސެކްޝަންތައް',
  default: 'އާދައިގެ',
  disabled: 'ބޭނުންނުކުރެވޭ',
  overview: 'ޚުލާޞާ',
  services: 'ޚިދުމަތްތައް',
  pricing: 'އަގުތައް',
  home: 'ހޯމް',
  settings: 'ސެޓިންގްސް',
  billing: 'ބިލިންގ',
  integrations: 'އިންޓަގްރޭޝަންސް',
  auditLog: 'އޮޑިޓް ލޮގް',
  members: 'މެމްބަރުން',
  panels: {
    overview: 'ޚުލާޞާ ސެކްޝަންގެ ކޮންޓެންޓް.',
    services: 'ޚިދުމަތްތައް ސެކްޝަންގެ ކޮންޓެންޓް.',
    pricing: 'އަގުތައް ސެކްޝަންގެ ކޮންޓެންޓް.',
    home: 'ހޯމް ސެކްޝަންގެ ކޮންޓެންޓް.',
    settings: 'ސެޓިންގްސް ސެކްޝަންގެ ކޮންޓެންޓް.',
    billing: 'ބިލިންގ ސެކްޝަންގެ ކޮންޓެންޓް.',
    integrations: 'އިންޓަގްރޭޝަންސް ސެކްޝަންގެ ކޮންޓެންޓް.',
    auditLog: 'އޮޑިޓް ލޮގް ސެކްޝަންގެ ކޮންޓެންޓް.',
    members: 'މެމްބަރުން ސެކްޝަންގެ ކޮންޓެންޓް.',
  },
} as const;

const localizedTabsText = {
  en: enTabsText,
  dv: dhivehiTabsText,
} as const;

type TabsLanguage = keyof typeof localizedTabsText;
type TabsStoryArgs = ComponentProps<typeof Tabs>;

const tabsArgText = {
  listAriaLabel: {
    en: enTabsText.listAriaLabel,
    dv: dhivehiTabsText.listAriaLabel,
  },
} as const;

type TabsArgTextKey = keyof typeof tabsArgText;

const tabsArgTextKeys = Object.keys(tabsArgText) as TabsArgTextKey[];

const useTabsLanguage = (): TabsLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useTabsText = () => {
  const language = useTabsLanguage();

  return localizedTabsText[language];
};

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

const getLocalizedTabsArgText = (key: TabsArgTextKey, value: unknown, language: TabsLanguage) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return tabsArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(tabsArgText[key]);

  if (localizedValues.includes(value)) {
    return tabsArgText[key][language];
  }

  return value;
};

const getDefaultItems = (text: (typeof localizedTabsText)[TabsLanguage]) =>
  [
    { id: 'overview', label: text.overview, panel: text.panels.overview },
    { id: 'services', label: text.services, panel: text.panels.services },
    { id: 'pricing', label: text.pricing, panel: text.panels.pricing },
  ] as const;

const meta = {
  title: 'Components/Tabs',
  component: Tabs,
  decorators: [
    (Story, context) => {
      const language: TabsLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { listAriaLabel } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<TabsArgTextKey, string>> = {};
        const currentArgs = { listAriaLabel };

        tabsArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedTabsArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [language, listAriaLabel, updateArgs]);

      return (
        <div className="w-full bg-white px-8 py-6 dark:bg-surface-base">
          <Story />
        </div>
      );
    },
  ],
  parameters: {
    layout: 'padded',
    backgrounds: {
      disable: true,
    },
    controls: {
      sort: 'none',
    },
    docs: {
      container: TabsDocsContainer,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    ...withArgCategory('Appearance', {
      size: { control: 'select', options: ['sm', 'md', 'lg'] },
    }),
    ...withArgCategory('Label', {
      listAriaLabel: { control: 'text' },
    }),
    ...withArgCategory('State', {
      selectedKey: { control: false, table: { disable: true } },
      defaultSelectedKey: { control: false, table: { disable: true } },
      onSelectionChange: { control: false, table: { disable: true } },
      isDisabled: { control: 'boolean' },
      keyboardActivation: { control: 'select', options: ['automatic', 'manual'] },
      disabledKeys: { control: false, table: { disable: true } },
    }),
    items: { table: { disable: true } },
    overflowItems: { table: { disable: true } },
    className: { table: { disable: true } },
    tabListClassName: { table: { disable: true } },
    tabClassName: { table: { disable: true } },
    panelClassName: { table: { disable: true } },
    orientation: { table: { disable: true } },
  },
  args: {
    size: 'sm',
    listAriaLabel: enTabsText.listAriaLabel,
    isDisabled: false,
    items: [
      { id: 'overview', label: enTabsText.overview, panel: enTabsText.panels.overview },
      { id: 'services', label: enTabsText.services, panel: enTabsText.panels.services },
      { id: 'pricing', label: enTabsText.pricing, panel: enTabsText.panels.pricing },
    ],
  },
} satisfies Meta<TabsStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const language = useTabsLanguage();
    const text = useTabsText();

    return (
      <div key={language} className="w-full max-w-[520px]">
        <Tabs
          {...args}
          listAriaLabel={getLocalizedTabsArgText('listAriaLabel', args.listAriaLabel, language)}
          items={getDefaultItems(text)}
        />
      </div>
    );
  },
};

export const Sizes: Story = {
  render: () => {
    const language = useTabsLanguage();
    const text = useTabsText();
    const items = getDefaultItems(text);

    return (
      <div key={language} className="flex w-full max-w-[520px] flex-col gap-8">
        {(['sm', 'md', 'lg'] as const).map((size) => (
          <div key={size} className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
              {size === 'sm' ? 'Small (sm)' : size === 'md' ? 'Medium (md)' : 'Large (lg)'}
            </span>
            <Tabs listAriaLabel={`${size} tabs`} size={size} items={items} />
          </div>
        ))}
      </div>
    );
  },
};

export const States: Story = {
  render: () => {
    const language = useTabsLanguage();
    const text = useTabsText();

    return (
      <div key={language} className="flex w-full max-w-[520px] flex-col gap-8">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.default}
          </span>
          <Tabs listAriaLabel={text.listAriaLabel} items={getDefaultItems(text)} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.disabled}
          </span>
          <Tabs
            listAriaLabel={text.listAriaLabel}
            items={[
              {
                id: 'overview',
                label: text.overview,
                panel: text.panels.overview,
              },
              {
                id: 'services',
                label: text.services,
                isDisabled: true,
                panel: text.panels.services,
              },
              {
                id: 'pricing',
                label: text.pricing,
                panel: text.panels.pricing,
              },
            ]}
          />
        </div>
      </div>
    );
  },
};

export const Slots: Story = {
  render: () => {
    const language = useTabsLanguage();
    const text = useTabsText();

    return (
      <div key={language} className="w-full max-w-[520px]">
        <Tabs
          listAriaLabel={text.listAriaLabel}
          items={[
            {
              id: 'overview',
              label: text.overview,
              leading: <HouseIcon size={16} />,
              trailing: <Badge intent="danger" appearance="emphasis" count={2} size="sm" />,
              panel: text.panels.overview,
            },
            {
              id: 'services',
              label: text.services,
              leading: <SquaresFourIcon size={16} />,
              panel: text.panels.services,
            },
            {
              id: 'settings',
              label: text.settings,
              leading: <GearIcon size={16} />,
              panel: text.panels.settings,
            },
          ]}
        />
      </div>
    );
  },
};

export const Overflow: Story = {
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
    const language = useTabsLanguage();
    const text = useTabsText();

    return (
      <div key={language} className="w-full max-w-[520px]">
        <Tabs
          listAriaLabel={text.listAriaLabel}
          items={getDefaultItems(text)}
          overflowItems={[
            {
              id: 'billing',
              label: text.billing,
              panel: text.panels.billing,
            },
            {
              id: 'integrations',
              label: text.integrations,
              panel: text.panels.integrations,
            },
            {
              id: 'audit-log',
              label: text.auditLog,
              panel: text.panels.auditLog,
            },
          ]}
        />
      </div>
    );
  },
};

export const Narrow: Story = {
  render: () => {
    const language = useTabsLanguage();
    const text = useTabsText();

    return (
      <div key={language} className="w-[220px] max-w-full rounded-lg border border-base-subtle p-3">
        <Tabs
          listAriaLabel={text.listAriaLabel}
          items={[
            ...getDefaultItems(text),
            {
              id: 'billing',
              label: text.billing,
              panel: text.panels.billing,
            },
            {
              id: 'integrations',
              label: text.integrations,
              panel: text.panels.integrations,
            },
            {
              id: 'members',
              label: text.members,
              panel: text.panels.members,
            },
          ]}
        />
      </div>
    );
  },
};

export const Navigation: Story = {
  render: () => {
    const language = useTabsLanguage();
    const text = useTabsText();
    const [selectedKey, setSelectedKey] = React.useState<string | number>('/overview');
    const navigate = React.useCallback((href: string) => {
      setSelectedKey(href);
    }, []);

    return (
      <VeliProvider navigate={navigate}>
        <div key={language} className="flex w-full max-w-[520px] flex-col gap-4">
          <Tabs
            listAriaLabel={text.listAriaLabel}
            selectedKey={selectedKey}
            onSelectionChange={setSelectedKey}
            items={[
              {
                id: '/overview',
                label: text.overview,
                href: '/overview',
              },
              {
                id: '/services',
                label: text.services,
                href: '/services',
              },
              {
                id: '/pricing',
                label: text.pricing,
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
