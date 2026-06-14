import type { Meta, StoryObj } from '@storybook/react';
import { Divider } from '@tradenetcorp/veli-ui/divider';

const dividerVariants = ['subtle', 'muted', 'strong', 'emphasis'] as const;

const storyPanelClassName =
  'w-80 rounded-2xl border border-border-default-subtle bg-bg-surface-raised p-4';

const meta = {
  title: 'Components/Divider',
  component: Divider,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  args: {
    orientation: 'horizontal',
    appearance: 'subtle',
    text: 'Or continue with',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
    appearance: {
      control: 'select',
      options: dividerVariants,
    },
    text: {
      control: 'text',
    },
  },
} satisfies Meta<typeof Divider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className={storyPanelClassName}>
      <Divider {...args} />
    </div>
  ),
};

export const Default: Story = {
  args: {
    text: undefined,
  },
  render: (args) => (
    <div className={storyPanelClassName}>
      <div className="space-y-3">
        <p className="type-body-sm-medium text-text-default-emphasis">Permit information</p>
        <Divider {...args} />
        <p className="type-body-sm-regular text-text-default-default">
          Use horizontal dividers to separate related content blocks without introducing extra
          hierarchy.
        </p>
      </div>
    </div>
  ),
};

export const WithText: Story = {
  args: {
    text: 'Or continue with',
    appearance: 'subtle',
  },
  render: (args) => (
    <div className={storyPanelClassName}>
      <Divider {...args} />
    </div>
  ),
};

export const TextVariants: Story = {
  render: () => (
    <div className={`${storyPanelClassName} space-y-4`}>
      {dividerVariants.map((appearance) => (
        <Divider key={appearance} appearance={appearance} text="text" />
      ))}
    </div>
  ),
};

export const LineVariants: Story = {
  render: () => (
    <div className={`${storyPanelClassName} space-y-4`}>
      {dividerVariants.map((appearance) => (
        <div key={appearance} className="space-y-2">
          <p className="type-caption-12-medium text-text-default-muted capitalize">{appearance}</p>
          <Divider appearance={appearance} />
        </div>
      ))}
    </div>
  ),
};

export const Orientations: Story = {
  render: () => (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className={storyPanelClassName}>
        <div className="space-y-3">
          <p className="type-body-sm-medium text-text-default-emphasis">Horizontal</p>
          <div className="space-y-2.5 type-body-sm-regular text-text-default-default">
            <p>Section one</p>
            <Divider />
            <p>Section two</p>
            <Divider appearance="emphasis" text="Or" />
            <p>Section three</p>
          </div>
        </div>
      </div>

      <div className={storyPanelClassName}>
        <div className="space-y-3">
          <p className="type-body-sm-medium text-text-default-emphasis">Vertical</p>
          <div className="flex items-center justify-between text-text-default-default">
            <span>Summary</span>
            <Divider orientation="vertical" />
            <span>Documents</span>
            <Divider orientation="vertical" appearance="emphasis" />
            <span>Status</span>
          </div>
        </div>
      </div>
    </div>
  ),
};
