import type { Meta, StoryObj } from '@storybook/react';
import type { ComponentProps } from 'react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { Tooltip, TooltipTrigger } from '@tradenetcorp/veli-ui/tooltip';

const TOOLTIP_PLACEMENTS = [
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
] as const;

const LG_TOOLTIP_TEXT =
  'A tooltip with a caret and a max width. A tool tip must not contain any interactive component with in the tooltip.';

const PLACEMENT_GROUPS = [
  { label: 'Top', placements: ['top', 'top left', 'top right', 'top start', 'top end'] as const },
  {
    label: 'Bottom',
    placements: ['bottom', 'bottom left', 'bottom right', 'bottom start', 'bottom end'] as const,
  },
  { label: 'Left', placements: ['left', 'left top', 'left bottom'] as const },
  { label: 'Right', placements: ['right', 'right top', 'right bottom'] as const },
  { label: 'Start', placements: ['start', 'start top', 'start bottom'] as const },
  { label: 'End', placements: ['end', 'end top', 'end bottom'] as const },
] as const;

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
      options: [...TOOLTIP_PLACEMENTS],
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
    size: {
      control: 'select',
      options: ['sm', 'lg'],
      description: 'Surface size. Large tooltips use the primary or secondary tone tokens.',
    },
    tone: {
      control: 'select',
      options: ['primary', 'secondary'],
      description: 'Color tone for large tooltips (`size="lg"`). Ignored when `size="sm"`.',
    },
    children: {
      control: 'text',
      description: 'Tooltip label (the component always uses a fixed 10px offset from the anchor).',
    },
  },
  args: {
    placement: 'top',
    shouldFlip: true,
    delay: 0,
    size: 'sm',
    tone: 'primary',
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
      <TooltipTrigger delay={0}>
        <Button aria-label="Copy to clipboard" variant="secondary" size="sm">
          ⧉
        </Button>
        <Tooltip>Copy</Tooltip>
      </TooltipTrigger>
      <TooltipTrigger delay={0}>
        <Button aria-label="Delete item" variant="secondary" size="sm">
          ✕
        </Button>
        <Tooltip>Delete</Tooltip>
      </TooltipTrigger>
    </div>
  ),
};

export const Placements: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => (
    <div className="mx-auto w-full max-w-5xl bg-bg-surface-base p-8">
      <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {PLACEMENT_GROUPS.map((group) => (
          <section key={group.label} className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
              {group.label}
            </h3>
            <div className="flex flex-col gap-3">
              {group.placements.map((placement) => (
                <TooltipTrigger key={placement} delay={0}>
                  <Button variant="secondary" size="sm" className="w-full justify-center">
                    {placement}
                  </Button>
                  <Tooltip placement={placement} size="lg" tone="primary" shouldFlip={false}>
                    {LG_TOOLTIP_TEXT}
                  </Tooltip>
                </TooltipTrigger>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  ),
};

/**
 * Size and tone variants: small for brief hints, large with primary or secondary surfaces for richer guidance.
 */
export const Variants: Story = {
  render: () => (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-10 bg-bg-surface-base p-8">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Small
        </span>
        <TooltipTrigger delay={0}>
          <Button variant="secondary">Hover me</Button>
          <Tooltip size="sm">Copy to clipboard</Tooltip>
        </TooltipTrigger>
      </div>
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Large — Primary
        </span>
        <TooltipTrigger delay={0}>
          <Button variant="secondary">Hover me</Button>
          <Tooltip size="lg" tone="primary">
            {LG_TOOLTIP_TEXT}
          </Tooltip>
        </TooltipTrigger>
      </div>
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs font-bold uppercase tracking-wider text-text-default-muted">
          Large — Secondary
        </span>
        <TooltipTrigger delay={0}>
          <Button variant="secondary">Hover me</Button>
          <Tooltip size="lg" tone="secondary">
            {LG_TOOLTIP_TEXT}
          </Tooltip>
        </TooltipTrigger>
      </div>
    </div>
  ),
};
