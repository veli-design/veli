import type { Meta, StoryObj } from '@storybook/react';
import { expect, userEvent, within, waitFor } from '@storybook/test';
import { Kbd, KbdGroup } from '@tradenetcorp/veli-ui/kbd';
import { useEffect, useRef } from 'react';
import type { ComponentProps } from 'react';
import { useArgs } from 'storybook/internal/preview-api';
import { CopyIcon, TrashIcon } from '@phosphor-icons/react';
import { Button } from '@tradenetcorp/veli-ui/button';
import { useVeliLanguage } from '@tradenetcorp/veli-ui/provider';
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

const englishTooltipText = {
  shortHelp: 'Short help text for this action.',
  triggerHoverFocus: 'Hover or focus me',
  triggerHover: 'Hover me',
  copyAriaLabel: 'Copy to clipboard',
  deleteAriaLabel: 'Delete item',
  copy: 'Copy',
  delete: 'Delete',
  largeTooltip: LG_TOOLTIP_TEXT,
  groups: {
    top: 'Top',
    bottom: 'Bottom',
    left: 'Left',
    right: 'Right',
    start: 'Start',
    end: 'End',
  },
  variants: {
    small: 'Small — Neutral',
    largePrimary: 'Large — Primary',
    largeSecondary: 'Large — Secondary',
  },
} as const;

const dhivehiTooltipText = {
  shortHelp: 'މި އެކްޝަނާ ގުޅޭ ކުރު އެހީގެ ލިޔުން.',
  triggerHoverFocus: 'ހޯވަރ ނުވަތަ ފޯކަސް ކުރައްވާ',
  triggerHover: 'މީގެ މައްޗަށް ހޯވަރ ކުރައްވާ',
  copyAriaLabel: 'ކްލިޕްބޯޑަށް ކޮޕީކުރައްވާ',
  deleteAriaLabel: 'އައިޓަމް ފޮހެލައްވާ',
  copy: 'ކޮޕީ',
  delete: 'ފޮހެލާ',
  largeTooltip:
    'އެންމެ ފުޅާމިނެއް ކަނޑައެޅިފައިވާ ޓޫލްޓިޕެއް. ޓޫލްޓިޕެއްގެ އެތެރޭގައި އިންޓަރއެކްޓިވް އެއްވެސް ކޮމްޕޯނަންޓެއް ހިމެނިގެން ނުވާނެއެވެ.',
  groups: englishTooltipText.groups,
  variants: englishTooltipText.variants,
} as const;

const localizedTooltipText = {
  en: englishTooltipText,
  dv: dhivehiTooltipText,
} as const;

type TooltipLanguage = keyof typeof localizedTooltipText;
type TooltipArgTextKey = 'children';

const tooltipArgText = {
  children: {
    en: englishTooltipText.shortHelp,
    dv: dhivehiTooltipText.shortHelp,
  },
} as const;

const tooltipArgTextKeys = Object.keys(tooltipArgText) as TooltipArgTextKey[];

const useTooltipLanguage = (): TooltipLanguage => {
  const { direction } = useVeliLanguage();

  return direction === 'rtl' ? 'dv' : 'en';
};

const useTooltipText = () => {
  const language = useTooltipLanguage();

  return localizedTooltipText[language];
};

const getLocalizedTooltipArgText = (
  key: TooltipArgTextKey,
  value: unknown,
  language: TooltipLanguage,
) => {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return tooltipArgText[key][language];
  }

  const localizedValues: readonly string[] = Object.values(tooltipArgText[key]);

  if (localizedValues.includes(value)) {
    return tooltipArgText[key][language];
  }

  return value;
};

const PLACEMENT_GROUPS = [
  {
    labelKey: 'top',
    placements: ['top', 'top left', 'top right', 'top start', 'top end'] as const,
  },
  {
    labelKey: 'bottom',
    placements: ['bottom', 'bottom left', 'bottom right', 'bottom start', 'bottom end'] as const,
  },
  { labelKey: 'left', placements: ['left', 'left top', 'left bottom'] as const },
  { labelKey: 'right', placements: ['right', 'right top', 'right bottom'] as const },
  { labelKey: 'start', placements: ['start', 'start top', 'start bottom'] as const },
  { labelKey: 'end', placements: ['end', 'end top', 'end bottom'] as const },
] as const;

