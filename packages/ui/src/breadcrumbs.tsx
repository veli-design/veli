'use client';

import * as React from 'react';
import {
  Breadcrumb as AriaBreadcrumb,
  Breadcrumbs as AriaBreadcrumbs,
  Button as AriaButton,
  Link as AriaLink,
  type BreadcrumbProps as AriaBreadcrumbProps,
  type BreadcrumbRenderProps,
  type BreadcrumbsProps as AriaBreadcrumbsProps,
} from 'react-aria-components';
import { cva } from 'class-variance-authority';
import { CaretLeft } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from './menu';

const breadcrumbsRootVariants = cva(
  'm-0 flex flex-wrap items-center gap-1.5 list-none p-0 font-sans antialiased',
);

const breadcrumbItemContentClassName =
  'inline-flex min-h-6 items-center gap-1.5 px-2 py-0.5 font-medium';

const breadcrumbInteractiveTextClassName =
  'text-text-default-muted hover:text-text-default-default active:text-text-default-default focus-visible:text-text-default-default';

const breadcrumbBackLinkLinkClassName =
  'bg-transparent text-text-links-default hover:bg-transparent hover:text-text-links-hover active:bg-transparent active:text-text-links-hover focus-visible:bg-transparent focus-visible:text-text-links-hover [&_svg]:text-icon-links-default hover:[&_svg]:text-icon-links-hover active:[&_svg]:text-icon-links-hover focus-visible:[&_svg]:text-icon-links-hover';

const breadcrumbBackLinkItemClassName = 'after:hidden';

const breadcrumbBackLinkDividerClassName =
  'box-border h-2 w-0 shrink-0 border-0 border-l border-border-default-strong';

const breadcrumbItemVariants = cva(
  'inline-flex items-center gap-1.5 type-body-sm-regular after:font-medium after:text-text-default-inactive after:content-["/"] data-[current]:after:hidden',
);

const breadcrumbLinkVariants = cva(
  `${breadcrumbItemContentClassName} ${breadcrumbInteractiveTextClassName} rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface-base`,
  {
    variants: {
      tone: {
        accent: '',
        muted: '',
      },
      isDisabled: {
        true: 'cursor-default text-text-disabled-disabled hover:text-text-disabled-disabled active:text-text-disabled-disabled focus-visible:text-text-disabled-disabled',
        false: 'hover:bg-breadcrumbs-hover active:bg-breadcrumbs-pressed',
      },
    },
    defaultVariants: {
      tone: 'muted',
      isDisabled: false,
    },
  },
);

