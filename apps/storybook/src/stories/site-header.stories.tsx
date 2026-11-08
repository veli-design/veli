import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, type ReactNode } from 'react';
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
  viewMore: 'އިތުރަށް ބައްލަވާ',
  viewLess: 'ކުޑަކޮށްލައްވާ',
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
    if (appCount > 0) parts.push(`އެޕް ${appCount}`);
    if (siteCount > 0) parts.push(`ސައިޓް ${siteCount}`);
    return {
      countLabel: `ނަތީޖާ ${appCount + siteCount}`,
      rest: ` “${query}” އަށް: ${parts.join(' އަދި ')}`,
    };
  },
  noAppsMatch: (query) => `“${query}” އާ ގުޅޭ އެޕެއް ނުފެނުނު`,
  noSitesMatch: (query) => `“${query}” އާ ގުޅޭ ސައިޓެއް ނުފެނުނު`,
  noAppsOrSitesMatch: (query) => `“${query}” އާ ގުޅޭ އެޕެއް ނުވަތަ ސައިޓެއް ނުފެނުނު`,
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

const appsDv: SiteHeaderSwitcherItem[] = [
  {
    id: 'govmv',
    name: 'Gov.mv',
    kind: 'app',
    href: '/',
    current: true,
    description:
      'މިއީ އާންމު ޚިދުމަތްތަކަށް ވާސިލުވުމަށާއި ސަރުކާރުގެ ޝާއިއުކުރުންތައް ހޯދުމަށް ބޭނުންކުރާ މައިގަނޑު ދޮރާށެވެ.',
  },
  {
    id: 'applications',
    name: 'ހުށަހެޅުންތައް',
    kind: 'app',
    href: '/applications',
    description:
      'ސަރުކާރުގެ ޚިދުމަތްތަކަށް ކުރެވިފައިވާ ހުށަހެޅުންތައް ބަލާލުމާއި ކުރިއަށް ގެންދިއުމަށް.',
  },
  {
    id: 'locker',
    name: 'ލޮކަރ',
    kind: 'app',
    href: '/locker',
    description:
      'ސަރުކާރުގެ ލިޔެކިޔުންތަކާއި ކްރެޑެންޝިއަލްތައް ރައްކާތެރިކަމާއެކު ރައްކާކުރުމަށް.',
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
  description: `Official site for the ${site.en}.`,
}));

const sitesDv: SiteHeaderSwitcherItem[] = ministrySites.map((site) => ({
  id: site.id,
  name: site.dv,
  kind: 'site',
  href: `/${site.id}`,
  description: 'ރަސްމީ ވެބްސައިޓް.',
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

function MinistryLogo() {
  return (
    <span
      className="relative block size-10 overflow-hidden rounded-xl shadow-[inset_0_0_6px_0_rgba(0,0,0,0.08)]"
      aria-hidden
    >
      <span
        className="absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            'var(--veli-header-site-tile-gradient, radial-gradient(circle at 50% 0%, #fbfcfb 0%, #e0e2dd 100%))',
        }}
      />
      <span
        className="absolute inset-0 hidden dark:block"
        style={{
          backgroundImage:
            'var(--veli-header-site-tile-gradient, radial-gradient(circle at 50% 0%, #0e0e0d 0%, #191a18 50%, #252624 100%))',
        }}
      />
    </span>
  );
}

function HeaderStory({
  title,
  language = 'en',
  emptySites = false,
}: {
  title?: string;
  language?: string;
  emptySites?: boolean;
}) {
  const { colorScheme } = useVeliColorScheme();
  const { language: providerLanguage } = useVeliLanguage();

  // Story args (e.g. Rtl) drive the Storybook provider instead of nesting another one.
  useEffect(() => {
    if (language !== 'en' && language !== 'dv') return;
    addons.getChannel().emit(providerSwitcherUpdatedEvent, { language });
  }, [language]);

  const lang = providerLanguage;
  const isDv = lang === 'dv';
  const dir = isDv ? 'rtl' : 'ltr';
  const labels = isDv ? labelsDv : labelsEn;
  const apps = isDv ? appsDv : appsEn;
  const sites = isDv ? sitesDv : sitesEn;
  const navHome = isDv ? 'ފުރަތަމަ ޞަފުޙާ' : 'Home';
  const navMedia = isDv ? 'މީޑިއާ' : 'Media';
  const navServices = isDv ? 'ޚިދުމަތްތައް' : 'Services';
  const navAbout = isDv ? 'އަޅުގަނޑުމެންނާ ބެހޭ' : 'About';
  const navContact = isDv ? 'ގުޅުއްވުމަށް' : 'Contact';
  const signIn = isDv ? 'ސައިންއިން' : 'Sign In';
  const scrollHint = isDv
    ? 'ފްލޯޓިންގ ހެޑަރ ބޭނުންކުރުމަށް ސްކްރޯލް ކުރައްވާ.'
    : 'Scroll to exercise the floating header.';
  const ministryTitle = title
    ? isDv
      ? 'މިނިސްޓަރ އޮފް ޓޫރިޒަމް އެންޑް ސިވިލް އޭވިއޭޝަން'
      : title
    : undefined;
  const logo: ReactNode = title ? <MinistryLogo /> : <GovmvLogo />;

  return (
    <div lang={lang} dir={dir} className="bg-surface-raised min-h-[120vh]">
      <SiteHeader
        logo={logo}
        title={ministryTitle}
        pathname="/"
        desktopNavItems={[
          { href: '/', label: navHome, current: true },
          { href: '/media', label: navMedia },
          { href: '/services', label: navServices },
          { href: '/about', label: navAbout },
          { href: '/contact', label: navContact },
        ]}
        mobileNavItems={[
          { href: '/', label: navHome, current: true },
          { href: '/media', label: navMedia },
          { href: '/services', label: navServices },
          { href: '/about', label: navAbout },
          { href: '/contact', label: navContact },
        ]}
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
        onNavigate={() => undefined}
        flagSrc="/blocks/maldives-flag.svg"
        actions={
          <Button intent="accent" appearance="fill" size="md">
            {signIn}
          </Button>
        }
      />
      <main className="px-4 py-8">
        <p className="type-body-md-regular text-text-base">{scrollHint}</p>
        <div className="h-[80vh]" />
      </main>
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
export const EmptySites: Story = { args: { emptySites: true } };
