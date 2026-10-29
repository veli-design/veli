'use client';

import { useState, type ReactNode } from 'react';
import NextLink from 'next/link';
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
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
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
} from '../components/blocks/side-nav/side-nav';

type Organization = {
  id: string;
  name: string;
  secondaryText?: string;
  avatar?: {
    src?: string;
    initials?: string;
    appearance?: AvatarAppearance;
  };
  lang?: string;
  dir?: 'ltr' | 'rtl' | 'auto';
};

type NavItem = {
  id: string;
  label: string;
  icon: ReactNode;
  href?: string;
  badge?: string;
};

/**
 * Host adapter for the side nav. Keep organization fetching,
 * nested routing, switcher menus, and persistence in the application.
 */
export function ApplicationSideNav({
  organizations,
  initialOrganizationId,
  labels,
  onOrganizationChange,
  onNavigate,
}: {
  organizations: readonly Organization[];
  initialOrganizationId?: string;
  labels: {
    section: string;
    collapse: string;
    expand: string;
    organizationSwitcher: string;
  };
  onOrganizationChange?: (id: string) => void;
  onNavigate?: (id: string) => void;
}) {
  const [level, setLevel] = useState<'organization' | 'access'>('organization');
  const [levelDirection, setLevelDirection] = useState(1);
  const [selectedItemId, setSelectedItemId] = useState('people');
  const [collapsed, setCollapsed] = useState(false);
  const [organizationId, setOrganizationId] = useState(
    initialOrganizationId ?? organizations[0]?.id ?? '',
  );

  const organization =
    organizations.find((entry) => entry.id === organizationId) ?? organizations[0];

  const organizationItems: NavItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <SquaresFourIcon weight="bold" />,
      href: '/org/overview',
    },
    {
      id: 'people',
      label: 'People',
      icon: <UsersIcon weight="bold" />,
      href: '/org/people',
      badge: '1',
    },
    {
      id: 'access',
      label: 'Access',
      icon: <ShieldCheckIcon weight="bold" />,
      href: '/org/access',
    },
    {
      id: 'representation',
      label: 'Representation',
      icon: <HandshakeIcon weight="bold" />,
      href: '/org/representation',
      badge: '1',
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <ClockCounterClockwiseIcon weight="bold" />,
      href: '/org/activity',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <GearIcon weight="bold" />,
      href: '/org/settings',
    },
  ];

  const accessItems: NavItem[] = [
    {
      id: 'roles',
      label: 'Roles',
      icon: <UserGearIcon weight="bold" />,
      href: '/org/access/roles',
    },
    {
      id: 'services',
      label: 'Services',
      icon: <BuildingsIcon weight="bold" />,
      href: '/org/access/services',
    },
    {
      id: 'apps',
      label: 'Apps',
      icon: <SquaresFourIcon weight="bold" />,
      href: '/org/access/apps',
    },
    {
      id: 'locker',
      label: 'Locker, Wallet, Inbox',
      icon: <TrayIcon weight="bold" />,
      href: '/org/access/locker',
    },
    {
      id: 'restricted',
      label: 'Restricted services',
      icon: <LockIcon weight="bold" />,
      href: '/org/access/restricted',
    },
  ];

  if (!organization) {
    return null;
  }

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
      onNavigate?.(id);
      return;
    }
    setSelectedItemId(id);
    onNavigate?.(id);
  }

  function handleOrganizationSelection(keys: Selection) {
    if (keys === 'all') return;
    const id = [...keys][0];
    if (typeof id === 'string') {
      setOrganizationId(id);
      goToOrganization('people');
      onOrganizationChange?.(id);
    }
  }

  return (
    <SideNav
      aria-label={ariaLabel}
      isCollapsed={collapsed}
      onCollapsedChange={setCollapsed}
      renderLink={(props) =>
        'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
      }
    >
      <SideNavLevels
        level={level}
        levelDirection={levelDirection}
        organization={organization}
        organizations={organizations}
        labels={labels}
        items={items}
        selectedItemId={selectedItemId}
        onOrganizationSelection={handleOrganizationSelection}
        onItemPress={handleItemPress}
        onBack={() => goToOrganization('access')}
      />
    </SideNav>
  );
}

function OrganizationMenu({
  organization,
  organizations,
  labels,
  onSelectionChange,
  children,
}: {
  organization: Organization;
  organizations: readonly Organization[];
  labels: { organizationSwitcher: string };
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
                  appearance={entry.avatar?.appearance ?? 'teal'}
                  src={entry.avatar?.src}
                  initials={entry.avatar?.initials ?? entry.name}
                  type={entry.avatar?.src ? 'image' : 'initials'}
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

function SideNavLevels({
  level,
  levelDirection,
  organization,
  organizations,
  labels,
  items,
  selectedItemId,
  onOrganizationSelection,
  onItemPress,
  onBack,
}: {
  level: 'organization' | 'access';
  levelDirection: number;
  organization: Organization;
  organizations: readonly Organization[];
  labels: {
    section: string;
    collapse: string;
    expand: string;
    organizationSwitcher: string;
  };
  items: NavItem[];
  selectedItemId: string;
  onOrganizationSelection: (keys: Selection) => void;
  onItemPress: (id: string) => void;
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
        <OrganizationMenu
          organization={organization}
          organizations={organizations}
          labels={labels}
          onSelectionChange={onOrganizationSelection}
        >
          <SideNavCollapsedOrgButton aria-label={labels.organizationSwitcher}>
            <SideNavOrgAvatar
              alt={organization.name}
              size="36"
              src={organization.avatar?.src}
              initials={organization.avatar?.initials}
              appearance={organization.avatar?.appearance}
            />
          </SideNavCollapsedOrgButton>
        </OrganizationMenu>
        <div aria-hidden="true" className="h-1 w-2.5 shrink-0" />
        {menu}
      </>
    );
  }

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
              organizations={organizations}
              labels={labels}
              onSelectionChange={onOrganizationSelection}
            >
              <SideNavOrgSwitcher aria-label={labels.organizationSwitcher}>
                <SideNavOrgAvatar
                  alt={organization.name}
                  size="44"
                  src={organization.avatar?.src}
                  initials={organization.avatar?.initials}
                  appearance={organization.avatar?.appearance}
                />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 overflow-hidden">
                  <SideNavOrgName lang={organization.lang} dir={organization.dir}>
                    {organization.name}
                  </SideNavOrgName>
                  {organization.secondaryText ? (
                    <SideNavOrgSecondary lang={organization.lang} dir={organization.dir}>
                      {organization.secondaryText}
                    </SideNavOrgSecondary>
                  ) : null}
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
