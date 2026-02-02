import * as React from 'react';
import {
    Link as AriaLink,
    LinkProps as AriaLinkProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';

const linkVariants = cva(
    'inline-flex items-center justify-center font-sans font-medium antialiased transition-colors focus-visible:outline-none disabled:pointer-events-none',
    {
        variants: {
            variant: {
                primary: 'text-fg-text-links-default',
                secondary: 'text-fg-text-default-default',
                inverted: 'text-white',
            },
            size: {
                xs: 'text-[12px] gap-1',
                sm: 'text-[14px] gap-1',
                md: 'text-[16px] gap-1.5',
                lg: 'text-[18px] gap-2',
                xl: 'text-[20px] gap-2',
            },
            underline: {
                none: 'no-underline',
                hover: 'no-underline',
                always: 'underline',
            },
            isHovered: {
                true: '',
            },
            isPressed: {
                true: '',
            },
            isDisabled: {
                true: 'text-fg-text-disabled-disabled pointer-events-none',
            },
            isFocusVisible: {
                true: 'ring-fg-border-focus ring-offset-2 ring-2 rounded-sm',
            },
        },
        compoundVariants: [
            // Hover Underline
            {
                underline: 'hover',
                isHovered: true,
                className: 'underline',
            },
            // Primary States
            {
                variant: 'primary',
                isHovered: true,
                className: 'text-fg-text-links-hover',
            },
            {
                variant: 'primary',
                isPressed: true,
                className: 'text-fg-text-links-hover',
            },
            // Secondary States
            {
                variant: 'secondary',
                isHovered: true,
                className: 'text-fg-text-default-muted',
            },
            {
                variant: 'secondary',
                isPressed: true,
                className: 'text-fg-text-default-muted',
            },
            // Inverted States
            {
                variant: 'inverted',
                isHovered: true,
                className: 'text-white/80',
            },
            {
                variant: 'inverted',
                isDisabled: true,
                className: 'opacity-50 text-white',
            },
        ],
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            underline: 'hover',
        },
    }
);

export interface LinkProps
    extends Omit<AriaLinkProps, 'className' | 'style' | 'children' | 'isDisabled'>,
    VariantProps<typeof linkVariants> {
    children?: React.ReactNode;
}

/**
 * A link component that follows the Coral Design System standards.
 * Built on top of react-aria-components for maximum accessibility.
 */
export function Link({
    variant,
    size,
    underline,
    isHovered: forcedHover,
    isPressed: forcedPressed,
    isDisabled: forcedDisabled,
    isFocusVisible: forcedFocus,
    children,
    ...props
}: LinkProps) {
    return (
        <AriaLink
            {...props}
            isDisabled={forcedDisabled ?? undefined}
            className={(state) =>
                linkVariants({
                    variant,
                    size,
                    underline,
                    isHovered: forcedHover ?? state.isHovered,
                    isPressed: forcedPressed ?? state.isPressed,
                    isDisabled: forcedDisabled ?? state.isDisabled,
                    isFocusVisible: forcedFocus ?? state.isFocusVisible,
                })
            }
        >
            {children}
        </AriaLink>
    );
}
