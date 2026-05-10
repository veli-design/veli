import * as React from 'react';
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  Link as AriaLink,
  type BreadcrumbProps as AriaBreadcrumbProps,
  type BreadcrumbRenderProps,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { twMerge } from 'tailwind-merge';

const breadcrumbsRootVariants = cva(
  'm-0 flex flex-wrap items-center list-none p-0 font-sans antialiased'
);

const breadcrumbItemVariants = cva(
  'inline-flex items-center type-body-sm-regular after:mx-[6px] after:font-medium after:text-text-default-muted after:content-["/"] data-[current]:after:hidden first:[&>a]:text-text-links-default first:[&>a]:hover:text-text-links-hover first:[&>a]:active:text-text-links-hover'
);

const breadcrumbLinkVariants = cva(
  'inline-flex min-h-[24px] items-center gap-[6px] rounded-[2px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base',
  {
    variants: {
      tone: {
        accent:
          'text-text-links-default hover:text-text-links-hover active:text-text-links-hover',
        muted:
          'text-text-default-inactive hover:text-text-default-subtle active:text-text-default-subtle',
      },
      isDisabled: {
        true: 'cursor-default text-text-disabled-disabled',
        false: '',
      },
    },
    defaultVariants: {
      tone: 'muted',
      isDisabled: false,
    },
  }
);

const breadcrumbTextVariants = cva('inline-flex min-h-[24px] items-center gap-[6px] font-medium', {
  variants: {
    tone: {
      accent: 'text-text-links-default',
      muted: 'text-text-default-inactive',
    },
    isDisabled: {
      true: 'text-text-disabled-disabled',
      false: '',
    },
  },
  defaultVariants: {
    tone: 'muted',
    isDisabled: false,
  },
});

const breadcrumbCurrentVariants = cva(
  'inline-flex min-h-[24px] items-center gap-[6px] font-medium text-text-default-subtle'
);

export interface BreadcrumbsProps<T extends object>
  extends Omit<AriaBreadcrumbsProps<T>, 'className' | 'style'> {
  className?: string;
}

type BreadcrumbChild =
  | React.ReactNode
  | ((state: BreadcrumbRenderProps) => React.ReactNode);

export interface BreadcrumbProps
  extends Omit<AriaBreadcrumbProps, 'children' | 'className' | 'style'> {
  children?: BreadcrumbChild;
  className?: string;
  linkClassName?: string;
  tone?: 'accent' | 'muted';
  href?: string;
  isDisabled?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  download?: boolean | string;
  onPress?: (
    e: Parameters<NonNullable<React.ComponentProps<typeof AriaLink>['onPress']>>[0]
  ) => void;
}

export function Breadcrumbs<T extends object>({
  className,
  ...props
}: BreadcrumbsProps<T>) {
  return (
    <AriaBreadcrumbs
      {...props}
      className={twMerge(breadcrumbsRootVariants(), className)}
    />
  );
}

export function Breadcrumb({
  children,
  className,
  linkClassName,
  tone = 'muted',
  href,
  isDisabled = false,
  target,
  rel,
  download,
  onPress,
  ...props
}: BreadcrumbProps) {
  return (
    <AriaBreadcrumb
      {...props}
      className={twMerge(breadcrumbItemVariants(), className)}
    >
      {(state) => {
        const content =
          typeof children === 'function' ? children(state) : children;
        const shouldRenderLink =
          !state.isCurrent && !isDisabled && (href != null || onPress != null);

        if (state.isCurrent) {
          return (
            <span aria-current="page" className={breadcrumbCurrentVariants()}>
              {content}
            </span>
          );
        }

        if (shouldRenderLink) {
          return (
            <AriaLink
              href={href}
              isDisabled={isDisabled}
              target={target}
              rel={rel}
              download={download}
              onPress={onPress}
              className={(linkState) =>
                twMerge(
                  breadcrumbLinkVariants({
                    tone,
                    isDisabled: linkState.isDisabled,
                  }),
                  linkClassName
                )
              }
            >
              {content}
            </AriaLink>
          );
        }

        return (
          <span
            className={twMerge(
              breadcrumbTextVariants({ tone, isDisabled }),
              linkClassName
            )}
          >
            {content}
          </span>
        );
      }}
    </AriaBreadcrumb>
  );
}
