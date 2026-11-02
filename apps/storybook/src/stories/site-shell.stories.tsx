import type { Meta, StoryObj } from '@storybook/react';
import { useEffect, useState, type ReactNode } from 'react';
import { addons } from 'storybook/internal/preview-api';
import { Button } from '@veli-design/react/button';
import { useVeliColorScheme, useVeliLanguage } from '@veli-design/react/provider';
import {
  SiteHeader,
  type SiteHeaderColorScheme,
  type SiteHeaderLabels,
  type SiteHeaderOverlayState,
  type SiteHeaderSwitcherItem,
} from '@tradenetcorp/veli-blocks/site-header';
import { SiteFooter } from '@tradenetcorp/veli-blocks/site-footer';
import { PreviewBanner } from '@tradenetcorp/veli-blocks/preview-banner';
import { SiteShell } from '@tradenetcorp/veli-blocks/site-shell';
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

function ShellStory({
  language = 'en',
  withPreviewBanner = false,
}: {
  language?: string;
  withPreviewBanner?: boolean;
}) {
  const { colorScheme } = useVeliColorScheme();
  const { language: providerLanguage } = useVeliLanguage();
  const [overlay, setOverlay] = useState<SiteHeaderOverlayState>({
    switcherOpen: false,
    switcherRendered: false,
    mobileMenuVisible: false,
  });

  useEffect(() => {
    if (language !== 'en' && language !== 'dv') return;
    addons.getChannel().emit(providerSwitcherUpdatedEvent, { language });
  }, [language]);

  const lang = providerLanguage;
  const isDv = lang === 'dv';
  const labels = isDv ? labelsDv : labelsEn;
  const apps = isDv ? appsDv : appsEn;
  const navHome = isDv ? 'ފުރަތަމަ ޞަފުޙާ' : 'Home';
  const navMedia = isDv ? 'މީޑިއާ' : 'Media';
  const navServices = isDv ? 'ޚިދުމަތްތައް' : 'Services';
  const navAbout = isDv ? 'އަޅުގަނޑުމެންނާ ބެހޭ' : 'About';
  const navContact = isDv ? 'ގުޅުއްވުމަށް' : 'Contact';
  const signIn = isDv ? 'ސައިންއިން' : 'Sign In';
  const mainCopy = withPreviewBanner
    ? 'Open the app switcher to fade the main column and hide the preview banner.'
    : 'Open the app switcher to fade the main column.';
  const noticeTitle = isDv ? 'ޕްރިވިއު' : 'Preview';
  const noticeMessage = isDv
    ? 'މިއީ ޝާއިއުނުކުރެވިފައިވާ ކޮންޓެންޓެއް.'
    : 'Only editors can see this version';
  const noticeAction = isDv ? 'ޕްރިވިއުން ނިކުންނާ' : 'Exit preview';
  const aboutLabel = isDv ? 'ތަޢާރަފު' : 'About';
  const privacyLabel = isDv ? 'ޕްރައިވަސީ' : 'Privacy';

  const logo: ReactNode = <GovmvLogo />;

  return (
    <div lang={lang} dir={isDv ? 'rtl' : 'ltr'}>
      <SiteShell
        overlay={overlay}
        notices={
          withPreviewBanner ? (
            <PreviewBanner
              notices={[
                {
                  id: 'draft-mode',
                  title: noticeTitle,
                  message: noticeMessage,
                  previewStatus: 'draft',
                  statusLabel: isDv ? 'ޑްރާފްޓް' : 'Draft',
                  action: { href: '#', label: noticeAction },
                },
              ]}
              hidden={Boolean(overlay.switcherRendered || overlay.mobileMenuVisible)}
            />
          ) : undefined
        }
        header={
          <SiteHeader
            logo={logo}
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
            sites={[]}
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
            onOverlayChange={setOverlay}
            flagSrc="/blocks/maldives-flag.svg"
            actions={
              <Button intent="accent" appearance="fill" size="md">
                {signIn}
              </Button>
            }
          />
        }
        footer={
          <SiteFooter
            startLinks={[{ id: 'about', label: aboutLabel, href: '/about' }]}
            endLinks={[{ id: 'privacy', label: privacyLabel, href: '/privacy' }]}
          />
        }
      >
        <div className="p-6">
          <p className="type-body-md-regular text-text-base">{mainCopy}</p>
          <div className="h-[60vh]" aria-hidden />
        </div>
      </SiteShell>
    </div>
  );
}

const meta = {
  title: 'Blocks/Site shell',
  component: ShellStory,
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof ShellStory>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithPreviewBanner: Story = {
  args: { withPreviewBanner: true },
};
