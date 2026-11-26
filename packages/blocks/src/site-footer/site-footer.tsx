'use client';

import type { ReactNode } from 'react';
import { Link, type LinkProps } from '@veli-design/react/link';

export {
  SiteFooterThemeToggle,
  type SiteFooterColorScheme,
  type SiteFooterThemeToggleLabels,
  type SiteFooterThemeToggleProps,
} from './theme-toggle';

export type FooterLink = {
  id: string;
  label: string;
  href: string;
};

export type SiteFooterProps = {
  startLinks: readonly FooterLink[];
  endLinks: readonly FooterLink[];
  startLabel?: string;
  endLabel?: string;
  /** Appends classes to the leading link group. */
  startGroupClassName?: string;
  /** Appends classes to the trailing link group. */
  endGroupClassName?: string;
  /** Forward every supplied prop to your router link, including its ref. */
  renderLink?: LinkProps['render'];
  /** Optional trailing content after the end links, such as `SiteFooterThemeToggle`. */
  endSlot?: ReactNode;
  className?: string;
};

const LINK_CLASSES =
  ' [&_a]:block [&_a]:text-text-base-muted [&_a:hover]:text-text-base-strong [&_a:focus-visible]:!ring-0 [&_a:focus-visible]:![outline-style:auto] [&_a:focus-visible]:!outline-1 [&_a:focus-visible]:!outline-offset-1 [&_a:focus-visible]:![box-shadow:none]';

export function SiteFooter({
  startLinks,
  endLinks,
  startLabel,
  endLabel,
  startGroupClassName = '',
  endGroupClassName = '',
  renderLink,
  endSlot,
  className = '',
}: SiteFooterProps) {
  function links(items: readonly FooterLink[], label: string | undefined, groupClassName: string) {
    if (items.length === 0) return null;
    return (
      <div
        aria-label={label}
        role={label ? 'group' : undefined}
        // Link styles stay on the link groups so `endSlot` content keeps its own.
        className={`veli-site-footer-links flex items-center${LINK_CLASSES} ${groupClassName}`}
      >
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            intent="secondary"
            underline="none"
            render={renderLink}
          >
            {item.label}
          </Link>
        ))}
      </div>
    );
  }

  return (
    <footer
      className={`veli-site-footer type-caption-medium text-text-base-muted md:type-body-sm-medium flex w-full flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-4 text-start lg:px-8 ${className}`}
    >
      <style>{`.veli-site-footer-links a:focus-visible { border-radius: 0 !important; outline-color: -webkit-focus-ring-color !important; transition: none !important; }`}</style>
      {links(startLinks, startLabel, `gap-5 md:gap-9 ${startGroupClassName}`)}
      {(endLinks.length > 0 || endSlot) && (
        <div className="ms-auto flex items-center gap-4 md:gap-8">
          {links(endLinks, endLabel, `gap-6 md:gap-14 ${endGroupClassName}`)}
          {endSlot}
        </div>
      )}
    </footer>
  );
}
