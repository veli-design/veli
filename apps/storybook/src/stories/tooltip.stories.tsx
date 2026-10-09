import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
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
    small: 'Small',
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

type TooltipStoryArgs = ComponentProps<typeof Tooltip> & {
  /** Hover delay before the tooltip opens; passed to `TooltipTrigger`. */
  delay?: number;
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
    children: englishTooltipText.shortHelp,
  },
} satisfies Meta<TooltipStoryArgs>;

export default meta;
type Story = StoryObj<TooltipStoryArgs>;

export const Playground: Story = {
  render: (args) => {
    const { delay, children, ...tooltipProps } = args;
    const language = useTooltipLanguage();
    const text = localizedTooltipText[language];

    return (
      <div className="flex min-h-[280px] items-center justify-center bg-surface-base p-8">
        <TooltipTrigger delay={delay}>
          <Button intent="secondary">{text.triggerHoverFocus}</Button>
          <Tooltip {...tooltipProps}>
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
                    <Button intent="secondary" size="sm" className="w-full justify-center">
                      {placement}
                    </Button>
                    <Tooltip placement={placement} size="lg" tone="primary" shouldFlip={false}>
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
 * Size and tone variants: small for brief hints, large with primary or secondary surfaces for richer guidance.
 */
export const Variants: Story = {
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
