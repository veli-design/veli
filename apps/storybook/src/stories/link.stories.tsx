import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '@tradenetcorp/veli-ui/link';
import { ArrowRight, Plus, DownloadSimple } from 'phosphor-react';

const linkSizeExamples = [
  { className: 'type-caption-12-regular', label: 'Extra Small', size: 'sm' },
  { className: 'type-body-sm-regular', label: 'Small', size: 'sm' },
  { className: 'type-body-md-regular', label: 'Medium', size: 'md' },
  { className: 'type-body-lg-regular', label: 'Large', size: 'lg' },
  { className: 'type-subtitle-regular', label: 'Extra Large', size: 'lg' },
] as const;

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
      options: ['default', 'secondary'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
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
    variant: 'default',
    size: 'md',
    underline: 'hover',
    href: '#',
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The default link style, typically used for navigation and inline references.
 */
export const Default: Story = {
  args: {
    children: 'Default Link',
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

      <div className="text-sm font-medium">Default</div>
      <div className="flex justify-center">
        <Link variant="default" underline="none">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="default" underline="hover">
          Link
        </Link>
      </div>
      <div className="flex justify-center">
        <Link variant="default" underline="always">
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
          <ArrowRight weight="bold" />
        </Link>
      </div>
    </div>
  ),
};

/**
 * Demonstrates common icon placement patterns. Icons inherit their size from the link's `size` prop.
 */
export const WithIcons: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-16">
        <Link {...args}>
          <Plus weight="bold" />
          Leading Icon
        </Link>
        <Link {...args}>
          Trailing Icon
          <ArrowRight weight="bold" />
        </Link>
        <Link {...args}>
          <DownloadSimple weight="bold" />
          Both Icons
          <ArrowRight weight="bold" />
        </Link>
      </div>
    </div>
  ),
};

/**
 * The `size` prop sets default icon dimensions via `[&_svg]` classes.
 * Typography still inherits from the surrounding context.
 */
export const ComponentSizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6 type-body-md-regular">
      {(
        [
          { size: 'sm', label: 'Small', iconSize: 16 },
          { size: 'md', label: 'Medium', iconSize: 16 },
          { size: 'lg', label: 'Large', iconSize: 20 },
        ] as const
      ).map(({ size, label, iconSize }) => (
        <div key={size} className="flex items-center gap-6">
          <span className="w-20 text-text-default-muted">{label}</span>
          <Link {...args} size={size}>
            <Plus weight="bold" />
            {label} Link
            <ArrowRight weight="bold" />
          </Link>
          <span className="text-xs text-text-default-muted italic">{iconSize}px icons</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Links inherit typography from their surrounding context.
 * Icon sizes should match the parent typography scale.
 */
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      {linkSizeExamples.map(({ className, label, size }) => (
        <div key={label} className="flex items-center gap-6">
          <span className={`${className} w-28 text-text-default-muted`}>{label}</span>
          <span className={className}>
            <Link {...args} size={size}>
              <Plus weight="bold" />
              {label} Link
              <ArrowRight weight="bold" />
            </Link>
          </span>
          <span className="text-xs text-text-default-muted italic">{size} icons</span>
        </div>
      ))}
    </div>
  ),
};

/**
 * Links inherit typography when embedded inline within body copy.
 */
export const InheritedTypography: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <p className="type-caption-12-regular">
        Small text with an{' '}
        <Link {...args} size="sm">
          <Plus weight="bold" />
          inherited link
        </Link>
      </p>
      <p className="type-body-md-regular">
        Body text with an{' '}
        <Link {...args} size="md">
          inherited link
          <ArrowRight weight="bold" />
        </Link>
      </p>
      <p className="type-subtitle-regular">
        Large text with an{' '}
        <Link {...args} size="lg">
          <Plus weight="bold" />
          inherited link
        </Link>
      </p>
    </div>
  ),
};
