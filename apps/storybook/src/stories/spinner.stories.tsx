import type { Meta, StoryObj } from '@storybook/react';
import { Button } from '@veli-design/react/button';
import { Spinner } from '@veli-design/react/spinner';

const meta = {
  title: 'Components/Spinner',
  component: Spinner,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: { variant: 'default', size: 'md' },
  argTypes: {
    variant: { control: 'select', options: ['default', 'button'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    className: { control: 'text' },
    'aria-label': { control: 'text' },
  },
} satisfies Meta<typeof Spinner>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Playground: Story = {};
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-8 rounded-2xl bg-surface-raised p-6">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" aria-label="Loading content" />
        <span className="type-caption-regular text-base-muted">General loading</span>
      </div>
      <div className="flex flex-col items-center gap-3">
        <Spinner variant="button" size="lg" aria-label="Saving" />
        <span className="type-caption-regular text-base-muted">Button animation</span>
      </div>
    </div>
  ),
};

export const PendingButton: Story = {
  render: () => (
    <Button isPending loadingIndicator={<Spinner variant="button" size="sm" aria-hidden="true" />}>
      Save changes
    </Button>
  ),
};
