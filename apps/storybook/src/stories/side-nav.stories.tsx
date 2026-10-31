import type { Meta, StoryObj } from '@storybook/react';
import { useState, type ReactNode } from 'react';
import {
  BuildingsIcon,
  ClockCounterClockwiseIcon,
  GearIcon,
  HandshakeIcon,
  LockIcon,
  ShieldCheckIcon,
  SquaresFourIcon,
  TrayIcon,
  UserGearIcon,
  UsersIcon,
} from '@phosphor-icons/react';
import type { Selection } from 'react-aria-components';
import { Avatar, type AvatarAppearance } from '@veli-design/react/avatar';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from '@veli-design/react/menu';
import { useVeliLanguage } from '@veli-design/react/provider';
import {
  SideNav,
  SideNavBackButton,
  SideNavCollapsedOrgButton,
  SideNavHeader,
  SideNavHeaderRow,
  SideNavLevelSwap,
  SideNavMenu,
  SideNavMenuBadge,
  SideNavMenuButton,
  SideNavMenuItem,
  SideNavMenuLabel,
  SideNavOrgAvatar,
  SideNavOrgCaret,
  SideNavOrgName,
  SideNavOrgSecondary,
  SideNavOrgSwitcher,
  SideNavSectionLabel,
  SideNavTitle,
  SideNavTrigger,
  useSideNav,
} from '@tradenetcorp/veli-blocks/side-nav';

type Organization = {
  id: string;
  name: string;
  secondaryText: string;
  secondaryTextDv: string;
  avatar: { initials: string; appearance: AvatarAppearance };
};

const organizations: Organization[] = [
  {
    id: 'island-holidays',
    name: 'Island Holidays',
    secondaryText: 'Owner · Travel agency',
    secondaryTextDv: 'އޯނަރ · ޓްރެވެލް އެޖަންސީ',
    avatar: { initials: 'IH', appearance: 'teal' },
  },
  {
    id: 'coral-tours',
    name: 'Coral Tours',
    secondaryText: 'Admin · Tour operator',
    secondaryTextDv: 'އެޑްމިން · ޓޫއަރ އޮޕަރޭޓަރ',
    avatar: { initials: 'CT', appearance: 'blue' },
  },
  {
    id: 'reef-logistics',
    name: 'Reef Logistics',
    secondaryText: 'Member · Logistics',
    secondaryTextDv: 'މެމްބަރ · ލޮޖިސްޓިކްސް',
    avatar: { initials: 'RL', appearance: 'emerald' },
  },
];

type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  badge?: string;
};

