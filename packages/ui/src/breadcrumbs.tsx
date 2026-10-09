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
import { CaretLeft, CaretRight } from 'phosphor-react';
import { twMerge } from 'tailwind-merge';
import { Menu, MenuItem, MenuPopover, MenuTrigger } from './menu.js';
import { useVeliLanguage } from './provider.js';

const breadcrumbsRootVariants = cva(
  'm-0 flex flex-wrap items-center gap-1.5 list-none p-0 antialiased',
);

const breadcrumbItemContentClassName = 'inline-flex min-h-6 items-center gap-1.5 px-2 py-0.5';

const breadcrumbInteractiveTypographyClassName = 'type-body-sm-medium';

const breadcrumbCurrentTypographyClassName = 'type-body-sm-medium';

const breadcrumbInteractiveTextClassName =
  'text-base-muted hover:text-base-default active:text-base-default focus-visible:text-base-default';

const breadcrumbBackLinkLinkClassName =
  'bg-transparent text-links hover:bg-transparent hover:text-links-hover active:bg-transparent active:text-links-hover focus-visible:bg-transparent focus-visible:text-links-hover [&_svg]:text-icon-links hover:[&_svg]:text-icon-links-hover active:[&_svg]:text-icon-links-hover focus-visible:[&_svg]:text-icon-links-hover';

const breadcrumbBackLinkItemClassName = 'after:hidden';
const breadcrumbBackLinkDividerItemClassName = 'self-stretch after:hidden';

const breadcrumbBackLinkDividerClassName =
  'box-border h-2 w-0 shrink-0 border-0 border-l border-base-strong';

const breadcrumbItemVariants = cva(
  'inline-flex items-center gap-1.5 type-body-sm-regular after:text-base-inactive after:content-["/"] data-[current]:after:hidden',
);

const breadcrumbLinkVariants = cva(
  `${breadcrumbItemContentClassName} cursor-pointer ${breadcrumbInteractiveTypographyClassName} ${breadcrumbInteractiveTextClassName} rounded-md motion-safe:transition-colors motion-safe:duration-normal motion-safe:ease-out motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2`,
  {
    variants: {
      isDisabled: {
        true: 'cursor-default text-base-inactive hover:text-base-inactive active:text-base-inactive focus-visible:text-base-inactive',
        false: 'hover:bg-breadcrumbs-hover active:bg-breadcrumbs-pressed',
      },
    },
    defaultVariants: {
      isDisabled: false,
    },
  },
);

const breadcrumbTextVariants = cva(`${breadcrumbItemContentClassName} text-base-muted`, {
  variants: {
    isDisabled: {
      true: 'type-body-sm-medium text-base-inactive',
      false: 'type-body-sm-regular',
    },
  },
  defaultVariants: {
    isDisabled: false,
  },
});

const breadcrumbCurrentVariants = cva(
  `${breadcrumbItemContentClassName} ${breadcrumbCurrentTypographyClassName} text-base-default`,
);

const breadcrumbOverflowTriggerVariants = cva(
  `${breadcrumbItemContentClassName} w-[29px] cursor-pointer justify-center rounded-md type-body-sm-regular text-base-default motion-safe:transition-colors motion-safe:duration-normal motion-safe:ease-out motion-reduce:transition-none aria-expanded:bg-breadcrumbs-pressed aria-expanded:type-body-sm-semibold aria-expanded:ring-1 aria-expanded:ring-inset aria-expanded:ring-border-focus outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-border-focus focus-visible:outline-offset-2`,
  {
    variants: {
      isHovered: {
        true: 'bg-breadcrumbs-hover type-body-sm-semibold',
        false: '',
      },
      isPressed: {
        true: 'bg-breadcrumbs-pressed type-body-sm-semibold',
        false: '',
      },
    },
    defaultVariants: {
      isHovered: false,
      isPressed: false,
    },
  },
);

const breadcrumbOverflowItemClassName = 'inline-flex items-center gap-1.5 type-body-sm-regular';

const breadcrumbOverflowDividerClassName =
  'inline-flex shrink-0 py-0.5 type-body-sm-regular text-base-inactive';

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
    <AriaBreadcrumb
      className={twMerge(breadcrumbItemVariants(), breadcrumbBackLinkDividerItemClassName)}
    >
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
  const { direction } = useVeliLanguage();
  const CaretIcon = direction === 'rtl' ? CaretRight : CaretLeft;
  const content = children ?? (
    <>
      <CaretIcon aria-hidden size={16} weight="bold" />
      <span>{label}</span>
    </>
  );
  const shouldRenderButton = href == null && onPress != null;

  const backLinkControl = shouldRenderButton ? (
    <AriaBreadcrumb
      {...props}
      className={twMerge(breadcrumbItemVariants(), breadcrumbBackLinkItemClassName)}
    >
      <AriaButton
        isDisabled={isDisabled}
        onPress={onPress}
        className={(state) =>
          twMerge(
            breadcrumbLinkVariants({
              isDisabled: state.isDisabled,
            }),
            state.isDisabled ? undefined : breadcrumbBackLinkLinkClassName,
          )
        }
      >
        {content}
      </AriaButton>
    </AriaBreadcrumb>
  ) : (
    <Breadcrumb
      {...props}
      className={breadcrumbBackLinkItemClassName}
      href={href}
      isDisabled={isDisabled}
      target={target}
      rel={rel}
      onPress={onPress}
      linkClassName={isDisabled ? undefined : breadcrumbBackLinkLinkClassName}
    >
      {content}
    </Breadcrumb>
  );

  return (
    <>
      {backLinkControl}
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
  const { direction, lang } = useVeliLanguage();

  return (
    <AriaBreadcrumb {...props} className={twMerge(breadcrumbOverflowItemClassName, className)}>
      <MenuTrigger>
        <AriaButton
          aria-label={label}
          className={(state) =>
            twMerge(
              breadcrumbOverflowTriggerVariants({
                isHovered: state.isHovered && !state.isPressed,
                isPressed: state.isPressed,
              }),
              triggerClassName,
            )
          }
        >
          <span aria-hidden="true">...</span>
        </AriaButton>
        <MenuPopover
          offset={2}
          className={twMerge(
            'min-w-[155px] w-[155px] border-[0.5px] border-base-muted',
            popoverClassName,
          )}
        >
          <Menu aria-label={menuLabel} dir={direction} lang={lang} onAction={onAction}>
            {items.map((item) => (
              <MenuItem
                key={item.id}
                id={item.id}
                href={item.href}
                target={item.target}
                rel={item.rel}
                isDisabled={item.isDisabled}
                size="sm"
                className="cursor-pointer px-4"
              >
                {item.label}
              </MenuItem>
            ))}
          </Menu>
        </MenuPopover>
      </MenuTrigger>
      <span aria-hidden="true" className={breadcrumbOverflowDividerClassName}>
        /
      </span>
    </AriaBreadcrumb>
  );
}

export function Breadcrumb({
  children,
  className,
  linkClassName,
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
          <span
            aria-disabled={isDisabled || undefined}
            className={twMerge(breadcrumbTextVariants({ isDisabled }), linkClassName)}
          >
            {content}
          </span>
        );
      }}
    </AriaBreadcrumb>
  );
}
