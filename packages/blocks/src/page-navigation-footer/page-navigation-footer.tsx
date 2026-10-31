'use client';

import type { ReactNode } from 'react';
import { ArrowUpRightIcon } from '@phosphor-icons/react';
import { Link, type LinkProps } from '@veli-design/react/link';
import { Button } from '@veli-design/react/button';
import { Divider } from '@veli-design/react/divider';
import { useVeliLanguage } from '@veli-design/react/provider';

export type PageNavigationFooterLink = {
  id: string;
  label: string;
  href: string;
  /** Shows an external marker; opening a new tab requires an explicit target. */
  external?: boolean;
  target?: string;
  rel?: string;
};
export type PageNavigationFooterSocialLink = PageNavigationFooterLink & {
  /** Decorative content; the link's accessible name comes from label. */
  icon: ReactNode;
};
export type PageNavigationFooterProps = {
  label: string;
  identity?: {
    /** Supplied by the consuming app. There is no bundled/default organization logo. */
    logo?: ReactNode;
    name: string;
    description?: string;
  };
  /** Internal navigation, under the localized “Jump to” heading. */
  internalLinks?: readonly PageNavigationFooterLink[];
  /** External resources, under the localized “Useful links” heading. */
  externalLinks?: readonly Omit<PageNavigationFooterLink, 'external'>[];
  socialLinks?: readonly PageNavigationFooterSocialLink[];
  /** Required when socialLinks are supplied; translate this group name too. */
  socialLabel?: string;
  renderLink?: LinkProps['render'];
  className?: string;
};

export function PageNavigationFooter({
  label,
  identity,
  internalLinks = [],
  externalLinks = [],
  socialLinks = [],
  socialLabel,
  renderLink,
  className = '',
}: PageNavigationFooterProps) {
  const { language, lang, direction } = useVeliLanguage();
  const dv = language === 'dv';
  const visibleGroups = [
    {
      id: 'internal',
      label: dv ? 'ބައިތަކަށް ދިއުން' : 'Jump to',
      links: internalLinks,
      external: false,
    },
    {
      id: 'external',
      label: dv ? 'ބޭނުންތެރި ލިންކުތައް' : 'Useful links',
      links: externalLinks,
      external: true,
    },
  ].filter((group) => group.links.length > 0);
  if (!identity && !visibleGroups.length && !socialLinks.length) return null;
  const relFor = (link: PageNavigationFooterLink) =>
    link.rel ?? (link.target === '_blank' ? 'noopener noreferrer' : undefined);
  const social =
    socialLinks.length > 0 ? (
      <ul
        dir="ltr"
        aria-label={socialLabel}
        className={`flex min-w-0 flex-wrap items-center gap-3 py-2.5 ${dv ? 'justify-end' : '-mt-6'} @[700px]:col-start-1 @[700px]:row-start-2 @[700px]:mt-0`}
      >
        {socialLinks.map((link) => (
          <li key={link.id}>
            <Button
              as="a"
              iconOnly
              size="md"
              appearance="transparent"
              href={link.href}
              aria-label={link.label}
              target={link.target}
              rel={relFor(link)}
              render={renderLink}
              intent="secondary"
            >
              <span aria-hidden="true">{link.icon}</span>
            </Button>
          </li>
        ))}
      </ul>
    ) : null;
  return (
    <section
      aria-label={label}
      lang={lang}
      dir={direction}
      className={`veli-page-navigation-footer @container bg-surface-base text-base-default w-full min-w-0 px-4 ${className}`}
    >
      <div className="mx-auto w-full max-w-[936px]">
        <Divider appearance="muted" />
        <div
          className={`grid min-w-0 grid-cols-1 items-start gap-x-8 ${dv ? 'gap-y-16' : 'gap-y-12'} px-4 pt-20 pb-18 text-start [overflow-wrap:anywhere] @[700px]:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] @[700px]:grid-rows-[min-content_1fr] @[700px]:gap-y-6 @[700px]:px-0 @[700px]:pb-30 @[1100px]:grid-cols-[minmax(0,361px)_minmax(0,1fr)] @[1100px]:gap-x-[117px] @[1100px]:pe-[70px]`}
        >
          {identity && (
            <div className="flex min-w-0 flex-col items-start gap-6 @[700px]:col-start-1 @[700px]:row-start-1">
              {identity.logo && (
                <div className="max-w-12 shrink-0 @[700px]:max-w-full [&_img]:h-auto [&_img]:max-w-full">
                  {identity.logo}
                </div>
              )}
              <div
                className={
                  dv
                    ? 'flex w-full max-w-[300px] flex-col gap-3 @[700px]:max-w-[361px]'
                    : 'flex w-full max-w-[361px] flex-col gap-6'
                }
              >
                <p className="type-body-lg-medium text-base-strong">{identity.name}</p>
                {identity.description && (
                  <p
                    className={
                      dv
                        ? 'type-body-md-regular whitespace-pre-line text-base-strong'
                        : 'type-body-md-regular whitespace-pre-line'
                    }
                  >
                    {identity.description}
                  </p>
                )}
              </div>
            </div>
          )}
          {!dv && social}
          {visibleGroups.length > 0 && (
            <div
              className={`grid min-w-0 grid-cols-1 items-start gap-x-8 gap-y-12 @[700px]:col-start-2 @[700px]:row-span-2 @[700px]:row-start-1 ${visibleGroups.length > 1 ? '@[700px]:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)] @[1100px]:grid-cols-[minmax(0,100px)_minmax(0,1fr)] @[1100px]:gap-x-[92px]' : ''}`}
            >
              {visibleGroups.map((group) => (
                <nav key={group.id} aria-label={group.label} className="min-w-0">
                  <p
                    aria-hidden="true"
                    className={
                      dv
                        ? 'type-caption-medium mb-3 text-base-subtle @[700px]:type-body-lg-medium @[700px]:mb-5'
                        : 'type-body-lg-medium mb-5 text-base-subtle'
                    }
                  >
                    {group.label}
                  </p>
                  <ul
                    className={
                      dv
                        ? 'flex min-w-0 flex-col items-start gap-3 @[700px]:gap-4'
                        : 'flex min-w-0 flex-col items-start gap-4'
                    }
                  >
                    {group.links.map((link) => (
                      <li
                        key={link.id}
                        className={
                          dv
                            ? 'type-caption-medium max-w-full @[700px]:type-body-sm-medium'
                            : 'type-body-sm-medium max-w-full'
                        }
                      >
                        <Link
                          href={link.href}
                          target={link.target}
                          rel={relFor(link)}
                          render={renderLink}
                          intent="secondary"
                          underline="hover"
                        >
                          <span className="min-w-0">{link.label}</span>
                          {(group.external || ('external' in link && link.external === true)) && (
                            <ArrowUpRightIcon aria-hidden="true" className="rtl:-scale-x-100" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
            </div>
          )}
          {dv && social}
        </div>
      </div>
    </section>
  );
}
