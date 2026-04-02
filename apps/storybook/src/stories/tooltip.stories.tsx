import type { Meta, StoryObj } from '@storybook/react';
import { TooltipTrigger } from 'react-aria-components';
import { Button } from '@tradenetcorp/coral-ui/button';
import { Tooltip } from '@tradenetcorp/coral-ui/tooltip';

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Brief contextual hint anchored to a control, built with `react-aria-components` and Coral styling. Wrap a trigger and this `Tooltip` in `TooltipTrigger` so hover and keyboard focus show the overlay with correct timing and accessibility.',
      },
    },
  },
  argTypes: {
    placement: {
      control: 'select',
      options: [
        'bottom',
        'bottom left',
        'bottom right',
        'bottom start',
        'bottom end',
        'top',
        'top left',
        'top right',
        'top start',
        'top end',
        'left',
        'left top',
        'left bottom',
        'start',
        'start top',
        'start bottom',
        'right',
        'right top',
        'right bottom',
        'end',
        'end top',
        'end bottom',
      ],
    },
    shouldFlip: {
      control: 'boolean',
    },
    children: {
      control: 'text',
      description: 'Tooltip label (the component always uses a fixed 10px offset from the anchor).',
    },
  },
  args: {
    placement: 'top',
    shouldFlip: true,
    children: 'Short help text for this action.',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args) => (
    <div className="flex min-h-[280px] items-center justify-center bg-bg-surface-surface-bg p-8">
      <TooltipTrigger>
        <Button variant="secondary">Hover or focus me</Button>
        <Tooltip {...args}>{args.children}</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

export const IconButtons: Story = {
  name: 'Icon buttons',
  render: () => (
    <div className="flex min-h-[280px] items-center justify-center gap-4 bg-bg-surface-surface-bg p-8">
      <TooltipTrigger>
        <Button aria-label="Copy to clipboard" variant="secondary" size="sm">
          ⧉
        </Button>
        <Tooltip>Copy</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger>
        <Button aria-label="Delete item" variant="secondary" size="sm">
          ✕
        </Button>
        <Tooltip>Delete</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

export const Placements: Story = {
  render: () => {
    const placements = ['top', 'bottom', 'left', 'right'] as const;

    return (
      <div className="flex min-h-[380px] items-center justify-center bg-bg-surface-surface-bg p-8">
        <div className="grid grid-cols-2 gap-12 sm:grid-cols-4">
          {placements.map((placement) => (
            <TooltipTrigger key={placement}>
              <Button variant="secondary" size="sm">
                {placement}
              </Button>
              <Tooltip placement={placement}>
                Tooltip on <strong>{placement}</strong>
              </Tooltip>
            </TooltipTrigger>
          ))}
        </div>
      </div>
    );
  },
};
