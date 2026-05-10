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
                primary: 'text-text-links-default',
                secondary: 'text-text-default-default',
                inverted: 'text-text-default-inverted',
            },
            size: {
                xs: 'type-caption-12-medium gap-[8px]',
                sm: 'type-body-sm-medium gap-[8px]',
                md: 'type-body-md-medium gap-[8px]',
                lg: 'type-body-lg-medium gap-[8px]',
                xl: 'type-subtitle-medium gap-[8px]',
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
                true: 'text-text-disabled-disabled pointer-events-none',
            },
            isFocusVisible: {
                true: 'ring-border-focus ring-offset-2 ring-2 rounded-sm',
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
                className: 'text-text-links-hover',
            },
            {
                variant: 'primary',
                isPressed: true,
                className: 'text-text-links-hover',
            },
            // Secondary States
            {
                variant: 'secondary',
                isHovered: true,
                className: 'text-text-default-muted',
            },
            {
                variant: 'secondary',
                isPressed: true,
                className: 'text-text-default-muted',
            },
            // Inverted States
            {
                variant: 'inverted',
                isHovered: true,
                className: 'text-text-default-inverted/80',
            },
            {
                variant: 'inverted',
                isDisabled: true,
                className: 'opacity-50 text-text-default-inverted',
            },
        ],
        defaultVariants: {
            variant: 'primary',
            size: 'md',
            underline: 'none',
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
