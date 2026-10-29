'use client';

import { useState, useSyncExternalStore, type ReactNode } from 'react';
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
import { Avatar, type AvatarAppearance } from '@tradenetcorp/veli-ui/avatar';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from '@tradenetcorp/veli-ui/menu';
import {
  useVeliLanguage,
  VeliProvider,
  type VeliColorScheme,
} from '@tradenetcorp/veli-ui/provider';
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

function subscribeToDocsTheme(callback: () => void) {
  window.addEventListener('veli:color-scheme-change', callback);
  return () => window.removeEventListener('veli:color-scheme-change', callback);
}

function getDocsColorScheme(): VeliColorScheme {
  const value = document.documentElement.dataset.colorScheme;
  return value === 'light' || value === 'dark' ? value : 'system';
}

type Organization = {
  id: string;
  name: string;
  secondaryText: string;
  avatar: { initials: string; appearance: AvatarAppearance };
};

const organizations: Organization[] = [
  {
    id: 'island-holidays',
    name: 'Island Holidays',
    secondaryText: 'Owner · Travel agency',
    avatar: { initials: 'IH', appearance: 'teal' },
  },
  {
    id: 'coral-tours',
    name: 'Coral Tours',
    secondaryText: 'Admin · Tour operator',
    avatar: { initials: 'CT', appearance: 'blue' },
  },
  {
    id: 'reef-logistics',
    name: 'Reef Logistics',
    secondaryText: 'Member · Logistics',
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

const organizationItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: <SquaresFourIcon weight="bold" />,
    href: '#overview',
  },
  {
    id: 'people',
    label: 'People',
    icon: <UsersIcon weight="bold" />,
    href: '#people',
    badge: '1',
  },
  {
    id: 'access',
    label: 'Access',
    icon: <ShieldCheckIcon weight="bold" />,
    href: '#access',
  },
  {
    id: 'representation',
    label: 'Representation',
    icon: <HandshakeIcon weight="bold" />,
    href: '#representation',
    badge: '1',
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: <ClockCounterClockwiseIcon weight="bold" />,
    href: '#activity',
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: <GearIcon weight="bold" />,
    href: '#settings',
  },
];

const accessItems: NavItem[] = [
  { id: 'roles', label: 'Roles', icon: <UserGearIcon weight="bold" />, href: '#roles' },
  {
    id: 'services',
    label: 'Services',
    icon: <BuildingsIcon weight="bold" />,
    href: '#services',
  },
  { id: 'apps', label: 'Apps', icon: <SquaresFourIcon weight="bold" />, href: '#apps' },
  {
    id: 'locker',
    label: 'Locker, Wallet, Inbox',
    icon: <TrayIcon weight="bold" />,
    href: '#locker',
  },
  {
    id: 'restricted',
    label: 'Restricted services',
    icon: <LockIcon weight="bold" />,
    href: '#restricted',
  },
];

const labels = {
  section: 'Organisation',
  collapse: 'Collapse sidebar',
  expand: 'Expand sidebar',
  organizationSwitcher: 'Switch organization',
};

export function SideNavDemo() {
  const [level, setLevel] = useState<'organization' | 'access'>('organization');
  const [levelDirection, setLevelDirection] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState('people');
  const [organizationId, setOrganizationId] = useState(organizations[0]!.id);
  const colorScheme = useSyncExternalStore(
    subscribeToDocsTheme,
    getDocsColorScheme,
    () => 'system' as const,
  );

  const organization =
    organizations.find((entry) => entry.id === organizationId) ?? organizations[0]!;
  const items = level === 'access' ? accessItems : organizationItems;
  const ariaLabel = level === 'access' ? 'Access' : labels.section;

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
    <VeliProvider language="en" colorScheme={colorScheme}>
      <div className="bg-surface-base flex justify-center rounded-xl border border-border-base-muted p-6">
        <SideNav aria-label={ariaLabel}>
          <DemoLevels
            level={level}
            levelDirection={levelDirection}
            organization={organization}
            items={items}
            selectedItemId={selectedItemId}
            onItemPress={handleItemPress}
            onOrganizationSelection={handleOrganizationSelection}
            onBack={() => goToOrganization('access')}
          />
        </SideNav>
      </div>
    </VeliProvider>
  );
}

function OrganizationMenu({
  organization,
  onSelectionChange,
  children,
}: {
  organization: Organization;
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
              description={entry.secondaryText}
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

function DemoLevels({
  level,
  levelDirection,
  organization,
  items,
  selectedItemId,
  onItemPress,
  onOrganizationSelection,
  onBack,
}: {
  level: 'organization' | 'access';
  levelDirection: number;
  organization: Organization;
  items: NavItem[];
  selectedItemId: string;
  onItemPress: (id: string) => void;
  onOrganizationSelection: (keys: Selection) => void;
  onBack: () => void;
}) {
  const { collapsed } = useSideNav();
  const { direction: writingDirection } = useVeliLanguage();

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

  if (collapsed) {
    return (
      <>
        <SideNavTrigger collapseLabel={labels.collapse} expandLabel={labels.expand} />
        <OrganizationMenu organization={organization} onSelectionChange={onOrganizationSelection}>
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
    );
  }

  // Trigger stays outside the level swap — it does not change between org and Access.
  return (
    <div className="relative flex w-full flex-col">
      <div className="absolute end-0 top-0 z-10">
        <SideNavTrigger collapseLabel={labels.collapse} expandLabel={labels.expand} />
      </div>
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
            <SideNavTitle>Access</SideNavTitle>
          </SideNavHeader>
        ) : (
          <SideNavHeader>
            <SideNavHeaderRow inset>
              <SideNavSectionLabel>{labels.section}</SideNavSectionLabel>
              <span aria-hidden="true" className="inline-block size-9 shrink-0" />
            </SideNavHeaderRow>
            <OrganizationMenu
              organization={organization}
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
                  <SideNavOrgSecondary>{organization.secondaryText}</SideNavOrgSecondary>
                </span>
                <SideNavOrgCaret />
              </SideNavOrgSwitcher>
            </OrganizationMenu>
            <div aria-hidden="true" className="h-2 w-full shrink-0" />
          </SideNavHeader>
        )}
        {menu}
      </SideNavLevelSwap>
    </div>
  );
}
