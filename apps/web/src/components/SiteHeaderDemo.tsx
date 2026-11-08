import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { VeliProvider } from '@veli-design/react/provider';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderSwitcherItem,
} from '@tradenetcorp/veli-blocks/site-header';

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
  showingApps: (count) => ({ lead: 'Showing all Apps: ', countLabel: `${count} result` }),
  showingSites: (count) => ({ lead: 'Showing all Sites: ', countLabel: `${count} result` }),
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
  {
    id: 'locker',
    name: 'Locker',
    kind: 'app',
    href: '#changelog',
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
  href: '#accessibility-and-responsive-behavior',
  description: `Official site for the ${name}.`,
}));

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

export function SiteHeaderDemo() {
  const [scheme, setScheme] = useState<SiteHeaderColorScheme>('light');
  const [language, setLanguage] = useState('en');

  return (
    <VeliProvider language={language === 'dv' ? 'dv' : 'en'} colorScheme={scheme}>
      {/* transform creates a containing block so position:fixed stays inside the preview. */}
      <div
        className="bg-surface-raised relative h-[420px] overflow-hidden rounded-xl border border-border-base-muted"
        style={{ transform: 'translateZ(0)' }}
      >
        <SiteHeader
          logo={<GovmvLogo />}
          pathname="/"
          desktopNavItems={[
            { href: '#ownership-and-prerequisites', label: 'Home', current: true },
            { href: '#api', label: 'API' },
            { href: '#changelog', label: 'Changelog' },
          ]}
          mobileNavItems={[
            { href: '#ownership-and-prerequisites', label: 'Home', current: true },
            { href: '#api', label: 'API' },
            { href: '#changelog', label: 'Changelog' },
          ]}
          apps={apps}
          sites={sites}
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
          flagSrc="/blocks/maldives-flag.svg"
          actions={
            <Button intent="accent" appearance="fill" size="md">
              Sign In
            </Button>
          }
        />
        <div className="px-4 py-6">
          <p className="type-body-sm-regular text-text-base-muted">
            Preview of the site header. Open the logo menu to browse the app switcher.
          </p>
        </div>
      </div>
    </VeliProvider>
  );
}
