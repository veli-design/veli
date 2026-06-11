import type { Meta, StoryObj } from '@storybook/react';
import { PageTab } from '@tradenetcorp/veli-ui/page-tab';

const meta = {
  title: 'Components/PageTab',
  component: PageTab,
  decorators: [
    (Story) => (
      <div className="w-full bg-white px-8 py-6 dark:bg-bg-surface-base">
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'centered',
    backgrounds: {
      disable: true,
    },
  },
  tags: ['autodocs'],
  args: {
    isCentered: true,
  },
  argTypes: {
    isCentered: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof PageTab>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Segmented page-tab pattern for full-width section navigation.
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-[900px]">
      <PageTab
        {...args}
        listAriaLabel="Services page tabs"
        items={[
          {
            id: 'overview',
            label: 'Overview',
            panel: 'Overview section content.',
          },
          {
            id: 'services',
            label: 'Services',
            panel: 'Services section content.',
          },
        ]}
      />
    </div>
  ),
};

/**
 * Page tabs with 3 items.
 */
export const ThreeItems: Story = {
  render: (args) => (
    <div className="w-full max-w-[900px]">
      <PageTab
        {...args}
        listAriaLabel="Information page tabs"
        items={[
          {
            id: 'overview',
            label: 'Overview',
            panel: 'Overview section content.',
          },
          {
            id: 'services',
            label: 'Services',
            panel: 'Services section content.',
          },
          {
            id: 'pricing',
            label: 'Pricing',
            panel: 'Pricing section content.',
          },
        ]}
      />
    </div>
  ),
};
