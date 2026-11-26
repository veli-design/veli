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

const labelsEn: SiteHeaderLabels = {
  openAppSwitcher: 'Open app switcher',
  closeAppSwitcher: 'Close app switcher',
  browse: 'Browse government apps and sites',
  introPrefix: 'Jump into any app or site to go deeper, or use search to find one.',
  introEmphasis: 'Select Gov.mv to return home.',
  appsBlurb: 'Shared government services under one address.',
  sitesBlurb: 'Ministries and agencies at gov.mv.',
  apps: 'Apps',
  sites: 'Sites',
  youAreHere: 'You are here',
  scrollToViewMore: 'Scroll to view more',
  searchAppsAndSites: 'Search apps and sites',
  search: 'Start typing...',
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
  searchSummary: (query, appCount, siteCount) => ({
    countLabel: appCount + siteCount === 1 ? '1 result' : `${appCount + siteCount} results`,
    rest: ` for “${query}”`,
  }),
  noAppsMatch: (query) => `No apps match “${query}”`,
  noSitesMatch: (query) => `No sites match “${query}”`,
  noAppsOrSitesMatch: (query) => `No apps or sites match “${query}”`,
  searchEmptyHint: 'Check the spelling, or clear the search to see all GOVMV apps and sites.',
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

const labelsDv: SiteHeaderLabels = {
  openAppSwitcher: 'އެޕް މެނޫ ހުޅުއްވާ',
  closeAppSwitcher: 'އެޕް މެނޫ ބަންދުކުރައްވާ',
  browse: 'ސަރުކާރުގެ ޚިދުމަތްތަކާއި ސައިޓްތައް ބައްލަވާލައްވާ',
  introPrefix:
    'އިތުރު ތަފްޞީލު ހޯއްދެވުމަށް ކޮންމެ އެޕަކަށްވެސް ވަދެވަޑައިގަންނަވާ، ނުވަތަ އެޕެއް ހޯއްދެވުމަށް ސާޗް ބޭނުންކުރައްވާ.',
  introEmphasis: 'ހޯމް ޕޭޖަށް އެނބުރި ވަޑައިގަތުމަށް ގަވް.އެމްވީ ޚިޔާރުކުރައްވާ.',
  appsBlurb: 'ސަރުކާރުގެ ޙިއްޞާކުރެވޭ ޚިދުމަތްތައް، ހުރިހާ އެއްޗެއް gov.mv ގެ ދަށުން.',
  sitesBlurb: 'މިނިސްޓްރީތަކާއި އޭޖެންސީތައް، ހުރިހާ އެއްޗެއް gov.mv ގައި.',
  apps: 'އެޕްތައް',
  sites: 'ސައިޓުތައް',
  youAreHere: 'މިހާރު މި އެޕްގައި',
  scrollToViewMore: 'އިތުރަށް ބެލުމަށް ސްކްރޯލް ކުރައްވާ',
  searchAppsAndSites: 'އެޕް އަދި ސައިޓްތައް ހޯއްދަވާ',
  search: 'ހޯއްދަވާ',
  filter: 'ފިލްޓަރ',
  showAll: 'ހުރިހާ',
  appsOnly: 'އެޕްތައް އެކަނި',
  sitesOnly: 'ސައިޓުތައް އެކަނި',
  showingApps: (count) => ({ lead: 'ހުރިހާ އެޕެއް: ', countLabel: `${count} ނަތީޖާ` }),
  showingSites: (count) => ({ lead: 'ހުރިހާ ސައިޓެއް: ', countLabel: `${count} ނަތީޖާ` }),
  searchSummary: (query, appCount, siteCount) => {
    const parts: string[] = [];
    if (appCount > 0) parts.push(`${appCount} އެޕް`);
    if (siteCount > 0) parts.push(`${siteCount} ސައިޓް`);
    return {
      countLabel: `${appCount + siteCount} ނަތީޖާ`,
      rest: ` “${query}” އަށް: ${parts.join(' އަދި ')}`,
    };
  },
  noAppsMatch: (query) => `“${query}” އާ ގުޅޭ އެޕެއް ނުފެނުނު`,
  noSitesMatch: (query) => `“${query}” އާ ގުޅޭ ސައިޓެއް ނުފެނުނު`,
  noAppsOrSitesMatch: (query) => `“${query}” އާ ގުޅޭ އެޕެއް ނުވަތަ ސައިޓެއް ނުފެނުނު`,
  searchEmptyHint:
    'ސްޕެލިންގް ޗެކް ކުރައްވާ، ނުވަތަ ހުރިހާ GOVMV އެޕްތަކާއި ސައިޓްތައް ފެންނަން ސަރޗް ކްލިއަރ ކުރައްވާ۔',
  label: 'މިއީ ދިވެހި ސަރުކާރުގެ ރަސްމީ ވެބްސައިޓެއް',
  howToIdentify: 'ރަސްމީ ސައިޓެއްކަން ދެނެގަންނާނީ',
  officialLinksTitle: 'ރަސްމީ ވެބްސައިޓްތަކުގެ ލިންކު .gov.mv އިން ނިމޭނެ',
  officialLinksDescription: 'ސަރުކާރުގެ އިދާރާތަކުން .gov.mv ވެބްސައިޓްތަކުން މުއާމަލާތްކުރާނެ.',
  secureWebsitesTitle: 'ސަލާމަތް ވެބްސައިޓްތަކުގައި HTTPS ބޭނުންކުރާނެ',
  secureWebsitesDescription: 'އިތުރު އިހުތިޔާތަކަށް ތާޅު ނުވަތަ https:// ހުރިތޯ ބައްލަވާ.',
  languageLabel: 'ބަސް',
  languageChange: 'ބަސް ބަދަލުކުރައްވާ',
  themeLabel: 'ތީމް',
  themeLight: 'އަލި',
  themeDark: 'އަނދިރި',
  themeAuto: 'އޮޓޯ',
  menuOpen: 'މެނޫ ހުޅުއްވާ',
  menuClose: 'މެނޫ ބަންދުކުރައްވާ',
  siteMenu: 'ސައިޓް މެނޫ',
  primaryNav: 'މައި',
};

const appsEn: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '#ownership-and-prerequisites',
    current: true,
    iconSrc: '/blocks/example-app-govmv.svg',
    description: 'The official entry point for public services.',
    searchNames: { en: 'Gov.mv', dv: 'Gov.mv' },
    infoParagraphs: [
      {
        leadIn: 'Gov.mv',
        body: 'is your single address for government public services, publications, and more. Open any app to go deeper into a specific service or entity, and select Gov.mv anytime to return home.',
      },
      {
        leadIn: 'Every service app has a widget',
        body: 'and your Gov.mv home brings them all together, a unified view of your government activity, with each widget acting as a shortcut into its app.',
      },
    ],
  },
  {
    id: 'applications',
    name: 'My Applications',
    kind: 'app',
    href: '#api',
    iconSrc: '/blocks/example-app-my-applications.svg',
    description: 'Track and continue government service applications.',
    searchNames: {
      en: ['My Applications', 'Applications'],
      dv: 'ހުށަހެޅުންތައް',
    },
  },
  {
    // English searchNames without dv: Dhivehi search does not fall back to the tile name.
    id: 'wallet',
    name: 'Wallet',
    kind: 'app',
    href: '#changelog',
    iconSrc: '/blocks/example-app-wallet.svg',
    description: 'Payments and government wallet balances.',
    searchNames: { en: 'Wallet' },
  },
];

