import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { expect, userEvent, within } from '@storybook/test';
import { Breadcrumb, BreadcrumbOverflow, Breadcrumbs } from '@tradenetcorp/veli-ui/breadcrumbs';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

type BreadcrumbTrailItem = {
  id: string;
  label: string;
  href?: string;
};

type BreadcrumbsPlaygroundArgs = {
  showBackLink: boolean;
  showOverflow: boolean;
  disableSecondCrumb: boolean;
  backLinkLabel: string;
  homeLabel: string;
  secondLabel: string;
  thirdLabel: string;
  menuFiveLabel: string;
  currentLabel: string;
};

const enBreadcrumbText = {
  navigation: {
    back: 'Back',
    home: 'Home',
    services: 'Services',
    permits: 'Permits',
    fishingPermit: 'Fishing permit',
    applications: 'Applications',
    newSubmission: 'New submission',
    archivedServices: 'Archived services',
    permitDetails: 'Permit details',
  },
  menus: {
    menuOne: 'Menu One',
    menuTwo: 'Menu Two',
    menuThree: 'Menu Three',
    menuFour: 'Menu Four',
    menuFive: 'Menu Five',
    menuActive: 'Menu Active',
  },
  stories: {
    standardTrail: 'Standard trail',
    backLinkTreatment: 'Back link treatment',
    disabledCrumb: 'Disabled crumb',
    wrappingTrail: 'Wrapping trail',
  },
} as const;

const dhivehiBreadcrumbText = {
  navigation: {
    back: 'ފަހަތަށް',
    home: 'ހޯމް',
    services: 'ޚިދުމަތްތައް',
    permits: 'ހުއްދަތައް',
    fishingPermit: 'މަސްވެރިކަމުގެ ހުއްދަ',
    applications: 'އެޕްލިކޭޝަންތައް',
    newSubmission: 'އައު ހުށަހެޅުމެއް',
    archivedServices: 'އާކައިވްކުރެވިފައިވާ ޚިދުމަތްތައް',
    permitDetails: 'ހުއްދައިގެ ތަފްޞީލު',
  },
  menus: {
    menuOne: 'މެނޫ އެކެއް',
    menuTwo: 'މެނޫ ދޭއް',
    menuThree: 'މެނޫ ތިނެއް',
    menuFour: 'މެނޫ ހަތަރެއް',
    menuFive: 'މެނޫ ފަހެއް',
    menuActive: 'އެކްޓިވް މެނޫ',
  },
  stories: {
    standardTrail: 'އާދައިގެ ޓްރެއިލް',
    backLinkTreatment: 'ބެކް ލިންކް ޓްރީޓްމަންޓް',
    disabledCrumb: 'ބޭނުންނުކުރެވޭ ކްރަމް',
    wrappingTrail: 'ރެޕިންގ ޓްރެއިލް',
  },
} as const;

const breadcrumbText = {
  en: enBreadcrumbText,
  dv: dhivehiBreadcrumbText,
} as const;

type BreadcrumbLanguage = keyof typeof breadcrumbText;
type BreadcrumbStoryText = (typeof breadcrumbText)[BreadcrumbLanguage];

const useBreadcrumbLanguage = (): BreadcrumbLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useBreadcrumbText = () => {
  const language = useBreadcrumbLanguage();

  return breadcrumbText[language];
};

const breadcrumbArgText = {
  backLinkLabel: {
    en: enBreadcrumbText.navigation.back,
    dv: dhivehiBreadcrumbText.navigation.back,
  },
  homeLabel: {
    en: enBreadcrumbText.navigation.home,
    dv: dhivehiBreadcrumbText.navigation.home,
  },
  secondLabel: {
    en: enBreadcrumbText.navigation.services,
    dv: dhivehiBreadcrumbText.navigation.services,
  },
  thirdLabel: {
    en: enBreadcrumbText.navigation.permits,
    dv: dhivehiBreadcrumbText.navigation.permits,
  },
  menuFiveLabel: {
    en: enBreadcrumbText.menus.menuFive,
    dv: dhivehiBreadcrumbText.menus.menuFive,
  },
  currentLabel: {
    en: enBreadcrumbText.navigation.fishingPermit,
    dv: dhivehiBreadcrumbText.navigation.fishingPermit,
  },
} as const;

