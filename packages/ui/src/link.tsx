'use client';

import * as React from 'react';
import { Link as AriaLink, LinkProps as AriaLinkProps } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const linkVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: '',
        secondary: '',
      },
      size: {
        sm: '[&_svg]:size-4',
        md: '[&_svg]:size-4',
        lg: '[&_svg]:size-5',
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
        false: '',
        true: 'pointer-events-none text-text-disabled-disabled [&_svg]:text-icon-disabled-disabled',
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
      // Default States
      {
        variant: 'default',
        isDisabled: false,
        className: 'text-text-links-default',
      },
      {
        variant: 'default',
        isHovered: true,
        className: 'text-text-links-hover',
      },
      {
        variant: 'default',
        isPressed: true,
        className: 'text-text-links-hover',
      },
      // Secondary States
      {
        variant: 'secondary',
        isDisabled: false,
        className: 'text-text-default-default',
      },
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
    ],
    defaultVariants: {
      variant: 'default',
      size: 'md',
      underline: 'none',
    },
  },
);

export interface LinkProps
  extends
    Omit<AriaLinkProps, 'className' | 'style' | 'children' | 'isDisabled'>,
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
      className={(state) => {
        const isDisabled = forcedDisabled ?? state.isDisabled;

        return twMerge(
          linkVariants({
            variant,
            size,
            underline,
            isHovered: isDisabled ? false : (forcedHover ?? state.isHovered),
            isPressed: isDisabled ? false : (forcedPressed ?? state.isPressed),
            isDisabled,
            isFocusVisible: forcedFocus ?? state.isFocusVisible,
          }),
        );
      }}
    >
      {children}
    </AriaLink>
  );
}
