import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '@tradenetcorp/veli-ui/link';
import { ArrowRight, Plus, DownloadSimple } from 'phosphor-react';

const meta = {
  title: 'Components/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'inverted'],
    },
    underline: {
      control: 'select',
      options: ['none', 'hover', 'always'],
    },
    isDisabled: {
      control: 'boolean',
    },
  },
  args: {
    children: 'Link Label',
    variant: 'primary',
    underline: 'hover',
    href: '#',
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default link style, typically used for navigation and inline references.
 */
export const Primary: Story = {
  args: {
    children: 'Primary Link',
  },
};

/**
 * A comprehensive view of all link variants and underlining options.
 * Useful for auditing visual consistency across the design system.
 */
export const AllVariants: Story = {
  render: () => (
    <div className="grid grid-cols-4 gap-x-12 gap-y-8 items-center">
      <div />
      <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted text-center">
        Plain
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted text-center">
        Hover Underline
      </div>
      <div className="text-xs font-bold uppercase tracking-wider text-text-default-muted text-center">
        Always Underline
      </div>

      <div className="text-sm font-medium">Primary</div>
      <div className="flex justify-center">
        <Link variant="primary" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="primary" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="primary" underline="always">
          Link
        </Link>
      </div>

      <div className="text-sm font-medium">Secondary</div>
      <div className="flex justify-center">
        <Link variant="secondary" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="secondary" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="secondary" underline="always">
          Link
        </Link>
      </div>

      <div className="text-sm font-medium bg-slate-100 p-2 rounded">Inverted</div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center bg-slate-900 p-2 rounded">
        <Link variant="inverted" underline="always">
          Link
        </Link>
      </div>
    </div>
  ),
};

/**
 * Demonstrates the interactive and non-interactive states of the Link component.
 * Uses forced state props to visually audit designs without manual interaction.
 */
export const StatesAudit: Story = {
  render: () => (
    <div className="flex items-center gap-16">
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
          Default
        </span>
        <Link href="#">Default Link</Link>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
          Hover
        </span>
        <Link href="#" isHovered={true}>
          Hover State
        </Link>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
          Pressed
        </span>
        <Link href="#" isPressed={true}>
          Pressed State
        </Link>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
          Disabled
        </span>
        <Link href="#" isDisabled={true}>
          Disabled Link
        </Link>
      </div>
      <div className="flex flex-col items-center gap-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-text-default-muted">
          Disabled Icon
        </span>
        <Link href="#" isDisabled={true}>
          Disabled
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  ),
};

/**
 * Demonstrates common icon placement patterns while the link inherits typography.
 */
export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-16">
        <Link {...args}>
          <Plus size={16} weight="bold" />
          Leading Icon
        </Link>
        <Link {...args}>
          Trailing Icon
          <ArrowRight size={16} weight="bold" />
        </Link>
        <Link {...args}>
          <DownloadSimple size={16} weight="bold" />
          Both Icons
          <ArrowRight size={16} weight="bold" />
        </Link>
      </div>
    </div>
  ),
};

/**
 * Links inherit typography from their surrounding context.
 */
export const InheritedTypography: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p className="type-caption-12-regular">
        Small text with an <Link {...args}>inherited link</Link>
      </p>
      <p className="type-body-md-regular">
        Body text with an <Link {...args}>inherited link</Link>
      </p>
      <p className="type-subtitle-regular">
        Large text with an <Link {...args}>inherited link</Link>
      </p>
    </div>
  ),
};
