import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState, type ReactNode } from 'react';
import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import { addons } from 'storybook/internal/preview-api';
import { Button } from '@veli-design/react/button';
import { useVeliColorScheme, useVeliLanguage } from '@veli-design/react/provider';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderSwitcherItem,
} from '@tradenetcorp/veli-blocks/site-header';
import { providerSwitcherUpdatedEvent } from '../../.storybook/custom-addons/provider/shared';

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

/** Dhivehi shell copy aligned with gov.mv `shell/dv.ts`. */
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
  skipToMain: 'މައި ކޮންޓެންޓަށް ދިއުމަށް',
};

const EMBLEM_SRC = '/blocks/example-organization-emblem.svg';

const appsEn: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '/',
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
    id: 'services',
    name: 'Services',
    kind: 'app',
    href: '/services',
    iconSrc: '/blocks/example-app-services.svg',
    description: 'Browse and start government services.',
    searchNames: { en: 'Services', dv: 'ޚިދުމަތްތައް' },
  },
  {
    id: 'applications',
    name: 'My Applications',
    kind: 'app',
    href: '/applications',
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
    href: '/locker',
    iconSrc: '/blocks/example-app-locker.svg',
    description: 'Secure storage for government documents.',
    searchNames: { en: 'Locker', dv: 'ލޮކަރ' },
  },
  {
    // English searchNames without dv: Dhivehi search does not fall back to the tile name.
    id: 'wallet',
    name: 'Wallet',
    kind: 'app',
    href: '/wallet',
    iconSrc: '/blocks/example-app-wallet.svg',
    description: 'Payments and government wallet balances.',
    searchNames: { en: 'Wallet' },
  },
  {
    id: 'inbox',
    name: 'Inbox',
    kind: 'app',
    href: '/inbox',
    iconSrc: '/blocks/example-app-inbox.svg',
    description: 'Messages from government services.',
    searchNames: { en: 'Inbox', dv: 'އިންބޮކްސް' },
  },
  {
    id: 'gov-account',
    name: 'gov Account',
    kind: 'app',
    href: '/account',
    iconSrc: '/blocks/example-app-gov-account.svg',
    description: 'Manage your government account.',
    searchNames: { en: 'gov Account', dv: 'gov Account' },
  },
  {
    id: 'corpid',
    name: 'CorpID',
    kind: 'app',
    href: '/corpid',
    iconSrc: '/blocks/example-app-corpid.svg',
    description: 'Corporate identity and authorisations.',
    searchNames: { en: 'CorpID', dv: 'CorpID' },
  },
  {
    id: 'gov-support',
    name: 'gov Support',
    kind: 'app',
    href: '/support',
    iconSrc: '/blocks/example-app-gov-support.svg',
    description: 'Get help with government services.',
    searchNames: { en: 'gov Support', dv: 'gov Support' },
  },
  {
    id: 'government-entities',
    name: 'Government Entities',
    kind: 'app',
    href: '/entities',
    iconSrc: '/blocks/example-app-government-entities.svg',
    description: 'Find ministries and other entities.',
    searchNames: { en: 'Government Entities', dv: 'Government Entities' },
  },
];

