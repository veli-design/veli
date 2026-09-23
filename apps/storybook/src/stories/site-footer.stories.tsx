import type { Meta, StoryObj } from '@storybook/react';
import { SiteFooter } from '@tradenetcorp/veli-blocks/site-footer';

const meta = {
  title: 'Blocks/Site footer',
  component: SiteFooter,
  parameters: { layout: 'fullscreen' },
  args: {
    startLabel: 'Service information',
    endLabel: 'Policies',
    startLinks: [
      { id: 'about', label: 'About', href: '#about' },
      { id: 'roadmap', label: 'Roadmap', href: '#roadmap' },
    ],
    endLinks: [
      { id: 'privacy', label: 'Privacy policy', href: '#privacy' },
      { id: 'terms', label: 'Terms of use', href: '#terms' },
    ],
  },
} satisfies Meta<typeof SiteFooter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const LongLabels: Story = {
  args: {
    startLinks: [
      {
        id: 'about',
        label:
          'Information about this public service and the organization responsible for delivering it',
        href: '#about',
      },
    ],
  },
};
export const EmptyGroups: Story = { args: { startLinks: [], endLinks: [] } };
