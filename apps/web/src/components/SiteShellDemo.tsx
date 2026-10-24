import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { VeliProvider } from '@veli-design/react/provider';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderOverlayState,
  type SiteHeaderSwitcherItem,
} from '@tradenetcorp/veli-blocks/site-header';
import { SiteFooter } from '@tradenetcorp/veli-blocks/site-footer';
import { SiteShell } from '@tradenetcorp/veli-blocks/site-shell';

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
  searchSummary: (query, appCount, siteCount) => ({
    countLabel: appCount + siteCount === 1 ? '1 result' : `${appCount + siteCount} results`,
    rest: ` for “${query}”`,
  }),
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

const apps: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '#ownership-and-prerequisites',
    current: true,
    description: 'The official entry point for public services.',
  },
  {
    id: 'applications',
    name: 'My Applications',
    kind: 'app',
    href: '#api',
    description: 'Track and continue government service applications.',
  },
];

function GovmvLogo() {
  return (
    <span className="relative block h-[31px] w-[118px] shrink-0" aria-hidden>
      <img
        src="/blocks/govmv-logo.svg"
        alt=""
        width={118}
        height={31}
        className="block size-full dark:hidden"
      />
      <img
        src="/blocks/govmv-logo-dark.svg"
        alt=""
        width={118}
        height={31}
        className="hidden size-full dark:block"
      />
    </span>
  );
}

export function SiteShellDemo() {
  const [scheme, setScheme] = useState<SiteHeaderColorScheme>('light');
  const [language, setLanguage] = useState('en');
  const [overlay, setOverlay] = useState<SiteHeaderOverlayState>({
    switcherOpen: false,
    switcherRendered: false,
    mobileMenuVisible: false,
  });

  return (
    <VeliProvider language={language === 'dv' ? 'dv' : 'en'} colorScheme={scheme}>
      <div
        className="bg-surface-raised relative h-[480px] overflow-hidden rounded-xl border border-border-base-muted"
        style={{ transform: 'translateZ(0)' }}
      >
        <SiteShell
          overlay={overlay}
          header={
            <SiteHeader
              logo={<GovmvLogo />}
              pathname="/"
              desktopNavItems={[
                { href: '#ownership-and-prerequisites', label: 'Home', current: true },
                { href: '#api', label: 'API' },
              ]}
              mobileNavItems={[
                { href: '#ownership-and-prerequisites', label: 'Home', current: true },
                { href: '#api', label: 'API' },
              ]}
              apps={apps}
              sites={[]}
              labels={labels}
              languages={[
                { id: 'en', label: 'English', dir: 'ltr' },
                { id: 'dv', label: 'ދިވެހި', dir: 'rtl' },
              ]}
              language={language}
              onLanguageChange={setLanguage}
              colorScheme={scheme}
              onColorSchemeChange={setScheme}
              onNavigate={() => undefined}
              onOverlayChange={setOverlay}
              flagSrc="/blocks/maldives-flag.svg"
              actions={
                <Button intent="accent" appearance="fill" size="md">
                  Sign In
                </Button>
              }
            />
          }
          footer={
            <SiteFooter
              startLinks={[{ id: 'about', label: 'About', href: '#api' }]}
              endLinks={[{ id: 'privacy', label: 'Privacy', href: '#changelog' }]}
            />
          }
        >
          <div className="p-4">
            <p className="type-body-sm-regular text-text-base-muted">
              Open the logo menu to fade this main column.
            </p>
          </div>
        </SiteShell>
      </div>
    </VeliProvider>
  );
}
