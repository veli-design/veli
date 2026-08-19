'use client';

import * as React from 'react';
import { Link as AriaLink, LinkProps as AriaLinkProps } from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const linkVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium transition-colors duration-normal ease-out focus-visible:outline-none disabled:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      intent: {
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
        true: 'pointer-events-none text-disabled [&_svg]:text-icon-disabled',
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
        intent: 'default',
        isDisabled: false,
        className: 'text-links',
      },
      {
        intent: 'default',
        isHovered: true,
        className: 'text-links-hover',
      },
      {
        intent: 'default',
        isPressed: true,
        className: 'text-links-hover',
      },
      // Secondary States
      {
        intent: 'secondary',
        isDisabled: false,
        className: 'text-base-default',
      },
      {
        intent: 'secondary',
        isHovered: true,
        className: 'text-base-muted',
      },
      {
        intent: 'secondary',
        isPressed: true,
        className: 'text-base-muted',
      },
    ],
    defaultVariants: {
      intent: 'default',
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

function splitLinkProps({
  intent,
  size,
  underline,
  isHovered: forcedHover,
  isPressed: forcedPressed,
  isDisabled: forcedDisabled,
  isFocusVisible: forcedFocus,
  children,
  ...ariaLinkProps
}: LinkProps) {
  return {
    ariaLinkProps,
    children,
    forcedDisabled,
    variantProps: {
      intent,
      size,
      underline,
      forcedHover,
      forcedPressed,
      forcedFocus,
    },
  };
}

/**
 * A link component that follows the Veli Design System standards.
 * Built on top of react-aria-components for maximum accessibility.
 */
export function Link(props: LinkProps) {
  const { ariaLinkProps, children, forcedDisabled, variantProps } = splitLinkProps(props);

  return (
    <AriaLink
      {...ariaLinkProps}
      isDisabled={forcedDisabled ?? undefined}
      className={(state) => {
        const isDisabled = forcedDisabled ?? state.isDisabled;

        return twMerge(
          linkVariants({
            intent: variantProps.intent,
            size: variantProps.size,
            underline: variantProps.underline,
            isHovered: isDisabled ? false : (variantProps.forcedHover ?? state.isHovered),
            isPressed: isDisabled ? false : (variantProps.forcedPressed ?? state.isPressed),
            isDisabled,
            isFocusVisible: variantProps.forcedFocus ?? state.isFocusVisible,
          }),
        );
      }}
    >
      {children}
    </AriaLink>
  );
}