const appsDv: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '#ownership-and-prerequisites',
    current: true,
    iconSrc: '/blocks/example-app-govmv.svg',
    description:
      'މިއީ އާންމު ޚިދުމަތްތަކަށް ވާސިލުވުމަށާއި ސަރުކާރުގެ ޝާއިއުކުރުންތައް ހޯދުމަށް ބޭނުންކުރާ މައިގަނޑު ދޮރާށެވެ.',
    searchNames: { en: 'Gov.mv', dv: 'Gov.mv' },
  },
  {
    id: 'applications',
    name: 'ހުށަހެޅުންތައް',
    kind: 'app',
    href: '#api',
    iconSrc: '/blocks/example-app-my-applications.svg',
    description:
      'ސަރުކާރުގެ ޚިދުމަތްތަކަށް ކުރެވިފައިވާ ހުށަހެޅުންތައް ބަލާލުމާއި ކުރިއަށް ގެންދިއުމަށް.',
    searchNames: {
      en: ['My Applications', 'Applications'],
      dv: 'ހުށަހެޅުންތައް',
    },
  },
  {
    id: 'wallet',
    name: 'Wallet',
    kind: 'app',
    href: '#changelog',
    iconSrc: '/blocks/example-app-wallet.svg',
    description: 'ފައިސާ ދައްކާލުމާއި ވޮލެޓް.',
    searchNames: { en: 'Wallet' },
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
  const isDv = language === 'dv';
  const labels = isDv ? labelsDv : labelsEn;
  const apps = isDv ? appsDv : appsEn;
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
                {
                  href: '#ownership-and-prerequisites',
                  label: isDv ? 'ފުރަތަމަ ޞަފުޙާ' : 'Home',
                  current: true,
                },
                { href: '#api', label: 'API' },
              ]}
              mobileNavItems={[
                {
                  href: '#ownership-and-prerequisites',
                  label: isDv ? 'ފުރަތަމަ ޞަފުޙާ' : 'Home',
                  current: true,
                },
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
                  {isDv ? 'ސައިންއިން' : 'Sign In'}
                </Button>
              }
            />
          }
          footer={
            <SiteFooter
              startLinks={[{ id: 'about', label: isDv ? 'ތަޢާރަފު' : 'About', href: '#api' }]}
              endLinks={[
                { id: 'privacy', label: isDv ? 'ޕްރައިވަސީ' : 'Privacy', href: '#changelog' },
              ]}
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
