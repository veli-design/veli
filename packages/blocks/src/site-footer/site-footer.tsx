'use client';

import { Link, type LinkProps } from '@tradenetcorp/veli-ui/link';

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
  /** Forward every supplied prop to your router link, including its ref. */
  renderLink?: LinkProps['render'];
  className?: string;
};

export function SiteFooter({
  startLinks,
  endLinks,
  startLabel,
  endLabel,
  renderLink,
  className = '',
}: SiteFooterProps) {
  function links(items: readonly FooterLink[], label?: string) {
    if (items.length === 0) return null;
    return (
      <ul
        aria-label={label}
        className="m-0 flex min-w-0 flex-wrap items-center gap-x-6 gap-y-3 p-0 list-none"
      >
        {items.map((item) => (
          <li key={item.id} className="min-w-0 max-w-full [overflow-wrap:anywhere]">
            <Link href={item.href} intent="secondary" underline="hover" render={renderLink}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <footer
      className={`type-caption-medium text-text-base-muted md:type-body-sm-medium flex w-full flex-wrap items-center justify-between gap-x-8 gap-y-4 px-4 py-4 text-start lg:px-8 ${className}`}
    >
      {links(startLinks, startLabel)}
      {links(endLinks, endLabel)}
    </footer>
  );
}
