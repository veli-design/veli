'use client';

import * as React from 'react';
import {
  Separator as AriaSeparator,
  type SeparatorProps as AriaSeparatorProps,
} from 'react-aria-components';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const dividerColorVariants = cva('', {
  variants: {
    appearance: {
      subtle: 'border-border-default-subtle',
      muted: 'border-border-default-muted',
      strong: 'border-border-default-strong',
      emphasis: 'border-border-default-emphasis',
    },
  },
  defaultVariants: {
    appearance: 'subtle',
  },
});

const dividerLineVariants = cva('min-w-0 flex-1 border-0 border-t', {
  variants: {
    appearance: {
      subtle: 'border-border-default-subtle',
      muted: 'border-border-default-muted',
      strong: 'border-border-default-strong',
      emphasis: 'border-border-default-emphasis',
    },
  },
  defaultVariants: {
    appearance: 'subtle',
  },
});

const dividerVariants = cva('shrink-0 border-0', {
  variants: {
    orientation: {
      horizontal: 'w-full border-t',
      vertical: 'h-full min-h-6 self-stretch border-l',
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
  },
});

export interface DividerProps
  extends
    Omit<AriaSeparatorProps, 'className' | 'style'>,
    VariantProps<typeof dividerColorVariants> {
  className?: string;
  text?: React.ReactNode;
}

export function Divider({
  className,
  orientation = 'horizontal',
  appearance = 'subtle',
  text,
  ...props
}: DividerProps) {
  if (text && orientation === 'horizontal') {
    const { slot, ...separatorProps } = props;

    return (
      <div slot={slot ?? undefined} className={twMerge('flex w-full items-center', className)}>
        <AriaSeparator
          {...separatorProps}
          orientation="horizontal"
          elementType="div"
          aria-hidden
          className={dividerLineVariants({ appearance })}
        />
        <span className="shrink-0 px-2.5 type-body-sm-regular text-text-default-muted">{text}</span>
        <AriaSeparator
          orientation="horizontal"
          elementType="div"
          aria-hidden
          className={dividerLineVariants({ appearance })}
        />
      </div>
    );
  }

  return (
    <AriaSeparator
      {...props}
      orientation={orientation}
      elementType={orientation === 'horizontal' ? 'div' : undefined}
      className={twMerge(
        dividerVariants({ orientation }),
        dividerColorVariants({ appearance }),
        className,
      )}
    />
  );
}