function SideNavStory({
  defaultCollapsed = false,
  startNested = false,
}: {
  defaultCollapsed?: boolean;
  startNested?: boolean;
}) {
  const { language } = useVeliLanguage();
  const isDv = language === 'dv';
  const [level, setLevel] = useState<'organization' | 'access'>(
    startNested ? 'access' : 'organization',
  );
  const [levelDirection, setLevelDirection] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState(startNested ? 'restricted' : 'people');
  const [organizationId, setOrganizationId] = useState(organizations[0]!.id);

  const organization =
    organizations.find((entry) => entry.id === organizationId) ?? organizations[0]!;

  const labels = {
    section: isDv ? 'އޮގަނައިޒޭޝަން' : 'Organisation',
    collapse: isDv ? 'ސައިޑްބާރ ބަންދުކުރޭ' : 'Collapse sidebar',
    expand: isDv ? 'ސައިޑްބާރ ހުޅުވާ' : 'Expand sidebar',
    organizationSwitcher: isDv ? 'އޮގަނައިޒޭޝަން ބަދަލުކުރޭ' : 'Switch organization',
  };

  const organizationItems: NavItem[] = [
    {
      id: 'overview',
      label: isDv ? 'އޮވަވިއު' : 'Overview',
      icon: <SquaresFourIcon weight="bold" />,
      href: '#overview',
    },
    {
      id: 'people',
      label: isDv ? 'މީހުން' : 'People',
      icon: <UsersIcon weight="bold" />,
      href: '#people',
      badge: '1',
    },
    {
      id: 'access',
      label: isDv ? 'އެކްސެސް' : 'Access',
      icon: <ShieldCheckIcon weight="bold" />,
      // Drill-in only — omit `href` so the row is a button, not a navigation link.
    },
    {
      id: 'representation',
      label: isDv ? 'ރެޕްރެޒެންޓޭޝަން' : 'Representation',
      icon: <HandshakeIcon weight="bold" />,
      href: '#representation',
      badge: '1',
    },
    {
      id: 'activity',
      label: isDv ? 'އެކްޓިވިޓީ' : 'Activity',
      icon: <ClockCounterClockwiseIcon weight="bold" />,
      href: '#activity',
    },
    {
      id: 'settings',
      label: isDv ? 'ސެޓިންގްސް' : 'Settings',
      icon: <GearIcon weight="bold" />,
      href: '#settings',
    },
  ];

  const accessItems: NavItem[] = [
    {
      id: 'roles',
      label: isDv ? 'ރޯލްސް' : 'Roles',
      icon: <UserGearIcon weight="bold" />,
      href: '#roles',
    },
    {
      id: 'services',
      label: isDv ? 'ސަރވިސްސް' : 'Services',
      icon: <BuildingsIcon weight="bold" />,
      href: '#services',
    },
    {
      id: 'apps',
      label: isDv ? 'އެޕްސް' : 'Apps',
      icon: <SquaresFourIcon weight="bold" />,
      href: '#apps',
    },
    {
      id: 'locker',
      label: isDv ? 'ލޮކަރ، ވޮލެޓް، އިންބޮކްސް' : 'Locker, Wallet, Inbox',
      icon: <TrayIcon weight="bold" />,
      href: '#locker',
    },
    {
      id: 'restricted',
      label: isDv ? 'މަޖުބޫރު ސަރވިސްސް' : 'Restricted services',
      icon: <LockIcon weight="bold" />,
      href: '#restricted',
    },
  ];

  const items = level === 'access' ? accessItems : organizationItems;
  const accessTitle = isDv ? 'އެކްސެސް' : 'Access';
  const secondaryText = isDv ? organization.secondaryTextDv : organization.secondaryText;
  const ariaLabel = level === 'access' ? accessTitle : labels.section;

  function goToAccess() {
    setLevelDirection(1);
    setLevel('access');
    setSelectedItemId('restricted');
  }

  function goToOrganization(selectedId = 'access') {
    setLevelDirection(-1);
    setLevel('organization');
    setSelectedItemId(selectedId);
  }

  function handleItemPress(id: string) {
    if (level === 'organization' && id === 'access') {
      goToAccess();
      return;
    }
    setSelectedItemId(id);
  }

  function handleOrganizationSelection(keys: Selection) {
    if (keys === 'all') return;
    const id = [...keys][0];
    if (typeof id === 'string') {
      setOrganizationId(id);
      goToOrganization('people');
    }
  }

  return (
    <div className="bg-surface-base flex min-h-[480px] items-start justify-center p-8">
      <SideNav aria-label={ariaLabel} defaultCollapsed={defaultCollapsed}>
        <StoryLevels
          level={level}
          levelDirection={levelDirection}
          labels={labels}
          organization={organization}
          items={items}
          selectedItemId={selectedItemId}
          accessTitle={accessTitle}
          secondaryText={secondaryText}
          onItemPress={handleItemPress}
          onOrganizationSelection={handleOrganizationSelection}
          onBack={() => goToOrganization('access')}
        />
      </SideNav>
    </div>
  );
}