type TooltipStoryArgs = Omit<ComponentProps<typeof Tooltip>, 'size' | 'tone'> & {
  size?: 'sm' | 'lg';
  tone?: 'primary' | 'secondary';
  /** Hover delay before the tooltip opens; passed to `TooltipTrigger`. */
  delay?: number;
  closeDelay?: number;
  trigger?: 'focus';
  isDisabled?: boolean;
};

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [
    (Story, context) => {
      const language: TooltipLanguage = context.globals.language === 'dv' ? 'dv' : 'en';
      const [args, updateArgs] = useArgs();
      const { children } = args;

      useEffect(() => {
        const nextArgs: Partial<Record<TooltipArgTextKey, string>> = {};
        const currentArgs = { children };

        tooltipArgTextKeys.forEach((key) => {
          const localizedValue = getLocalizedTooltipArgText(key, currentArgs[key], language);

          if (currentArgs[key] !== localizedValue) {
            nextArgs[key] = localizedValue;
          }
        });

        if (Object.keys(nextArgs).length > 0) {
          updateArgs?.(nextArgs);
        }
      }, [children, language, updateArgs]);

      return <Story />;
    },
  ],
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
    className: { control: false, table: { category: 'Composition' } },
    style: { control: false, table: { category: 'Composition' } },
    ref: { control: false, table: { category: 'Composition' } },
    lang: { control: 'text', table: { category: 'Localization' } },
    dir: { control: 'select', options: ['ltr', 'rtl'], table: { category: 'Localization' } },
    closeDelay: { control: { type: 'number', min: 0 }, table: { category: 'Trigger' } },
    isDisabled: { control: 'boolean', table: { category: 'Trigger' } },
    trigger: { control: 'select', options: [undefined, 'focus'], table: { category: 'Trigger' } },
    offset: {
      control: 'number',
      description: 'Distance from the trigger (8px small, 12px large by default).',
    },
    crossOffset: { control: 'number' },
    arrowBoundaryOffset: {
      control: 'number',
      description: 'Minimum large-arrow inset from a tooltip edge (20px).',
    },
    containerPadding: { control: 'number' },
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
      description:
        'Surface size. Small uses neutral colors; large uses primary or secondary tone tokens.',
    },
    tone: {
      if: { arg: 'size', eq: 'lg' },
      control: 'select',
      options: ['primary', 'secondary'],
      description:
        'Primary or secondary color tone for large tooltips. Small tooltips stay neutral.',
    },
    children: {
      control: 'text',
      description:
        'Brief non-interactive help. Small tooltips have no arrow; large tooltips include one.',
    },
  },
  args: {
    placement: 'top',
    shouldFlip: true,
    delay: 0,
    closeDelay: 0,
    isDisabled: false,
    size: 'sm',
    children: englishTooltipText.shortHelp,
  },
} satisfies Meta<TooltipStoryArgs>;

export default meta;
type Story = StoryObj<TooltipStoryArgs>;

export const Playground: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole('button');
    const user = userEvent.setup();
    trigger.blur();
    await user.tab();
    if (args.isDisabled) {
      await expect(within(document.body).queryByRole('tooltip')).not.toBeInTheDocument();
      return;
    }
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeInTheDocument());
    const tooltip = within(document.body).getByRole('tooltip');
    await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
    await expect(tooltip.querySelector('svg') !== null).toBe(args.size === 'lg');
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(within(document.body).queryByRole('tooltip')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
  render: (args) => {
    const { delay, closeDelay, trigger, isDisabled, children, size, tone, ...tooltipProps } = args;
    const variantProps = size === 'lg' ? ({ size, tone } as const) : ({ size: 'sm' } as const);
    const language = useTooltipLanguage();
    const text = localizedTooltipText[language];

    return (
      <div className="flex min-h-[280px] items-center justify-center bg-surface-base p-8">
        <TooltipTrigger
          delay={delay}
          closeDelay={closeDelay}
          trigger={trigger}
          isDisabled={isDisabled}
        >
          <Button intent="secondary">{text.triggerHoverFocus}</Button>
          <Tooltip {...tooltipProps} {...variantProps}>
            {getLocalizedTooltipArgText('children', children, language)}
          </Tooltip>
        </TooltipTrigger>
      </div>
    );
  },
};

