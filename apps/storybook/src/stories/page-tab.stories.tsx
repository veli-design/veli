import { useEffect, type ComponentProps } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { useArgs } from 'storybook/internal/preview-api';
import { PageTab } from '@tradenetcorp/veli-ui/page-tab';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const enTabsText = {
  overview: 'Overview',
  services: 'Services',
  pricing: 'Pricing',
  overviewContent: 'Overview section content.',
  servicesContent: 'Services section content.',
  pricingContent: 'Pricing section content.',
} as const;

const dhivehiTabsText = {
  overview: 'ޚުލާޞާ',
  services: 'ޚިދުމަތްތައް',
  pricing: 'އަގުތައް',
  overviewContent: 'ޚުލާޞާ ސެކްޝަންގެ ކޮންޓެންޓް.',
  servicesContent: 'ޚިދުމަތްތައް ސެކްޝަންގެ ކޮންޓެންޓް.',
  pricingContent: 'އަގުތައް ސެކްޝަންގެ ކޮންޓެންޓް.',
} as const;

type PageTabLanguage = 'en' | 'dv';
type PageTabArgTextKey = keyof typeof pageTabArgText;
type PageTabStoryArgs = ComponentProps<typeof PageTab> & {
  overviewLabel: string;
  servicesLabel: string;
  pricingLabel: string;
  overviewContent: string;
  servicesContent: string;
  pricingContent: string;
};

const pageTabArgText = {
  overviewLabel: {
    en: enTabsText.overview,
    dv: dhivehiTabsText.overview,
  },
  servicesLabel: {
    en: enTabsText.services,
    dv: dhivehiTabsText.services,
  },
  pricingLabel: {
    en: enTabsText.pricing,
    dv: dhivehiTabsText.pricing,
  },
  overviewContent: {
    en: enTabsText.overviewContent,
    dv: dhivehiTabsText.overviewContent,
  },
  servicesContent: {
    en: enTabsText.servicesContent,
    dv: dhivehiTabsText.servicesContent,
  },
  pricingContent: {
    en: enTabsText.pricingContent,
    dv: dhivehiTabsText.pricingContent,
  },
} as const;

const pageTabArgTextKeys = Object.keys(pageTabArgText) as PageTabArgTextKey[];

const usePageTabLanguage = (): PageTabLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const getLocalizedPageTabArgText = (
  key: PageTabArgTextKey,
  value: unknown,
  language: PageTabLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return pageTabArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(pageTabArgText[key]);

  if (localizedValues.includes(value)) {
    return pageTabArgText[key][language];
  }

  return value;
};

const meta = {
  title: 'Components/PageTab',
  component: PageTab,
  decorators: [
    (Story, context) => {
      const language: PageTabLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const {
        overviewLabel,
        servicesLabel,
        pricingLabel,
        overviewContent,
        servicesContent,
        pricingContent,
      } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<PageTabArgTextKey, string>> = {};
        const currentArgs = {
          overviewLabel,
          servicesLabel,
          pricingLabel,
          overviewContent,
          servicesContent,
          pricingContent,
        };

        pageTabArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedPageTabArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [
        overviewLabel,
        servicesLabel,
        pricingLabel,
        overviewContent,
        servicesContent,
        pricingContent,
        language,
        updateArgs,
      ]);

      return <Story />;
    },
  ],
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  args: {
    isCentered: true,
    items: [
      {
        id: 'overview',
        label: enTabsText.overview,
        panel: enTabsText.overviewContent,
      },
      {
        id: 'services',
        label: enTabsText.services,
        panel: enTabsText.servicesContent,
      },
    ],
    overviewLabel: enTabsText.overview,
    servicesLabel: enTabsText.services,
    pricingLabel: enTabsText.pricing,
    overviewContent: enTabsText.overviewContent,
    servicesContent: enTabsText.servicesContent,
    pricingContent: enTabsText.pricingContent,
  },
  argTypes: {
    isCentered: {
      control: 'boolean',
    },
    items: {
      control: false,
      table: {
        disable: true,
      },
    },
    overviewLabel: {
      control: 'text',
    },
    servicesLabel: {
      control: 'text',
    },
    pricingLabel: {
      control: 'text',
    },
    overviewContent: {
      control: 'text',
    },
    servicesContent: {
      control: 'text',
    },
    pricingContent: {
      control: 'text',
    },
  },
} satisfies Meta<PageTabStoryArgs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Segmented page-tab pattern for full-width section navigation.
 */
export const Default: Story = {
  render: (args) => {
    const language = usePageTabLanguage();
    const { overviewLabel, servicesLabel, overviewContent, servicesContent } = args;

    return (
      <div className="w-full max-w-[900px]">
        <PageTab
          isCentered={args.isCentered}
          listAriaLabel="Services page tabs"
          items={[
            {
              id: 'overview',
              label: getLocalizedPageTabArgText('overviewLabel', overviewLabel, language),
              panel: getLocalizedPageTabArgText('overviewContent', overviewContent, language),
            },
            {
              id: 'services',
              label: getLocalizedPageTabArgText('servicesLabel', servicesLabel, language),
              panel: getLocalizedPageTabArgText('servicesContent', servicesContent, language),
            },
          ]}
        />
      </div>
    );
  },
};

/**
 * Page tabs with 3 items.
 */
export const ThreeItems: Story = {
  render: (args) => {
    const language = usePageTabLanguage();
    const {
      overviewLabel,
      servicesLabel,
      pricingLabel,
      overviewContent,
      servicesContent,
      pricingContent,
    } = args;

    return (
      <div className="w-full max-w-[900px]">
        <PageTab
          isCentered={args.isCentered}
          listAriaLabel="Information page tabs"
          items={[
            {
              id: 'overview',
              label: getLocalizedPageTabArgText('overviewLabel', overviewLabel, language),
              panel: getLocalizedPageTabArgText('overviewContent', overviewContent, language),
            },
            {
              id: 'services',
              label: getLocalizedPageTabArgText('servicesLabel', servicesLabel, language),
              panel: getLocalizedPageTabArgText('servicesContent', servicesContent, language),
            },
            {
              id: 'pricing',
              label: getLocalizedPageTabArgText('pricingLabel', pricingLabel, language),
              panel: getLocalizedPageTabArgText('pricingContent', pricingContent, language),
            },
          ]}
        />
      </div>
    );
  },
};
