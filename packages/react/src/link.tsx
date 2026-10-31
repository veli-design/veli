'use client';

import { Link as AriaLink, LinkProps as AriaLinkProps } from 'react-aria-components';
import type { AriaAttributes, ComponentProps } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const linkVariants = cva(
  'inline max-w-full rounded-md box-decoration-clone [overflow-wrap:anywhere] [&:has(svg)]:inline-flex items-center gap-2 [&>*]:min-w-0 transition-colors duration-normal ease-out motion-reduce:transition-none outline-none [&_svg]:shrink-0 [&_svg]:size-4',
  {
    variants: {
      intent: {
        default: '',
        secondary: '',
      },
      size: {
        sm: 'type-body-sm-medium',
        md: 'type-body-md-medium',
        lg: 'type-body-lg-medium [&_svg]:size-5',
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
        true: 'inset-ring-2 inset-ring-border-focus forced-colors:outline-2 forced-colors:outline-solid forced-colors:outline-offset-2 forced-colors:outline-[Highlight]',
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
      underline: 'none',
    },
  },
);

export interface LinkProps
  extends
    Omit<AriaLinkProps, 'className' | 'style' | 'children' | 'isDisabled'>,
    VariantProps<typeof linkVariants> {
  /** Omit to inherit typography. A size applies the corresponding medium body preset. */
  size?: VariantProps<typeof linkVariants>['size'];
  /**
   * Link content. A function receives React Aria link state, including
   * `isCurrent`, `isHovered`, and `isPressed`.
   */
  children?: AriaLinkProps['children'];
  /** Forwarded to the React Aria link element. */
  ref?: ComponentProps<typeof AriaLink>['ref'];
  /** Identifies the current destination and sets render-prop `isCurrent`. */
  'aria-current'?: AriaAttributes['aria-current'];
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
 * A navigation link with inherited typography, or a medium body preset when sized.
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
            isFocusVisible: state.isFocusVisible || variantProps.forcedFocus,
          }),
        );
      }}
    >
      {children}
    </AriaLink>
  );
}