export const IconButtons: Story = {
  name: 'Icon buttons',
  render: () => {
    const text = useTooltipText();

    return (
      <div className="flex min-h-[280px] items-center justify-center gap-4 bg-surface-base p-8">
        <TooltipTrigger delay={0}>
          <Button aria-label={text.copyAriaLabel} intent="secondary" size="sm" iconOnly={true}>
            <CopyIcon size={16} weight="bold" />
          </Button>
          <Tooltip>{text.copy}</Tooltip>
        </TooltipTrigger>
        <TooltipTrigger delay={0}>
          <Button aria-label={text.deleteAriaLabel} intent="secondary" size="sm" iconOnly={true}>
            <TrashIcon size={16} weight="bold" />
          </Button>
          <Tooltip>{text.delete}</Tooltip>
        </TooltipTrigger>
      </div>
    );
  },
};

export const Placements: Story = {
  parameters: {
    layout: 'padded',
  },
  render: () => {
    const text = useTooltipText();

    return (
      <div className="mx-auto w-full max-w-5xl bg-surface-base p-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {PLACEMENT_GROUPS.map((group) => (
            <section key={group.labelKey} className="flex flex-col gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-base-muted">
                {text.groups[group.labelKey]}
              </h3>
              <div className="flex flex-col gap-3">
                {group.placements.map((placement) => (
                  <TooltipTrigger key={placement} delay={0}>
                    <Button intent="secondary" size="sm" className="w-full">
                      {placement}
                    </Button>
                    <Tooltip placement={placement} size="lg" tone="primary">
                      {text.largeTooltip}
                    </Tooltip>
                  </TooltipTrigger>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    );
  },
};

/**
 * One neutral small surface and primary/secondary large surfaces.
 */
export const Variants: Story = {
  play: async ({ canvasElement }) => {
    const triggers = within(canvasElement).getAllByRole('button');
    const user = userEvent.setup();
    await expect(triggers).toHaveLength(3);
    const colors = [
      ['tooltip-bg-small', 'text-base-emphasis'],
      ['tooltip-bg-large-primary', 'tooltip-text-on-primary'],
      ['tooltip-bg-large-secondary', 'tooltip-text-on-secondary'],
    ];

    triggers.forEach((trigger) => trigger.blur());
    for (const [index, trigger] of triggers.entries()) {
      await user.tab();
      await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeVisible());
      const tooltip = within(document.body).getByRole('tooltip');
      const [background, foreground] = colors[index];
      // Resolve the theme's tokens in the portal's own scope before comparing colors.
      const probe = document.createElement('span');
      probe.style.backgroundColor = `var(--veli-color-${background})`;
      probe.style.color = `var(--veli-color-${foreground})`;
      tooltip.append(probe);
      try {
        await expect(getComputedStyle(tooltip).backgroundColor).toBe(
          getComputedStyle(probe).backgroundColor,
        );
        await expect(getComputedStyle(tooltip).color).toBe(getComputedStyle(probe).color);
        const arrow = tooltip.querySelector('svg');
        await expect(arrow !== null).toBe(index >= 1);
        if (arrow) {
          await expect(getComputedStyle(arrow).fill).toBe(
            getComputedStyle(tooltip).backgroundColor,
          );
        }
        await expect(trigger).toHaveAttribute('aria-describedby', tooltip.id);
      } finally {
        probe.remove();
      }
      await user.keyboard('{Escape}');
      await waitFor(() =>
        expect(within(document.body).queryByRole('tooltip')).not.toBeInTheDocument(),
      );
    }
  },
  render: () => {
    const text = useTooltipText();

    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-10 bg-surface-base p-8">
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.variants.small}
          </span>
          <TooltipTrigger delay={0}>
            <Button intent="secondary">{text.triggerHover}</Button>
            <Tooltip size="sm">{text.copyAriaLabel}</Tooltip>
          </TooltipTrigger>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.variants.largePrimary}
          </span>
          <TooltipTrigger delay={0}>
            <Button intent="secondary">{text.triggerHover}</Button>
            <Tooltip size="lg" tone="primary">
              {text.largeTooltip}
            </Tooltip>
          </TooltipTrigger>
        </div>
        <div className="flex flex-col items-center gap-4">
          <span className="text-xs font-bold uppercase tracking-wider text-base-muted">
            {text.variants.largeSecondary}
          </span>
          <TooltipTrigger delay={0}>
            <Button intent="secondary">{text.triggerHover}</Button>
            <Tooltip size="lg" tone="secondary">
              {text.largeTooltip}
            </Tooltip>
          </TooltipTrigger>
        </div>
      </div>
    );
  },
};