const appsDv: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '/',
    current: true,
    iconSrc: '/blocks/example-app-govmv.svg',
    description:
      'މިއީ އާންމު ޚިދުމަތްތަކަށް ވާސިލުވުމަށާއި ސަރުކާރުގެ ޝާއިއުކުރުންތައް ހޯދުމަށް ބޭނުންކުރާ މައިގަނޑު ދޮރާށެވެ.',
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
    id: 'services',
    name: 'ޚިދުމަތްތައް',
    kind: 'app',
    href: '/services',
    iconSrc: '/blocks/example-app-services.svg',
    description: 'ސަރުކާރުގެ ޚިދުމަތްތައް ބަލާލުމާއި ފަށާލުމަށް.',
    searchNames: { en: 'Services', dv: 'ޚިދުމަތްތައް' },
  },
  {
    id: 'applications',
    name: 'ހުށަހެޅުންތައް',
    kind: 'app',
    href: '/applications',
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
    href: '/locker',
    iconSrc: '/blocks/example-app-locker.svg',
    description:
      'ސަރުކާރުގެ ލިޔެކިޔުންތަކާއި ކްރެޑެންޝިއަލްތައް ރައްކާތެރިކަމާއެކު ރައްކާކުރުމަށް.',
    searchNames: { en: 'Locker', dv: 'ލޮކަރ' },
  },
  {
    id: 'wallet',
    name: 'ވޮލެޓް',
    kind: 'app',
    href: '/wallet',
    iconSrc: '/blocks/example-app-wallet.svg',
    description: 'ފައިސާ ދައްކާލުމާއި ވޮލެޓް.',
    searchNames: { en: 'Wallet' },
  },
  {
    id: 'inbox',
    name: 'އިންބޮކްސް',
    kind: 'app',
    href: '/inbox',
    iconSrc: '/blocks/example-app-inbox.svg',
    description: 'ސަރުކާރުގެ ޚިދުމަތްތަކުން ލިބޭ މެސެޖުތައް.',
    searchNames: { en: 'Inbox', dv: 'އިންބޮކްސް' },
  },
  {
    id: 'gov-account',
    name: 'gov Account',
    kind: 'app',
    href: '/account',
    iconSrc: '/blocks/example-app-gov-account.svg',
    description: 'އަކައުންޓް ބެލޕްބަލުން.',
    searchNames: { en: 'gov Account', dv: 'gov Account' },
  },
  {
    id: 'corpid',
    name: 'CorpID',
    kind: 'app',
    href: '/corpid',
    iconSrc: '/blocks/example-app-corpid.svg',
    description: 'ކޯޕަރޭޓް އައިޑީ.',
    searchNames: { en: 'CorpID', dv: 'CorpID' },
  },
  {
    id: 'gov-support',
    name: 'gov Support',
    kind: 'app',
    href: '/support',
    iconSrc: '/blocks/example-app-gov-support.svg',
    description: 'އެހީތެރިކަން.',
    searchNames: { en: 'gov Support', dv: 'gov Support' },
  },
  {
    id: 'government-entities',
    name: 'Government Entities',
    kind: 'app',
    href: '/entities',
    iconSrc: '/blocks/example-app-government-entities.svg',
    description: 'ވުޒާރާތަކާއި އެހެނިހެން އެންޓިޓީތައް.',
    searchNames: { en: 'Government Entities', dv: 'Government Entities' },
  },
];

/** Default ministry order from the app-switcher design, English then Dhivehi. */
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
  kind: 'site',
  href: `/${site.id}`,
  emblemSrc: EMBLEM_SRC,
  description: `Official site for the ${site.en}.`,
  searchNames: { en: site.en, dv: site.dv },
}));

const sitesDv: SiteHeaderSwitcherItem[] = ministrySites.map((site) => ({
  id: site.id,
  name: site.dv,
  kind: 'site',
  href: `/${site.id}`,
  emblemSrc: EMBLEM_SRC,
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

function MinistryLogo({ emblemSrc = EMBLEM_SRC }: { emblemSrc?: string }) {
  return (
    <span
      className="relative block size-10 overflow-hidden rounded-xl shadow-[inset_0_0_6px_0_rgba(0,0,0,0.08)]"
      aria-hidden
    >
      <span
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            'var(--veli-header-site-tile-gradient, radial-gradient(circle at 50% 0%, rgb(155 180 155 / 0.04) 0%, rgb(44 66 11 / 0.09) 100%))',
        }}
      />
      <span
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            'var(--veli-header-site-tile-gradient, radial-gradient(circle at 50% 0%, rgb(14 14 13 / 0.4) 0%, rgb(37 38 36 / 0.55) 100%))',
        }}
      />
      <span
        className="absolute inset-[10%_18%] bg-contain bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${emblemSrc}')` }}
      />
    </span>
  );
}

/**
 * Host-owned brand for the logo trigger. SiteHeader does not infer ministry mode.
 * A site tile supplies its emblem and entity name. An app keeps the Gov.mv wordmark.
 */
function brandFromSwitcherItem(item: SiteHeaderSwitcherItem | undefined): {
  logo: ReactNode;
  title?: string;
} {
  if (item?.kind === 'site') {
    return {
      logo: <MinistryLogo emblemSrc={item.emblemSrc ?? EMBLEM_SRC} />,
      title: item.name,
    };
  }
  return { logo: <GovmvLogo /> };
}