type BreadcrumbArgTextKey = keyof typeof breadcrumbArgText;

const breadcrumbArgTextKeys = Object.keys(breadcrumbArgText) as BreadcrumbArgTextKey[];

const getLocalizedBreadcrumbArgText = (
  key: BreadcrumbArgTextKey,
  value: unknown,
  language: BreadcrumbLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return breadcrumbArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(breadcrumbArgText[key]);

  if (localizedValues.includes(value)) {
    return breadcrumbArgText[key][language];
  }

  return value;
};

const getHiddenBacklinkItems = (text: BreadcrumbStoryText) => [
  { id: 'menu-two', label: text.menus.menuTwo, href: '#' },
  { id: 'menu-three', label: text.menus.menuThree, href: '#' },
  { id: 'menu-four', label: text.menus.menuFour, href: '#' },
];

const getBreadcrumbTrail = (text: BreadcrumbStoryText): BreadcrumbTrailItem[] => [
  { id: 'home', label: text.navigation.home, href: '#' },
  { id: 'services', label: text.navigation.services, href: '#' },
  { id: 'permits', label: text.navigation.permits, href: '#' },
  { id: 'fishing', label: text.navigation.fishingPermit },
];

const meta = {
  title: 'Components/Breadcrumbs',
  component: Breadcrumbs,
  decorators: [
    (Story, context) => {
      const language: BreadcrumbLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { backLinkLabel, homeLabel, secondLabel, thirdLabel, menuFiveLabel, currentLabel } =
        args;

      useEffect(() => {
        const currentArgs = {
          backLinkLabel,
          homeLabel,
          secondLabel,
          thirdLabel,
          menuFiveLabel,
          currentLabel,
        };
        const nextArgs: Partial<Record<BreadcrumbArgTextKey, string>> = {};

        breadcrumbArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedBreadcrumbArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [
        backLinkLabel,
        homeLabel,
        secondLabel,
        thirdLabel,
        menuFiveLabel,
        currentLabel,
        language,
        updateArgs,
      ]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Breadcrumbs>;

export default meta;
type Story = StoryObj<typeof meta>;
type PlaygroundStory = StoryObj<BreadcrumbsPlaygroundArgs>;

const storyPanelClassName =
  'w-full max-w-[560px] rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]';

export const Playground: PlaygroundStory = {
  args: {
    showBackLink: false,
    showOverflow: true,
    disableSecondCrumb: false,
    backLinkLabel: enBreadcrumbText.navigation.back,
    homeLabel: enBreadcrumbText.navigation.home,
    secondLabel: enBreadcrumbText.navigation.services,
    thirdLabel: enBreadcrumbText.navigation.permits,
    menuFiveLabel: enBreadcrumbText.menus.menuFive,
    currentLabel: enBreadcrumbText.navigation.fishingPermit,
  },
  argTypes: {
    showBackLink: {
      control: 'boolean',
    },
    showOverflow: {
      control: 'boolean',
    },
    disableSecondCrumb: {
      control: 'boolean',
    },
    backLinkLabel: {
      control: 'text',
    },
    homeLabel: {
      control: 'text',
    },
    secondLabel: {
      control: 'text',
    },
    thirdLabel: {
      control: 'text',
    },
    menuFiveLabel: {
      control: 'text',
    },
    currentLabel: {
      control: 'text',
    },
  },
  render: (args) => {
    const language = useBreadcrumbLanguage();
    const hiddenBacklinkItems = getHiddenBacklinkItems(breadcrumbText[language]);
    const backLinkLabel = getLocalizedBreadcrumbArgText(
      'backLinkLabel',
      args.backLinkLabel,
      language,
    );
    const homeLabel = getLocalizedBreadcrumbArgText('homeLabel', args.homeLabel, language);
    const secondLabel = getLocalizedBreadcrumbArgText('secondLabel', args.secondLabel, language);
    const thirdLabel = getLocalizedBreadcrumbArgText('thirdLabel', args.thirdLabel, language);
    const menuFiveLabel = getLocalizedBreadcrumbArgText(
      'menuFiveLabel',
      args.menuFiveLabel,
      language,
    );
    const currentLabel = getLocalizedBreadcrumbArgText('currentLabel', args.currentLabel, language);

    return (
      <div className={storyPanelClassName}>
        <Breadcrumbs
          aria-label="Breadcrumb playground"
          showBackLink={args.showBackLink}
          backLinkHref="#"
          backLinkLabel={backLinkLabel}
        >
          {!args.showBackLink ? <Breadcrumb href="#">{homeLabel}</Breadcrumb> : null}
          <Breadcrumb href="#" isDisabled={args.disableSecondCrumb}>
            {secondLabel}
          </Breadcrumb>
          {args.showOverflow ? (
            <BreadcrumbOverflow items={hiddenBacklinkItems} />
          ) : (
            <Breadcrumb href="#">{thirdLabel}</Breadcrumb>
          )}
          <Breadcrumb href="#">{menuFiveLabel}</Breadcrumb>
          <Breadcrumb>{currentLabel}</Breadcrumb>
        </Breadcrumbs>
      </div>
    );
  },
};

export const Default: Story = {
  render: () => {
    const text = useBreadcrumbText();

    return (
      <div className="rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <Breadcrumbs aria-label="Breadcrumb">
          <Breadcrumb href="#">{text.navigation.home}</Breadcrumb>
          <Breadcrumb href="#">{text.navigation.services}</Breadcrumb>
          <Breadcrumb href="#">{text.navigation.permits}</Breadcrumb>
          <Breadcrumb>{text.navigation.fishingPermit}</Breadcrumb>
        </Breadcrumbs>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole('navigation', { name: 'Breadcrumb' })).toBeVisible();
    await expect(canvas.getByText('Fishing permit')).toHaveAttribute('aria-current', 'page');
  },
};

export const Variations: Story = {
  render: () => {
    const text = useBreadcrumbText();
    const hiddenBacklinkItems = getHiddenBacklinkItems(text);

    return (
      <div className="grid gap-[24px] lg:grid-cols-2">
        <div className={storyPanelClassName}>
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-base-emphasis">{text.stories.standardTrail}</p>
            <Breadcrumbs aria-label="Permit breadcrumb">
              <Breadcrumb href="#">{text.navigation.home}</Breadcrumb>
              <Breadcrumb href="#">{text.navigation.applications}</Breadcrumb>
              <Breadcrumb href="#">{text.navigation.permits}</Breadcrumb>
              <Breadcrumb>{text.navigation.newSubmission}</Breadcrumb>
            </Breadcrumbs>
          </div>
        </div>

        <div className={storyPanelClassName}>
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-base-emphasis">
              {text.stories.backLinkTreatment}
            </p>
            <Breadcrumbs
              aria-label="Back breadcrumb"
              showBackLink
              backLinkLabel={text.navigation.back}
              backLinkOnPress={() => undefined}
            >
              <Breadcrumb href="#">{text.menus.menuOne}</Breadcrumb>
              <BreadcrumbOverflow items={hiddenBacklinkItems} />
              <Breadcrumb href="#">{text.menus.menuFive}</Breadcrumb>
              <Breadcrumb>{text.menus.menuActive}</Breadcrumb>
            </Breadcrumbs>
          </div>
        </div>

        <div className={`${storyPanelClassName} lg:col-span-2`}>
          <div className="space-y-[12px]">
            <p className="type-body-sm-medium text-base-emphasis">{text.stories.disabledCrumb}</p>
            <Breadcrumbs aria-label="Disabled breadcrumb">
              <Breadcrumb href="#">{text.navigation.home}</Breadcrumb>
              <Breadcrumb href="#" isDisabled>
                {text.navigation.archivedServices}
              </Breadcrumb>
              <Breadcrumb>{text.navigation.permitDetails}</Breadcrumb>
            </Breadcrumbs>
          </div>
        </div>
      </div>
    );
  },
};

export const BackLink: Story = {
  render: () => {
    const text = useBreadcrumbText();
    const [pressCount, setPressCount] = useState(0);

    return (
      <div className={storyPanelClassName}>
        <Breadcrumbs
          aria-label="Back breadcrumb"
          showBackLink
          backLinkLabel={text.navigation.back}
          backLinkOnPress={() => setPressCount((count) => count + 1)}
        >
          <Breadcrumb href="#">{text.navigation.services}</Breadcrumb>
          <Breadcrumb>{text.navigation.fishingPermit}</Breadcrumb>
        </Breadcrumbs>
        <output className="mt-3 block type-body-sm-regular text-base-muted">
          {pressCount} back-link activations
        </output>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const backLink = canvas.getByRole('button', { name: 'Back' });

    await userEvent.click(backLink);
    await expect(canvas.getByText('1 back-link activations')).toBeVisible();
  },
};

export const Overflow: Story = {
  render: () => {
    const text = useBreadcrumbText();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const hiddenItems = getHiddenBacklinkItems(text);

    return (
      <div className={storyPanelClassName}>
        <Breadcrumbs aria-label="Overflow breadcrumb">
          <Breadcrumb href="#">{text.navigation.home}</Breadcrumb>
          <BreadcrumbOverflow
            items={hiddenItems}
            label="Show hidden breadcrumb pages"
            menuLabel="Hidden breadcrumb pages"
            onAction={(key) => setSelectedItem(String(key))}
          />
          <Breadcrumb href="#">{text.navigation.permits}</Breadcrumb>
          <Breadcrumb>{text.navigation.fishingPermit}</Breadcrumb>
        </Breadcrumbs>
        {selectedItem && (
          <output className="mt-3 block type-body-sm-regular text-base-muted">
            Selected: {selectedItem}
          </output>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const documentBody = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Show hidden breadcrumb pages' });

    await userEvent.click(trigger);
    const menu = await documentBody.findByRole('menu', { name: 'Hidden breadcrumb pages' });
    await expect(menu).toBeVisible();
    await userEvent.click(within(menu).getByRole('menuitem', { name: 'Menu Two' }));
    await expect(canvas.getByText('Selected: menu-two')).toBeVisible();
  },
};

export const Disabled: Story = {
  render: () => {
    const text = useBreadcrumbText();

    return (
      <div className={storyPanelClassName}>
        <Breadcrumbs aria-label="Disabled breadcrumb">
          <Breadcrumb href="#">{text.navigation.home}</Breadcrumb>
          <Breadcrumb href="#" isDisabled>
            {text.navigation.archivedServices}
          </Breadcrumb>
          <Breadcrumb>{text.navigation.permitDetails}</Breadcrumb>
        </Breadcrumbs>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const disabledCrumb = canvas.getByText('Archived services');

    await expect(disabledCrumb).toHaveAttribute('aria-disabled', 'true');
    await expect(disabledCrumb).not.toHaveAttribute('href');
  },
};

export const ResponsiveWrapping: Story = {
  render: () => {
    const text = useBreadcrumbText();

    return (
      <div className="w-[280px] rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <p className="mb-3 type-body-sm-medium text-base-emphasis">{text.stories.wrappingTrail}</p>
        <Breadcrumbs aria-label="Wrapping breadcrumb">
          <Breadcrumb href="#">{text.navigation.home}</Breadcrumb>
          <Breadcrumb href="#">{text.navigation.archivedServices}</Breadcrumb>
          <Breadcrumb href="#">{text.navigation.permitDetails}</Breadcrumb>
          <Breadcrumb>{text.navigation.fishingPermit}</Breadcrumb>
        </Breadcrumbs>
      </div>
    );
  },
};

export const DataDrivenCollection: Story = {
  render: () => {
    const text = useBreadcrumbText();
    const breadcrumbTrail = getBreadcrumbTrail(text);
    const [currentIndex, setCurrentIndex] = useState(breadcrumbTrail.length - 1);
    const items = breadcrumbTrail.slice(0, currentIndex + 1);

    return (
      <div className="w-full max-w-[420px] rounded-[16px] border border-base-subtle bg-surface-raised p-[16px]">
        <Breadcrumbs
          aria-label="Application breadcrumb"
          items={items}
          onAction={(key) => {
            const nextIndex = breadcrumbTrail.findIndex((item) => item.id === key);
            if (nextIndex >= 0) {
              setCurrentIndex(nextIndex);
            }
          }}
        >
          {(item) => <Breadcrumb href={item.href}>{item.label}</Breadcrumb>}
        </Breadcrumbs>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('link', { name: 'Services' }));
    await expect(canvas.getByText('Services')).toHaveAttribute('aria-current', 'page');
    await expect(canvas.queryByText('Fishing permit')).not.toBeInTheDocument();
  },
};
