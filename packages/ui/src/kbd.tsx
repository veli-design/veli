'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

export type KbdVariant = 'default' | 'inverted';

const kbdGroupVariants = cva('inline-flex items-center gap-0.5', {
  variants: {
    variant: {
      default: '',
      inverted: '',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

const kbdKeyVariants = cva(
  'inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-sm px-1 font-sans antialiased leading-none type-caption-regular',
  {
    variants: {
      variant: {
        default:
          'bg-menu-shortcut-bg text-base [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-icon-base',
        inverted:
          'bg-button-secondary-subtle text-base-inactive [&_svg]:size-3 [&_svg]:shrink-0 [&_svg]:text-icon-base-inactive',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface KbdProps extends React.HTMLAttributes<HTMLElement> {
  variant?: KbdVariant;
  className?: string;
  children: React.ReactNode;
}

export function Kbd({ className, variant = 'default', children, lang = 'en', ...props }: KbdProps) {
  return (
    <kbd {...props} lang={lang} className={twMerge(kbdKeyVariants({ variant }), className)}>
      {children}
    </kbd>
  );
}

export interface KbdGroupProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof kbdGroupVariants> {
  className?: string;
}

export function KbdGroup({ className, variant = 'default', children, ...props }: KbdGroupProps) {
  return (
    <div {...props} className={twMerge(kbdGroupVariants({ variant }), className)}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<KbdProps>(child) || child.type !== Kbd) {
          return child;
        }

        if (child.props.variant != null) {
          return child;
        }

        return React.cloneElement(child, { variant: variant ?? 'default' });
      })}
    </div>
  );
}
