'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const badgeVariants = cva(
  'inline-flex max-w-full items-center border border-transparent font-sans antialiased whitespace-nowrap align-middle [&_svg]:shrink-0',
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

const badgeLabelVariants = cva('min-w-0', {
  variants: {
    counter: {
      true: 'tabular-nums text-center [font-variant-numeric:tabular-nums]',
      false: 'block truncate px-0.5 text-center leading-[inherit]',
    },
  },
  defaultVariants: {
    counter: false,
  },
});

export type BadgeAppearance = 'emphasis' | 'outline' | 'subtle';
export type BadgeIntentKey =
  | 'neutral'
  | 'info'
  | 'positive'
  | 'cautious'
  | 'warning'
  | 'danger'
  | 'magenta'
  | 'indigo'
  | 'brand'
  | 'green'
  | 'lime';
export type BadgeIntent = BadgeIntentKey;
export type BadgeSize = 'xs' | 'sm' | 'md';

const badgeIntentClasses = {
  subtle: {
    neutral: 'bg-status-neutral-subtle text-base-strong [&_svg]:text-icon-base-strong',
    info: 'bg-status-info-subtle text-info-1000 [&_svg]:text-info-1000',
    positive: 'bg-status-success-subtle text-success-strong [&_svg]:text-icon-success-strong',
    cautious: 'bg-status-caution-subtle text-caution-strong [&_svg]:text-icon-caution-strong',
    warning: 'bg-status-warning-subtle text-warning-strong [&_svg]:text-icon-warning-strong',
    danger: 'bg-status-danger-subtle text-danger-strong [&_svg]:text-icon-danger-strong',
    magenta: 'bg-status-magenta-subtle text-magenta-1000 [&_svg]:text-magenta-1000',
    indigo: 'bg-status-indigo-subtle text-indigo-1000 [&_svg]:text-indigo-1000',
    brand: 'bg-status-teal-subtle text-primary-strong [&_svg]:text-icon-primary-strong',
    green: 'bg-status-green-subtle text-green-1000 [&_svg]:text-green-1000',
    lime: 'bg-status-lime-subtle text-lime-1000 [&_svg]:text-lime-1000',
  },
  emphasis: {
    neutral: 'bg-status-neutral-emphasis text-base-inverted [&_svg]:text-icon-base-inverted',
    info: 'bg-status-info-emphasis text-info-100 [&_svg]:text-info-100',
    positive: 'bg-status-success-emphasis text-success-inverted [&_svg]:text-icon-success-inverted',
    cautious: 'bg-status-caution-emphasis text-caution-inverted [&_svg]:text-icon-caution-inverted',
    warning: 'bg-status-warning-emphasis text-warning-inverted [&_svg]:text-icon-warning-inverted',
    danger: 'bg-status-danger-emphasis text-danger-inverted [&_svg]:text-icon-danger-inverted',
    magenta: 'bg-status-magenta-emphasis text-magenta-100 [&_svg]:text-magenta-100',
    indigo: 'bg-status-indigo-emphasis text-indigo-100 [&_svg]:text-indigo-100',
    brand: 'bg-status-teal-emphasis text-primary-inverted [&_svg]:text-icon-primary-inverted',
    green: 'bg-status-green-emphasis text-green-100 [&_svg]:text-green-100',
    lime: 'bg-status-lime-emphasis text-lime-100 [&_svg]:text-lime-100',
  },
  outline: {
    neutral: 'border-status-neutral-stroke bg-transparent text-base-default [&_svg]:text-icon-base',
    info: 'border-status-info-stroke bg-transparent text-info-900 [&_svg]:text-info-900',
    positive: 'border-status-success-stroke bg-transparent text-success [&_svg]:text-icon-success',
    cautious: 'border-status-caution-stroke bg-transparent text-caution [&_svg]:text-icon-caution',
    warning: 'border-status-warning-stroke bg-transparent text-warning [&_svg]:text-icon-warning',
    danger: 'border-status-danger-stroke bg-transparent text-danger [&_svg]:text-icon-danger',
    magenta:
      'border-status-magenta-stroke bg-transparent text-magenta-900 [&_svg]:text-magenta-900',
    indigo: 'border-status-indigo-stroke bg-transparent text-indigo-900 [&_svg]:text-indigo-900',
    brand: 'border-status-teal-stroke bg-transparent text-primary [&_svg]:text-icon-primary',
    green: 'border-status-green-stroke bg-transparent text-green-900 [&_svg]:text-green-900',
    lime: 'border-status-lime-stroke bg-transparent text-lime-900 [&_svg]:text-lime-900',
  },
} satisfies Record<BadgeAppearance, Record<BadgeIntentKey, string>>;

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
        <span
          aria-hidden="true"
          className="inline-flex shrink-0 items-center justify-center leading-none"
        >
          {leadingIcon}
        </span>
      ) : null}
      {showLabel ? (
        <span className={badgeLabelVariants({ counter: isCounter })}>{label}</span>
      ) : null}
    </span>
  );
}
