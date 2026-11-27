import { useState } from 'react';
import { Button } from '@veli-design/react/button';
import { VeliProvider } from '@veli-design/react/provider';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderSwitcherItem,
} from '@tradenetcorp/veli-blocks/site-header';

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
  skipToMain: 'Skip to main content',
};

const labelsDv: SiteHeaderLabels = {
  skipToMain: 'މައި ކޮންޓެންޓަށް ދިއުމަށް',
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
    id: 'locker',
    name: 'Locker',
    kind: 'app',
    href: '#changelog',
    iconSrc: '/blocks/example-app-locker.svg',
    description: 'Secure storage for government documents.',
    searchNames: { en: 'Locker', dv: 'ލޮކަރ' },
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
    id: 'locker',
    name: 'ލޮކަރ',
    kind: 'app',
    href: '#changelog',
    iconSrc: '/blocks/example-app-locker.svg',
    description:
      'ސަރުކާރުގެ ލިޔެކިޔުންތަކާއި ކްރެޑެންޝިއަލްތައް ރައްކާތެރިކަމާއެކު ރައްކާކުރުމަށް.',
    searchNames: { en: 'Locker', dv: 'ލޮކަރ' },
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

const ministrySites: Array<{ id: string; en: string; dv: string }> = [
  {
    id: 'defence',
    en: 'Minister of Defence and National Service',
    dv: 'މިނިސްޓަރ އޮފް ޑިފެންސް އެންޑް ނޭޝަނަލް ސަރވިސް',
  },
  {
    id: 'foreign-affairs',
    en: 'Minister of Foreign Affairs',
    dv: 'މިނިސްޓަރ އޮފް ފޮރިން އެފެއާޒް',
  },
  {
    id: 'homeland',
    en: 'Minister of Homeland Security, Labour and Technology',
    dv: 'މިނިސްޓަރ އޮފް ހޯމްލޭންޑް ސެކިއުރިޓީ، ލޭބަރ އެންޑް ޓެކްނޯލޮޖީ',
  },
  {
    id: 'finance',
    en: 'Minister of Finance And Public Enterprises',
    dv: 'މިނިސްޓަރ އޮފް ފިނޭންސް އެންޑް ޕަބްލިކް އެންޓަރޕްރައިޒަސް',
  },
  {
    id: 'education',
    en: 'Minister of Education, Higher Education and Skills Development',
    dv: 'މިނިސްޓަރ އޮފް އެޑިޔުކޭޝަން، ހަޔަރ އެޑިޔުކޭޝަން އެންޑް ސްކިލްސް ޑިވެލޮޕްމަންޓް',
  },
  {
    id: 'health',
    en: 'Minister of Health, Family and Welfare',
    dv: 'މިނިސްޓަރ އޮފް ހެލްތު، ފެމިލީ އެންޑް ވެލްފެއަރ',
  },
  {
    id: 'economy',
    en: 'Minister of Economic Development, Transport and Trade',
    dv: 'މިނިސްޓަރ އޮފް އިކޮނޮމިކް ޑިވެލޮޕްމަންޓް، ޓްރާންސްޕޯޓް އެންޑް ޓްރޭޑް',
  },
  {
    id: 'fisheries',
    en: 'Minister of Fisheries, Agriculture and Ocean Resources',
    dv: 'މިނިސްޓަރ އޮފް ފިޝަރީޒް، އެގްރިކަލްޗަރ އެންޑް އޯޝަން ރިސޯސަސް',
  },
  {
    id: 'attorney-general',
    en: 'Attorney General',
    dv: 'ބަންޑާރަނައިބު',
  },
  {
    id: 'islamic-affairs',
    en: 'Minister of Islamic Affairs and Endowments',
    dv: 'މިނިސްޓަރ އޮފް އިސްލާމިކް އެފެއާޒް އެންޑް އެންޑައުމަންޓްސް',
  },
  {
    id: 'tourism',
    en: 'Minister of Tourism and Civil Aviation',
    dv: 'މިނިސްޓަރ އޮފް ޓޫރިޒަމް އެންޑް ސިވިލް އޭވިއޭޝަން',
  },
  {
    id: 'youth',
    en: 'Minister of Youth Empowerment, Sports and Fitness',
    dv: 'މިނިސްޓަރ އޮފް ޔޫތު އެމްޕަވަރމަންޓް، ސްޕޯޓްސް އެންޑް ފިޓްނަސް',
  },
  {
    id: 'arts',
    en: 'Minister of Arts, Culture and Heritage',
    dv: 'މިނިސްޓަރ އޮފް އާޓްސް، ކަލްޗަރ އެންޑް ހެރިޓޭޖް',
  },
  {
    id: 'infrastructure',
    en: 'Minister of Infrastructure, Housing and Urban Development',
    dv: 'މިނިސްޓަރ އޮފް އިންފްރާސްޓްރަކްޗަރ، ހައުސިންގ އެންޑް އަރބަން ޑިވެލޮޕްމަންޓް',
  },
  {
    id: 'climate',
    en: 'Minister of Climate Change, Environment and Energy',
    dv: 'މިނިސްޓަރ އޮފް ކްލައިމެޓް ޗޭންޖް، އެންވަޔަރަންމަންޓް އެންޑް އެނަރޖީ',
  },
];

const sitesEn: SiteHeaderSwitcherItem[] = ministrySites.map((site) => ({
  id: site.id,
  name: site.en,
  kind: 'site' as const,
  href: '#accessibility-and-responsive-behavior',
  emblemSrc: '/blocks/example-organization-emblem.svg',
  description: `Official site for the ${site.en}.`,
  searchNames: { en: site.en, dv: site.dv },
}));

const sitesDv: SiteHeaderSwitcherItem[] = ministrySites.map((site) => ({
  id: site.id,
  name: site.dv,
  kind: 'site' as const,
  href: '#accessibility-and-responsive-behavior',
  emblemSrc: '/blocks/example-organization-emblem.svg',
  description: 'ރަސްމީ ވެބްސައިޓް.',
  searchNames: { en: site.en, dv: site.dv },
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
  const isDv = language === 'dv';
  const labels = isDv ? labelsDv : labelsEn;
  const apps = isDv ? appsDv : appsEn;
  const sites = isDv ? sitesDv : sitesEn;

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
          skipToMainHref="#site-header-demo-main"
          desktopNavItems={[
            {
              href: '#ownership-and-prerequisites',
              label: isDv ? 'ފުރަތަމަ ޞަފުޙާ' : 'Home',
              current: true,
            },
            { href: '#api', label: 'API' },
            { href: '#changelog', label: 'Changelog' },
          ]}
          mobileNavItems={[
            {
              href: '#ownership-and-prerequisites',
              label: isDv ? 'ފުރަތަމަ ޞަފުޙާ' : 'Home',
              current: true,
            },
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
              {isDv ? 'ސައިންއިން' : 'Sign In'}
            </Button>
          }
        />
        <div id="site-header-demo-main" tabIndex={-1} className="px-4 py-6 focus:outline-none">
          <p className="type-body-sm-regular text-text-base-muted">
            Preview of the site header. Open the logo menu to browse the app switcher.
          </p>
        </div>
      </div>
    </VeliProvider>
  );
}
