import type { Meta, StoryObj } from '@storybook/react';
import { SegmentedTabs } from '@tradenetcorp/veli-ui/tabs';

const meta = {
  title: 'Components/Tabs',
  component: SegmentedTabs,
  parameters: {
    layout: 'centered',
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
} satisfies Meta<typeof SegmentedTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default segmented/page-tab pattern.
 */
export const Default: Story = {
  render: (args) => (
    <div className="w-full max-w-[900px]">
      <SegmentedTabs
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
 * Segmented tabs with 3 items.
 */
export const ThreeItems: Story = {
  render: (args) => (
    <div className="w-full max-w-[900px]">
      <SegmentedTabs
        {...args}
        listAriaLabel="Information tabs"
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
