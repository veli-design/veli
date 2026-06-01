import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';

type TooltipStoryArgs = ComponentProps<typeof Tooltip> & {
  /** Hover delay before the tooltip opens; passed to `TooltipTrigger`. */
  delay?: number;
};

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Brief contextual hint anchored to a control, styled with Veli tokens and exposed through the Veli UI API. Wrap a trigger and this `Tooltip` in `TooltipTrigger` so hover and keyboard focus show the overlay with correct timing and accessibility.',
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
      description:
        'Whether the element should flip its orientation (e.g. top to bottom or left to right) when there is insufficient room for it to render completely.',
    },
    delay: {
      control: { type: 'number', min: 0, max: 3000, step: 50 },
      description:
        'Milliseconds to wait before showing the tooltip on hover (`TooltipTrigger`). Focus via keyboard typically opens without this delay.',
    },
    children: {
      control: 'text',
      description: 'Tooltip label (the component always uses a fixed 10px offset from the anchor).',
    },
  },
  args: {
    placement: 'top',
    shouldFlip: true,
    delay: 500,
    children: 'Short help text for this action.',
  },
} satisfies Meta<TooltipStoryArgs>;

export default meta;
type Story = StoryObj<TooltipStoryArgs>;

export const Playground: Story = {
  render: (args) => {
    const { delay, children, ...tooltipProps } = args;
    return (
      <div className="flex min-h-[280px] items-center justify-center bg-bg-surface-base p-8">
        <TooltipTrigger delay={delay}>
          <Button variant="secondary">Hover or focus me</Button>
          <Tooltip {...tooltipProps}>{children}</Tooltip>
        </TooltipTrigger>
      </div>
    );
  },
};

export const IconButtons: Story = {
  name: 'Icon buttons',
  render: () => (
    <div className="flex min-h-[280px] items-center justify-center gap-4 bg-bg-surface-base p-8">
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
      <div className="flex min-h-[380px] items-center justify-center bg-bg-surface-base p-8">
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