function OrganizationMenu({
  organization,
  labels,
  secondaryTextFor,
  onSelectionChange,
  children,
}: {
  organization: Organization;
  labels: { organizationSwitcher: string };
  secondaryTextFor: (entry: Organization) => string;
  onSelectionChange: (keys: Selection) => void;
  children: ReactNode;
}) {
  return (
    <MenuTrigger>
      {children}
      <MenuPopover placement="bottom start" className="min-w-[var(--trigger-width)]">
        <Menu
          aria-label={labels.organizationSwitcher}
          selectionMode="single"
          selectedKeys={new Set([organization.id])}
          onSelectionChange={onSelectionChange}
          disallowEmptySelection
          className="[&_[data-veli-menu-selection-slot]]:order-last"
        >
          {organizations.map((entry) => (
            <MenuItem
              key={entry.id}
              id={entry.id}
              textValue={entry.name}
              description={secondaryTextFor(entry)}
              startIcon={
                <Avatar
                  size="28"
                  appearance={entry.avatar.appearance}
                  initials={entry.avatar.initials}
                  type="initials"
                  alt={entry.name}
                />
              }
            >
              {entry.name}
            </MenuItem>
          ))}
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

function StoryLevels({
  level,
  levelDirection,
  labels,
  organization,
  items,
  selectedItemId,
  accessTitle,
  secondaryText,
  onItemPress,
  onOrganizationSelection,
  onBack,
}: {
  level: 'organization' | 'access';
  levelDirection: number;
  labels: {
    section: string;
    collapse: string;
    expand: string;
    organizationSwitcher: string;
  };
  organization: Organization;
  items: NavItem[];
  selectedItemId: string;
  accessTitle: string;
  secondaryText: string;
  onItemPress: (id: string) => void;
  onOrganizationSelection: (keys: Selection) => void;
  onBack: () => void;
}) {
  const { collapsed } = useSideNav();
  const { language, direction: writingDirection } = useVeliLanguage();
  const isDv = language === 'dv';

  const menu = (
    <SideNavMenu>
      {items.map((item) => (
        <SideNavMenuItem key={item.id}>
          <SideNavMenuButton
            href={item.href}
            isActive={item.id === selectedItemId}
            onPress={() => onItemPress(item.id)}
          >
            {item.icon}
            <SideNavMenuLabel>{item.label}</SideNavMenuLabel>
            {item.badge ? <SideNavMenuBadge>{item.badge}</SideNavMenuBadge> : null}
          </SideNavMenuButton>
        </SideNavMenuItem>
      ))}
    </SideNavMenu>
  );

  // Keep one trigger mounted across collapse so keyboard focus is not discarded.
  return (
    <div className={`relative flex w-full flex-col ${collapsed ? 'items-center' : ''}`}>
      <div className={collapsed ? 'shrink-0' : 'absolute end-0 top-0 z-10'}>
        <SideNavTrigger collapseLabel={labels.collapse} expandLabel={labels.expand} />
      </div>
      {collapsed ? (
        <>
          <OrganizationMenu
            organization={organization}
            labels={labels}
            secondaryTextFor={(entry) => (isDv ? entry.secondaryTextDv : entry.secondaryText)}
            onSelectionChange={onOrganizationSelection}
          >
            <SideNavCollapsedOrgButton aria-label={labels.organizationSwitcher}>
              <SideNavOrgAvatar
                alt={organization.name}
                size="36"
                initials={organization.avatar.initials}
                appearance={organization.avatar.appearance}
              />
            </SideNavCollapsedOrgButton>
          </OrganizationMenu>
          <div aria-hidden="true" className="h-1 w-2.5 shrink-0" />
          {menu}
        </>
      ) : (
        <SideNavLevelSwap
          level={level}
          direction={levelDirection}
          writingDirection={writingDirection}
        >
          {level === 'access' ? (
            <SideNavHeader>
              <SideNavHeaderRow>
                <SideNavBackButton onPress={onBack}>{organization.name}</SideNavBackButton>
                <span aria-hidden="true" className="inline-block size-9 shrink-0" />
              </SideNavHeaderRow>
              <SideNavTitle>{accessTitle}</SideNavTitle>
            </SideNavHeader>
          ) : (
            <SideNavHeader>
              <SideNavHeaderRow inset>
                <SideNavSectionLabel>{labels.section}</SideNavSectionLabel>
                <span aria-hidden="true" className="inline-block size-9 shrink-0" />
              </SideNavHeaderRow>
              <OrganizationMenu
                organization={organization}
                labels={labels}
                secondaryTextFor={(entry) => (isDv ? entry.secondaryTextDv : entry.secondaryText)}
                onSelectionChange={onOrganizationSelection}
              >
                <SideNavOrgSwitcher aria-label={labels.organizationSwitcher}>
                  <SideNavOrgAvatar
                    alt={organization.name}
                    size="44"
                    initials={organization.avatar.initials}
                    appearance={organization.avatar.appearance}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                    <SideNavOrgName>{organization.name}</SideNavOrgName>
                    <SideNavOrgSecondary>{secondaryText}</SideNavOrgSecondary>
                  </span>
                  <SideNavOrgCaret />
                </SideNavOrgSwitcher>
              </OrganizationMenu>
              <div aria-hidden="true" className="h-2 w-full shrink-0" />
            </SideNavHeader>
          )}
          {menu}
        </SideNavLevelSwap>
      )}
    </div>
  );
}

const meta = {
  title: 'Blocks/Side nav',
  component: SideNavStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof SideNavStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Nested: Story = {
  args: { startNested: true },
};

export const Collapsed: Story = {
  args: { defaultCollapsed: true },
};
