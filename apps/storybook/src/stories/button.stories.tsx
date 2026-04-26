import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@tradenetcorp/coral-ui/button";
import { Plus, ArrowRight, Trash, DownloadSimple } from "phosphor-react";

const iconSizeMap = {
  xl: 24,
  lg: 20,
  md: 16,
  sm: 16,
  xs: 12,
} as const;

function ButtonLabel({ size = "md" }: { size?: keyof typeof iconSizeMap }) {
  const iconSize = iconSizeMap[size];

  return (
    <>
      <Plus size={iconSize} weight="bold" />
      <span>Label</span>
      <ArrowRight size={iconSize} weight="bold" />
    </>
  );
}

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "danger"],
    },
    style: {
      control: "select",
      options: ["fill", "transparent", "ghost"],
    },
    size: {
      control: "select",
      options: ["xs", "sm", "md", "lg", "xl"],
    },
    isLoading: {
      control: "boolean",
    },
    treatment: {
      control: "select",
      options: ["basic", "seaglass"],
    },
    isDisabled: {
      control: "boolean",
    },
  },
  args: {
    children: "Button",
    variant: "primary",
    style: "fill",
    size: "md",
    treatment: "basic",
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default button style used for most actions.
 */
export const Primary: Story = {
  args: {
    children: "Primary Button",
  },
};

/**
 * A comprehensive view of all button variants and styles.
 * Useful for auditing visual consistency across the design system.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-x-12 gap-y-8 items-center">
      <div />
      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Fill
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Transparent
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Ghost
      </div>

      <div className="text-sm font-medium">Primary</div>
      <Button variant="primary" style="fill">
        Button
      </Button>
      <Button variant="primary" style="transparent">
        Button
      </Button>
      <Button variant="primary" style="ghost">
        Button
      </Button>

      <div className="text-sm font-medium">Secondary</div>
      <Button variant="secondary" style="fill">
        Button
      </Button>
      <Button variant="secondary" style="transparent">
        Button
      </Button>
      <Button variant="secondary" style="ghost">
        Button
      </Button>

      <div className="text-sm font-medium">Danger</div>
      <Button variant="danger" style="fill">
        Button
      </Button>
      <Button variant="danger" style="transparent">
        Button
      </Button>
      <Button variant="danger" style="ghost">
        Button
      </Button>
    </div>
  ),
};

/**
 * The seaglass treatment mapped onto the existing variant/style matrix.
 * Primary and secondary follow the dedicated Figma button set, while danger is a system-consistent extension behind the same treatment API.
 */
export const ExperimentalEnhanced: Story = {
  render: () => (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
            Figma XL Matrix
          </span>
          <span className="text-sm text-gray-500">
            Primary and secondary mirror the stylized Figma set at XL. Danger
            extends the same treatment for system consistency.
          </span>
        </div>
        <div className="grid grid-cols-4 gap-x-12 gap-y-8 items-center w-fit">
          <div />
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Fill
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Transparent
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Ghost
          </div>

          <div className="text-sm font-medium">Primary</div>
          <Button variant="primary" style="fill" size="xl" treatment="seaglass">
            <ButtonLabel size="xl" />
          </Button>
          <Button
            variant="primary"
            style="transparent"
            size="xl"
            treatment="seaglass"
          >
            <ButtonLabel size="xl" />
          </Button>
          <Button
            variant="primary"
            style="ghost"
            size="xl"
            treatment="seaglass"
          >
            <ButtonLabel size="xl" />
          </Button>

          <div className="text-sm font-medium">Secondary</div>
          <Button
            variant="secondary"
            style="fill"
            size="xl"
            treatment="seaglass"
          >
            <ButtonLabel size="xl" />
          </Button>
          <Button
            variant="secondary"
            style="transparent"
            size="xl"
            treatment="seaglass"
          >
            <ButtonLabel size="xl" />
          </Button>
          <Button
            variant="secondary"
            style="ghost"
            size="xl"
            treatment="seaglass"
          >
            <ButtonLabel size="xl" />
          </Button>

          <div className="text-sm font-medium">Danger</div>
          <Button variant="danger" style="fill" size="xl" treatment="seaglass">
            <ButtonLabel size="xl" />
          </Button>
          <Button
            variant="danger"
            style="transparent"
            size="xl"
            treatment="seaglass"
          >
            <ButtonLabel size="xl" />
          </Button>
          <Button variant="danger" style="ghost" size="xl" treatment="seaglass">
            <ButtonLabel size="xl" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          State Coverage
        </span>
        <div className="grid grid-cols-3 gap-8">
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Primary Default
            </span>
            <Button
              variant="primary"
              style="fill"
              size="xl"
              treatment="seaglass"
            >
              <ButtonLabel size="xl" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Primary Loading
            </span>
            <Button
              variant="primary"
              style="fill"
              size="xl"
              isLoading
              treatment="seaglass"
              aria-label="Primary loading button"
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Primary Disabled
            </span>
            <Button
              variant="primary"
              style="fill"
              size="xl"
              isDisabled
              treatment="seaglass"
            >
              <ButtonLabel size="xl" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Secondary Default
            </span>
            <Button
              variant="secondary"
              style="fill"
              size="xl"
              treatment="seaglass"
            >
              <ButtonLabel size="xl" />
            </Button>
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Secondary Loading
            </span>
            <Button
              variant="secondary"
              style="fill"
              size="xl"
              isLoading
              treatment="seaglass"
              aria-label="Secondary loading button"
            />
          </div>
          <div className="flex flex-col items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Secondary Disabled
            </span>
            <Button
              variant="secondary"
              style="fill"
              size="xl"
              isDisabled
              treatment="seaglass"
            >
              <ButtonLabel size="xl" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-gray-400">
          Size Adaptation
        </span>
        <div className="flex items-end gap-4 flex-wrap">
          <Button variant="primary" style="fill" size="xs" treatment="seaglass">
            <ButtonLabel size="xs" />
          </Button>
          <Button variant="primary" style="fill" size="sm" treatment="seaglass">
            <ButtonLabel size="sm" />
          </Button>
          <Button variant="primary" style="fill" size="md" treatment="seaglass">
            <ButtonLabel size="md" />
          </Button>
          <Button variant="primary" style="fill" size="lg" treatment="seaglass">
            <ButtonLabel size="lg" />
          </Button>
          <Button variant="primary" style="fill" size="xl" treatment="seaglass">
            <ButtonLabel size="xl" />
          </Button>
        </div>
      </div>
    </div>
  ),
};

/**
 * Demonstrates common icon placement patterns with correct Figma sizing:
 * XL: 24px, LG: 20px, MD/SM: 16px, XS: 12px.
 */
export const WithIcons: Story = {
  render: (args) => {
    const size = iconSizeMap[args.size as keyof typeof iconSizeMap] || 16;

    return (
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <Button {...args}>
            <Plus size={size} weight="bold" />
            Leading Icon
          </Button>
          <Button {...args}>
            Trailing Icon
            <ArrowRight size={size} weight="bold" />
          </Button>
          <Button {...args}>
            <DownloadSimple size={size} weight="bold" />
            Both Icons
            <ArrowRight size={size} weight="bold" />
          </Button>
        </div>
        <div className="text-xs text-gray-400 italic">
          Icon size for current {args.size} scale: {size}px
        </div>
      </div>
    );
  },
};

/**
 * All supported sizes shown side-by-side with correctly sized icons.
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-4 flex-wrap">
        <Button {...args} size="xl">
          <Plus size={24} weight="bold" /> XL Button
        </Button>
        <Button {...args} size="lg">
          <Plus size={20} weight="bold" /> LG Button
        </Button>
        <Button {...args} size="md">
          <Plus size={16} weight="bold" /> MD Button
        </Button>
        <Button {...args} size="sm">
          <Plus size={16} weight="bold" /> SM Button
        </Button>
        <Button {...args} size="xs">
          <Plus size={12} weight="bold" /> XS Button
        </Button>
      </div>
    </div>
  ),
};

/**
 * Displays a loading spinner while preserving the button's dimensions.
 */
export const Loading: Story = {
  args: {
    isLoading: true,
    children: "Saving changes...",
  },
};

/**
 * Standard disabled state. Prevents all user interaction.
 */
export const Disabled: Story = {
  args: {
    isDisabled: true,
    children: "Disabled Action",
  },
};