export const Shortcuts: Story = {
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole('button').blur();
    await userEvent.tab();
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeInTheDocument());
    const tooltip = within(document.body).getByRole('tooltip');
    const [label, shortcut] = Array.from(tooltip.children);
    const labelBounds = label.getBoundingClientRect();
    const shortcutBounds = shortcut.getBoundingClientRect();
    const gap = Math.min(
      Math.abs(shortcutBounds.left - labelBounds.right),
      Math.abs(labelBounds.left - shortcutBounds.right),
    );
    await expect(gap).toBeCloseTo(8, 0);
    await userEvent.keyboard('{Escape}');
  },
  render: () => {
    const text = useTooltipText();
    return (
      <TooltipTrigger delay={0}>
        <Button intent="secondary">{text.copy}</Button>
        <Tooltip className="flex items-center gap-2">
          <span>{text.copy}</span>
          <KbdGroup>
            <Kbd>⌘</Kbd>
            <Kbd>C</Kbd>
          </KbdGroup>
        </Tooltip>
      </TooltipTrigger>
    );
  },
};

/** Inline emphasis and punctuation keep normal text flow. */
export const InlineContent: Story = {
  render: () => {
    const text = useTooltipText();
    return (
      <TooltipTrigger delay={0} closeDelay={0}>
        <Button intent="secondary">{text.copy}</Button>
        <Tooltip>
          <span>{text.copy}</span>
          <strong>.</strong>
        </Tooltip>
      </TooltipTrigger>
    );
  },
  play: async ({ canvasElement }) => {
    within(canvasElement).getByRole('button').blur();
    await userEvent.tab();
    await waitFor(() => expect(within(document.body).getByRole('tooltip')).toBeInTheDocument());
    const tooltip = within(document.body).getByRole('tooltip');
    const [label, punctuation] = Array.from(tooltip.children);
    const labelBounds = label.getBoundingClientRect();
    const punctuationBounds = punctuation.getBoundingClientRect();
    const gap = Math.min(
      Math.abs(punctuationBounds.left - labelBounds.right),
      Math.abs(labelBounds.left - punctuationBounds.right),
    );
    await expect(gap).toBeLessThan(1);
    await userEvent.keyboard('{Escape}');
  },
};

export const Offset: Story = {
  render: () => (
    <div className="flex min-h-72 items-center justify-center gap-8">
      {[0, 32].map((offset) => (
        <TooltipTrigger key={offset} delay={0} closeDelay={0}>
          <Button intent="secondary">{offset}px</Button>
          <Tooltip placement="bottom" shouldFlip={false} offset={offset}>
            {offset}px gap
          </Tooltip>
        </TooltipTrigger>
      ))}
    </div>
  ),
  play: async ({ canvasElement }) => {
    const triggers = within(canvasElement).getAllByRole('button');
    const gaps: number[] = [];
    const user = userEvent.setup();
    for (const [index, trigger] of triggers.entries()) {
      await user.tab();
      await waitFor(() => {
        const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]:not([data-exiting])');
        expect(tooltip).toHaveTextContent(`${index === 0 ? 0 : 32}px gap`);
        expect(getComputedStyle(tooltip!).opacity).toBe('1');
      });
      const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]:not([data-exiting])')!;
      gaps.push(tooltip.getBoundingClientRect().top - trigger.getBoundingClientRect().bottom);
    }
    await expect(Math.abs(gaps[1] - gaps[0] - 32)).toBeLessThan(1);
    await user.keyboard('{Escape}');
  },
};

/** Forwarded surface props and initial open state without restyling the component. */
export const Composition: Story = {
  render: () => {
    const ref = useRef<HTMLDivElement>(null);
    const text = useTooltipText();
    return (
      <TooltipTrigger defaultOpen delay={0} closeDelay={0}>
        <Button intent="secondary">{text.triggerHoverFocus}</Button>
        <Tooltip
          ref={ref}
          size="lg"
          placement="bottom start"
          crossOffset={4}
          containerPadding={16}
          arrowBoundaryOffset={24}
          shouldFlip
          className={({ placement }) => `tooltip-composition-${placement}`}
          style={() => ({ textAlign: 'start' })}
        >
          {text.largeTooltip}
        </Tooltip>
      </TooltipTrigger>
    );
  },
  play: async () => {
    await waitFor(() =>
      expect(document.querySelector('[role="tooltip"]')).toHaveAttribute('role', 'tooltip'),
    );
    await expect(document.querySelector('[role="tooltip"]')?.className).toContain(
      'tooltip-composition-',
    );
  },
};
