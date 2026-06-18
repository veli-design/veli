'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva(
  'inline-flex max-w-full items-center border font-sans antialiased whitespace-nowrap align-middle',
  {
    variants: {
      counter: {
        true: '',
        false: '',
      },
      size: {
        xs: 'size-2 shrink-0 gap-0 rounded-full p-0',
        sm: '',
        md: '',
      },
    },
    compoundVariants: [
      {
        counter: false,
        size: 'sm',
        className: 'h-5 gap-1 rounded-md px-1 type-caption-medium [&_svg]:size-3',
      },
      {
        counter: false,
        size: 'md',
        className: 'h-7 gap-1 rounded-md px-2 type-body-sm-medium [&_svg]:size-4',
      },
      {
        counter: true,
        size: 'sm',
        className: 'h-5 min-w-5 justify-center rounded-full px-1 type-caption-medium',
      },
      {
        counter: true,
        size: 'md',
        className: 'h-7 min-w-7 justify-center rounded-full px-2 type-body-sm-medium',
      },
    ],
    defaultVariants: {
      counter: false,
      size: 'md',
    },
  },
);

export type BadgeAppearance = 'emphasis' | 'outline' | 'subtle';
export type BadgeIntent =
  | 'neutral'
  | 'info'
  | 'positive'
  | 'cautious'
  | 'warning'
  | 'danger'
  | 'pink'
  | 'indigo'
  | 'turquoise'
  | 'green'
  | 'lime';
export type BadgeSize = 'xs' | 'sm' | 'md';

const badgeIntentClasses = {
  subtle: {
    neutral:
      'border-status-neutral-subtle bg-status-neutral-subtle text-text-default-strong [&_svg]:text-icon-default-strong',
    info: 'border-status-info-subtle bg-status-info-subtle text-text-primary-strong [&_svg]:text-icon-primary-strong',
    positive:
      'border-status-success-subtle bg-status-success-subtle text-text-success-strong [&_svg]:text-icon-success-strong',
    cautious:
      'border-status-cautious-subtle bg-status-cautious-subtle text-text-cautious-strong [&_svg]:text-icon-cautious-strong',
    warning:
      'border-status-warning-subtle bg-status-warning-subtle text-text-warning-strong [&_svg]:text-icon-warning-strong',
    danger:
      'border-status-danger-subtle bg-status-danger-subtle text-text-danger-strong [&_svg]:text-icon-danger-strong',
    pink: 'border-status-pink-subtle bg-status-pink-subtle text-pink-1000 [&_svg]:text-pink-1000',
    indigo:
      'border-status-indigo-subtle bg-status-indigo-subtle text-indigo-1000 [&_svg]:text-indigo-1000',
    turquoise:
      'border-status-turquoise-subtle bg-status-turquoise-subtle text-turquoise-1000 [&_svg]:text-turquoise-1000',
    green:
      'border-status-green-subtle bg-status-green-subtle text-green-1000 [&_svg]:text-green-1000',
    lime: 'border-status-lime-subtle bg-status-lime-subtle text-lime-1000 [&_svg]:text-lime-1000',
  },
  emphasis: {
    neutral:
      'border-status-neutral-emphasis bg-status-neutral-emphasis text-text-default-inverted [&_svg]:text-icon-default-inverted',
    info: 'border-status-info-emphasis bg-status-info-emphasis text-text-primary-inverted [&_svg]:text-icon-primary-inverted',
    positive:
      'border-status-success-emphasis bg-status-success-emphasis text-text-success-inverted [&_svg]:text-icon-success-inverted',
    cautious:
      'border-status-cautious-emphasis bg-status-cautious-emphasis text-text-cautious-inverted [&_svg]:text-icon-cautious-inverted',
    warning:
      'border-status-warning-emphasis bg-status-warning-emphasis text-text-warning-inverted [&_svg]:text-icon-warning-inverted',
    danger:
      'border-status-danger-emphasis bg-status-danger-emphasis text-text-danger-inverted [&_svg]:text-icon-danger-inverted',
    pink: 'border-status-pink-emphasis bg-status-pink-emphasis text-pink-100 [&_svg]:text-pink-100',
    indigo:
      'border-status-indigo-emphasis bg-status-indigo-emphasis text-indigo-100 [&_svg]:text-indigo-100',
    turquoise:
      'border-status-turquoise-emphasis bg-status-turquoise-emphasis text-turquoise-100 [&_svg]:text-turquoise-100',
    green:
      'border-status-green-emphasis bg-status-green-emphasis text-green-100 [&_svg]:text-green-100',
    lime: 'border-status-lime-emphasis bg-status-lime-emphasis text-lime-100 [&_svg]:text-lime-100',
  },
  outline: {
    neutral:
      'border-status-neutral-subtle bg-transparent text-text-default-default [&_svg]:text-icon-default-default',
    info: 'border-status-info-subtle bg-transparent text-text-primary-default [&_svg]:text-icon-primary-default',
    positive:
      'border-status-success-subtle bg-transparent text-text-success-default [&_svg]:text-icon-success-default',
    cautious:
      'border-status-cautious-subtle bg-transparent text-text-cautious-default [&_svg]:text-icon-cautious-default',
    warning:
      'border-status-warning-subtle bg-transparent text-text-warning-default [&_svg]:text-icon-warning-default',
    danger:
      'border-status-danger-subtle bg-transparent text-text-danger-default [&_svg]:text-icon-danger-default',
    pink: 'border-status-pink-subtle bg-transparent text-pink-900 [&_svg]:text-pink-900',
    indigo: 'border-status-indigo-subtle bg-transparent text-indigo-900 [&_svg]:text-indigo-900',
    turquoise:
      'border-status-turquoise-subtle bg-transparent text-turquoise-900 [&_svg]:text-turquoise-900',
    green: 'border-status-green-subtle bg-transparent text-green-900 [&_svg]:text-green-900',
    lime: 'border-status-lime-subtle bg-transparent text-lime-900 [&_svg]:text-lime-900',
  },
} satisfies Record<BadgeAppearance, Record<BadgeIntent, string>>;

function formatBadgeCount(count: number, max: number) {
  return count > max ? `${max}+` : String(count);
}

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    Omit<VariantProps<typeof badgeVariants>, 'counter'> {
  appearance?: BadgeAppearance;
  intent?: BadgeIntent;
  counter?: boolean;
  count?: number;
  max?: number;
  leadingIcon?: React.ReactNode;
  className?: string;
}

export function Badge({
  children,
  className,
  appearance = 'outline',
  intent = 'neutral',
  counter = false,
  count,
  max = 99,
  size = 'md',
  leadingIcon,
  ...props
}: BadgeProps) {
  const isCounter = (counter || count != null) && size !== 'xs';
  const isDot = size === 'xs';
  const label = isCounter && count != null ? formatBadgeCount(count, max) : children;
  const showLabel = !isDot && label != null && label !== false;

  return (
    <span
      {...props}
      aria-hidden={isDot && props['aria-label'] == null ? true : undefined}
      className={twMerge(
        badgeVariants({ counter: isCounter, size }),
        badgeIntentClasses[appearance][intent],
        className,
      )}
    >
      {!isDot && !isCounter && leadingIcon ? (
        <span aria-hidden="true" className="inline-flex shrink-0 items-center">
          {leadingIcon}
        </span>
      ) : null}
      {showLabel ? (
        <span className={twMerge(isCounter ? 'tabular-nums' : 'min-w-0 truncate px-0.5')}>
          {label}
        </span>
      ) : null}
    </span>
  );
}
