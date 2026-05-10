import type { Meta, StoryObj } from '@storybook/react';
import { Link } from '@tradenetcorp/coral-ui/link';
import { ArrowRight, Link as LinkIcon, Plus, DownloadSimple } from 'phosphor-react';

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
        size: {
            control: 'select',
            options: ['xs', 'sm', 'md', 'lg', 'xl'],
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
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Plain</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Hover Underline</div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400 text-center">Always Underline</div>

            <div className="text-sm font-medium">Primary</div>
            <div className="flex justify-center"><Link variant="primary" underline="none">Link</Link></div>
            <div className="flex justify-center"><Link variant="primary" underline="hover">Link</Link></div>
            <div className="flex justify-center"><Link variant="primary" underline="always">Link</Link></div>

            <div className="text-sm font-medium">Secondary</div>
            <div className="flex justify-center"><Link variant="secondary" underline="none">Link</Link></div>
            <div className="flex justify-center"><Link variant="secondary" underline="hover">Link</Link></div>
            <div className="flex justify-center"><Link variant="secondary" underline="always">Link</Link></div>

            <div className="text-sm font-medium bg-bg-surface-base p-2 rounded">Inverted</div>
            <div className="flex justify-center bg-bg-secondary-default p-2 rounded"><Link variant="inverted" underline="none">Link</Link></div>
            <div className="flex justify-center bg-bg-secondary-default p-2 rounded"><Link variant="inverted" underline="hover">Link</Link></div>
            <div className="flex justify-center bg-bg-secondary-default p-2 rounded"><Link variant="inverted" underline="always">Link</Link></div>
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
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Default</span>
                <Link href="#">Default Link</Link>
            </div>
            <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Hover</span>
                <Link href="#" isHovered={true}>Hover State</Link>
            </div>
            <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Pressed</span>
                <Link href="#" isPressed={true}>Pressed State</Link>
            </div>
            <div className="flex flex-col items-center gap-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Disabled</span>
                <Link href="#" isDisabled={true}>Disabled Link</Link>
            </div>
        </div>
    ),
};

/**
 * Demonstrates common icon placement patterns with correct Figma sizing:
 * - XL: 24px
 * - LG: 20px
 * - MD/SM: 16px
 * - XS: 12px
 */
export const WithIcons: Story = {
    render: (args) => {
        const iconSizeMap = {
            xl: 24,
            lg: 20,
            md: 16,
            sm: 16,
            xs: 12,
        } as const;

        const size = iconSizeMap[args.size as keyof typeof iconSizeMap] || 16;

        return (
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-8">
                    <Link {...args}>
                        <Plus size={size} weight="bold" />
                        Leading Icon
                    </Link>
                    <Link {...args}>
                        Trailing Icon
                        <ArrowRight size={size} weight="bold" />
                    </Link>
                    <Link {...args}>
                        <DownloadSimple size={size} weight="bold" />
                        Both Icons
                        <ArrowRight size={size} weight="bold" />
                    </Link>
                </div>
                <div className="text-xs text-gray-400 italic">
                    Icon size for current {args.size} scale: {size}px
                </div>
            </div>
        );
    },
};

/**
 * All supported sizes shown side-by-side with correctly sized icons matching Figma's specifications.
 */
export const Sizes: Story = {
    render: (args) => (
        <div className="flex flex-col gap-8">
            <div className="flex items-center gap-6 flex-wrap">
                <Link {...args} size="xl"><LinkIcon size={24} weight="bold" /> XL Link</Link>
                <Link {...args} size="lg"><LinkIcon size={20} weight="bold" /> LG Link</Link>
                <Link {...args} size="md"><LinkIcon size={16} weight="bold" /> MD Link</Link>
                <Link {...args} size="sm"><LinkIcon size={16} weight="bold" /> SM Link</Link>
                <Link {...args} size="xs"><LinkIcon size={12} weight="bold" /> XS Link</Link>
            </div>
        </div>
    ),
};
