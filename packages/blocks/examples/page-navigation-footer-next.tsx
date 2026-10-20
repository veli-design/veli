'use client';

import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { PageNavigationFooter } from '../components/blocks/page-navigation-footer/page-navigation-footer';
import { pageNavigationFooterContent } from './page-navigation-footer-content';

export function ApplicationPageNavigationFooter({
  language,
  logo,
}: {
  language: 'en' | 'dv';
  logo?: ReactNode;
}) {
  const content = pageNavigationFooterContent(language);
  return (
    <PageNavigationFooter
      {...content}
      identity={{ ...content.identity, logo }}
      renderLink={(props) =>
        'href' in props ? <NextLink {...props} href={props.href!} /> : <span {...props} />
      }
    />
  );
}