/**
 * Host-owned "You are here" flag. SiteHeader does not infer the current tile.
 * The app sets `current` on the switcher item whose stable `id` matches the location.
 */
function withCurrentSwitcherItems(
  items: readonly SiteHeaderSwitcherItem[],
  currentId: string | undefined,
): SiteHeaderSwitcherItem[] {
  return items.map((item) => ({
    ...item,
    current: item.id === currentId,
  }));
}

/**
 * Map a location to a switcher id.
 * In-app routes match the item href or a path under it (`/services/passport` → services).
 * `/` matches only the home app. External tiles match their href exactly.
 * The longest matching href wins. Display names are not used.
 */
function switcherIdForHref(
  items: readonly SiteHeaderSwitcherItem[],
  href: string,
): string | undefined {
  let match: SiteHeaderSwitcherItem | undefined;
  for (const item of items) {
    const hit = item.external
      ? item.href === href
      : item.href === '/'
        ? href === '/'
        : href === item.href || href.startsWith(`${item.href}/`);
    if (!hit) continue;
    if (!match || item.href.length > match.href.length) match = item;
  }
  return match?.id;
}

function withCurrentNavItems(
  items: readonly { href: string; label: string }[],
  pathname: string,
): { href: string; label: string; current: boolean }[] {
  return items.map((item) => ({
    ...item,
    current:
      item.href === '/'
        ? pathname === '/'
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));
}

const servicesPage = {
  en: {
    eyebrow: 'Public services',
    title: 'Government services, in one place',
    lede: 'Gov.mv is the official entry point for public services in the Maldives. Start an application, check a document, or open a ministry site from this address.',
    servicesHeading: 'Start a service',
    services: [
      {
        title: 'Passport and travel',
        body: 'Renew a passport, check the status of an application, or find what to bring to an appointment.',
      },
      {
        title: 'Business registration',
        body: 'Register a company, file a change of directors, and keep annual returns in one place.',
      },
      {
        title: 'Civil records',
        body: 'Request birth, marriage, and other certificates issued by government offices.',
      },
      {
        title: 'Vehicles',
        body: 'Transfer ownership, renew a registration, and view the documents already on file.',
      },
    ],
    newsHeading: 'Latest from government',
    news: [
      {
        date: '12 Nov 2026',
        title: 'Budget consultation opens for public comment',
        body: 'Ministries are publishing draft programmes for the next fiscal year. Comments stay open through December.',
      },
      {
        date: '3 Nov 2026',
        title: 'Official documents can live in Locker',
        body: 'Signed files issued by agencies can be stored and shared without downloading a fresh copy each time.',
      },
      {
        date: '18 Oct 2026',
        title: 'Health appointments move online',
        body: 'Clinics in Malé and the atolls are accepting bookings through Services, including follow-up visits.',
      },
    ],
    stepsHeading: 'How a visit works',
    steps: [
      'Choose a service or a ministry site from the page, or open the app switcher from the logo.',
      'Sign in with your government account when the service asks for one.',
      'Track the application in My Applications, and keep issued documents in Locker.',
    ],
  },
  dv: {
    eyebrow: 'އާންމު ޚިދުމަތްތައް',
    title: 'ސަރުކާރުގެ ޚިދުމަތްތައް، އެއް ތަނުން',
    lede: 'Gov.mv އަކީ ދިވެހިރާއްޖޭގެ އާންމު ޚިދުމަތްތަކަށް ވަންނަ ރަސްމީ ދޮރު. ހުށަހެޅުމެއް ފަށާލުމަށް، ލިޔުމެއް ބަލާލުމަށް، ނުވަތަ ވުޒާރާއެއްގެ ސައިޓަކަށް ވަޑައިގަތުމަށް މި އެޑްރެސް ބޭނުންކުރެވޭ.',
    servicesHeading: 'ޚިދުމަތެއް ފަށާލައްވާ',
    services: [
      {
        title: 'ޕާސްޕޯޓާއި ދަތުރު',
        body: 'ޕާސްޕޯޓް އައުކުރުމަށް، ހުށަހެޅުމެއްގެ ހާލަތު ބަލާލުމަށް، އަދި އެޕޮއިންޓްމަންޓަކަށް ގެންދަވާނެ ތަކެތި ހޯދުމަށް.',
      },
      {
        title: 'ބިޒްނަސް ރަޖިސްޓްރީ',
        body: 'ކުންފުންޏެއް ރަޖިސްޓްރީ ކުރުމަށް، ޑައިރެކްޓަރުން ބަދަލުކުރުމަށް، އަދި އަހަރީ ރިޕޯޓް ހިމެނުމަށް.',
      },
      {
        title: 'ސިވިލް ރެކޯޑް',
        body: 'އުފަން، ކައިވެނި، އަދި އެހެނިހެން ސެޓްފިކެޓް ސަރުކާރުގެ އޮފީސްތަކުން ލިބިގަތުމަށް.',
      },
      {
        title: 'ވެހިކަލް',
        body: 'ވެހިކަލްގެ ވެރިކަން ބަދަލުކުރުމަށް، ރަޖިސްޓްރީ އައުކުރުމަށް، އަދި ހުރި ލިޔުންތައް ބަލާލުމަށް.',
      },
    ],
    newsHeading: 'ސަރުކާރުން ފަހު ޚަބަރު',
    news: [
      {
        date: '12 Nov 2026',
        title: 'ބަޖެޓް މަޝްވަރާ އާންމުކޮށްފި',
        body: 'ވުޒާރާތައް ދެން އަންނަ އަހަރުގެ ޕްރޮގްރާމްތައް ޝާއިއުކޮށްފި. ކޮމެންޓް ޑިސެމްބަރު ހަމަޔަށް ހުޅުވިފައި ބޭނުންވާނެ.',
      },
      {
        date: '3 Nov 2026',
        title: 'ރަސްމީ ލިޔުންތައް ލޮކަރުގައި ބެހެއްޓުމަށް',
        body: 'އޭޖެންސީތަކުން ދޫކުރާ ސޮއިކުރެވިފައިވާ ފައިލްތައް ރައްކާކޮށް، ކޮންމެ ފަހަރަކު އަލުން ޑައުންލޯޑް ނުކޮށް ޝެއަރ ކުރެވޭނެ.',
      },
      {
        date: '18 Oct 2026',
        title: 'ޞިއްޙީ އެޕޮއިންޓްމަންޓް އޮންލައިން',
        body: 'މާލޭގެ އަދި އަތޮޅުތަކުގެ ކްލިނިކްތައިން ބުކިން ގަބޫލުކުރަނީ ޚިދުމަތްތައިގެ ޒަރީޢާއިން.',
      },
    ],
    stepsHeading: 'ވެބްސައިޓެއް ބޭނުންކުރާ ގޮތް',
    steps: [
      'ޕޭޖުން ޚިދުމަތެއް ނުވަތަ ވުޒާރާއެއްގެ ސައިޓެއް ހޮވާލައްވާ، ނުވަތަ ލޯގޯއިން އެޕް ސްވިޗަރ ހުޅުއްވާ.',
      'ޚިދުމަތުން އެދޭއިރު ސަރުކާރުގެ އެކައުންޓުން ސައިން އިން ކުރައްވާ.',
      'ހުށަހެޅުން މައި އެޕްލިކޭޝަންސްގައި ބަލާލައްވާ، ދޫކުރި ލިޔުންތައް ލޮކަރުގައި ބެހެއްޓުއްވާ.',
    ],
  },
} as const;

const locationJumps = [
  { href: '/', en: 'Gov.mv', dv: 'Gov.mv' },
  { href: '/services', en: 'Services', dv: 'ޚިދުމަތްތައް' },
  { href: '/services/passport', en: 'Services · passport', dv: 'ޚިދުމަތްތައް · ޕާސްޕޯޓް' },
  { href: '/locker', en: 'Locker', dv: 'ލޮކަރ' },
  { href: '/inbox', en: 'Inbox', dv: 'އިންބޮކްސް' },
  { href: '/finance', en: 'Finance', dv: 'ފިނޭންސް' },
  { href: '/tourism', en: 'Tourism', dv: 'ޓޫރިޒަމް' },
] as const;

function DemoFooter({ isDv }: { isDv: boolean }) {
  const items = isDv
    ? ['ދިވެހިރާއްޖޭގެ ސަރުކާރު', 'ޕްރައިވަސީ', 'އެކްސެސިބިލިޓީ', 'ގުޅުއްވުމަށް']
    : ['Government of the Maldives', 'Privacy', 'Accessibility', 'Contact'];

  return (
    <footer className="type-body-sm-regular text-text-base-muted mx-auto flex w-full max-w-[1120px] flex-wrap gap-x-6 gap-y-2 px-4 py-8 md:px-8">
      {items.map((item) => (
        <span key={item}>{item}</span>
      ))}
    </footer>
  );
}

function DemoPage({ children, isDv }: { children: ReactNode; isDv: boolean }) {
  return (
    <>
      <main
        id="main-content"
        tabIndex={-1}
        className="bg-surface-base mx-1 mb-2 scroll-mt-28 rounded-3xl focus:outline-none lg:mx-2"
      >
        <div className="mx-auto flex max-w-[1120px] flex-col gap-12 px-4 py-8 md:px-8 md:py-12">
          {children}
        </div>
      </main>
      <DemoFooter isDv={isDv} />
    </>
  );
}

function ServicesHomePage({ isDv }: { isDv: boolean }) {
  const copy = isDv ? servicesPage.dv : servicesPage.en;

  return (
    <DemoPage isDv={isDv}>
      <header className="flex max-w-[40rem] flex-col gap-3">
        <p className="type-body-sm-medium text-text-primary-strong">{copy.eyebrow}</p>
        <h1 className="type-heading-2-medium text-base-emphasis">{copy.title}</h1>
        <p className="type-body-md-regular text-text-base">{copy.lede}</p>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="type-heading-4-medium text-base-emphasis">{copy.servicesHeading}</h2>
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2">
          {copy.services.map((service) => (
            <li
              key={service.title}
              className="border-base-subtle bg-surface-raised flex flex-col gap-2 rounded-2xl border p-5"
            >
              <h3 className="type-body-md-semibold text-text-base">{service.title}</h3>
              <p className="type-body-md-regular text-text-base">{service.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-heading-4-medium text-base-emphasis">{copy.newsHeading}</h2>
        <ul className="m-0 flex list-none flex-col gap-6 p-0">
          {copy.news.map((item) => (
            <li key={item.title} className="border-base-subtle flex flex-col gap-1 border-t pt-6">
              <p className="type-body-sm-regular text-text-base-muted">{item.date}</p>
              <h3 className="type-body-md-semibold text-text-base">{item.title}</h3>
              <p className="type-body-md-regular text-text-base">{item.body}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="type-heading-4-medium text-base-emphasis">{copy.stepsHeading}</h2>
        <ol className="m-0 flex list-decimal flex-col gap-3 ps-5">
          {copy.steps.map((step) => (
            <li key={step} className="type-body-md-regular text-text-base">
              {step}
            </li>
          ))}
        </ol>
      </section>
    </DemoPage>
  );
}

function CurrentLocationPage({
  isDv,
  pathname,
  currentItem,
  onNavigate,
}: {
  isDv: boolean;
  pathname: string;
  currentItem: SiteHeaderSwitcherItem | undefined;
  onNavigate: (href: string) => void;
}) {
  const copy = isDv
    ? {
        eyebrow: 'ސިމިއުލޭޓް ކުރި ލޮކޭޝަން',
        pathLabel: 'ޕާތްނޭމް',
        idLabel: 'ބެޖްގެ އައިޑީ',
        none: 'މި ލޮކޭޝަންއާ ގުޅޭ ޓައިލެއް ނެތް',
        hint: 'ލޯގޯ ހުޅުއްވާ “މިހާރު މި އެޕްގައި” ބެޖް ބަލާލައްވާ. ތިރީގެ ލިންކުން ނުވަތަ އެޕް ސްވިޗަރުން ވެސް ތަން ބަދަލުކުރެވޭ.',
        jump: 'ދިޔުމަށް',
        about: 'މި ތަނުގެ ތަޢާރަފު',
        notices: 'ނޯޓިސް',
        visit: 'ވެދިޔަ ގޮތް',
        kindApp: 'އެޕް',
        kindSite: 'ސައިޓް',
      }
    : {
        eyebrow: 'Simulated location',
        pathLabel: 'Pathname',
        idLabel: 'Badge id',
        none: 'No switcher tile matches this location',
        hint: 'Open the logo to check the You are here badge. Jump with the links below, or pick a tile in the app switcher. The host sets current from the item id.',
        jump: 'Jump to',
        about: 'About this destination',
        notices: 'Notices',
        visit: 'What this page is for',
        kindApp: 'App',
        kindSite: 'Site',
      };
  const name = currentItem?.name ?? copy.none;
  const kind = currentItem ? (currentItem.kind === 'site' ? copy.kindSite : copy.kindApp) : '—';

  return (
    <DemoPage isDv={isDv}>
      <header className="flex max-w-[40rem] flex-col gap-3">
        <p className="type-body-sm-medium text-text-primary-strong">{copy.eyebrow}</p>
        <h1 className="type-heading-2-medium text-base-emphasis">{name}</h1>
        <p className="type-body-sm-regular text-text-base-muted">
          {copy.pathLabel}: <span className="text-text-base">{pathname}</span>
          {' · '}
          {copy.idLabel}: <span className="text-text-base">{currentItem?.id ?? '—'}</span>
          {' · '}
          {kind}
        </p>
        <p className="type-body-md-regular text-text-base">{copy.hint}</p>
      </header>

      <nav aria-label={copy.jump} className="flex flex-col gap-3">
        <h2 className="type-heading-4-medium text-base-emphasis">{copy.jump}</h2>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {locationJumps.map((jump) => {
            const label = isDv ? jump.dv : jump.en;
            const current = pathname === jump.href;
            return (
              <li key={jump.href}>
                <button
                  type="button"
                  aria-current={current ? 'page' : undefined}
                  className={`type-body-sm-medium rounded-full border px-3 py-1.5 ${
                    current
                      ? 'border-transparent bg-surface-raised text-text-base'
                      : 'border-base-subtle bg-transparent text-text-base'
                  }`}
                  onClick={() => onNavigate(jump.href)}
                >
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <section className="flex max-w-[40rem] flex-col gap-3">
        <h2 className="type-heading-4-medium text-base-emphasis">{copy.about}</h2>
        <p className="type-body-md-regular text-text-base">
          {currentItem?.description ?? copy.none}
        </p>
        <p className="type-body-md-regular text-text-base">
          {isDv
            ? `${name} އަކީ މި ޑެމޯގައި މިހާރު ހުޅުވިފައިވާ ތަން. އެޕް ސްވިޗަރ ހުޅުއްވާއިރު ބެޖް ޖެހިފައި އޮންނަނީ މި އައިޑީއަށް.`
            : `${name} is the destination this demo is showing. When the app switcher opens, the You are here badge sits on the tile with this id.`}
        </p>
      </section>

      <section className="flex max-w-[40rem] flex-col gap-4">
        <h2 className="type-heading-4-medium text-base-emphasis">{copy.notices}</h2>
        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {(isDv
            ? [
                'މި ޕޭޖުގެ ކޮންޓެންޓް ބަދަލުވަނީ ހޮވިފައިވާ އެޕް ނުވަތަ ސައިޓާ އެކު.',
                'ސަރވިސް ޕާސްޕޯޓް ލިންކު ޕާތް ދިގުކުރޭ. ބެޖް އަދި ހުރީ ޚިދުމަތްތައިގެ ޓައިލްގައި.',
                'ސައިޓް ލިންކުތައް ބެޖް ގެންދަނީ މިނިސްޓްރީ ޓައިލަށް. ހޯސްޓް އަކީ ކަރަންޓް ސෙޓް ކުރާ ފަރާތް.',
              ]
            : [
                'Page content follows the selected app or site so the switcher opens over a real column.',
                'Services · passport lengthens the path. The badge stays on the Services tile.',
                'Site links move the badge to that ministry tile. The host, not the header, sets current.',
              ]
          ).map((notice) => (
            <li key={notice} className="border-base-subtle border-t pt-4">
              <p className="type-body-md-regular text-text-base">{notice}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex max-w-[40rem] flex-col gap-3">
        <h2 className="type-heading-4-medium text-base-emphasis">{copy.visit}</h2>
        <p className="type-body-md-regular text-text-base">
          {isDv
            ? 'މި ކޮލަމް ދިގުކޮށްފައިވަނީ ސްވިޗަރ ހުޅުވާއިރު ޕޭޖުގެ ޚްރޯމް ފެންނަން. ސްކްރޯލް ކުރުމުން ފްލޯޓިންގ ހެޑަރ ވެސް ބަލައިގަންނަވާ.'
            : 'This column is long enough to scroll, so the switcher morph and scrim can be judged over headings, cards, and body copy. Scroll to exercise the floating header as well.'}
        </p>
        <p className="type-body-md-regular text-text-base">
          {isDv
            ? `${name} އާ ގުޅޭ އިތުރު މައުލޫމާތު، ފޯމް، އަދި ކޮންޓެކްޓް ތަފްޞީލު މިތަނުގައި ދައްކާނެ. މި ޑެމޯގައި އެ ބްލޮކްތައް ސްޓެޓިކް.`
            : `Further information, forms, and contact details for ${name} would sit in this column. In this demo those blocks stay static so the badge is the thing that changes.`}
        </p>
      </section>
    </DemoPage>
  );
}

const LONG_MINISTRY_TITLE = 'Ministry of Education, Higher Education and Skills Development';
const LONG_MINISTRY_TITLE_DV =
  'މިނިސްޓްރީ އޮފް އެޑިޔުކޭޝަން، ހަޔަރ އެޑިޔުކޭޝަން އެންޑް ސްކިލްސް ޑިވެލޮޕްމަންޓް';
const TOURISM_TITLE_DV = 'މިނިސްޓަރ އޮފް ޓޫރިޒަމް އެންޑް ސިވިލް އޭވިއޭޝަން';

function HeaderStory({
  title,
  language = 'en',
  emptySites = false,
  withPageContent = false,
  trackCurrent = false,
}: {
  title?: string;
  language?: string;
  emptySites?: boolean;
  withPageContent?: boolean;
  trackCurrent?: boolean;
}) {
  const { colorScheme } = useVeliColorScheme();
  const { language: providerLanguage } = useVeliLanguage();

  // Story args (e.g. Rtl) drive the Storybook provider instead of nesting another one.
  useEffect(() => {
    if (language !== 'en' && language !== 'dv') return;
    addons.getChannel().emit(providerSwitcherUpdatedEvent, { language });
  }, [language]);

  const [pathname, setPathname] = useState('/');

  const lang = providerLanguage;
  const isDv = lang === 'dv';
  const dir = isDv ? 'rtl' : 'ltr';
  const labels = isDv ? labelsDv : labelsEn;
  const baseApps = isDv ? appsDv : appsEn;
  const baseSites = emptySites ? [] : isDv ? sitesDv : sitesEn;
  const catalog = [...baseApps, ...baseSites];
  const currentId = trackCurrent ? switcherIdForHref(catalog, pathname) : undefined;
  const apps = trackCurrent ? withCurrentSwitcherItems(baseApps, currentId) : baseApps;
  const sites = trackCurrent ? withCurrentSwitcherItems(baseSites, currentId) : baseSites;
  const currentItem = catalog.find((item) => item.id === currentId);
  const navHome = isDv ? 'ފުރަތަމަ ޞަފުޙާ' : 'Home';
  const navMedia = isDv ? 'މީޑިއާ' : 'Media';
  const navServices = isDv ? 'ޚިދުމަތްތައް' : 'Services';
  const navAbout = isDv ? 'އަޅުގަނޑުމެންނާ ބެހޭ' : 'About';
  const navContact = isDv ? 'ގުޅުއްވުމަށް' : 'Contact';
  const searchLabel = isDv ? 'ހޯއްދަވާ' : 'Search';
  const signIn = isDv ? 'ސައިންއިން' : 'Sign In';
  const scrollHint = isDv
    ? 'ފްލޯޓިންގ ހެޑަރ ބޭނުންކުރުމަށް ސްކްރޯލް ކުރައްވާ.'
    : 'Scroll to exercise the floating header.';
  const staticTitle = title
    ? isDv
      ? title === LONG_MINISTRY_TITLE
        ? LONG_MINISTRY_TITLE_DV
        : TOURISM_TITLE_DV
      : title
    : undefined;
  // Navigation stories follow the selected tile. Static stories (Ministry) keep their title.
  const brand = trackCurrent
    ? brandFromSwitcherItem(currentItem)
    : { logo: staticTitle ? <MinistryLogo /> : <GovmvLogo />, title: staticTitle };
  const navDefs = [
    { href: '/', label: navHome },
    { href: '/media', label: navMedia },
    { href: '/services', label: navServices },
    { href: '/about', label: navAbout },
    { href: '/contact', label: navContact },
  ];
  const navItems = trackCurrent
    ? withCurrentNavItems(navDefs, pathname)
    : navDefs.map((item) => ({ ...item, current: item.href === '/' }));

  return (
    <div lang={lang} dir={dir} className="bg-surface-raised min-h-[120vh]">
      <SiteHeader
        logo={brand.logo}
        title={brand.title}
        pathname={trackCurrent ? pathname : '/'}
        desktopNavItems={navItems}
        mobileNavItems={navItems}
        apps={apps}
        sites={emptySites ? [] : sites}
        labels={labels}
        languages={[
          { id: 'en', label: 'English', dir: 'ltr' },
          { id: 'dv', label: 'ދިވެހި', dir: 'rtl' },
        ]}
        language={lang}
        onLanguageChange={(id) => {
          addons.getChannel().emit(providerSwitcherUpdatedEvent, {
            language: id === 'dv' ? 'dv' : 'en',
          });
        }}
        colorScheme={colorScheme}
        onColorSchemeChange={(scheme: SiteHeaderColorScheme) => {
          addons.getChannel().emit(providerSwitcherUpdatedEvent, { theme: scheme });
        }}
        onNavigate={(href) => {
          if (trackCurrent) setPathname(href);
        }}
        renderNavLink={
          trackCurrent
            ? (item, className, children, options) => (
                <a
                  href={item.href}
                  className={className}
                  aria-current={item.current ? 'page' : undefined}
                  onClick={(event) => {
                    options?.onClick?.();
                    event.preventDefault();
                    setPathname(item.href);
                  }}
                >
                  {children}
                </a>
              )
            : undefined
        }
        flagSrc="/blocks/maldives-flag.svg"
        actions={
          <>
            <Button
              intent="secondary"
              appearance="transparent"
              size="md"
              iconOnly
              aria-label={searchLabel}
            >
              <MagnifyingGlassIcon aria-hidden size={16} weight="regular" />
            </Button>
            <Button intent="accent" appearance="fill" size="md">
              {signIn}
            </Button>
          </>
        }
        mobileActions={({ closeMenu }) => (
          <>
            <Button
              intent="secondary"
              appearance="transparent"
              size="md"
              className="w-full"
              onPress={closeMenu}
            >
              <MagnifyingGlassIcon aria-hidden size={16} weight="regular" />
              {searchLabel}
            </Button>
            <Button
              intent="accent"
              appearance="fill"
              size="md"
              className="w-full"
              onPress={closeMenu}
            >
              {signIn}
            </Button>
          </>
        )}
      />
      {trackCurrent ? (
        <CurrentLocationPage
          isDv={isDv}
          pathname={pathname}
          currentItem={currentItem}
          onNavigate={setPathname}
        />
      ) : withPageContent ? (
        <ServicesHomePage isDv={isDv} />
      ) : (
        <main id="main-content" tabIndex={-1} className="px-4 py-8 focus:outline-none">
          <p className="type-body-md-regular text-text-base">{scrollHint}</p>
          <div className="h-[80vh]" />
        </main>
      )}
    </div>
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
export const Ministry: Story = {
  args: { title: 'Minister of Tourism and Civil Aviation' },
};
export const LongMinistry: Story = {
  args: { title: LONG_MINISTRY_TITLE },
};
export const EmptySites: Story = { args: { emptySites: true } };

/** Banner, header, and a services page. Open the logo to judge the switcher over page chrome. */
export const WithPageContent: Story = {
  args: { withPageContent: true },
};

/**
 * Simulated navigation. The host sets `current` from the switcher item id for the
 * pathname, and the logo follows that tile: a site shows its emblem and name, an app
 * keeps the Gov.mv wordmark. Open the logo after a jump or a tile click to see the badge move.
 */
export const SwitchingSites: Story = {
  args: { trackCurrent: true },
};
