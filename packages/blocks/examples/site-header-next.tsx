'use client';

import { useMemo, type ReactNode } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderNavItem,
  type SiteHeaderSwitcherItem,
} from '../components/blocks/site-header/site-header';

const labels: SiteHeaderLabels = {
  openAppSwitcher: 'Open app switcher',
  closeAppSwitcher: 'Close app switcher',
  browse: 'Browse government services and sites',
  introPrefix: 'Jump into any app to go deeper, or use search to find one.',
  introEmphasis: 'Select Gov.mv to return home.',
  appsBlurb: 'Shared government services under one address.',
  sitesBlurb: 'Ministries and agencies at gov.mv.',
  apps: 'Apps',
  sites: 'Sites',
  youAreHere: 'You are here',
  viewMore: 'View more',
  viewLess: 'View less',
  searchAppsAndSites: 'Search apps and sites',
  search: 'Search',
  filter: 'Filter',
  searchSummary: (query, appCount, siteCount) => {
    const total = appCount + siteCount;
    return {
      countLabel: total === 1 ? '1 result' : `${total} results`,
      rest: ` for “${query}”`,
    };
  },
  noAppsMatch: (query) => `No apps match “${query}”`,
  noSitesMatch: (query) => `No sites match “${query}”`,
  noAppsOrSitesMatch: (query) => `No apps or sites match “${query}”`,
  label: 'An Official website of the Maldives Government',
  howToIdentify: 'How to identify',
  officialLinksTitle: 'Official website links end with .gov.mv',
  officialLinksDescription: 'Government agencies communicate via .gov.mv websites.',
  secureWebsitesTitle: 'Secure websites use HTTPS',
  secureWebsitesDescription: 'Look for a lock or https:// as an added precaution.',
  languageLabel: 'Language',
  languageChange: 'Change language',
  themeLabel: 'Theme',
  themeLight: 'Light',
  themeDark: 'Dark',
  themeAuto: 'Auto',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
  siteMenu: 'Site menu',
  primaryNav: 'Primary',
};

const languages = [
  { id: 'en', label: 'English', dir: 'ltr' as const },
  { id: 'dv', label: 'ދިވެހި', dir: 'rtl' as const },
];

function withCurrent(
  items: Omit<SiteHeaderNavItem, 'current'>[],
  pathname: string,
): SiteHeaderNavItem[] {
  return items.map((item) => ({
    ...item,
    current:
      item.href === '/'
        ? pathname === '/'
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));
}

const apps: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '/',
    current: true,
    description: 'The official entry point for public services.',
    sections: [
      {
        title: 'Unified Experience',
        body: 'Interact with tasks through apps listed under Your Apps.',
      },
    ],
  },
  {
    id: 'applications',
    name: 'My Applications',
    kind: 'app',
    href: '/about',
    description: 'Track and continue government service applications.',
  },
  {
    id: 'locker',
    name: 'Locker',
    kind: 'app',
    href: '/privacy',
    description: 'Secure storage for government documents.',
  },
];

const sites: SiteHeaderSwitcherItem[] = [
  {
    id: 'tourism',
    name: 'Ministry of Tourism',
    kind: 'site',
    href: 'https://tourism.gov.mv',
    external: true,
    description: 'Official site for the Ministry of Tourism.',
  },
  {
    id: 'secure-inbox',
    name: 'Secure Inbox',
    kind: 'site',
    href: 'https://inbox.gov.mv',
    external: true,
    badge: 'signin',
    description: 'Sign in required to open messages from government services.',
  },
];

export function ApplicationHeader({
  colorScheme = 'light',
  onColorSchemeChange,
  language = 'en',
  onLanguageChange,
  actions,
  /** Banner flag image URL owned by the application. */
  flagSrc,
}: {
  colorScheme?: SiteHeaderColorScheme;
  onColorSchemeChange?: (scheme: SiteHeaderColorScheme) => void;
  language?: string;
  onLanguageChange?: (id: string) => void;
  actions?: ReactNode;
  flagSrc: string;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const desktopNavItems = useMemo(
    () =>
      withCurrent(
        [
          { href: '/', label: 'Home' },
          { href: '/about', label: 'About' },
          { href: '/privacy', label: 'Privacy' },
        ],
        pathname,
      ),
    [pathname],
  );

  return (
    <SiteHeader
      logo={
        // Replace with your brand mark (light/dark SVGs). The block does not ship assets.
        <span className="type-body-md-semibold text-text-base-strong inline-flex h-[31px] items-center px-1">
          Gov.mv
        </span>
      }
      pathname={pathname}
      desktopNavItems={desktopNavItems}
      mobileNavItems={desktopNavItems}
      apps={apps}
      sites={sites}
      labels={labels}
      languages={languages}
      language={language}
      onLanguageChange={(id) => onLanguageChange?.(id)}
      colorScheme={colorScheme}
      onColorSchemeChange={(next) => onColorSchemeChange?.(next)}
      onNavigate={(href) => router.push(href)}
      flagSrc={flagSrc}
      actions={actions}
      renderNavLink={(item, className, children, options) =>
        item.external ? (
          <a
            href={item.href}
            className={className}
            aria-current={item.current ? 'page' : undefined}
            onClick={options?.onClick}
          >
            {children}
          </a>
        ) : (
          <NextLink
            href={item.href}
            className={className}
            aria-current={item.current ? 'page' : undefined}
            onClick={options?.onClick}
          >
            {children}
          </NextLink>
        )
      }
    />
  );
}
