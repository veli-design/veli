import type { Meta, StoryObj } from '@storybook/react';
import { ErrorPage } from '@tradenetcorp/veli-blocks/error-page';
import { PageNavigationFooter } from '@tradenetcorp/veli-blocks/page-navigation-footer';
import { ErrorPagePreview } from '@tradenetcorp/veli-blocks/examples/error-page-preview';
import { pageNavigationFooterContent } from '@tradenetcorp/veli-blocks/examples/page-navigation-footer-content';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';

const meta = {
  title: 'Blocks/Error page',
  component: ErrorPage,
  parameters: { layout: 'fullscreen' },
  argTypes: {
    kind: { control: 'select', options: ['404', '500', '503', '403', '401', 'offline'] },
    animation: { control: 'select', options: ['auto', 'static'] },
  },
  args: { kind: '404' },
  render: (args) => <ErrorPagePreview {...args} />,
} satisfies Meta<typeof ErrorPagePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const ServerError: Story = { args: { kind: '500' } };
export const Maintenance: Story = { args: { kind: '503' } };
export const Forbidden: Story = { args: { kind: '403' } };
export const SessionExpired: Story = { args: { kind: '401' } };
export const Offline: Story = { args: { kind: 'offline' } };
export const Static: Story = { args: { animation: 'static' } };
export const LongCopy: Story = {
  args: {
    title: 'This requested resource is currently unavailable to your organization',
    description:
      'This is an example of longer application-owned content that must wrap across narrow screens without clipping the recovery actions or report links.',
    report: {
      prompt: 'If you followed a link from a different service or organization,',
      action: {
        type: 'link',
        label: 'Contact the team responsible for this service',
        href: '#contact',
      },
    },
  },
};
export const PendingAction: Story = {
  args: {
    kind: '500',
    primaryAction: { type: 'button', label: 'Trying again…', isPending: true, onPress: () => {} },
  },
};
export const NoActions: Story = {
  args: { primaryAction: undefined, secondaryAction: undefined, report: undefined },
};
export const Composed: Story = {
  render: (args) => {
    const { language } = useVeliLanguage();
    const footer = pageNavigationFooterContent(language);
    return (
      <main>
        <ErrorPagePreview {...args} />
        <PageNavigationFooter
          {...footer}
          identity={{
            ...footer.identity,
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
      </main>
    );
  },
};