const breadcrumbTextVariants = cva(`${breadcrumbItemContentClassName} text-text-default-muted`, {
  variants: {
    tone: {
      accent: '',
      muted: '',
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

const breadcrumbCurrentVariants = cva(`${breadcrumbItemContentClassName} text-text-default-strong`);

const breadcrumbOverflowTriggerVariants = cva(
  `${breadcrumbItemContentClassName} min-w-6 cursor-pointer justify-center rounded-md text-text-default-muted transition-colors outline-none`,
  {
    variants: {
      isHovered: {
        true: 'bg-breadcrumbs-hover text-text-default-default',
        false: '',
      },
      isPressed: {
        true: 'bg-breadcrumbs-pressed text-text-default-default',
        false: '',
      },
      isFocusVisible: {
        true: 'text-text-default-default ring-2 ring-border-focus ring-offset-2 ring-offset-bg-surface-base',
        false: '',
      },
    },
    defaultVariants: {
      isHovered: false,
      isPressed: false,
      isFocusVisible: false,
    },
  },
);

export interface BreadcrumbsProps<T extends object> extends Omit<
  AriaBreadcrumbsProps<T>,
  'className' | 'style'
> {
  className?: string;
  showBackLink?: boolean;
  backLinkLabel?: React.ReactNode;
  backLinkHref?: string;
  backLinkIsDisabled?: boolean;
  backLinkTarget?: React.HTMLAttributeAnchorTarget;
  backLinkRel?: string;
  backLinkOnPress?: (
    e: Parameters<NonNullable<React.ComponentProps<typeof AriaLink>['onPress']>>[0],
  ) => void;
}

export interface BreadcrumbBackLinkProps extends Omit<
  AriaBreadcrumbProps,
  'children' | 'className' | 'style'
> {
  label?: React.ReactNode;
  children?: React.ReactNode;
  href?: string;
  isDisabled?: boolean;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  onPress?: (
    e: Parameters<NonNullable<React.ComponentProps<typeof AriaLink>['onPress']>>[0],
  ) => void;
}

type BreadcrumbChild = React.ReactNode | ((state: BreadcrumbRenderProps) => React.ReactNode);

export interface BreadcrumbProps extends Omit<
  AriaBreadcrumbProps,
  'children' | 'className' | 'style'
> {
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
    e: Parameters<NonNullable<React.ComponentProps<typeof AriaLink>['onPress']>>[0],
  ) => void;
}

export type BreadcrumbOverflowItem = {
  id: string | number;
  label: React.ReactNode;
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  isDisabled?: boolean;
};

export interface BreadcrumbOverflowProps extends Omit<
  AriaBreadcrumbProps,
  'children' | 'className' | 'style'
> {
  items: readonly BreadcrumbOverflowItem[];
  label?: string;
  menuLabel?: string;
  className?: string;
  triggerClassName?: string;
  popoverClassName?: string;
  onAction?: (key: string | number) => void;
}

function BreadcrumbBackLinkDivider() {
  return (
    <AriaBreadcrumb className={twMerge(breadcrumbItemVariants(), 'after:hidden')}>
      <span aria-hidden="true" className={breadcrumbBackLinkDividerClassName} />
    </AriaBreadcrumb>
  );
}

export function BreadcrumbBackLink({
  label = 'Back',
  children,
  href,
  isDisabled = false,
  target,
  rel,
  onPress,
  ...props
}: BreadcrumbBackLinkProps) {
  const content = children ?? (
    <>
      <CaretLeft aria-hidden size={16} weight="bold" />
      <span>{label}</span>
    </>
  );

  return (
    <>
      <Breadcrumb
        {...props}
        className={breadcrumbBackLinkItemClassName}
        href={href}
        isDisabled={isDisabled}
        target={target}
        rel={rel}
        onPress={onPress}
        linkClassName={breadcrumbBackLinkLinkClassName}
      >
        {content}
      </Breadcrumb>
      <BreadcrumbBackLinkDivider />
    </>
  );
}

export function Breadcrumbs<T extends object>({
  className,
  showBackLink = false,
  backLinkLabel,
  backLinkHref,
  backLinkIsDisabled,
  backLinkTarget,
  backLinkRel,
  backLinkOnPress,
  children,
  ...props
}: BreadcrumbsProps<T>) {
  const backLink =
    showBackLink && typeof children !== 'function' ? (
      <BreadcrumbBackLink
        label={backLinkLabel}
        href={backLinkHref}
        isDisabled={backLinkIsDisabled}
        target={backLinkTarget}
        rel={backLinkRel}
        onPress={backLinkOnPress}
      />
    ) : null;

  const renderedChildren =
    typeof children === 'function' ? (
      children
    ) : (
      <>
        {backLink}
        {children}
      </>
    );

  return (
    <AriaBreadcrumbs {...props} className={twMerge(breadcrumbsRootVariants(), className)}>
      {renderedChildren as AriaBreadcrumbsProps<T>['children']}
    </AriaBreadcrumbs>
  );
}

export function BreadcrumbOverflow({
  items,
  label = 'Show hidden breadcrumb pages',
  menuLabel = 'Hidden breadcrumb pages',
  className,
  triggerClassName,
  popoverClassName,
  onAction,
  ...props
}: BreadcrumbOverflowProps) {
  return (
    <AriaBreadcrumb {...props} className={twMerge(breadcrumbItemVariants(), className)}>
      <MenuTrigger>
        <AriaButton
          aria-label={label}
          className={(state) =>
            twMerge(
              breadcrumbOverflowTriggerVariants({
                isHovered: state.isHovered && !state.isPressed,
                isPressed: state.isPressed,
                isFocusVisible: state.isFocusVisible,
              }),
              triggerClassName,
            )
          }
        >
          <span aria-hidden="true">…</span>
        </AriaButton>
        <MenuPopover className={popoverClassName}>
          <Menu aria-label={menuLabel} onAction={onAction}>
            {items.map((item) => (
              <MenuItem
                key={item.id}
                id={item.id}
                href={item.href}
                target={item.target}
                rel={item.rel}
                isDisabled={item.isDisabled}
                size="sm"
                className="cursor-pointer"
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </MenuPopover>
      </MenuTrigger>
    </AriaBreadcrumb>
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
    <AriaBreadcrumb {...props} className={twMerge(breadcrumbItemVariants(), className)}>
      {(state) => {
        const content = typeof children === 'function' ? children(state) : children;
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
                  linkClassName,
                )
              }
            >
              {content}
            </AriaLink>
          );
        }

        return (
          <span className={twMerge(breadcrumbTextVariants({ tone, isDisabled }), linkClassName)}>
            {content}
          </span>
        );
      }}
    </AriaBreadcrumb>
  );
}
