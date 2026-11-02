'use client';

import { useCallback, useState, type ReactNode } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@veli-design/react/button';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderOverlayState,
  type SiteHeaderSwitcherItem,
} from '../components/blocks/site-header/site-header';
import { SiteFooter } from '../components/blocks/site-footer/site-footer';
import { SiteShell } from '../components/blocks/site-shell/site-shell';
import {
  PreviewBanner,
  type PreviewBannerNotice,
} from '../components/blocks/preview-banner/preview-banner';

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
  showAll: 'Show all',
  appsOnly: 'Apps only',
  sitesOnly: 'Sites only',
  showingApps: (count) => ({
    lead: 'Showing all Apps: ',
    countLabel: count === 1 ? '1 result' : `${count} results`,
  }),
  showingSites: (count) => ({
    lead: 'Showing all Sites: ',
    countLabel: count === 1 ? '1 result' : `${count} results`,
  }),
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

const apps: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '/shell',
    current: true,
    description: 'The official entry point for public services.',
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
  ['defence', 'Minister of Defence and National Service'],
  ['foreign-affairs', 'Minister of Foreign Affairs'],
  ['homeland', 'Minister of Homeland Security, Labour and Technology'],
  ['finance', 'Minister of Finance And Public Enterprises'],
  ['education', 'Minister of Education, Higher Education and Skills Development'],
  ['health', 'Minister of Health, Family and Welfare'],
  ['economy', 'Minister of Economic Development, Transport and Trade'],
  ['fisheries', 'Minister of Fisheries, Agriculture and Ocean Resources'],
  ['attorney-general', 'Attorney General'],
  ['islamic-affairs', 'Minister of Islamic Affairs and Endowments'],
  ['tourism', 'Minister of Tourism and Civil Aviation'],
  ['youth', 'Minister of Youth Empowerment, Sports and Fitness'],
  ['arts', 'Minister of Arts, Culture and Heritage'],
  ['infrastructure', 'Minister of Infrastructure, Housing and Urban Development'],
  ['climate', 'Minister of Climate Change, Environment and Energy'],
].map(([id, name]) => ({
  id,
  name,
  kind: 'site' as const,
  href: `https://${id}.gov.mv`,
  external: true,
  description: `Official site for the ${name}.`,
}));

/**
 * Host adapter that composes site-header, site-footer, and site-shell.
 * Session, search, and draft-mode notice resolution stay in the application.
 */
export function ApplicationShell({
  children,
  notices = [],
  colorScheme = 'light',
  onColorSchemeChange,
  language = 'en',
  onLanguageChange,
  flagSrc,
  actions,
}: {
  children: ReactNode;
  notices?: PreviewBannerNotice[];
  colorScheme?: SiteHeaderColorScheme;
  onColorSchemeChange?: (scheme: SiteHeaderColorScheme) => void;
  language?: string;
  onLanguageChange?: (id: string) => void;
  flagSrc: string;
  actions?: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [overlay, setOverlay] = useState<SiteHeaderOverlayState>({
    switcherOpen: false,
    switcherRendered: false,
    mobileMenuVisible: false,
  });

  const onOverlayChange = useCallback((next: SiteHeaderOverlayState) => {
    setOverlay(next);
  }, []);

  const navItems = [
    { href: '/shell', label: 'Home', current: pathname === '/shell' },
    { href: '/media', label: 'Media', current: pathname === '/media' },
    { href: '/services', label: 'Services', current: pathname === '/services' },
    { href: '/about', label: 'About', current: pathname === '/about' },
    { href: '/contact', label: 'Contact', current: pathname === '/contact' },
  ];

  return (
    <SiteShell
      overlay={overlay}
      notices={
        <PreviewBanner
          notices={notices}
          hidden={Boolean(overlay.switcherRendered || overlay.mobileMenuVisible)}
        />
      }
      header={
        <SiteHeader
          logo={
            <span className="type-body-md-semibold text-text-base-strong inline-flex h-[31px] items-center px-1">
              Gov.mv
            </span>
          }
          pathname={pathname}
          desktopNavItems={navItems}
          mobileNavItems={navItems}
          apps={apps}
          sites={sites}
          labels={labels}
          languages={languages}
          language={language}
          onLanguageChange={(id) => onLanguageChange?.(id)}
          colorScheme={colorScheme}
          onColorSchemeChange={(next) => onColorSchemeChange?.(next)}
          onNavigate={(href) => router.push(href)}
          onOverlayChange={onOverlayChange}
          flagSrc={flagSrc}
          actions={
            actions ?? (
              <Button intent="accent" appearance="fill" size="md">
                Sign In
              </Button>
            )
          }
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
      }
      footer={
        <SiteFooter
          startLabel="Service information"
          endLabel="Policies"
          startLinks={[{ id: 'about', label: 'About', href: '/about' }]}
          endLinks={[{ id: 'privacy', label: 'Privacy', href: '/privacy' }]}
          renderLink={(props) =>
            'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
          }
        />
      }
    >
      {children}
    </SiteShell>
  );
}

export type { PreviewBannerNotice };
