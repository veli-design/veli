import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { VeliProvider } from '@tradenetcorp/veli-ui/provider';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderSwitcherItem,
} from '@tradenetcorp/veli-blocks/site-header';

const FLAG_SRC =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="12"><rect width="18" height="12" fill="#D21034"/><rect x="3" y="3" width="8" height="6" fill="#007E3A"/><circle cx="8" cy="6" r="2" fill="#fff"/></svg>',
  );

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
    href: '/',
    current: true,
    description: 'The official entry point for public services.',
  },
  {
    id: 'applications',
    name: 'My Applications',
    kind: 'app',
    href: '/applications',
    description: 'Track and continue government service applications.',
  },
  {
    id: 'locker',
    name: 'Locker',
    kind: 'app',
    href: '/locker',
    description: 'Secure storage for government documents.',
  },
];

const sites: SiteHeaderSwitcherItem[] = [
  {
    id: 'tourism',
    name: 'Ministry of Tourism',
    kind: 'site',
    href: '/tourism',
    description: 'Official site for the Ministry of Tourism.',
  },
];

function HeaderStory({
  title,
  language = 'en',
  emptySites = false,
  longLabels = false,
}: {
  title?: string;
  language?: string;
  emptySites?: boolean;
  longLabels?: boolean;
}) {
  const [scheme, setScheme] = useState<SiteHeaderColorScheme>('light');
  const [lang, setLang] = useState(language);
  const dir = lang === 'dv' ? 'rtl' : 'ltr';
  const navLabel = longLabels
    ? 'Information about this public service and the organization responsible'
    : 'Home';

  return (
    <VeliProvider language={lang === 'dv' ? 'dv' : 'en'} colorScheme={scheme}>
      <div lang={lang} dir={dir} className="bg-surface-raised min-h-[120vh]">
        <SiteHeader
          logo={
            <span className="type-body-md-semibold text-text-base-strong inline-flex size-10 items-center justify-center rounded-xl bg-primary-subtle">
              G
            </span>
          }
          title={title}
          pathname="/"
          desktopNavItems={[
            { href: '/', label: navLabel, current: true },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ]}
          mobileNavItems={[
            { href: '/', label: navLabel, current: true },
            { href: '/about', label: 'About' },
            { href: '/contact', label: 'Contact' },
          ]}
          apps={apps}
          sites={emptySites ? [] : sites}
          labels={labels}
          languages={[
            { id: 'en', label: 'English', dir: 'ltr' },
            { id: 'dv', label: 'ދިވެހި', dir: 'rtl' },
          ]}
          language={lang}
          onLanguageChange={setLang}
          colorScheme={scheme}
          onColorSchemeChange={setScheme}
          onNavigate={() => undefined}
          flagSrc={FLAG_SRC}
          actions={
            <button
              type="button"
              className="bg-button-accent-fill type-body-sm-medium text-text-on-accent inline-flex h-11 items-center rounded-full px-4"
            >
              Sign In
            </button>
          }
        />
        <main className="px-4 py-8">
          <p className="type-body-md-regular text-text-base">
            Scroll to exercise the floating header.
          </p>
          <div className="h-[80vh]" />
        </main>
      </div>
    </VeliProvider>
  );
}

const meta = {
  title: 'Blocks/Site header',
  component: HeaderStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof HeaderStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Ministry: Story = { args: { title: 'Ministry of Tourism' } };
export const Rtl: Story = { args: { language: 'dv' } };
export const EmptySites: Story = { args: { emptySites: true } };
export const LongLabels: Story = { args: { longLabels: true } };
