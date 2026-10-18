import type { Meta, StoryObj } from '@storybook/react';
import { PageNavigationFooter } from '@tradenetcorp/veli-blocks/page-navigation-footer';
import { pageNavigationFooterContent } from '@tradenetcorp/veli-blocks/examples/page-navigation-footer-content';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const meta = {
  title: 'Blocks/Page navigation footer',
  component: PageNavigationFooter,
  parameters: { layout: 'fullscreen' },
  args: { ...pageNavigationFooterContent('en') },
  render: (args) => {
    const { language } = useVeliLanguage();
    const content = pageNavigationFooterContent(language);
    return (
      <PageNavigationFooter
        {...args}
        {...content}
        identity={{
          ...content.identity,
          logo: (
            <img
              src="/blocks/example-organization-emblem.svg"
              alt=""
              width={61}
              height={70}
              className="object-contain"
            />
          ),
        }}
      />
    );
  },
} satisfies Meta<typeof PageNavigationFooter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const NoLogo: Story = {
  render: () => {
    const { language } = useVeliLanguage();
    return <PageNavigationFooter {...pageNavigationFooterContent(language)} />;
  },
};
export const Minimal: Story = {
  render: () => (
    <PageNavigationFooter label="Organization information" identity={{ name: 'Example service' }} />
  ),
};
export const Empty: Story = { render: () => <PageNavigationFooter label="Page navigation" /> };
export const LongLabels: Story = {
  render: () => {
    const { language } = useVeliLanguage();
    const content = pageNavigationFooterContent(language);
    return (
      <PageNavigationFooter
        {...content}
        identity={{ ...content.identity, name: content.identity.name.repeat(4) }}
        internalLinks={content.internalLinks.map((link) => ({
          ...link,
          label: link.label.repeat(5),
        }))}
        externalLinks={content.externalLinks.map((link) => ({
          ...link,
          label: link.label.repeat(5),
        }))}
      />
    );
  },
};
